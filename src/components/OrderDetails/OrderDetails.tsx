import { useEffect, useState } from 'react';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { ILimitOrderState } from '../../utils/state/graphDataSlice';

interface IOrderDetailsProps {
    limitOrder: ILimitOrderState;
}

export default function OrderDetails(props: IOrderDetailsProps) {
    const { limitOrder } = props;

    const lastBlockNumber = useAppSelector((state) => state.graphData).lastBlock;

    const [posLiqBaseDecimalCorrected, setPosLiqBaseDecimalCorrected] = useState<
        number | undefined
    >();
    const [posLiqQuoteDecimalCorrected, setPosLiqQuoteDecimalCorrected] = useState<
        number | undefined
    >();
    const [feesBaseDecimalCorrected, setFeeLiqBaseDecimalCorrected] = useState<
        number | undefined
    >();
    const [feesQuoteDecimalCorrected, setFeeLiqQuoteDecimalCorrected] = useState<
        number | undefined
    >();
    const [positionLiqTotalUSD, setPositionLiqTotalUSD] = useState<number | undefined>();

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
                        console.log({ json });
                        setPosLiqBaseDecimalCorrected(json?.data?.positionLiqBaseDecimalCorrected);
                        setPosLiqQuoteDecimalCorrected(
                            json?.data?.positionLiqQuoteDecimalCorrected,
                        );
                        setFeeLiqBaseDecimalCorrected(json?.data?.feesLiqBaseDecimalCorrected);
                        setFeeLiqQuoteDecimalCorrected(json?.data?.feesLiqQuoteDecimalCorrected);
                        setPositionLiqTotalUSD(json?.data?.positionLiqTotalUSD);
                    });
            })();
        }
    }, [limitOrder, lastBlockNumber]);

    return (
        <div>
            <div>Removal Details:</div>
            <div>Liquidity Base Qty: {posLiqBaseDecimalCorrected}</div>
            <div>Liquidity Quote Qty: {posLiqQuoteDecimalCorrected}</div>
            <div>Fees Base Qty: {feesBaseDecimalCorrected}</div>
            <div>Fees Quote Qty: {feesQuoteDecimalCorrected}</div>
            <div>Position Liq.Total: {positionLiqTotalUSD}</div>
        </div>
    );
}
