import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import trimString from '../../utils/functions/trimString';
import { getMoneynessRank } from '../functions/getMoneynessRank';
import { TransactionIF } from '../../utils/interfaces/exports';
import { getChainExplorer } from '../data/chains';
import moment from 'moment';
import { getElapsedTime } from '../../App/functions/getElapsedTime';
import { getFormattedNumber } from '../../App/functions/getFormattedNumber';
import { getAddress } from 'ethers/lib/utils.js';
import {
    toDisplayPrice,
    priceHalfAboveTick,
    priceHalfBelowTick,
} from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

export const useProcessTransaction = (
    tx: TransactionIF,
    account = '',
    isAccountView = false,
) => {
    const tradeData = useAppSelector((state) => state.tradeData);
    const blockExplorer = getChainExplorer(tx.chainId);

    const isDenomBase = tradeData.isDenomBase;

    const txHash = tx.txHash;
    const ownerId = tx.user ? getAddress(tx.user) : '';

    const ensName = tx.ensResolution ? tx.ensResolution : null;
    const isOwnerActiveAccount =
        ownerId.toLowerCase() === account?.toLowerCase();

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    const transactionBaseAddressLowerCase = tx.base.toLowerCase();
    const transactionQuoteAddressLowerCase = tx.quote.toLowerCase();

    const tokenAAddressLowerCase = tokenAAddress.toLowerCase();
    const tokenBAddressLowerCase = tokenBAddress.toLowerCase();

    const isBaseTokenMoneynessGreaterOrEqual =
        getMoneynessRank(tx.base.toLowerCase() + '_' + tx.chainId) -
            getMoneynessRank(tx.quote.toLowerCase() + '_' + tx.chainId) >=
        0;

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
        } else {
            truncatedDisplayPrice = undefined;
        }
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
        } else {
            truncatedLowDisplayPrice = undefined;
            truncatedHighDisplayPrice = undefined;
        }
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
        });

        estimatedQuoteFlowDisplay = getFormattedNumber({
            value: baseFlowAbsNum * middlePriceDisplayNum,
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
        });
        estimatedBaseFlowDisplay = getFormattedNumber({
            value: quoteFlowAbsNum / middlePriceDisplayNum,
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
        isUSD: true,
    });

    const totalFlowUSD = getFormattedNumber({
        value: totalFlowAbsNum,
        isUSD: true,
    });

    // --------------------------------------------------------

    const usdValue = totalFlowUSD ?? usdValueString;

    const baseQuantityDisplay =
        baseFlowDisplay !== undefined ? `${baseFlowDisplay || '0'}` : '…';

    const quoteQuantityDisplay =
        quoteFlowDisplay !== undefined ? `${quoteFlowDisplay || '0'}` : '…';

    // --------------------------------------------------------

    const ensNameOrOwnerTruncated = ensName
        ? ensName.length > 16
            ? trimString(ensName, 11, 3, '…')
            : ensName
        : trimString(ownerId, 5, 4, '…');

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

    const isLimitRemove =
        tx.entityType === 'limitOrder' && sideType === 'remove';

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
        truncatedDisplayPrice,
        truncatedDisplayPriceDenomByMoneyness,
        truncatedLowDisplayPrice,
        truncatedHighDisplayPrice,
        truncatedLowDisplayPriceDenomByMoneyness,
        truncatedHighDisplayPriceDenomByMoneyness,
        middlePriceDisplayNum,
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
    } as const;
};
