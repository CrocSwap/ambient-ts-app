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
export const useProcessTransaction = (
    tx: TransactionIF,
    account = '',
    isAccountView = false,
) => {
    const tradeData = useAppSelector((state) => state.tradeData);
    const blockExplorer = getChainExplorer(tx.chainId);

    const isDenomBase = tradeData.isDenomBase;

    const txHash = tx.tx;
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
    // const baseAddressLowerCase = baseAddress.toLowerCase();
    // const quoteAddressLowerCase = quoteAddress.toLowerCase();

    const isBaseTokenMoneynessGreaterOrEqual =
        getMoneynessRank(tx.base.toLowerCase() + '_' + tx.chainId) -
            getMoneynessRank(tx.quote.toLowerCase() + '_' + tx.chainId) >=
        0;

    // const isBaseTokenMoneynessGreaterOrEqual = useMemo(
    //     () =>
    //         getMoneynessRank(tx.base.toLowerCase() + '_' + tx.chainId) -
    //             getMoneynessRank(tx.quote.toLowerCase() + '_' + tx.chainId) >=
    //         0,
    //     [tx.base, tx.base, tx.chainId],
    // );

    // useEffect(() => {
    //     console.log({ isBaseTokenMoneynessGreaterOrEqual });
    // }, [isBaseTokenMoneynessGreaterOrEqual]);
    // const baseMoneyness = getMoneynessRank(tx.base.toLowerCase() + '_' + tx.chainId);
    // useEffect(() => {
    //     console.log({ baseMoneyness });
    // }, [baseMoneyness]);
    // const quoteMoneyness = getMoneynessRank(tx.quote.toLowerCase() + '_' + tx.chainId);
    // useEffect(() => {
    //     console.log({ quoteMoneyness });
    // }, [quoteMoneyness]);

    const baseTokenSymbol = tx.baseSymbol;
    const quoteTokenSymbol = tx.quoteSymbol;

    const baseTokenAddress = tx.base;
    const baseTokenAddressTruncated = trimString(baseTokenAddress, 6, 0, '…');
    const quoteTokenAddress = tx.quote;
    const quoteTokenAddressTruncated = trimString(quoteTokenAddress, 6, 0, '…');

    const quoteTokenLogo = tx.quoteTokenLogoURI;
    const baseTokenLogo = tx.baseTokenLogoURI;
    // console.log({ quoteTokenLogo });
    // console.log({ baseTokenLogo });

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

            const nonInvertedPriceTruncated =
                priceDecimalCorrected === 0
                    ? '0.00'
                    : priceDecimalCorrected < 0.0001
                    ? priceDecimalCorrected.toExponential(2)
                    : priceDecimalCorrected < 0.8
                    ? priceDecimalCorrected.toPrecision(3)
                    : priceDecimalCorrected < 2
                    ? priceDecimalCorrected.toPrecision(5)
                    : priceDecimalCorrected >= 100000
                    ? formatAmountOld(priceDecimalCorrected)
                    : priceDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });

            const invertedPriceTruncated =
                invPriceDecimalCorrected === 0
                    ? '0.00'
                    : invPriceDecimalCorrected < 0.0001
                    ? invPriceDecimalCorrected.toExponential(2)
                    : invPriceDecimalCorrected < 0.8
                    ? invPriceDecimalCorrected.toPrecision(3)
                    : invPriceDecimalCorrected < 2
                    ? invPriceDecimalCorrected.toPrecision(5)
                    : invPriceDecimalCorrected >= 100000
                    ? formatAmountOld(invPriceDecimalCorrected)
                    : invPriceDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
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
            const nonInvertedBidPriceTruncated =
                bidTickPriceDecimalCorrected === 1000000000000
                    ? '∞'
                    : bidTickPriceDecimalCorrected === 0
                    ? '0.00'
                    : bidTickPriceDecimalCorrected < 0.0001
                    ? bidTickPriceDecimalCorrected.toExponential(2)
                    : bidTickPriceDecimalCorrected < 0.8
                    ? bidTickPriceDecimalCorrected.toPrecision(3)
                    : bidTickPriceDecimalCorrected < 2
                    ? bidTickPriceDecimalCorrected.toPrecision(5)
                    : bidTickPriceDecimalCorrected >= 100000
                    ? formatAmountOld(bidTickPriceDecimalCorrected, 1)
                    : bidTickPriceDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            const invertedBidPriceTruncated =
                bidTickInvPriceDecimalCorrected === 1000000000000
                    ? '∞'
                    : bidTickInvPriceDecimalCorrected === 0
                    ? '0.00'
                    : bidTickInvPriceDecimalCorrected < 0.0001
                    ? bidTickInvPriceDecimalCorrected.toExponential(2)
                    : bidTickInvPriceDecimalCorrected < 0.8
                    ? bidTickInvPriceDecimalCorrected.toPrecision(3)
                    : bidTickInvPriceDecimalCorrected < 2
                    ? bidTickInvPriceDecimalCorrected.toPrecision(5)
                    : bidTickInvPriceDecimalCorrected >= 100000
                    ? formatAmountOld(bidTickInvPriceDecimalCorrected, 1)
                    : bidTickInvPriceDecimalCorrected.toLocaleString(
                          undefined,
                          {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          },
                      );
            const nonInvertedAskPriceTruncated =
                askTickPriceDecimalCorrected === 1000000000000
                    ? '∞'
                    : askTickPriceDecimalCorrected === 0
                    ? '0.00'
                    : askTickPriceDecimalCorrected < 0.0001
                    ? askTickPriceDecimalCorrected.toExponential(2)
                    : askTickPriceDecimalCorrected < 0.8
                    ? askTickPriceDecimalCorrected.toPrecision(3)
                    : askTickPriceDecimalCorrected < 2
                    ? askTickPriceDecimalCorrected.toPrecision(5)
                    : askTickPriceDecimalCorrected >= 100000
                    ? formatAmountOld(askTickPriceDecimalCorrected, 1)
                    : askTickPriceDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            const invertedAskPriceTruncated =
                askTickInvPriceDecimalCorrected === 1000000000000
                    ? '0.00'
                    : askTickInvPriceDecimalCorrected === 0
                    ? '∞'
                    : askTickInvPriceDecimalCorrected < 0.0001
                    ? askTickInvPriceDecimalCorrected.toExponential(2)
                    : askTickInvPriceDecimalCorrected < 0.8
                    ? askTickInvPriceDecimalCorrected.toPrecision(3)
                    : askTickInvPriceDecimalCorrected < 2
                    ? askTickInvPriceDecimalCorrected.toPrecision(5)
                    : askTickInvPriceDecimalCorrected >= 100000
                    ? formatAmountOld(askTickInvPriceDecimalCorrected, 1)
                    : askTickInvPriceDecimalCorrected.toLocaleString(
                          undefined,
                          {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          },
                      );
            truncatedLowDisplayPrice = isDenomBase
                ? `${invertedAskPriceTruncated}`
                : `${nonInvertedBidPriceTruncated}`;
            truncatedHighDisplayPrice = isDenomBase
                ? `${invertedBidPriceTruncated}`
                : `${nonInvertedAskPriceTruncated}`;

            truncatedLowDisplayPriceDenomByMoneyness =
                isBaseTokenMoneynessGreaterOrEqual
                    ? `${nonInvertedAskPriceTruncated}`
                    : `${invertedAskPriceTruncated}`;
            truncatedHighDisplayPriceDenomByMoneyness =
                isBaseTokenMoneynessGreaterOrEqual
                    ? `${nonInvertedBidPriceTruncated}`
                    : `${invertedBidPriceTruncated}`;
        } else {
            truncatedLowDisplayPrice = undefined;
            truncatedHighDisplayPrice = undefined;
        }
    } else {
        if (tx.priceDecimalCorrected && tx.invPriceDecimalCorrected) {
            const priceDecimalCorrected = tx.priceDecimalCorrected;
            const invPriceDecimalCorrected = tx.invPriceDecimalCorrected;

            const nonInvertedPriceTruncated =
                priceDecimalCorrected === 0
                    ? '0.00'
                    : priceDecimalCorrected < 0.0001
                    ? priceDecimalCorrected.toExponential(2)
                    : priceDecimalCorrected < 0.8
                    ? priceDecimalCorrected.toPrecision(3)
                    : priceDecimalCorrected < 2
                    ? priceDecimalCorrected.toPrecision(5)
                    : priceDecimalCorrected >= 100000
                    ? formatAmountOld(priceDecimalCorrected)
                    : priceDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });

            const invertedPriceTruncated =
                invPriceDecimalCorrected === 0
                    ? '0.00'
                    : invPriceDecimalCorrected < 0.0001
                    ? invPriceDecimalCorrected.toExponential(2)
                    : invPriceDecimalCorrected < 0.8
                    ? invPriceDecimalCorrected.toPrecision(3)
                    : invPriceDecimalCorrected < 2
                    ? invPriceDecimalCorrected.toPrecision(5)
                    : invPriceDecimalCorrected >= 100000
                    ? formatAmountOld(invPriceDecimalCorrected)
                    : invPriceDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
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
    }

    if (
        tx.baseFlowDecimalCorrected !== undefined &&
        tx.baseFlowDecimalCorrected !== null
    ) {
        const baseFlowDisplayNum = tx.baseFlowDecimalCorrected;
        const baseFlowAbsNum = Math.abs(baseFlowDisplayNum);
        isBaseFlowPositive = baseFlowDisplayNum > 0;
        const baseFlowDisplayTruncatedShort =
            baseFlowAbsNum === 0
                ? '0 '
                : baseFlowAbsNum < 0.0001
                ? baseFlowAbsNum.toExponential(2)
                : baseFlowAbsNum < 0.1
                ? baseFlowAbsNum.toPrecision(3)
                : baseFlowAbsNum >= 10000
                ? formatAmountOld(baseFlowAbsNum)
                : // ? baseLiqDisplayNum.toExponential(2)
                  baseFlowAbsNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  }) + ' ';
        // const baseFlowDisplayStringShort =
        //     tx.entityType !== 'liqchange' && `${baseFlowDisplayTruncatedShort}`;
        baseFlowDisplayShort = baseFlowDisplayTruncatedShort;

        const baseFlowDisplayTruncatedLong =
            baseFlowAbsNum === 0
                ? '0 '
                : baseFlowAbsNum < 0.0001
                ? baseFlowAbsNum.toExponential(2)
                : baseFlowAbsNum < 0.1
                ? baseFlowAbsNum.toPrecision(3)
                : baseFlowAbsNum >= 1000000000
                ? formatAmountOld(baseFlowAbsNum)
                : // ? baseLiqDisplayNum.toExponential(2)
                  baseFlowAbsNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  }) + ' ';
        // const baseFlowDisplayStringLong =
        //     tx.entityType !== 'liqchange' && `${baseFlowDisplayTruncatedLong}`;
        baseFlowDisplayLong = baseFlowDisplayTruncatedLong;
    }
    if (
        tx.quoteFlowDecimalCorrected !== undefined &&
        tx.quoteFlowDecimalCorrected !== null
    ) {
        const quoteFlowDisplayNum = tx.quoteFlowDecimalCorrected;
        const quoteFlowAbsNum = Math.abs(quoteFlowDisplayNum);
        isQuoteFlowPositive = quoteFlowDisplayNum > 0;
        const quoteFlowDisplayTruncatedShort =
            quoteFlowAbsNum === 0
                ? '0 '
                : quoteFlowAbsNum < 0.0001
                ? quoteFlowAbsNum.toExponential(2)
                : quoteFlowAbsNum < 0.1
                ? quoteFlowAbsNum.toPrecision(3)
                : quoteFlowAbsNum >= 10000
                ? formatAmountOld(quoteFlowAbsNum)
                : // ? quoteLiqDisplayNum.toExponential(2)
                  quoteFlowAbsNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  }) + ' ';
        quoteFlowDisplayShort = quoteFlowDisplayTruncatedShort;
        const quoteFlowDisplayTruncatedLong =
            quoteFlowAbsNum === 0
                ? '0 '
                : quoteFlowAbsNum < 0.0001
                ? quoteFlowAbsNum.toExponential(2)
                : quoteFlowAbsNum < 0.1
                ? quoteFlowAbsNum.toPrecision(3)
                : quoteFlowAbsNum >= 1000000000
                ? formatAmountOld(quoteFlowAbsNum)
                : // ? quoteLiqDisplayNum.toExponential(2)
                  quoteFlowAbsNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  }) + ' ';
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
                ? 'add'
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

    // const sideType =
    //     tx.entityType === 'swap' || tx.entityType === 'limitOrder'
    //         ? (isDenomBase && !tx.isBuy) || (!isDenomBase && tx.isBuy)
    //             ? 'buy'
    //             : 'sell'
    //         : tx.changeType === 'burn'
    //         ? 'sell'
    //         : 'buy';

    const transactionTypeSide =
        tx.entityType === 'liqchange'
            ? tx.changeType === 'mint'
                ? 'rangeAdd'
                : 'rangeRemove'
            : tx.entityType === 'limitOrder'
            ? 'limit'
            : 'market';
    // const transactionTypeSide =
    //     tx.entityType === 'swap'
    //         ? 'market'
    //         : tx.entityType === 'limitOrder'
    //         ? 'limit'
    //         : tx.changeType === 'burn'
    //         ? 'rangeRemove'
    //         : 'rangeAdd';

    const type =
        tx.entityType === 'liqchange'
            ? tx.changeType === 'mint'
                ? 'range'
                : 'range'
            : tx.entityType === 'limitOrder'
            ? 'limit'
            : 'market';
    // const type =
    //     tx.entityType === 'swap'
    //         ? 'market'
    //         : tx.entityType === 'limitOrder'
    //         ? 'limit'
    //         : tx.changeType === 'burn'
    //         ? 'Remove'
    //         : 'Add';

    const sideTypeStyle = `${sideType}_style`;

    const usdValueNum = tx.valueUSD;
    const totalValueUSD = tx.totalValueUSD;
    const totalFlowUSD = tx.totalFlowUSD;
    const totalFlowAbsNum =
        totalFlowUSD !== undefined ? Math.abs(totalFlowUSD) : undefined;

    const usdValueTruncated = !usdValueNum
        ? undefined
        : usdValueNum < 0.01
        ? usdValueNum.toExponential(2) + ' '
        : usdValueNum >= 100000
        ? formatAmountOld(usdValueNum, 2)
        : // ? baseLiqDisplayNum.toExponential(2)
          usdValueNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }) + ' ';

    const usdValueLocaleString = !usdValueNum
        ? undefined
        : usdValueNum < 0.01
        ? usdValueNum.toPrecision(3)
        : // ? baseLiqDisplayNum.toExponential(2)
          usdValueNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const totalValueUSDTruncated = !totalValueUSD
        ? undefined
        : totalValueUSD < 0.01
        ? totalValueUSD.toExponential(2) + ' '
        : totalValueUSD >= 100000
        ? formatAmountOld(totalValueUSD, 2)
        : // ? baseLiqDisplayNum.toExponential(2)
          totalValueUSD.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }) + ' ';

    const totalValueUSDLocaleString = !totalValueUSD
        ? undefined
        : totalValueUSD < 0.01
        ? totalValueUSD.toPrecision(3)
        : // ? baseLiqDisplayNum.toExponential(2)
          totalValueUSD.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const totalFlowUSDTruncated =
        totalFlowAbsNum === undefined
            ? undefined
            : totalFlowAbsNum === 0
            ? '0.00' + ' '
            : totalFlowAbsNum < 0.01
            ? totalFlowAbsNum.toExponential(2) + ' '
            : totalFlowAbsNum >= 100000
            ? formatAmountOld(totalFlowAbsNum, 2)
            : // ? baseLiqDisplayNum.toExponential(2)
              totalFlowAbsNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              }) + ' ';

    const totalFlowUSDLocaleString = !totalFlowAbsNum
        ? undefined
        : totalFlowAbsNum < 0.01
        ? totalFlowAbsNum.toPrecision(3)
        : totalFlowAbsNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    // --------------------------------------------------------

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
    // --------------------OWNER AND ID WALLET DATA

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
        tx.time * 1000,
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
        (isBuy && tx.baseFlow === '0') || (!isBuy && tx.quoteFlow === '0');
    const isBuyQtyZero =
        (!isBuy && tx.baseFlow === '0') || (isBuy && tx.quoteFlow === '0');
    const isOrderRemove =
        tx.entityType === 'limitOrder' && sideType === 'remove';

    const positiveDisplayStyle =
        baseQuantityDisplayShort === '0' ||
        !valueArrows ||
        (isOrderRemove ? isSellQtyZero : isBuyQtyZero) ||
        tx.source === 'manual'
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
