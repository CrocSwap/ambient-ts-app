import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import { formatAmountOld } from '../../utils/numbers';
import trimString from '../../utils/functions/trimString';
import { getMoneynessRank } from '../functions/getMoneynessRank';
import { TransactionIF } from '../../utils/interfaces/exports';
import { getChainExplorer } from '../data/chains';
import moment from 'moment';
import styles from '../../components/Trade/TradeTabs/Transactions/Transactions.module.css';
import { getElapsedTime } from '../../App/functions/getElapsedTime';
import { getFormattedTokenBalance } from '../../App/functions/getFormattedTokenBalance';

export const useProcessTransaction = (
    tx: TransactionIF,
    account = '',
    isAccountView = false,
) => {
    const tradeData = useAppSelector((state) => state.tradeData);
    const blockExplorer = getChainExplorer(tx.chainId);

    const isDenomBase = tradeData.isDenomBase;

    const txHash = tx.txHash;
    const ownerId = tx.user;
    const ensName = tx.ensResolution ? tx.ensResolution : null;
    const isOwnerActiveAccount =
        ownerId.toLowerCase() === account?.toLowerCase();

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;
    // const baseAddress = tradeData.baseToken.address;
    // const quoteAddress = tradeData.quoteToken.address;

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
    const baseTokenAddressTruncated = trimString(baseTokenAddress, 6, 0, '…');
    const quoteTokenAddress = tx.quote;
    const quoteTokenAddressTruncated = trimString(quoteTokenAddress, 6, 0, '…');

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

    let baseFlowDisplayLong;
    let quoteFlowDisplayLong;
    let baseFlowDisplayShort;
    let quoteFlowDisplayShort;

    let isBaseFlowPositive = false;
    let isQuoteFlowPositive = false;

    const baseTokenCharacter = tx.baseSymbol
        ? getUnicodeCharacter(tx.baseSymbol)
        : '';
    const quoteTokenCharacter = tx.quoteSymbol
        ? getUnicodeCharacter(tx.quoteSymbol)
        : '';

    if (tx.entityType === 'limitOrder') {
        if (tx.limitPriceDecimalCorrected && tx.invLimitPriceDecimalCorrected) {
            const priceDecimalCorrected = tx.limitPriceDecimalCorrected;
            const invPriceDecimalCorrected = tx.invLimitPriceDecimalCorrected;

            const nonInvertedPriceTruncated = getFormattedTokenBalance({
                balance: priceDecimalCorrected,
            });
            const invertedPriceTruncated = getFormattedTokenBalance({
                balance: invPriceDecimalCorrected,
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
            const nonInvertedBidPriceTruncated = getFormattedTokenBalance({
                balance: bidTickPriceDecimalCorrected,
            });
            const invertedBidPriceTruncated = getFormattedTokenBalance({
                balance: bidTickInvPriceDecimalCorrected,
            });
            const nonInvertedAskPriceTruncated = getFormattedTokenBalance({
                balance: askTickPriceDecimalCorrected,
            });
            const invertedAskPriceTruncated = getFormattedTokenBalance({
                balance: askTickInvPriceDecimalCorrected,
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

        const nonInvertedPriceTruncated = getFormattedTokenBalance({
            balance: priceDecimalCorrected,
        });
        const invertedPriceTruncated = getFormattedTokenBalance({
            balance: invPriceDecimalCorrected,
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
        const baseFlowDisplayTruncatedShort = getFormattedTokenBalance({
            balance: baseFlowAbsNum,
        });
        baseFlowDisplayShort = baseFlowDisplayTruncatedShort;

        const baseFlowDisplayTruncatedLong = getFormattedTokenBalance({
            balance: baseFlowAbsNum,
        });
        baseFlowDisplayLong = baseFlowDisplayTruncatedLong;
    }
    if (
        tx.quoteFlowDecimalCorrected !== undefined &&
        tx.quoteFlowDecimalCorrected !== null
    ) {
        const quoteFlowDisplayNum = tx.quoteFlowDecimalCorrected;
        const quoteFlowAbsNum = Math.abs(quoteFlowDisplayNum);
        isQuoteFlowPositive = quoteFlowDisplayNum > 0;
        const quoteFlowDisplayTruncatedShort = getFormattedTokenBalance({
            balance: quoteFlowAbsNum,
        });
        quoteFlowDisplayShort = quoteFlowDisplayTruncatedShort;
        const quoteFlowDisplayTruncatedLong = getFormattedTokenBalance({
            balance: quoteFlowAbsNum,
        });
        quoteFlowDisplayLong = quoteFlowDisplayTruncatedLong;
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

    const sideTypeStyle = `${sideType}_style`;

    const usdValueNum = tx.totalValueUSD;
    const totalValueUSD = tx.totalValueUSD;
    const totalFlowUSD = tx.totalValueUSD;
    const totalFlowAbsNum =
        totalFlowUSD !== undefined ? Math.abs(totalFlowUSD) : undefined;

    const usdValueTruncated = getFormattedTokenBalance({
        balance: usdValueNum,
        isUSD: true,
    });
    const usdValueLocaleString = getFormattedTokenBalance({
        balance: usdValueNum,
        isUSD: true,
    });

    const totalValueUSDTruncated = getFormattedTokenBalance({
        balance: totalValueUSD,
        isUSD: true,
    });
    const totalValueUSDLocaleString = getFormattedTokenBalance({
        balance: totalValueUSD,
        isUSD: true,
    });

    const totalFlowUSDTruncated = getFormattedTokenBalance({
        balance: totalFlowAbsNum,
        isUSD: true,
    });
    const totalFlowUSDLocaleString = getFormattedTokenBalance({
        balance: totalFlowAbsNum,
        isUSD: true,
    });

    // --------------------------------------------------------

    const usdValue =
        totalFlowUSDTruncated !== undefined
            ? '$' + totalFlowUSDTruncated
            : totalValueUSDTruncated
            ? '$' + totalValueUSDTruncated
            : usdValueTruncated
            ? '$' + usdValueTruncated
            : '…';

    const txUsdValueLocaleString = totalFlowUSDLocaleString
        ? '$' + totalFlowUSDLocaleString
        : totalValueUSDLocaleString
        ? '$' + totalValueUSDLocaleString
        : usdValueLocaleString
        ? '$' + usdValueLocaleString
        : '…';

    const quantitiesAvailable =
        baseFlowDisplayShort !== undefined ||
        quoteFlowDisplayShort !== undefined;

    const baseQuantityDisplayLong = quantitiesAvailable
        ? baseFlowDisplayLong || '0'
        : '…';

    const quoteQuantityDisplayLong = quantitiesAvailable
        ? quoteFlowDisplayLong || '0'
        : '…';

    const baseQuantityDisplayShort = quantitiesAvailable
        ? `${baseFlowDisplayShort || '0'}`
        : '…';

    const quoteQuantityDisplayShort = quantitiesAvailable
        ? `${quoteFlowDisplayShort || '0'}`
        : '…';

    // --------------------------------------------------------

    const ensNameOrOwnerTruncated = ensName
        ? ensName.length > 13
            ? trimString(ensName, 8, 3, '…')
            : ensName
        : trimString(ownerId, 8, 3, '…');

    const txHashTruncated = trimString(txHash, 6, 4, '…');

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
    const valueArrows = tx.entityType !== 'liqchange';

    const positiveArrow = '↑';
    const negativeArrow = '↓';

    const isSellQtyZero =
        (isBuy && tx.baseFlow === 0) || (!isBuy && tx.quoteFlow === 0);
    const isBuyQtyZero =
        (!isBuy && tx.baseFlow === 0) || (isBuy && tx.quoteFlow === 0);
    const isOrderRemove =
        tx.entityType === 'limitOrder' && sideType === 'remove';

    const positiveDisplayStyle =
        baseQuantityDisplayShort === '0' ||
        !valueArrows ||
        (isOrderRemove ? isSellQtyZero : isBuyQtyZero)
            ? styles.light_grey
            : styles.positive_value;
    const negativeDisplayStyle =
        quoteQuantityDisplayShort === '0' ||
        !valueArrows ||
        (isOrderRemove ? isBuyQtyZero : isSellQtyZero)
            ? styles.light_grey
            : styles.negative_value;

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
        // Transaction type and side data
        sideType,
        transactionTypeSide,
        type,
        sideTypeStyle,

        sideCharacter,
        priceCharacter,
        isBuy,
        positiveDisplayStyle,
        negativeDisplayStyle,

        // Value data
        usdValue,
        txUsdValueLocaleString,

        positiveArrow,
        negativeArrow,
        valueArrows,

        // Token Qty data
        baseTokenCharacter,
        baseQuantityDisplayShort,
        quoteQuantityDisplayShort,
        baseQuantityDisplayLong,
        quoteQuantityDisplayLong,
        quoteTokenCharacter,
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
