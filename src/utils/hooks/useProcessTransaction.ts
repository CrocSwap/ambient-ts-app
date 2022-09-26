import { ITransaction } from '../../utils/state/graphDataSlice';
import { useMoralis } from 'react-moralis';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import { useState, useEffect } from 'react';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import { toDisplayQty } from '@crocswap-libs/sdk';
import { formatAmount } from '../../utils/numbers';

export const useProcessTransaction = (tx: ITransaction) => {
    const tradeData = useAppSelector((state) => state.tradeData);

    const { account } = useMoralis();
    const isDenomBase = tradeData.isDenomBase;

    const txHash = tx.tx;
    const ownerId = tx.user;

    const isOwnerActiveAccount = ownerId.toLowerCase() === account?.toLowerCase();

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;

    const transactionBaseAddressLowerCase = tx.base.toLowerCase();
    const transactionQuoteAddressLowerCase = tx.quote.toLowerCase();

    const tokenAAddressLowerCase = tokenAAddress.toLowerCase();
    const tokenBAddressLowerCase = tokenBAddress.toLowerCase();

    const transactionMatchesSelectedTokens =
        (transactionBaseAddressLowerCase === tokenAAddressLowerCase ||
            transactionQuoteAddressLowerCase === tokenAAddressLowerCase) &&
        (transactionBaseAddressLowerCase === tokenBAddressLowerCase ||
            transactionQuoteAddressLowerCase === tokenBAddressLowerCase);

    const [truncatedDisplayPrice, setTruncatedDisplayPrice] = useState<string | undefined>();

    const [baseFlowDisplay, setBaseFlowDisplay] = useState<string | undefined>(undefined);
    const [quoteFlowDisplay, setQuoteFlowDisplay] = useState<string | undefined>(undefined);

    useEffect(() => {
        setBaseFlowDisplay(undefined);
        setQuoteFlowDisplay(undefined);
    }, [tx.tx]);

    const baseTokenCharacter = tx.baseSymbol ? getUnicodeCharacter(tx.baseSymbol) : '';
    const quoteTokenCharacter = tx.quoteSymbol ? getUnicodeCharacter(tx.quoteSymbol) : '';

    useEffect(() => {
        // console.log({ tx });
        if (tx.priceDecimalCorrected && tx.invPriceDecimalCorrected) {
            const priceDecimalCorrected = tx.priceDecimalCorrected;
            const invPriceDecimalCorrected = tx.invPriceDecimalCorrected;

            const nonInvertedPriceTruncated =
                priceDecimalCorrected === 0
                    ? '0'
                    : priceDecimalCorrected < 0.0001
                    ? priceDecimalCorrected.toExponential(2)
                    : priceDecimalCorrected < 2
                    ? priceDecimalCorrected.toPrecision(3)
                    : priceDecimalCorrected >= 100000
                    ? formatAmount(priceDecimalCorrected)
                    : priceDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });

            const invertedPriceTruncated =
                invPriceDecimalCorrected === 0
                    ? '0'
                    : invPriceDecimalCorrected < 0.0001
                    ? invPriceDecimalCorrected.toExponential(2)
                    : invPriceDecimalCorrected < 2
                    ? invPriceDecimalCorrected.toPrecision(3)
                    : invPriceDecimalCorrected >= 100000
                    ? formatAmount(invPriceDecimalCorrected)
                    : invPriceDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });

            const truncatedDisplayPrice = isDenomBase
                ? quoteTokenCharacter + invertedPriceTruncated
                : baseTokenCharacter + nonInvertedPriceTruncated;

            // const truncatedDisplayPrice = isDenomBase
            //     ? quoteTokenCharacter + invPriceDecimalCorrected?.toPrecision(3)
            //     : baseTokenCharacter + priceDecimalCorrected?.toPrecision(3);

            setTruncatedDisplayPrice(truncatedDisplayPrice);
        } else {
            setTruncatedDisplayPrice(undefined);
        }
        if (tx.baseFlow && tx.baseDecimals) {
            const baseFlowDisplayNum = parseFloat(toDisplayQty(tx.baseFlow, tx.baseDecimals));
            const baseFlowAbsNum = Math.abs(baseFlowDisplayNum);
            const isBaseFlowNegative = baseFlowDisplayNum > 0;
            const baseFlowDisplayTruncated =
                baseFlowAbsNum === 0
                    ? '0'
                    : baseFlowAbsNum < 0.0001
                    ? baseFlowDisplayNum.toExponential(2)
                    : baseFlowAbsNum < 2
                    ? baseFlowAbsNum.toPrecision(3)
                    : baseFlowAbsNum >= 100000
                    ? formatAmount(baseFlowAbsNum)
                    : // ? baseLiqDisplayNum.toExponential(2)
                      baseFlowAbsNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            const baseFlowDisplayString = isBaseFlowNegative
                ? `(${baseFlowDisplayTruncated})`
                : baseFlowDisplayTruncated;
            setBaseFlowDisplay(baseFlowDisplayString);
        }
        if (tx.quoteFlow && tx.quoteDecimals) {
            const quoteFlowDisplayNum = parseFloat(toDisplayQty(tx.quoteFlow, tx.quoteDecimals));
            const quoteFlowAbsNum = Math.abs(quoteFlowDisplayNum);
            const isQuoteFlowNegative = quoteFlowDisplayNum > 0;
            const quoteFlowDisplayTruncated =
                quoteFlowAbsNum === 0
                    ? '0'
                    : quoteFlowAbsNum < 0.0001
                    ? quoteFlowDisplayNum.toExponential(2)
                    : quoteFlowAbsNum < 2
                    ? quoteFlowAbsNum.toPrecision(3)
                    : quoteFlowAbsNum >= 100000
                    ? formatAmount(quoteFlowAbsNum)
                    : // ? quoteLiqDisplayNum.toExponential(2)
                      quoteFlowAbsNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            const quoteFlowDisplayString = isQuoteFlowNegative
                ? `(${quoteFlowDisplayTruncated})`
                : quoteFlowDisplayTruncated;
            setQuoteFlowDisplay(quoteFlowDisplayString);
        }
    }, [JSON.stringify(tx), isDenomBase]);

    const priceType =
        (isDenomBase && !tx.isBuy) || (!isDenomBase && tx.isBuy) ? 'priceBuy' : 'priceSell';

    const sideType =
        tx.entityType === 'swap' || tx.entityType === 'limitOrder'
            ? (isDenomBase && !tx.isBuy) || (!isDenomBase && tx.isBuy)
                ? 'buy'
                : 'sell'
            : tx.changeType === 'burn'
            ? 'sell'
            : 'buy';

    const transactionTypeSide =
        tx.entityType === 'swap'
            ? 'market'
            : tx.entityType === 'limitOrder'
            ? 'limit'
            : tx.changeType === 'burn'
            ? 'rangeRemove'
            : 'rangeAdd';

    const usdValueNum = tx.valueUSD;

    const usdValueTruncated = !usdValueNum
        ? undefined
        : usdValueNum < 0.0001
        ? usdValueNum.toExponential(2)
        : usdValueNum < 2
        ? usdValueNum.toPrecision(3)
        : usdValueNum >= 100000
        ? formatAmount(usdValueNum)
        : // ? baseLiqDisplayNum.toExponential(2)
          usdValueNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });
};
