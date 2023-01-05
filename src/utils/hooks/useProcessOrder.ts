import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { useState, useEffect, useMemo } from 'react';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import { formatAmountOld } from '../../utils/numbers';
import trimString from '../../utils/functions/trimString';
import { LimitOrderIF } from '../interfaces/exports';
import { getMoneynessRank } from '../functions/getMoneynessRank';

export const useProcessOrder = (limitOrder: LimitOrderIF, account: string) => {
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

    const isOrderFilled = limitOrder.claimableLiq !== '0';
    // const isOrderFilled = !!limitOrder.latestCrossPivotTime;

    const posHash = limitOrder.limitOrderIdentifier?.slice(42);
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

    const [startPriceDisplay, setStartPriceDisplay] = useState<string | undefined>();
    const [finishPriceDisplay, setFinishPriceDisplay] = useState<string | undefined>();

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
                    ? formatAmountOld(priceDecimalCorrected)
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
                    ? formatAmountOld(invPriceDecimalCorrected)
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
        const askTickInvPrice = limitOrder.askTickInvPriceDecimalCorrected;
        const askTickPrice = limitOrder.askTickPriceDecimalCorrected;
        const bidTickInvPrice = limitOrder.bidTickInvPriceDecimalCorrected;
        const bidTickPrice = limitOrder.bidTickPriceDecimalCorrected;
        const isBid = limitOrder.isBid;

        if (askTickPrice && askTickInvPrice && bidTickPrice && bidTickInvPrice) {
            const startPriceDisplayNum = isDenomBase
                ? isBid
                    ? askTickInvPrice
                    : bidTickInvPrice
                : isBid
                ? askTickPrice
                : bidTickPrice;

            const finishPriceDisplayNum = isDenomBase
                ? isBid
                    ? bidTickInvPrice
                    : askTickInvPrice
                : isBid
                ? bidTickPrice
                : askTickPrice;

            const startPriceDisplay =
                startPriceDisplayNum === 0
                    ? '0'
                    : startPriceDisplayNum < 0.0001
                    ? startPriceDisplayNum.toExponential(2)
                    : startPriceDisplayNum < 1
                    ? startPriceDisplayNum.toPrecision(3)
                    : startPriceDisplayNum < 2
                    ? startPriceDisplayNum.toPrecision(5)
                    : startPriceDisplayNum >= 100000
                    ? formatAmountOld(startPriceDisplayNum)
                    : // ? baseLiqDisplayNum.toExponential(2)
                      startPriceDisplayNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });

            const finishPriceDisplay =
                finishPriceDisplayNum === 0
                    ? '0'
                    : finishPriceDisplayNum < 0.0001
                    ? finishPriceDisplayNum.toExponential(2)
                    : finishPriceDisplayNum < 1
                    ? finishPriceDisplayNum.toPrecision(3)
                    : startPriceDisplayNum < 2
                    ? startPriceDisplayNum.toPrecision(5)
                    : finishPriceDisplayNum >= 100000
                    ? formatAmountOld(finishPriceDisplayNum)
                    : // ? baseLiqDisplayNum.toExponential(2)
                      finishPriceDisplayNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });

            setStartPriceDisplay(startPriceDisplay);
            setFinishPriceDisplay(finishPriceDisplay);
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

    const liqBaseNum =
        limitOrder.positionLiqBaseDecimalCorrected !== 0
            ? limitOrder.positionLiqBaseDecimalCorrected
            : limitOrder.claimableLiqBaseDecimalCorrected;
    const liqQuoteNum =
        limitOrder.positionLiqQuoteDecimalCorrected !== 0
            ? limitOrder.positionLiqQuoteDecimalCorrected
            : limitOrder.claimableLiqQuoteDecimalCorrected;

    const baseQty = !liqBaseNum
        ? '0'
        : liqBaseNum < 0.0001
        ? liqBaseNum.toExponential(2)
        : liqBaseNum < 2
        ? liqBaseNum.toPrecision(3)
        : liqBaseNum >= 100000
        ? formatAmountOld(liqBaseNum)
        : // ? baseLiqDisplayNum.toExponential(2)
          liqBaseNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });
    const quoteQty = !liqQuoteNum
        ? '0'
        : liqQuoteNum < 0.0001
        ? liqQuoteNum.toExponential(2)
        : liqQuoteNum < 2
        ? liqQuoteNum.toPrecision(3)
        : liqQuoteNum >= 100000
        ? formatAmountOld(liqQuoteNum)
        : // ? baseLiqDisplayNum.toExponential(2)
          liqQuoteNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const usdValueNum = limitOrder.totalValueUSD;
    // const usdValueNum =
    //     limitOrder.totalValueUSD !== 0 ? limitOrder.totalValueUSD : limitOrder.claimableLiqTotalUSD;

    const usdValueTruncated =
        usdValueNum === undefined
            ? undefined
            : usdValueNum === 0
            ? '0.00 '
            : usdValueNum < 0.001
            ? usdValueNum.toExponential(2) + ' '
            : usdValueNum >= 99999
            ? formatAmountOld(usdValueNum)
            : // ? baseLiqDisplayNum.toExponential(2)
              usdValueNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              }) + ' ';

    const usdValueLocaleString =
        usdValueNum === undefined
            ? '…'
            : usdValueNum === 0
            ? '0.00 '
            : usdValueNum < 0.01
            ? usdValueNum.toPrecision(3)
            : // ? baseLiqDisplayNum.toExponential(2)
              usdValueNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    // -----------------------------------------------------------------------------------------
    // eslint-disable-next-line
    const [positionLiqTotalUSD, setTotalValueUSD] = useState<number | undefined>();

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
        usdValueLocaleString,

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
        startPriceDisplay,
        finishPriceDisplay,

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
