import {
    CrocEnv,
    priceHalfAboveTick,
    priceHalfBelowTick,
    toDisplayPrice,
} from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { getAddress } from 'ethers';
import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import {
    getElapsedTime,
    getFormattedNumber,
    getMoneynessRank,
    getUnicodeCharacter,
    trimString,
} from '../../ambient-utils/dataLayer';
import { getBlockExplorerUrl } from '../../ambient-utils/dataLayer/functions/chains';
import { getPositionHash } from '../../ambient-utils/dataLayer/functions/getPositionHash';
import { TransactionIF } from '../../ambient-utils/types';
import { useFetchBatch } from '../../App/hooks/useFetchBatch';
import { CachedDataContext } from '../../contexts/CachedDataContext';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import { UserDataContext } from '../../contexts/UserDataContext';

export const useProcessTransaction = (
    tx: TransactionIF,
    account = '',
    crocEnv: CrocEnv | undefined,
    isAccountView = false,
) => {
    const { tokenA, tokenB, isDenomBase } = useContext(TradeDataContext);
    const { ensName: ensNameConnectedUser } = useContext(UserDataContext);
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);
    const blockExplorer = getBlockExplorerUrl(tx.chainId);

    const txHash = tx.txHash;

    // TODO: clarify if this should also preferentially show ENS address
    const ownerId = tx.user ? getAddress(tx.user) : '';

    const isOwnerActiveAccount =
        ownerId.toLowerCase() === account?.toLowerCase();

    /* eslint-disable-next-line camelcase */
    const body = { config_path: 'ens_address', address: tx.user };
    const { data, error } = useFetchBatch<'ens_address'>(body);

    let ensAddress = null;
    if (data && !error) {
        // prevent showing ens address if it is the same as the connected user due to async issue when switching tables
        ensAddress =
            data.ens_address !== ensNameConnectedUser
                ? data.ens_address
                : undefined;
    }
    const ensName = ensAddress || tx.ensResolution || null;

    const tokenAAddress = tokenA.address;
    const tokenBAddress = tokenB.address;

    const transactionBaseAddressLowerCase = tx.base.toLowerCase();
    const transactionQuoteAddressLowerCase = tx.quote.toLowerCase();

    const tokenAAddressLowerCase = tokenAAddress.toLowerCase();
    const tokenBAddressLowerCase = tokenBAddress.toLowerCase();

    const isBaseTokenMoneynessGreaterOrEqual =
        getMoneynessRank(tx.baseSymbol) - getMoneynessRank(tx.quoteSymbol) >= 0;

    const baseTokenSymbol = tx.baseSymbol;
    const quoteTokenSymbol = tx.quoteSymbol;

    const baseTokenAddress = tx.base;
    const baseTokenAddressTruncated = trimString(baseTokenAddress, 6, 4, '…');
    const quoteTokenAddress = tx.quote;
    const quoteTokenAddressTruncated = trimString(quoteTokenAddress, 6, 4, '…');

    const quoteTokenLogo = tx.quoteTokenLogoURI;
    const baseTokenLogo = tx.baseTokenLogoURI;

    const transactionMatchesSelectedTokens =
        (transactionBaseAddressLowerCase === tokenAAddressLowerCase ||
            transactionQuoteAddressLowerCase === tokenAAddressLowerCase) &&
        (transactionBaseAddressLowerCase === tokenBAddressLowerCase ||
            transactionQuoteAddressLowerCase === tokenBAddressLowerCase);

    const [basePrice, setBasePrice] = useState<number | undefined>();
    const [quotePrice, setQuotePrice] = useState<number | undefined>();

    useEffect(() => {
        const fetchTokenPrice = async () => {
            const baseTokenPrice =
                (await cachedFetchTokenPrice(tx.base, tx.chainId))?.usdPrice ||
                0.0;
            const quoteTokenPrice =
                (await cachedFetchTokenPrice(tx.quote, tx.chainId))?.usdPrice ||
                0.0;

            if (baseTokenPrice) {
                setBasePrice(baseTokenPrice);
            } else if (quoteTokenPrice && tx.curentPoolPriceDisplayNum) {
                // this may be backwards
                const estimatedBasePrice =
                    quoteTokenPrice / tx.curentPoolPriceDisplayNum;
                setBasePrice(estimatedBasePrice);
            }
            if (quoteTokenPrice) {
                setQuotePrice(quoteTokenPrice);
            } else if (baseTokenPrice && tx.curentPoolPriceDisplayNum) {
                const estimatedQuotePrice =
                    baseTokenPrice * tx.curentPoolPriceDisplayNum;
                setQuotePrice(estimatedQuotePrice);
            }
        };

        fetchTokenPrice();
    }, [tx.base, tx.quote, tx.chainId, tx.curentPoolPriceDisplayNum]);

    let displayPriceNumInUsd;
    let lowDisplayPriceInUsd;
    let highDisplayPriceInUsd;
    let truncatedDisplayPrice;
    let truncatedDisplayPriceDenomByMoneyness;
    let truncatedLowDisplayPrice;
    let truncatedHighDisplayPrice;
    let truncatedLowDisplayPriceDenomByMoneyness;
    let truncatedHighDisplayPriceDenomByMoneyness;

    let estimatedQuoteFlowDisplay;
    let estimatedBaseFlowDisplay;

    let baseFlowDisplay;
    let quoteFlowDisplay;

    let isBaseFlowPositive = false;
    let isQuoteFlowPositive = false;

    let positionHash = '';

    const baseTokenCharacter = tx.baseSymbol
        ? getUnicodeCharacter(tx.baseSymbol)
        : '';
    const quoteTokenCharacter = tx.quoteSymbol
        ? getUnicodeCharacter(tx.quoteSymbol)
        : '';

    const limitTick = tx.isBid ? tx.askTick : tx.bidTick;

    const gridSize = lookupChain(tx.chainId).gridSize;

    const priceHalfAbove = toDisplayPrice(
        priceHalfAboveTick(limitTick, gridSize),
        tx.baseDecimals,
        tx.quoteDecimals,
    );
    const priceHalfBelow = toDisplayPrice(
        priceHalfBelowTick(limitTick, gridSize),
        tx.baseDecimals,
        tx.quoteDecimals,
    );

    const middlePriceDisplayNum = isDenomBase
        ? tx.isBid
            ? 1 / priceHalfBelow
            : 1 / priceHalfAbove
        : tx.isBid
          ? priceHalfBelow
          : priceHalfAbove;

    if (tx.entityType === 'limitOrder') {
        if (tx.limitPriceDecimalCorrected && tx.invLimitPriceDecimalCorrected) {
            const priceDecimalCorrected = tx.limitPriceDecimalCorrected;
            const invPriceDecimalCorrected = tx.invLimitPriceDecimalCorrected;

            const nonInvertedPriceTruncated = getFormattedNumber({
                value: priceDecimalCorrected,
            });
            const invertedPriceTruncated = getFormattedNumber({
                value: invPriceDecimalCorrected,
            });

            truncatedDisplayPriceDenomByMoneyness =
                isBaseTokenMoneynessGreaterOrEqual
                    ? nonInvertedPriceTruncated
                    : invertedPriceTruncated;

            truncatedDisplayPrice = isDenomBase
                ? invertedPriceTruncated
                : nonInvertedPriceTruncated;

            displayPriceNumInUsd = isAccountView
                ? isBaseTokenMoneynessGreaterOrEqual
                    ? basePrice
                        ? priceDecimalCorrected * basePrice
                        : undefined
                    : quotePrice
                      ? invPriceDecimalCorrected * quotePrice
                      : undefined
                : isDenomBase
                  ? quotePrice
                      ? invPriceDecimalCorrected * quotePrice
                      : undefined
                  : basePrice
                    ? priceDecimalCorrected * basePrice
                    : undefined;
        } else {
            truncatedDisplayPrice = undefined;
        }
        positionHash = getPositionHash(undefined, {
            isPositionTypeAmbient: false,
            user: tx.user ?? '',
            baseAddress: tx.base ?? '',
            quoteAddress: tx.quote ?? '',
            poolIdx: tx.poolIdx ?? 0,
            bidTick: tx.bidTick ?? 0,
            askTick: tx.askTick ?? 0,
        });
    } else if (tx.entityType === 'liqchange') {
        if (
            tx.bidTickPriceDecimalCorrected &&
            tx.bidTickInvPriceDecimalCorrected &&
            tx.askTickPriceDecimalCorrected &&
            tx.askTickInvPriceDecimalCorrected
        ) {
            const bidTickPriceDecimalCorrected =
                tx.bidTickPriceDecimalCorrected;
            const bidTickInvPriceDecimalCorrected =
                tx.bidTickInvPriceDecimalCorrected;
            const askTickPriceDecimalCorrected =
                tx.askTickPriceDecimalCorrected;
            const askTickInvPriceDecimalCorrected =
                tx.askTickInvPriceDecimalCorrected;
            const nonInvertedBidPriceTruncated = getFormattedNumber({
                value: bidTickPriceDecimalCorrected,
            });
            const invertedBidPriceTruncated = getFormattedNumber({
                value: bidTickInvPriceDecimalCorrected,
            });
            const nonInvertedAskPriceTruncated = getFormattedNumber({
                value: askTickPriceDecimalCorrected,
            });
            const invertedAskPriceTruncated = getFormattedNumber({
                value: askTickInvPriceDecimalCorrected,
            });

            truncatedLowDisplayPrice = isDenomBase
                ? `${invertedBidPriceTruncated}`
                : `${nonInvertedBidPriceTruncated}`;
            truncatedHighDisplayPrice = isDenomBase
                ? `${invertedAskPriceTruncated}`
                : `${nonInvertedAskPriceTruncated}`;

            truncatedLowDisplayPriceDenomByMoneyness =
                isBaseTokenMoneynessGreaterOrEqual
                    ? `${nonInvertedBidPriceTruncated}`
                    : `${invertedBidPriceTruncated}`;

            truncatedHighDisplayPriceDenomByMoneyness =
                isBaseTokenMoneynessGreaterOrEqual
                    ? `${nonInvertedAskPriceTruncated}`
                    : `${invertedAskPriceTruncated}`;

            if (/[bt]/.test(truncatedHighDisplayPrice)) {
                truncatedHighDisplayPrice = '∞';
                truncatedHighDisplayPriceDenomByMoneyness = '∞';
            }

            lowDisplayPriceInUsd = isAccountView
                ? isBaseTokenMoneynessGreaterOrEqual
                    ? basePrice
                        ? bidTickPriceDecimalCorrected * basePrice
                        : undefined
                    : quotePrice
                      ? bidTickInvPriceDecimalCorrected * quotePrice
                      : undefined
                : isDenomBase
                  ? quotePrice
                      ? bidTickInvPriceDecimalCorrected * quotePrice
                      : undefined
                  : basePrice
                    ? bidTickPriceDecimalCorrected * basePrice
                    : undefined;

            highDisplayPriceInUsd = isAccountView
                ? isBaseTokenMoneynessGreaterOrEqual
                    ? basePrice
                        ? askTickPriceDecimalCorrected * basePrice
                        : undefined
                    : quotePrice
                      ? askTickInvPriceDecimalCorrected * quotePrice
                      : undefined
                : isDenomBase
                  ? quotePrice
                      ? askTickInvPriceDecimalCorrected * quotePrice
                      : undefined
                  : basePrice
                    ? askTickPriceDecimalCorrected * basePrice
                    : undefined;
        } else {
            truncatedLowDisplayPrice = undefined;
            truncatedHighDisplayPrice = undefined;
        }
        positionHash = getPositionHash(undefined, {
            isPositionTypeAmbient: tx.positionType == 'ambient',
            user: tx.user ?? '',
            baseAddress: tx.base ?? '',
            quoteAddress: tx.quote ?? '',
            poolIdx: tx.poolIdx ?? 0,
            bidTick: tx.bidTick ?? 0,
            askTick: tx.askTick ?? 0,
        });
    } else {
        const priceDecimalCorrected = tx.swapPriceDecimalCorrected;
        const invPriceDecimalCorrected = tx.swapInvPriceDecimalCorrected;

        const nonInvertedPriceTruncated = getFormattedNumber({
            value: priceDecimalCorrected,
        });
        const invertedPriceTruncated = getFormattedNumber({
            value: invPriceDecimalCorrected,
        });

        truncatedDisplayPriceDenomByMoneyness =
            isBaseTokenMoneynessGreaterOrEqual
                ? nonInvertedPriceTruncated
                : invertedPriceTruncated;

        truncatedDisplayPrice = isDenomBase
            ? invertedPriceTruncated
            : nonInvertedPriceTruncated;

        displayPriceNumInUsd = isAccountView
            ? isBaseTokenMoneynessGreaterOrEqual
                ? basePrice
                    ? priceDecimalCorrected * basePrice
                    : undefined
                : quotePrice
                  ? invPriceDecimalCorrected * quotePrice
                  : undefined
            : isDenomBase
              ? quotePrice
                  ? invPriceDecimalCorrected * quotePrice
                  : undefined
              : basePrice
                ? priceDecimalCorrected * basePrice
                : undefined;
    }

    if (
        tx.baseFlowDecimalCorrected !== undefined &&
        tx.baseFlowDecimalCorrected !== null
    ) {
        const baseFlowDisplayNum = tx.baseFlowDecimalCorrected;
        const baseFlowAbsNum = Math.abs(baseFlowDisplayNum);
        isBaseFlowPositive = baseFlowDisplayNum > 0;

        baseFlowDisplay = getFormattedNumber({
            value: baseFlowAbsNum,
            zeroDisplay: '0',
            removeExtraTrailingZeros: true,
        });

        estimatedQuoteFlowDisplay = getFormattedNumber({
            value: isDenomBase
                ? baseFlowAbsNum * middlePriceDisplayNum
                : baseFlowAbsNum / middlePriceDisplayNum,
            zeroDisplay: '0',
        });
    }
    if (
        tx.quoteFlowDecimalCorrected !== undefined &&
        tx.quoteFlowDecimalCorrected !== null
    ) {
        const quoteFlowDisplayNum = tx.quoteFlowDecimalCorrected;
        const quoteFlowAbsNum = Math.abs(quoteFlowDisplayNum);
        isQuoteFlowPositive = quoteFlowDisplayNum > 0;

        quoteFlowDisplay = getFormattedNumber({
            value: quoteFlowAbsNum,
            zeroDisplay: '0',
            removeExtraTrailingZeros: true,
        });
        estimatedBaseFlowDisplay = getFormattedNumber({
            value: isDenomBase
                ? quoteFlowAbsNum / middlePriceDisplayNum
                : quoteFlowAbsNum * middlePriceDisplayNum,
            zeroDisplay: '0',
        });
    }

    const priceType =
        (isDenomBase && !tx.isBuy) || (!isDenomBase && tx.isBuy)
            ? 'priceBuy'
            : 'priceSell';

    const isBuy = tx.isBuy === true || tx.isBid === true;

    const sideType =
        tx.entityType === 'liqchange'
            ? tx.changeType === 'burn'
                ? 'remove'
                : tx.changeType === 'harvest'
                  ? 'harvest'
                  : 'add'
            : tx.entityType === 'limitOrder'
              ? tx.changeType === 'mint'
                  ? isAccountView
                      ? isBaseTokenMoneynessGreaterOrEqual
                          ? isBuy
                              ? 'buy'
                              : 'sell'
                          : isBuy
                            ? 'sell'
                            : 'buy'
                      : (isDenomBase && tx.isBuy) || (!isDenomBase && !tx.isBuy)
                        ? 'sell'
                        : 'buy'
                  : tx.changeType === 'recover'
                    ? 'claim'
                    : tx.changeType === 'cross'
                      ? 'fill'
                      : 'remove'
              : isAccountView
                ? isBaseTokenMoneynessGreaterOrEqual
                    ? isBuy
                        ? 'buy'
                        : 'sell'
                    : isBuy
                      ? 'sell'
                      : 'buy'
                : (isDenomBase && tx.isBuy) || (!isDenomBase && !tx.isBuy)
                  ? 'sell'
                  : 'buy';

    const transactionTypeSide =
        tx.entityType === 'liqchange'
            ? tx.changeType === 'mint'
                ? 'rangeAdd'
                : 'rangeRemove'
            : tx.entityType === 'limitOrder'
              ? 'limit'
              : 'market';

    const type =
        tx.entityType === 'liqchange'
            ? tx.changeType === 'mint'
                ? 'range'
                : 'range'
            : tx.entityType === 'limitOrder'
              ? 'limit'
              : 'market';

    const usdValueNum = tx.totalValueUSD;
    const totalFlowUSDNum = tx.totalValueUSD;
    const totalFlowAbsNum =
        totalFlowUSDNum !== undefined ? Math.abs(totalFlowUSDNum) : undefined;

    const usdValueString = getFormattedNumber({
        value: usdValueNum,
        prefix: '$',
    });

    const totalFlowUSD = getFormattedNumber({
        value: totalFlowAbsNum,
        prefix: '$',
    });

    const isLimitRemove =
        tx.entityType === 'limitOrder' && sideType === 'remove';

    const isLimitAdd =
        tx.entityType === 'limitOrder' &&
        (sideType === 'buy' || sideType === 'sell');

    // --------------------------------------------------------

    const usdValue = totalFlowUSD ?? usdValueString;

    const baseQuantityDisplay =
        baseFlowDisplay !== undefined
            ? `${baseFlowDisplay && baseFlowDisplay !== '0' ? baseFlowDisplay : isLimitAdd ? '...' : '0'}`
            : '…';

    const quoteQuantityDisplay =
        quoteFlowDisplay !== undefined
            ? `${quoteFlowDisplay && quoteFlowDisplay !== '0' ? quoteFlowDisplay : isLimitAdd ? '...' : '0'}`
            : '…';

    // --------------------------------------------------------

    const ensNameOrOwnerTruncated = ensName
        ? ensName.length > 16
            ? trimString(ensName, 11, 3, '…')
            : ensName
        : trimString(ownerId, 7, 4, '…');

    const txHashTruncated = trimString(txHash, 9, 0, '…');

    const userNameToDisplay = isOwnerActiveAccount
        ? 'You'
        : ensNameOrOwnerTruncated;

    const elapsedTimeInSecondsNum = moment(Date.now()).diff(
        tx.txTime * 1000,
        'seconds',
    );

    const elapsedTimeString = getElapsedTime(elapsedTimeInSecondsNum);

    // -------------------------------------------
    const sideCharacter = isAccountView
        ? isBaseTokenMoneynessGreaterOrEqual
            ? quoteTokenCharacter
            : baseTokenCharacter
        : isDenomBase
          ? baseTokenCharacter
          : quoteTokenCharacter;

    const priceCharacter = isAccountView
        ? isBaseTokenMoneynessGreaterOrEqual
            ? baseTokenCharacter
            : quoteTokenCharacter
        : !isDenomBase
          ? baseTokenCharacter
          : quoteTokenCharacter;

    // -----------------------------------------------

    const positiveArrow = '↑';
    const negativeArrow = '↓';

    const valueArrows = tx.entityType !== 'liqchange' && !isLimitRemove;

    const positiveDisplayColor =
        (!isBuy ? baseQuantityDisplay === '0' : quoteQuantityDisplay === '0') ||
        !valueArrows ||
        isLimitRemove
            ? 'text1'
            : 'positive';
    const negativeDisplayColor =
        (isBuy ? baseQuantityDisplay === '0' : quoteQuantityDisplay === '0') ||
        !valueArrows ||
        isLimitRemove
            ? 'text1'
            : 'negative';

    // if (!tx) return null;
    return {
        // wallet and id data
        ownerId,
        txHash,
        txHashTruncated,
        ensName,
        isOwnerActiveAccount,
        userNameToDisplay,
        // Price and Price type data
        priceType,
        displayPriceNumInUsd,
        lowDisplayPriceInUsd,
        highDisplayPriceInUsd,
        truncatedDisplayPrice,
        truncatedDisplayPriceDenomByMoneyness,
        truncatedLowDisplayPrice,
        truncatedHighDisplayPrice,
        truncatedLowDisplayPriceDenomByMoneyness,
        truncatedHighDisplayPriceDenomByMoneyness,
        middlePriceDisplayNum,
        basePrice,
        quotePrice,
        estimatedBaseFlowDisplay,
        estimatedQuoteFlowDisplay,
        // Transaction type and side data
        sideType,
        transactionTypeSide,
        type,
        isLimitRemove,

        sideCharacter,
        priceCharacter,
        isBuy,
        positiveDisplayColor,
        negativeDisplayColor,

        // Value data
        usdValue,

        positiveArrow,
        negativeArrow,
        valueArrows,

        // Token Qty data
        baseTokenCharacter,
        quoteTokenCharacter,
        baseQuantityDisplay,
        quoteQuantityDisplay,
        // baseFlowDisplay,
        // quoteFlowDisplay,
        baseTokenSymbol,
        baseTokenAddress,
        baseTokenAddressTruncated,
        quoteTokenSymbol,
        quoteTokenAddress,
        quoteTokenAddressTruncated,

        quoteTokenLogo,
        baseTokenLogo,
        isBaseFlowPositive,
        isQuoteFlowPositive,

        // block explorer data
        blockExplorer,
        isDenomBase,

        // transaction matches select token data
        transactionMatchesSelectedTokens,
        isBaseTokenMoneynessGreaterOrEqual,

        //
        elapsedTimeString,

        positionHash,
    } as const;
};
