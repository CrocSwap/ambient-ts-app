import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { useState, useEffect, useMemo } from 'react';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import trimString from '../../utils/functions/trimString';
import { LimitOrderIF } from '../interfaces/exports';
import { getMoneynessRank } from '../functions/getMoneynessRank';

import {
    concPosSlot,
    priceHalfAboveTick,
    priceHalfBelowTick,
    toDisplayPrice,
} from '@crocswap-libs/sdk';

import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import moment from 'moment';
import { getChainExplorer } from '../data/chains';
import { getElapsedTime } from '../../App/functions/getElapsedTime';
import { diffHashSig } from '../functions/diffHashSig';
import { getFormattedNumber } from '../../App/functions/getFormattedNumber';
import uriToHttp from '../functions/uriToHttp';
import { getAddress } from 'ethers/lib/utils.js';

export const useProcessOrder = (
    limitOrder: LimitOrderIF,
    account = '',
    isAccountView = false,
) => {
    const tradeData = useAppSelector((state) => state.tradeData);
    const blockExplorer = getChainExplorer(limitOrder.chainId);

    const selectedBaseToken = tradeData.baseToken.address.toLowerCase();
    const selectedQuoteToken = tradeData.quoteToken.address.toLowerCase();

    const baseTokenSymbol = limitOrder.baseSymbol;
    const quoteTokenSymbol = limitOrder.quoteSymbol;

    const baseTokenName = limitOrder.baseName;
    const quoteTokenName = limitOrder.quoteName;

    const quoteTokenLogo = uriToHttp(limitOrder.quoteTokenLogoURI);
    const baseTokenLogo = uriToHttp(limitOrder.baseTokenLogoURI);

    const isOwnerActiveAccount =
        limitOrder.user.toLowerCase() === account?.toLowerCase();
    const isDenomBase = tradeData.isDenomBase;

    const ownerId = limitOrder.ensResolution
        ? limitOrder.ensResolution
        : limitOrder.user
        ? getAddress(limitOrder.user)
        : '';

    const ensName = limitOrder.ensResolution ? limitOrder.ensResolution : null;

    const isOrderFilled = limitOrder.claimableLiq > 0;

    const posHash =
        limitOrder.user &&
        limitOrder.base &&
        limitOrder.quote &&
        limitOrder.bidTick &&
        limitOrder.askTick
            ? concPosSlot(
                  limitOrder.user,
                  limitOrder.base,
                  limitOrder.quote,
                  limitOrder.bidTick,
                  limitOrder.askTick,
                  limitOrder.poolIdx,
              ).toString()
            : '…';

    const posHashTruncated = trimString(posHash ?? '', 9, 0, '…');

    const [truncatedDisplayPrice, setTruncatedDisplayPrice] = useState<
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
            getMoneynessRank(
                limitOrder.base.toLowerCase() + '_' + limitOrder.chainId,
            ) -
                getMoneynessRank(
                    limitOrder.quote.toLowerCase() + '_' + limitOrder.chainId,
                ) >=
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
    const [initialTokenQty, setInitialTokenQty] = useState<string | undefined>(
        undefined,
    );

    const isBid = limitOrder.isBid;

    const priceType =
        (isDenomBase && !isBid) || (!isDenomBase && isBid)
            ? 'priceBuy'
            : 'priceSell';

    const sideType = isAccountView
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
    });

    const fillPercentage =
        100 *
        (limitOrder.isBid
            ? liqQuoteNum / limitOrder.expectedPositionLiqQuoteDecimalCorrected
            : liqBaseNum / limitOrder.expectedPositionLiqBaseDecimalCorrected);

    const originalPositionLiqBase = getFormattedNumber({
        value: limitOrder.originalPositionLiqBaseDecimalCorrected,
    });

    const originalPositionLiqQuote = getFormattedNumber({
        value: limitOrder.originalPositionLiqQuoteDecimalCorrected,
    });

    const expectedPositionLiqBase = getFormattedNumber({
        value: limitOrder.expectedPositionLiqBaseDecimalCorrected,
    });

    const expectedPositionLiqQuote = getFormattedNumber({
        value: limitOrder.expectedPositionLiqQuoteDecimalCorrected,
    });

    const quoteQty = getFormattedNumber({
        value: liqQuoteNum,
        zeroDisplay: '0',
    });

    const usdValueNum = limitOrder.totalValueUSD;

    const usdValue = getFormattedNumber({
        value: usdValueNum,
        isUSD: true,
    });

    // -----------------------------------------------------------------------------------------

    const quantitiesAvailable = baseQty !== undefined || quoteQty !== undefined;

    const baseDisplayFrontend = quantitiesAvailable
        ? `${baseQty || '0.00'}`
        : '…';

    const quoteDisplayFrontend = quantitiesAvailable
        ? `${quoteQty || '0.00'}`
        : '…';
    const baseDisplay = quantitiesAvailable ? baseQty || '0.00' : '…';

    const quoteDisplay = quantitiesAvailable ? quoteQty || '0.00' : '…';
    // ------------------------------------------------------------------

    const positionTime =
        limitOrder.latestUpdateTime || limitOrder.timeFirstMint;

    const elapsedTimeInSecondsNum = positionTime
        ? moment(Date.now()).diff(positionTime * 1000, 'seconds')
        : 0;

    const elapsedTimeString = getElapsedTime(elapsedTimeInSecondsNum);

    // ----------------------------------------------------------------------

    const ensNameOrOwnerTruncated = ensName
        ? ensName.length > 16
            ? trimString(ensName, 11, 3, '…')
            : ensName
        : trimString(ownerId, 5, 4, '…');

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

            const truncatedDisplayPriceDenomByMoneyness =
                isBaseTokenMoneynessGreaterOrEqual
                    ? nonInvertedPriceTruncated
                    : invertedPriceTruncated;

            const truncatedDisplayPrice = isDenomBase
                ? `${invertedPriceTruncated}`
                : `${nonInvertedPriceTruncated}`;

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
                    ? bidTickInvPrice
                    : askTickInvPrice
                : isBid
                ? bidTickPrice
                : askTickPrice;

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
    }, [diffHashSig(limitOrder), isDenomBase, isAccountView]);

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
        baseDisplayFrontend,
        quoteDisplayFrontend,
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

        // transaction matches selected token
        orderMatchesSelectedTokens,
        isBaseTokenMoneynessGreaterOrEqual,
        blockExplorer,

        elapsedTimeString,
        initialTokenQty,
        baseTokenAddress: limitOrder.base,
        quoteTokenAddress: limitOrder.quote,
    };
};
