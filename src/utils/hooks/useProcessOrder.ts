import { useContext, useEffect, useMemo, useState } from 'react';
import {
    getChainExplorer,
    getElapsedTime,
    getFormattedNumber,
    getMoneynessRank,
    getUnicodeCharacter,
    trimString,
    uriToHttp,
} from '../../ambient-utils/dataLayer';
import { LimitOrderIF } from '../../ambient-utils/types';

import {
    CrocEnv,
    priceHalfAboveTick,
    priceHalfBelowTick,
    toDisplayPrice,
} from '@crocswap-libs/sdk';

import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { getAddress } from 'ethers';
import moment from 'moment';
import { getPositionHash } from '../../ambient-utils/dataLayer/functions/getPositionHash';
import { useFetchBatch } from '../../App/hooks/useFetchBatch';
import { CachedDataContext } from '../../contexts/CachedDataContext';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import { UserDataContext } from '../../contexts/UserDataContext';

export const useProcessOrder = (
    limitOrder: LimitOrderIF,
    crocEnv: CrocEnv | undefined,
    account = '',
    isAccountView = false,
) => {
    const { baseToken, quoteToken, isDenomBase } = useContext(TradeDataContext);
    const { ensName: ensNameConnectedUser } = useContext(UserDataContext);
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

    const blockExplorer = getChainExplorer(limitOrder.chainId);

    const selectedBaseToken = baseToken.address.toLowerCase();
    const selectedQuoteToken = quoteToken.address.toLowerCase();

    const baseTokenSymbol = limitOrder.baseSymbol;
    const quoteTokenSymbol = limitOrder.quoteSymbol;

    const baseTokenName = limitOrder.baseName;
    const quoteTokenName = limitOrder.quoteName;

    const quoteTokenLogo = uriToHttp(limitOrder.quoteTokenLogoURI);
    const baseTokenLogo = uriToHttp(limitOrder.baseTokenLogoURI);

    const isOwnerActiveAccount =
        limitOrder.user.toLowerCase() === account?.toLowerCase();

    const [basePrice, setBasePrice] = useState<number | undefined>();
    const [quotePrice, setQuotePrice] = useState<number | undefined>();

    useEffect(() => {
        const fetchTokenPrice = async () => {
            const baseTokenPrice =
                (
                    await cachedFetchTokenPrice(
                        limitOrder.base,
                        limitOrder.chainId,
                    )
                )?.usdPrice || 0.0;
            const quoteTokenPrice =
                (
                    await cachedFetchTokenPrice(
                        limitOrder.quote,
                        limitOrder.chainId,
                    )
                )?.usdPrice || 0.0;

            if (baseTokenPrice) {
                setBasePrice(baseTokenPrice);
            } else if (
                quoteTokenPrice &&
                limitOrder.curentPoolPriceDisplayNum
            ) {
                // this may be backwards
                const estimatedBasePrice =
                    quoteTokenPrice / limitOrder.curentPoolPriceDisplayNum;
                setBasePrice(estimatedBasePrice);
            }
            if (quoteTokenPrice) {
                setQuotePrice(quoteTokenPrice);
            } else if (baseTokenPrice && limitOrder.curentPoolPriceDisplayNum) {
                const estimatedQuotePrice =
                    baseTokenPrice * limitOrder.curentPoolPriceDisplayNum;
                setQuotePrice(estimatedQuotePrice);
            }
        };

        fetchTokenPrice();
    }, [
        limitOrder.base,
        limitOrder.quote,
        limitOrder.chainId,
        limitOrder.curentPoolPriceDisplayNum,
    ]);

    /* eslint-disable-next-line camelcase */
    const body = { config_path: 'ens_address', address: limitOrder.user };
    const { data, error } = useFetchBatch<'ens_address'>(body);

    let ensAddress = null;
    if (data && !error) {
        // prevent showing ens address if it is the same as the connected user due to async issue when switching tables
        ensAddress =
            data.ens_address !== ensNameConnectedUser
                ? data.ens_address
                : undefined;
    }

    const ownerId = ensAddress || getAddress(limitOrder.user);
    const ensName = ensAddress || limitOrder.ensResolution || null;

    const isOrderFilled = limitOrder.claimableLiq > 0;

    const posHash = getPositionHash(undefined, {
        isPositionTypeAmbient: false,
        user: limitOrder.user ?? '',
        baseAddress: limitOrder.base ?? '',
        quoteAddress: limitOrder.quote ?? '',
        poolIdx: limitOrder.poolIdx ?? 0,
        bidTick: limitOrder.bidTick ?? 0,
        askTick: limitOrder.askTick ?? 0,
    });

    const posHashTruncated = trimString(posHash ?? '', 9, 0, '…');

    const [truncatedDisplayPrice, setTruncatedDisplayPrice] = useState<
        string | undefined
    >();

    const [displayPriceInUsd, setDisplayPriceInUsd] = useState<
        string | undefined
    >();

    const [
        truncatedDisplayPriceDenomByMoneyness,
        setTruncatedDisplayPriceDenomByMoneyness,
    ] = useState<string | undefined>();

    const baseTokenCharacter = limitOrder.baseSymbol
        ? getUnicodeCharacter(limitOrder.baseSymbol)
        : '';
    const quoteTokenCharacter = limitOrder.quoteSymbol
        ? getUnicodeCharacter(limitOrder.quoteSymbol)
        : '';

    const isBaseTokenMoneynessGreaterOrEqual = useMemo(
        () =>
            getMoneynessRank(limitOrder.baseSymbol) -
                getMoneynessRank(limitOrder.quoteSymbol) >=
            0,
        [limitOrder.base, limitOrder.base, limitOrder.chainId],
    );

    const [startPriceDisplay, setStartPriceDisplay] = useState<
        string | undefined
    >();
    const [
        startPriceDisplayDenomByMoneyness,
        setStartPriceDisplayDenomByMoneyness,
    ] = useState<string | undefined>();
    const [middlePriceDisplay, setMiddlePriceDisplay] = useState<
        string | undefined
    >();
    const [
        middlePriceDisplayDenomByMoneyness,
        setMiddlePriceDisplayDenomByMoneyness,
    ] = useState<string | undefined>();
    const [finishPriceDisplay, setFinishPriceDisplay] = useState<
        string | undefined
    >();
    const [
        finishPriceDisplayDenomByMoneyness,
        setFinishPriceDisplayDenomByMoneyness,
    ] = useState<string | undefined>();
    const [initialTokenQty, setInitialTokenQty] = useState<string | undefined>(
        undefined,
    );

    const isBid = limitOrder.isBid;

    const priceType =
        (isDenomBase && !isBid) || (!isDenomBase && isBid)
            ? 'priceBuy'
            : 'priceSell';

    const sideType: 'sell' | 'buy' = isAccountView
        ? isBaseTokenMoneynessGreaterOrEqual
            ? isBid
                ? 'buy'
                : 'sell'
            : isBid
              ? 'sell'
              : 'buy'
        : (isDenomBase && isBid) || (!isDenomBase && !isBid)
          ? 'sell'
          : 'buy';

    const type = 'limit';

    const baseTokenAddressLowerCase = limitOrder.base.toLowerCase();
    const quoteTokenAddressLowerCase = limitOrder.quote.toLowerCase();

    const baseTokenAddressTruncated = trimString(
        baseTokenAddressLowerCase,
        6,
        4,
        '…',
    );
    const quoteTokenAddressTruncated = trimString(
        quoteTokenAddressLowerCase,
        6,
        4,
        '…',
    );

    const orderMatchesSelectedTokens =
        selectedBaseToken === baseTokenAddressLowerCase &&
        selectedQuoteToken === quoteTokenAddressLowerCase;

    const liqBaseNum =
        limitOrder.positionLiqBaseDecimalCorrected !== 0
            ? limitOrder.positionLiqBaseDecimalCorrected
            : limitOrder.claimableLiqBaseDecimalCorrected;
    const liqQuoteNum =
        limitOrder.positionLiqQuoteDecimalCorrected !== 0
            ? limitOrder.positionLiqQuoteDecimalCorrected
            : limitOrder.claimableLiqQuoteDecimalCorrected;

    const isLimitOrderPartiallyFilled = liqBaseNum !== 0 && liqQuoteNum !== 0;

    const baseQty = getFormattedNumber({
        value: liqBaseNum,
        zeroDisplay: '0',
        removeExtraTrailingZeros: true,
    });

    const quoteQty = getFormattedNumber({
        value: liqQuoteNum,
        zeroDisplay: '0',
        removeExtraTrailingZeros: true,
    });

    const fillPercentage =
        100 *
        (limitOrder.isBid
            ? liqQuoteNum / limitOrder.expectedPositionLiqQuoteDecimalCorrected
            : liqBaseNum / limitOrder.expectedPositionLiqBaseDecimalCorrected);

    const originalPositionLiqBase = getFormattedNumber({
        value: limitOrder.originalPositionLiqBaseDecimalCorrected,
        removeExtraTrailingZeros: true,
    });

    const originalPositionLiqQuote = getFormattedNumber({
        value: limitOrder.originalPositionLiqQuoteDecimalCorrected,
        removeExtraTrailingZeros: true,
    });

    const expectedPositionLiqBase = getFormattedNumber({
        value: limitOrder.expectedPositionLiqBaseDecimalCorrected,
        removeExtraTrailingZeros: true,
    });

    const expectedPositionLiqQuote = getFormattedNumber({
        value: limitOrder.expectedPositionLiqQuoteDecimalCorrected,
        removeExtraTrailingZeros: true,
    });

    const usdValueNum = limitOrder.totalValueUSD;

    const usdValue = getFormattedNumber({
        value: usdValueNum,
        prefix: '$',
    });

    // -----------------------------------------------------------------------------------------

    const quantitiesAvailable = baseQty !== undefined || quoteQty !== undefined;

    const baseDisplay = quantitiesAvailable ? baseQty || '0.00' : '…';

    const quoteDisplay = quantitiesAvailable ? quoteQty || '0.00' : '…';
    // ------------------------------------------------------------------

    const positionTime =
        limitOrder.latestUpdateTime || limitOrder.timeFirstMint;

    const elapsedTimeInSecondsNum = positionTime
        ? moment(Date.now()).diff(positionTime * 1000, 'seconds')
        : 0;

    const elapsedTimeSinceFirstMintInSecondsNum = limitOrder.timeFirstMint
        ? moment(Date.now()).diff(limitOrder.timeFirstMint * 1000, 'seconds')
        : 0;

    const elapsedTimeSinceCrossInSecondsNum = limitOrder.crossTime
        ? moment(Date.now()).diff(limitOrder.crossTime * 1000, 'seconds')
        : 0;

    const elapsedTimeString = getElapsedTime(elapsedTimeInSecondsNum);
    const elapsedTimeSinceFirstMintString = getElapsedTime(
        elapsedTimeSinceFirstMintInSecondsNum,
    );
    const elapsedTimeSinceCrossString = getElapsedTime(
        elapsedTimeSinceCrossInSecondsNum,
    );

    // ----------------------------------------------------------------------

    const ensNameOrOwnerTruncated = ensName
        ? ensName.length > 16
            ? trimString(ensName, 11, 3, '…')
            : ensName
        : trimString(ownerId, 7, 4, '…');

    const userNameToDisplay = isOwnerActiveAccount
        ? 'You'
        : ensNameOrOwnerTruncated;

    useEffect(() => {
        if (
            limitOrder.limitPriceDecimalCorrected &&
            limitOrder.invLimitPriceDecimalCorrected
        ) {
            const priceDecimalCorrected = limitOrder.limitPriceDecimalCorrected;
            const invPriceDecimalCorrected =
                limitOrder.invLimitPriceDecimalCorrected;

            const nonInvertedPriceTruncated = getFormattedNumber({
                value: priceDecimalCorrected,
                zeroDisplay: '0',
            });

            const invertedPriceTruncated = getFormattedNumber({
                value: invPriceDecimalCorrected,
                zeroDisplay: '0',
            });

            const displayPriceNumInUsd = isAccountView
                ? isBaseTokenMoneynessGreaterOrEqual
                    ? basePrice
                        ? priceDecimalCorrected * basePrice
                        : undefined
                    : quotePrice
                      ? invPriceDecimalCorrected * quotePrice
                      : undefined
                : basePrice && quotePrice
                  ? isDenomBase
                      ? invPriceDecimalCorrected * quotePrice
                      : priceDecimalCorrected * basePrice
                  : undefined;

            const formattedUsdPrice = displayPriceNumInUsd
                ? getFormattedNumber({
                      value: displayPriceNumInUsd,
                      prefix: '$',
                  })
                : '...';

            setDisplayPriceInUsd(formattedUsdPrice);

            const truncatedDisplayPriceDenomByMoneyness =
                isBaseTokenMoneynessGreaterOrEqual
                    ? baseTokenCharacter + nonInvertedPriceTruncated
                    : quoteTokenCharacter + invertedPriceTruncated;

            const truncatedDisplayPrice = isDenomBase
                ? `${quoteTokenCharacter}${invertedPriceTruncated}`
                : `${baseTokenCharacter}${nonInvertedPriceTruncated}`;

            setTruncatedDisplayPrice(truncatedDisplayPrice);
            setTruncatedDisplayPriceDenomByMoneyness(
                truncatedDisplayPriceDenomByMoneyness,
            );
        } else {
            setTruncatedDisplayPrice(undefined);
        }
        const askTickInvPrice = limitOrder.askTickInvPriceDecimalCorrected;
        const askTickPrice = limitOrder.askTickPriceDecimalCorrected;
        const bidTick = limitOrder.bidTick;
        const askTick = limitOrder.askTick;
        const bidTickInvPrice = limitOrder.bidTickInvPriceDecimalCorrected;
        const bidTickPrice = limitOrder.bidTickPriceDecimalCorrected;
        const isBid = limitOrder.isBid;

        const limitTick = isBid ? askTick : bidTick;

        const gridSize = lookupChain(limitOrder.chainId).gridSize;

        const priceHalfAbove = toDisplayPrice(
            priceHalfAboveTick(limitTick, gridSize),
            limitOrder.baseDecimals,
            limitOrder.quoteDecimals,
        );
        const priceHalfBelow = toDisplayPrice(
            priceHalfBelowTick(limitTick, gridSize),
            limitOrder.baseDecimals,
            limitOrder.quoteDecimals,
        );
        if (
            askTickPrice &&
            askTickInvPrice &&
            bidTickPrice &&
            bidTickInvPrice
        ) {
            const startPriceDisplayNum = isDenomBase
                ? isBid
                    ? bidTickInvPrice
                    : askTickInvPrice
                : isBid
                  ? askTickPrice
                  : bidTickPrice;

            const startPriceDisplay = getFormattedNumber({
                value: startPriceDisplayNum,
            });

            const startPriceDenomByMoneyness =
                isBaseTokenMoneynessGreaterOrEqual
                    ? isBid
                        ? askTickPrice
                        : bidTickPrice
                    : isBid
                      ? bidTickInvPrice
                      : askTickInvPrice;

            const startPriceDisplayDenomByMoneyness = getFormattedNumber({
                value: startPriceDenomByMoneyness,
            });

            const middlePriceDisplayNum = isDenomBase
                ? isBid
                    ? 1 / priceHalfBelow
                    : 1 / priceHalfAbove
                : isBid
                  ? priceHalfBelow
                  : priceHalfAbove;

            const middlePriceDisplay = getFormattedNumber({
                value: middlePriceDisplayNum,
            });

            const middlePriceDenomByMoneyness =
                isBaseTokenMoneynessGreaterOrEqual
                    ? isBid
                        ? priceHalfBelow
                        : priceHalfAbove
                    : isBid
                      ? 1 / priceHalfBelow
                      : 1 / priceHalfAbove;

            const middlePriceDisplayDenomByMoneyness = getFormattedNumber({
                value: middlePriceDenomByMoneyness,
            });

            const finishPriceDisplayNum = isDenomBase
                ? isBid
                    ? askTickInvPrice
                    : bidTickInvPrice
                : isBid
                  ? bidTickPrice
                  : askTickPrice;

            const finishPriceDenomByMoneyness =
                isBaseTokenMoneynessGreaterOrEqual
                    ? isBid
                        ? bidTickPrice
                        : askTickPrice
                    : isBid
                      ? askTickInvPrice
                      : bidTickInvPrice;

            const finishPriceDisplayDenomByMoneyness = getFormattedNumber({
                value: finishPriceDenomByMoneyness,
            });

            const finishPriceDisplay = getFormattedNumber({
                value: finishPriceDisplayNum,
            });

            setStartPriceDisplay(startPriceDisplay);
            setStartPriceDisplayDenomByMoneyness(
                startPriceDisplayDenomByMoneyness,
            );
            setMiddlePriceDisplayDenomByMoneyness(
                middlePriceDisplayDenomByMoneyness,
            );
            setMiddlePriceDisplay(middlePriceDisplay);
            setFinishPriceDisplay(finishPriceDisplay);
            setFinishPriceDisplayDenomByMoneyness(
                finishPriceDisplayDenomByMoneyness,
            );

            const finalTokenQty = !isBid
                ? limitOrder.claimableLiqBaseDecimalCorrected
                : limitOrder.claimableLiqQuoteDecimalCorrected;
            const intialTokenQtyNum = middlePriceDisplayNum * finalTokenQty;
            const invIntialTokenQtyNum =
                (1 / middlePriceDisplayNum) * finalTokenQty;

            const intialTokenQtyTruncated = getFormattedNumber({
                value: intialTokenQtyNum,
                zeroDisplay: '0',
            });

            const invIntialTokenQtyTruncated = getFormattedNumber({
                value: invIntialTokenQtyNum,
                zeroDisplay: '0',
            });

            setInitialTokenQty(
                (isBid && !isDenomBase) || (!isBid && isDenomBase)
                    ? intialTokenQtyTruncated
                    : invIntialTokenQtyTruncated,
            );
        }
    }, [limitOrder, isDenomBase, isAccountView, basePrice, quotePrice]);

    return {
        // wallet and id data
        ownerId,
        posHash,
        isOwnerActiveAccount,
        posHashTruncated,
        userNameToDisplay,
        ensName,

        // Price and Price type data
        priceType,
        truncatedDisplayPrice,
        truncatedDisplayPriceDenomByMoneyness,

        // Order type and side data
        sideType,
        type,

        // Value data
        usdValue,

        // Token Qty data
        baseQty,
        quoteQty,
        baseTokenCharacter,
        quoteTokenCharacter,
        quoteTokenLogo,
        baseTokenLogo,
        originalPositionLiqBase,
        originalPositionLiqQuote,
        expectedPositionLiqBase,
        expectedPositionLiqQuote,
        baseDisplay,
        quoteDisplay,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenName,
        quoteTokenName,
        isDenomBase,
        baseTokenAddressLowerCase,
        quoteTokenAddressLowerCase,
        baseTokenAddressTruncated,
        quoteTokenAddressTruncated,

        // open order status
        isOrderFilled,
        isLimitOrderPartiallyFilled,
        fillPercentage,

        // price
        startPriceDisplay,
        startPriceDisplayDenomByMoneyness,
        middlePriceDisplay,
        middlePriceDisplayDenomByMoneyness,
        finishPriceDisplay,
        finishPriceDisplayDenomByMoneyness,
        displayPriceInUsd,

        // transaction matches selected token
        orderMatchesSelectedTokens,
        isBaseTokenMoneynessGreaterOrEqual,
        blockExplorer,

        elapsedTimeString,
        elapsedTimeSinceFirstMintString,
        elapsedTimeSinceCrossString,
        initialTokenQty,
        baseTokenAddress: limitOrder.base,
        quoteTokenAddress: limitOrder.quote,
    };
};
