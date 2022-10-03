import { useEffect, useState } from 'react';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { ILimitOrderState } from '../../utils/state/graphDataSlice';

interface IOrderRemovalProps {
    limitOrder: ILimitOrderState;
}

export default function OrderRemoval(props: IOrderRemovalProps) {
    const { limitOrder } = props;

    const lastBlockNumber = useAppSelector((state) => state.graphData).lastBlock;
    const isDenomBase = useAppSelector((state) => state.tradeData.isDenomBase);

    const [posLiqBaseDecimalCorrected, setPosLiqBaseDecimalCorrected] = useState<
        number | undefined
    >();
    const [posLiqQuoteDecimalCorrected, setPosLiqQuoteDecimalCorrected] = useState<
        number | undefined
    >();

    const [userDisplay, setUserDisplay] = useState<string | undefined>();

    const [lowPriceDisplay, setLowPriceDisplay] = useState<string | undefined>();
    const [highPriceDisplay, setHighPriceDisplay] = useState<string | undefined>();

    const [bidTick, setBidTick] = useState<number | undefined>();
    const [askTick, setAskTick] = useState<number | undefined>();

    const [positionLiquidity, setPositionLiquidity] = useState<string | undefined>();
    const [baseSymbol, setBaseSymbol] = useState<string | undefined>();
    const [quoteSymbol, setQuoteSymbol] = useState<string | undefined>();
    // const [lastUpdatedTime, setLastUpdatedTime] = useState<string | undefined>();

    // const [feesBaseDecimalCorrected, setFeeLiqBaseDecimalCorrected] = useState<
    //     number | undefined
    // >();
    // const [feesQuoteDecimalCorrected, setFeeLiqQuoteDecimalCorrected] = useState<
    //     number | undefined
    // >();
    const [positionLiqTotalUSD, setTotalValueUSD] = useState<number | undefined>();

    const positionStatsCacheEndpoint = 'https://809821320828123.de:5000/position_stats?';

    useEffect(() => {
        if (
            limitOrder.chainId &&
            limitOrder.poolIdx &&
            limitOrder.user &&
            limitOrder.base &&
            limitOrder.quote &&
            limitOrder.bidTick &&
            limitOrder.askTick
        ) {
            (async () => {
                // console.log('fetching details');
                fetch(
                    positionStatsCacheEndpoint +
                        new URLSearchParams({
                            chainId: limitOrder.chainId,
                            user: limitOrder.user,
                            base: limitOrder.base,
                            quote: limitOrder.quote,
                            poolIdx: limitOrder.poolIdx.toString(),
                            bidTick: limitOrder.bidTick.toString(),
                            askTick: limitOrder.askTick.toString(),
                            addValue: 'true',
                            positionType: 'knockout',
                            isBid: limitOrder.isBid.toString(),
                            omitAPY: 'true',
                            ensResolution: 'true',
                        }),
                )
                    .then((response) => response.json())
                    .then((json) => {
                        const orderData = json?.data;
                        // console.log({ orderData });
                        setPosLiqBaseDecimalCorrected(
                            orderData?.positionLiqBaseDecimalCorrected ?? 0,
                        );
                        setPosLiqQuoteDecimalCorrected(
                            orderData?.positionLiqQuoteDecimalCorrected ?? 0,
                        );
                        // setFeeLiqBaseDecimalCorrected(orderData?.feesLiqBaseDecimalCorrected ?? 0);
                        // setFeeLiqQuoteDecimalCorrected(
                        //     orderData?.feesLiqQuoteDecimalCorrected ?? 0,
                        // );
                        setTotalValueUSD(orderData?.totalValueUSD);
                        setUserDisplay(
                            orderData.ensResolution ? orderData.ensResolution : orderData.user,
                        );
                        isDenomBase
                            ? setLowPriceDisplay(orderData.askTickInvPriceDecimalCorrected)
                            : setLowPriceDisplay(orderData.askTickPriceDecimalCorrected);
                        isDenomBase
                            ? setHighPriceDisplay(orderData.bidTickInvPriceDecimalCorrected)
                            : setHighPriceDisplay(orderData.bidTickPriceDecimalCorrected);
                        setPositionLiquidity(orderData.positionLiq);
                        setBidTick(orderData.bidTick);
                        setAskTick(orderData.askTick);
                        setBaseSymbol(orderData.baseSymbol);
                        setQuoteSymbol(orderData.quoteSymbol);

                        // setLastUpdatedTime(
                        //     new Date(orderData.latestUpdateTime).toLocaleTimeString('en-US'),
                        // );
                    });
            })();
        }
    }, [limitOrder, lastBlockNumber, isDenomBase]);

    return (
        <div>
            {/* <div>Time Updated: {lastUpdatedTime}</div> */}
            <div>Owner: {userDisplay}</div>
            <div>Base Token: {baseSymbol}</div>
            <div>Quote Token: {quoteSymbol}</div>
            <div>Low Price: {lowPriceDisplay}</div>
            <div>High Price: {highPriceDisplay}</div>
            <div>Bid Tick: {bidTick}</div>
            <div>Ask Tick: {askTick}</div>
            <div>Liquidity Base Qty: {posLiqBaseDecimalCorrected}</div>
            <div>Liquidity Quote Qty: {posLiqQuoteDecimalCorrected}</div>
            <div>Liquidity Wei Qty: {positionLiquidity}</div>
            {/* <div>Fees Base Qty: {feesBaseDecimalCorrected}</div>
            <div>Fees Quote Qty: {feesQuoteDecimalCorrected}</div> */}
            <div>Total Value USD: {positionLiqTotalUSD}</div>
        </div>
    );
}
