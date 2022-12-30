import { ITransaction } from '../../utils/state/graphDataSlice';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { useState, useEffect, useMemo } from 'react';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import { formatAmountOld } from '../../utils/numbers';
import trimString from '../../utils/functions/trimString';
import { getMoneynessRank } from '../functions/getMoneynessRank';

export const useProcessTransaction = (tx: ITransaction, account: string) => {
    const tradeData = useAppSelector((state) => state.tradeData);
    const blockExplorer = 'https://goerli.etherscan.io/';
    // const blockExplorer = chainData?.blockExplorer;

    const isDenomBase = tradeData.isDenomBase;

    const txHash = tx.tx;
    const ownerId = tx.user;
    const ensName = tx.ensResolution ? tx.ensResolution : null;
    const isOwnerActiveAccount = ownerId.toLowerCase() === account?.toLowerCase();

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

    const isBaseTokenMoneynessGreaterOrEqual = useMemo(
        () =>
            getMoneynessRank(tx.base.toLowerCase() + '_' + tx.chainId) -
                getMoneynessRank(tx.quote.toLowerCase() + '_' + tx.chainId) >=
            0,
        [tx.base, tx.base, tx.chainId],
    );

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
    const quoteTokenAddress = tx.quote;

    const quoteTokenLogo = tx.quoteTokenLogoURI;
    const baseTokenLogo = tx.baseTokenLogoURI;
    // console.log({ quoteTokenLogo });
    // console.log({ baseTokenLogo });

    const transactionMatchesSelectedTokens =
        (transactionBaseAddressLowerCase === tokenAAddressLowerCase ||
            transactionQuoteAddressLowerCase === tokenAAddressLowerCase) &&
        (transactionBaseAddressLowerCase === tokenBAddressLowerCase ||
            transactionQuoteAddressLowerCase === tokenBAddressLowerCase);

    const [truncatedDisplayPrice, setTruncatedDisplayPrice] = useState<string | undefined>();
    const [truncatedDisplayPriceDenomByMoneyness, setTruncatedDisplayPriceDenomByMoneyness] =
        useState<string | undefined>();
    const [truncatedLowDisplayPrice, setTruncatedLowDisplayPrice] = useState<string | undefined>();
    const [truncatedHighDisplayPrice, setTruncatedHighDisplayPrice] = useState<
        string | undefined
    >();
    const [truncatedLowDisplayPriceDenomByMoneyness, setTruncatedLowDisplayPriceDenomByMoneyness] =
        useState<string | undefined>();
    const [
        truncatedHighDisplayPriceDenomByMoneyness,
        setTruncatedHighDisplayPriceDenomByMoneyness,
    ] = useState<string | undefined>();

    const [baseFlowDisplay, setBaseFlowDisplay] = useState<string | undefined>(undefined);
    const [quoteFlowDisplay, setQuoteFlowDisplay] = useState<string | undefined>(undefined);
    const [isBaseFlowPositive, setIsBaseFlowPositive] = useState(false);
    const [isQuoteFlowPositive, setIsQuoteFlowPositive] = useState(false);

    useEffect(() => {
        setBaseFlowDisplay(undefined);
        setQuoteFlowDisplay(undefined);
    }, [tx.tx]);

    const baseTokenCharacter = tx.baseSymbol ? getUnicodeCharacter(tx.baseSymbol) : '';
    const quoteTokenCharacter = tx.quoteSymbol ? getUnicodeCharacter(tx.quoteSymbol) : '';

    useEffect(() => {
        // setTruncatedDisplayPrice(undefined);
        if (tx.entityType === 'limitOrder') {
            if (tx.limitPriceDecimalCorrected && tx.invLimitPriceDecimalCorrected) {
                const priceDecimalCorrected = tx.limitPriceDecimalCorrected;
                const invPriceDecimalCorrected = tx.invLimitPriceDecimalCorrected;

                const nonInvertedPriceTruncated =
                    priceDecimalCorrected === 0
                        ? '0.00'
                        : priceDecimalCorrected < 0.0001
                        ? priceDecimalCorrected.toExponential(2)
                        : priceDecimalCorrected < 2
                        ? priceDecimalCorrected.toPrecision(3)
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
                        : invPriceDecimalCorrected < 2
                        ? invPriceDecimalCorrected.toPrecision(3)
                        : invPriceDecimalCorrected >= 100000
                        ? formatAmountOld(invPriceDecimalCorrected)
                        : invPriceDecimalCorrected.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          });

                const truncatedDisplayPriceDenomByMoneyness = isBaseTokenMoneynessGreaterOrEqual
                    ? nonInvertedPriceTruncated
                    : invertedPriceTruncated;

                const truncatedDisplayPrice = isDenomBase
                    ? quoteTokenCharacter + invertedPriceTruncated
                    : baseTokenCharacter + nonInvertedPriceTruncated;

                setTruncatedDisplayPrice(truncatedDisplayPrice);
                setTruncatedDisplayPriceDenomByMoneyness(truncatedDisplayPriceDenomByMoneyness);
            } else {
                setTruncatedDisplayPrice(undefined);
            }
        } else if (tx.entityType === 'liqchange') {
            if (
                tx.bidTickPriceDecimalCorrected &&
                tx.bidTickInvPriceDecimalCorrected &&
                tx.askTickPriceDecimalCorrected &&
                tx.askTickInvPriceDecimalCorrected
            ) {
                const bidTickPriceDecimalCorrected = tx.bidTickPriceDecimalCorrected;
                const bidTickInvPriceDecimalCorrected = tx.bidTickInvPriceDecimalCorrected;
                const askTickPriceDecimalCorrected = tx.askTickPriceDecimalCorrected;
                const askTickInvPriceDecimalCorrected = tx.askTickInvPriceDecimalCorrected;
                const nonInvertedBidPriceTruncated =
                    bidTickPriceDecimalCorrected === 1000000000000
                        ? '∞'
                        : bidTickPriceDecimalCorrected === 0
                        ? '0.00'
                        : bidTickPriceDecimalCorrected < 0.0001
                        ? bidTickPriceDecimalCorrected.toExponential(2)
                        : bidTickPriceDecimalCorrected < 2
                        ? bidTickPriceDecimalCorrected.toPrecision(3)
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
                        : bidTickInvPriceDecimalCorrected < 2
                        ? bidTickInvPriceDecimalCorrected.toPrecision(3)
                        : bidTickInvPriceDecimalCorrected >= 100000
                        ? formatAmountOld(bidTickInvPriceDecimalCorrected, 1)
                        : bidTickInvPriceDecimalCorrected.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          });
                const nonInvertedAskPriceTruncated =
                    askTickPriceDecimalCorrected === 1000000000000
                        ? '∞'
                        : askTickPriceDecimalCorrected === 0
                        ? '0.00'
                        : askTickPriceDecimalCorrected < 0.0001
                        ? askTickPriceDecimalCorrected.toExponential(2)
                        : askTickPriceDecimalCorrected < 2
                        ? askTickPriceDecimalCorrected.toPrecision(3)
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
                        : askTickInvPriceDecimalCorrected < 2
                        ? askTickInvPriceDecimalCorrected.toPrecision(3)
                        : askTickInvPriceDecimalCorrected >= 100000
                        ? formatAmountOld(askTickInvPriceDecimalCorrected, 1)
                        : askTickInvPriceDecimalCorrected.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          });
                const truncatedLowDisplayPrice = isDenomBase
                    ? `${quoteTokenCharacter}${invertedAskPriceTruncated}`
                    : `${baseTokenCharacter}${nonInvertedAskPriceTruncated}`;
                const truncatedHighDisplayPrice = isDenomBase
                    ? `${quoteTokenCharacter}${invertedBidPriceTruncated}`
                    : `${baseTokenCharacter}${nonInvertedBidPriceTruncated}`;

                const truncatedLowDisplayPriceDenomByMoneyness = isBaseTokenMoneynessGreaterOrEqual
                    ? `${nonInvertedAskPriceTruncated}`
                    : `${invertedAskPriceTruncated}`;
                const truncatedHighDisplayPriceDenomByMoneyness = isBaseTokenMoneynessGreaterOrEqual
                    ? `${nonInvertedBidPriceTruncated}`
                    : `${invertedBidPriceTruncated}`;

                setTruncatedLowDisplayPrice(truncatedLowDisplayPrice);
                setTruncatedHighDisplayPrice(truncatedHighDisplayPrice);
                setTruncatedLowDisplayPriceDenomByMoneyness(
                    truncatedLowDisplayPriceDenomByMoneyness,
                );
                setTruncatedHighDisplayPriceDenomByMoneyness(
                    truncatedHighDisplayPriceDenomByMoneyness,
                );
            } else {
                setTruncatedLowDisplayPrice(undefined);
                setTruncatedHighDisplayPrice(undefined);
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
                        : priceDecimalCorrected < 2
                        ? priceDecimalCorrected.toPrecision(3)
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
                        : invPriceDecimalCorrected < 2
                        ? invPriceDecimalCorrected.toPrecision(3)
                        : invPriceDecimalCorrected >= 100000
                        ? formatAmountOld(invPriceDecimalCorrected)
                        : invPriceDecimalCorrected.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          });

                const truncatedDisplayPriceDenomByMoneyness = isBaseTokenMoneynessGreaterOrEqual
                    ? nonInvertedPriceTruncated
                    : invertedPriceTruncated;

                const truncatedDisplayPrice = isDenomBase
                    ? quoteTokenCharacter + invertedPriceTruncated
                    : baseTokenCharacter + nonInvertedPriceTruncated;

                setTruncatedDisplayPrice(truncatedDisplayPrice);
                setTruncatedDisplayPriceDenomByMoneyness(truncatedDisplayPriceDenomByMoneyness);
            } else {
                setTruncatedDisplayPrice(undefined);
            }
        }

        if (tx.baseFlowDecimalCorrected !== undefined && tx.baseFlowDecimalCorrected !== null) {
            const baseFlowDisplayNum = tx.baseFlowDecimalCorrected;
            const baseFlowAbsNum = Math.abs(baseFlowDisplayNum);
            const isBaseFlowPositive = baseFlowDisplayNum > 0;
            setIsBaseFlowPositive(isBaseFlowPositive);
            const baseFlowDisplayTruncated =
                baseFlowAbsNum === 0
                    ? '0.00 '
                    : baseFlowAbsNum < 0.0001
                    ? baseFlowAbsNum.toExponential(2)
                    : baseFlowAbsNum < 0.01
                    ? baseFlowAbsNum.toPrecision(3)
                    : baseFlowAbsNum >= 10000
                    ? formatAmountOld(baseFlowAbsNum)
                    : // ? baseLiqDisplayNum.toExponential(2)
                      baseFlowAbsNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      }) + ' ';
            const baseFlowDisplayString =
                tx.entityType !== 'liqchange' && isBaseFlowPositive
                    ? `${baseFlowDisplayTruncated}`
                    : `${baseFlowDisplayTruncated}`;
            setBaseFlowDisplay(baseFlowDisplayString);
        }
        if (tx.quoteFlowDecimalCorrected !== undefined && tx.quoteFlowDecimalCorrected !== null) {
            const quoteFlowDisplayNum = tx.quoteFlowDecimalCorrected;
            const quoteFlowAbsNum = Math.abs(quoteFlowDisplayNum);
            const isQuoteFlowPositive = quoteFlowDisplayNum > 0;
            setIsQuoteFlowPositive(isQuoteFlowPositive);
            const quoteFlowDisplayTruncated =
                quoteFlowAbsNum === 0
                    ? '0.00 '
                    : quoteFlowAbsNum < 0.0001
                    ? quoteFlowAbsNum.toExponential(2)
                    : quoteFlowAbsNum < 0.01
                    ? quoteFlowAbsNum.toPrecision(3)
                    : quoteFlowAbsNum >= 10000
                    ? formatAmountOld(quoteFlowAbsNum)
                    : // ? quoteLiqDisplayNum.toExponential(2)
                      quoteFlowAbsNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      }) + ' ';
            const quoteFlowDisplayString =
                tx.entityType !== 'liqchange' && isQuoteFlowPositive
                    ? // (isQuoteFlowNegative && tx.entityType !== 'liqchange') ||
                      // (!isQuoteFlowNegative && tx.entityType === 'liqchange')
                      `${quoteFlowDisplayTruncated}`
                    : `${quoteFlowDisplayTruncated}`;
            setQuoteFlowDisplay(quoteFlowDisplayString);
        }
    }, [JSON.stringify(tx), isDenomBase, isBaseTokenMoneynessGreaterOrEqual]);

    const priceType =
        (isDenomBase && !tx.isBuy) || (!isDenomBase && tx.isBuy) ? 'priceBuy' : 'priceSell';

    // const sideCharacter = isDenomBase ? baseTokenCharacter : quoteTokenCharacter
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

    const usdValueNum = tx.valueUSD;
    const totalValueUSD = tx.totalValueUSD;
    const totalFlowUSD = tx.totalFlowUSD;
    const totalFlowAbsNum = totalFlowUSD !== undefined ? Math.abs(totalFlowUSD) : undefined;

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

    const quantitiesAvailable = baseFlowDisplay !== undefined || quoteFlowDisplay !== undefined;

    const baseDisplay = quantitiesAvailable ? baseFlowDisplay || '0.00' : '…';

    const quoteDisplay = quantitiesAvailable ? quoteFlowDisplay || '0.00' : '…';

    const baseDisplayFrontend = quantitiesAvailable
        ? `${baseTokenCharacter}${baseFlowDisplay || '0.00'}`
        : '…';

    const quoteDisplayFrontend = quantitiesAvailable
        ? `${quoteTokenCharacter}${quoteFlowDisplay || '0.00'}`
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
        ? ensName.length > 10
            ? trimString(ensName, 5, 3, '…')
            : ensName
        : trimString(ownerId, 6, 0, '…');

    const txHashTruncated = trimString(txHash, 6, 0, '…');

    const userNameToDisplay = isOwnerActiveAccount ? 'You' : ensNameOrOwnerTruncated;

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

        // Value data
        usdValue,
        txUsdValueLocaleString,

        // Token Qty data
        baseTokenCharacter,
        baseDisplay,
        quoteDisplay,
        quoteTokenCharacter,
        baseFlowDisplay,
        quoteFlowDisplay,
        baseTokenSymbol,
        baseTokenAddress,
        quoteTokenSymbol,
        quoteTokenAddress,
        baseDisplayFrontend,
        quoteDisplayFrontend,
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
    } as const;
};
