import { useEffect, useRef, useState } from 'react';
import {
    bandLineData,
    lineData,
    orderHistory,
    renderCanvasArray,
    scaleData,
    setCanvasResolution,
} from '../ChartUtils/chartUtils';
import { createCircle } from '../ChartUtils/circle';
import { createLinearLineSeries } from '../Draw/DrawCanvas/LinearLineSeries';
import * as d3 from 'd3';
import { diffHashSig } from '../../../utils/functions/diffHashSig';
import { createBandArea } from '../Draw/DrawCanvas/BandArea';

interface OrderHistoryCanvasProps {
    scaleData: scaleData;
    denomInBase: any;
    orderData: orderHistory[];
    showSwap: boolean;
    showLiquidity: boolean;
    showHistorical: boolean;
    hoveredOrderHistory: orderHistory | undefined;
}

export default function OrderHistoryCanvas(props: OrderHistoryCanvasProps) {
    const {
        scaleData,
        denomInBase,
        orderData,
        showSwap,
        showLiquidity,
        showHistorical,
        hoveredOrderHistory,
    } = props;

    const d3OrderCanvas = useRef<HTMLDivElement | null>(null);

    const [bandArea, setBandArea] = useState<any>();

    const circleSeries = createCircle(
        scaleData?.xScale,
        scaleData?.yScale,
        900,
        1,
        denomInBase,
        false,
        true,
    );

    const lineSeries = createLinearLineSeries(
        scaleData?.xScale,
        scaleData?.yScale,
        denomInBase,
    );

    function createScaleForBandArea(x: number, x2: number) {
        const newXScale = scaleData?.xScale.copy();

        newXScale.range([scaleData?.xScale(x), scaleData?.xScale(x2)]);

        return newXScale;
    }

    useEffect(() => {
        if (orderData && scaleData) {
            orderData.forEach((order) => {
                if (order.orderType === 'liquidity') {
                    const newBandScale = createScaleForBandArea(
                        order?.tsStart.getTime() * 1000,
                        order?.tsEnd.getTime() * 1000,
                    );

                    const bandArea = createBandArea(
                        newBandScale,
                        scaleData?.yScale,
                        denomInBase,
                        'rgba(95, 255, 242, 0.15)',
                    );

                    setBandArea(() => {
                        return bandArea;
                    });
                }
            });
        }
    }, [diffHashSig(orderData)]);

    useEffect(() => {
        const canvas = d3
            .select(d3OrderCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (orderData && lineSeries && scaleData && bandArea) {
            d3.select(d3OrderCanvas.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);

                    orderData.forEach((order) => {
                        if (showSwap && order.orderType === 'swap') {
                            const circleData = [
                                {
                                    x: order.tsEnd.getTime() * 1000,
                                    y: order.orderPriceCompleted,
                                    denomInBase: denomInBase,
                                },
                            ];

                            circleSeries(circleData);
                        }
                        if (showHistorical && order.orderType === 'history') {
                            const lineData: lineData[] = [];

                            lineData.push({
                                x: order.tsStart.getTime() * 1000,
                                y: order.orderPrice,
                                ctx: undefined,
                                denomInBase: denomInBase,
                            });
                            lineData.push({
                                x: order.tsEnd.getTime() * 1000,
                                y: order.orderPrice,
                                ctx: undefined,
                                denomInBase: denomInBase,
                            });

                            lineSeries(lineData);
                        }
                        if (showLiquidity && order.orderType === 'liquidity') {
                            const range = [
                                scaleData?.xScale(
                                    order?.tsStart.getTime() * 1000,
                                ),
                                scaleData.xScale(order?.tsEnd.getTime() * 1000),
                            ];

                            bandArea.xScale().range(range);

                            const bandData = {
                                fromValue: order.orderPrice,
                                toValue: order.orderPriceCompleted,
                                denomInBase: denomInBase,
                            } as bandLineData;

                            bandArea([bandData]);

                            // bandArea.decorate((context: CanvasRenderingContext2D) => {
                            //     context.fillStyle = 'red';
                            // })
                        }
                    });
                })
                .on('measure', (event: CustomEvent) => {
                    lineSeries.context(ctx);
                    circleSeries.context(ctx);
                    bandArea.context(ctx);
                });
        }

        renderCanvasArray([d3OrderCanvas]);
    }, [
        diffHashSig(orderData),
        lineSeries,
        denomInBase,
        bandArea,
        circleSeries,
        showHistorical,
        showLiquidity,
        showSwap,
    ]);

    return <d3fc-canvas className='d3_order_canvas' ref={d3OrderCanvas} />;
}
