import { useMoralis } from 'react-moralis';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { useState, useEffect, useMemo } from 'react';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import { formatAmount } from '../../utils/numbers';
import trimString from '../../utils/functions/trimString';
import { LimitOrderIF } from '../interfaces/exports';
import { getMoneynessRank } from '../functions/getMoneynessRank';

export const useProcessOrder = (limitOrder: LimitOrderIF) => {
    const { account } = useMoralis();
    const tradeData = useAppSelector((state) => state.tradeData);
    // eslint-disable-next-line
    const lastBlockNumber = useAppSelector((state) => state.graphData).lastBlock;

    const selectedBaseToken = tradeData.baseToken.address.toLowerCase();
    const selectedQuoteToken = tradeData.quoteToken.address.toLowerCase();

    const baseTokenSymbol = limitOrder.baseSymbol;
    const quoteTokenSymbol = limitOrder.quoteSymbol;

    const quoteTokenLogo = limitOrder.quoteTokenLogoURI;
    const baseTokenLogo = limitOrder.baseTokenLogoURI;

    const isOwnerActiveAccount = limitOrder.user.toLowerCase() === account?.toLowerCase();
    const isDenomBase = tradeData.isDenomBase;

    const ownerId = limitOrder.ensResolution ? limitOrder.ensResolution : limitOrder.user;
    const ensName = limitOrder.ensResolution ? limitOrder.ensResolution : null;

    const isOrderFilled = !!limitOrder.latestCrossPivotTime;

    const posHash = limitOrder.limitOrderIdentifier.slice(42);
    const [truncatedDisplayPrice, setTruncatedDisplayPrice] = useState<string | undefined>();

    const [truncatedDisplayPriceDenomByMoneyness, setTruncatedDisplayPriceDenomByMoneyness] =
        useState<string | undefined>();

    const baseTokenCharacter = limitOrder.baseSymbol
        ? getUnicodeCharacter(limitOrder.baseSymbol)
        : '';
    const quoteTokenCharacter = limitOrder.quoteSymbol
        ? getUnicodeCharacter(limitOrder.quoteSymbol)
        : '';

    const isBaseTokenMoneynessGreaterOrEqual = useMemo(
        () =>
            getMoneynessRank(limitOrder.base.toLowerCase() + '_' + limitOrder.chainId) -
                getMoneynessRank(limitOrder.quote.toLowerCase() + '_' + limitOrder.chainId) >=
            0,
        [limitOrder.base, limitOrder.base, limitOrder.chainId],
    );

    useEffect(() => {
        // console.log({ limitOrder });
        if (limitOrder.limitPriceDecimalCorrected && limitOrder.invLimitPriceDecimalCorrected) {
            const priceDecimalCorrected = limitOrder.limitPriceDecimalCorrected;
            const invPriceDecimalCorrected = limitOrder.invLimitPriceDecimalCorrected;

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

            const truncatedDisplayPriceDenomByMoneyness = isBaseTokenMoneynessGreaterOrEqual
                ? nonInvertedPriceTruncated
                : invertedPriceTruncated;

            const truncatedDisplayPrice = isDenomBase
                ? `${quoteTokenCharacter}${invertedPriceTruncated}`
                : `${baseTokenCharacter}${nonInvertedPriceTruncated}`;

            setTruncatedDisplayPrice(truncatedDisplayPrice);
            setTruncatedDisplayPriceDenomByMoneyness(truncatedDisplayPriceDenomByMoneyness);
        } else {
            setTruncatedDisplayPrice(undefined);
        }
    }, [JSON.stringify(limitOrder), isDenomBase]);

    const priceType =
        (isDenomBase && !limitOrder.isBid) || (!isDenomBase && limitOrder.isBid)
            ? 'priceBuy'
            : 'priceSell';

    const side =
        (isDenomBase && !limitOrder.isBid) || (!isDenomBase && limitOrder.isBid) ? 'buy' : 'sell';

    const type = 'order';

    const baseTokenAddressLowerCase = limitOrder.base.toLowerCase();
    const quoteTokenAddressLowerCase = limitOrder.quote.toLowerCase();

    const orderMatchesSelectedTokens =
        selectedBaseToken === baseTokenAddressLowerCase &&
        selectedQuoteToken === quoteTokenAddressLowerCase;

    const liqBaseNum = limitOrder.positionLiqBaseDecimalCorrected;
    const liqQuoteNum = limitOrder.positionLiqQuoteDecimalCorrected;

    const baseQty =
        liqBaseNum === 0
            ? '0'
            : liqBaseNum < 0.0001
            ? liqBaseNum.toExponential(2)
            : liqBaseNum < 2
            ? liqBaseNum.toPrecision(3)
            : liqBaseNum >= 100000
            ? formatAmount(liqBaseNum)
            : // ? baseLiqDisplayNum.toExponential(2)
              liqBaseNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });
    const quoteQty =
        liqQuoteNum === 0
            ? '0'
            : liqQuoteNum < 0.0001
            ? liqQuoteNum.toExponential(2)
            : liqQuoteNum < 2
            ? liqQuoteNum.toPrecision(3)
            : liqQuoteNum >= 100000
            ? formatAmount(liqQuoteNum)
            : // ? baseLiqDisplayNum.toExponential(2)
              liqQuoteNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const usdValueNum = limitOrder.positionLiqTotalUSD;
    const usdValueTruncated = !usdValueNum
        ? undefined
        : usdValueNum < 0.001
        ? usdValueNum.toExponential(2) + ' '
        : usdValueNum >= 100000
        ? formatAmount(usdValueNum)
        : // ? baseLiqDisplayNum.toExponential(2)
          usdValueNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }) + ' ';

    // -----------------------------------------------------------------------------------------
    // eslint-disable-next-line
    const [positionLiqTotalUSD, setTotalValueUSD] = useState<number | undefined>();
    // eslint-disable-next-line
    const [lowPriceDisplay, setLowPriceDisplay] = useState<string | undefined>();
    // eslint-disable-next-line
    const [highPriceDisplay, setHighPriceDisplay] = useState<string | undefined>();
    // eslint-disable-next-line
    const [bidTick, setBidTick] = useState<number | undefined>();
    // eslint-disable-next-line
    const [askTick, setAskTick] = useState<number | undefined>();
    // eslint-disable-next-line
    const [positionLiquidity, setPositionLiquidity] = useState<string | undefined>();
    // eslint-disable-next-line
    const [posLiqBaseDecimalCorrected, setPosLiqBaseDecimalCorrected] = useState<
        number | undefined
    >();
    // eslint-disable-next-line
    const [posLiqQuoteDecimalCorrected, setPosLiqQuoteDecimalCorrected] = useState<
        number | undefined
    >();
    // eslint-disable-next-line
    const positionStatsCacheEndpoint = 'https://809821320828123.de:5000/position_stats?';

    // useEffect(() => {
    //     if (
    //         limitOrder.chainId &&
    //         limitOrder.poolIdx &&
    //         limitOrder.user &&
    //         limitOrder.base &&
    //         limitOrder.quote &&
    //         limitOrder.bidTick &&
    //         limitOrder.askTick
    //     ) {
    //         (async () => {
    //             // console.log('fetching details');
    //             fetch(
    //                 positionStatsCacheEndpoint +
    //                     new URLSearchParams({
    //                         chainId: limitOrder.chainId,
    //                         user: limitOrder.user,
    //                         base: limitOrder.base,
    //                         quote: limitOrder.quote,
    //                         poolIdx: limitOrder.poolIdx.toString(),
    //                         bidTick: limitOrder.bidTick.toString(),
    //                         askTick: limitOrder.askTick.toString(),
    //                         addValue: 'true',
    //                         positionType: 'knockout',
    //                         isBid: limitOrder.isBid.toString(),
    //                         omitAPY: 'true',
    //                         ensResolution: 'true',
    //                     }),
    //             )
    //                 .then((response) => response.json())
    //                 .then((json) => {
    //                     const orderData = json?.data;
    //                     setPosLiqBaseDecimalCorrected(
    //                         orderData?.positionLiqBaseDecimalCorrected ?? 0,
    //                     );
    //                     setPosLiqQuoteDecimalCorrected(
    //                         orderData?.positionLiqQuoteDecimalCorrected ?? 0,
    //                     );

    //                     setTotalValueUSD(orderData?.totalValueUSD);

    //                     isDenomBase
    //                         ? setLowPriceDisplay(orderData.askTickInvPriceDecimalCorrected)
    //                         : setLowPriceDisplay(orderData.askTickPriceDecimalCorrected);
    //                     isDenomBase
    //                         ? setHighPriceDisplay(orderData.bidTickInvPriceDecimalCorrected)
    //                         : setHighPriceDisplay(orderData.bidTickPriceDecimalCorrected);
    //                     setPositionLiquidity(orderData.positionLiq);
    //                     setBidTick(orderData.bidTick);
    //                     setAskTick(orderData.askTick);

    //                 });
    //         })();
    //     }
    // }, [limitOrder, lastBlockNumber, isDenomBase]);

    // -----------------------------------------------------------------------------------------

    // ------------------------------------------------------------------

    const quantitiesAvailable = baseQty !== undefined || quoteQty !== undefined;

    const baseDisplayFrontend = quantitiesAvailable
        ? `${baseTokenCharacter}${baseQty || '0.00'}`
        : '…';

    const quoteDisplayFrontend = quantitiesAvailable
        ? `${quoteTokenCharacter}${quoteQty || '0.00'}`
        : '…';
    const baseDisplay = quantitiesAvailable ? baseQty || '0.00' : '…';

    const quoteDisplay = quantitiesAvailable ? quoteQty || '0.00' : '…';
    // ------------------------------------------------------------------
    const usdValue = usdValueTruncated ? usdValueTruncated : '…';

    const ensNameOrOwnerTruncated = ensName
        ? ensName.length > 10
            ? trimString(ensName, 5, 3, '…')
            : ensName
        : trimString(ownerId, 6, 0, '…');
    const posHashTruncated = trimString(posHash, 6, 0, '…');

    const userNameToDisplay = isOwnerActiveAccount ? 'You' : ensNameOrOwnerTruncated;

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
        side,
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
        baseDisplay,
        quoteDisplay,
        baseTokenSymbol,
        quoteTokenSymbol,
        isDenomBase,
        baseTokenAddressLowerCase,
        quoteTokenAddressLowerCase,

        // open order status
        isOrderFilled,

        // price
        lowPriceDisplay,
        highPriceDisplay,

        // tik
        bidTick,
        askTick,

        // liquidity
        posLiqBaseDecimalCorrected,
        posLiqQuoteDecimalCorrected,
        positionLiquidity,
        positionLiqTotalUSD,

        // transaction matches selected token
        orderMatchesSelectedTokens,
    };
};
