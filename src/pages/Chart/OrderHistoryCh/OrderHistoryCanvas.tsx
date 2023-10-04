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
    isHoveredOrderHistory: boolean;
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
        isHoveredOrderHistory,
    } = props;

    const d3OrderCanvas = useRef<HTMLDivElement | null>(null);

    const [bandArea, setBandArea] = useState<any>();
    const [bandAreaHighlighted, setBandAreaHighlighted] = useState<any>();

    const [circleScale, setCircleScale] = useState<any>();
    const [circleSeries, setCircleSeries] = useState<any>();
    const [circleSeriesHighlighted, setCircleSeriesHighlighted] =
        useState<any>();

    const lineSeries = createLinearLineSeries(
        scaleData?.xScale,
        scaleData?.yScale,
        denomInBase,
    );

    const liquidityLineSeries = createLinearLineSeries(
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
        const domainRight = d3.max(orderData, (data) => {
            data.orderType === 'swap';
            return data.orderDolarAmount;
        });
        const domainLeft = d3.min(orderData, (data) => {
            data.orderType === 'swap';
            return data.orderDolarAmount;
        });

        if (domainRight && domainLeft) {
            const scale = d3
                .scaleLinear()
                .range([1000, 3000])
                .domain([domainLeft, domainRight]);
            setCircleScale(() => {
                return scale;
            });
        }
    }, [orderData]);

    useEffect(() => {
        if (orderData && circleScale) {
            const circleSerieArray: any[] = [];

            orderData.forEach((order) => {
                const circleSerie = createCircle(
                    scaleData?.xScale,
                    scaleData?.yScale,
                    circleScale(order.orderDolarAmount),
                    1,
                    denomInBase,
                    false,
                    true,
                );

                circleSerieArray.push(circleSerie);
            });

            setCircleSeries(() => {
                return circleSerieArray;
            });

            setCircleSeriesHighlighted(() => {
                return circleSerieArray;
            });
        }
    }, [orderData, circleScale]);

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
        if (
            hoveredOrderHistory &&
            scaleData &&
            hoveredOrderHistory.tsId != ''
        ) {
            if (hoveredOrderHistory.orderType === 'liquidity') {
                const newBandScale = createScaleForBandArea(
                    hoveredOrderHistory?.tsStart.getTime() * 1000,
                    hoveredOrderHistory?.tsEnd.getTime() * 1000,
                );

                const bandArea = createBandArea(
                    newBandScale,
                    scaleData?.yScale,
                    denomInBase,
                    'rgba(95, 255, 242, 0.15)',
                );

                setBandAreaHighlighted(() => {
                    return bandArea;
                });
            }
        }
    }, [diffHashSig(orderData), hoveredOrderHistory]);

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

                    if (isHoveredOrderHistory && hoveredOrderHistory) {
                        if (
                            showLiquidity &&
                            liquidityLineSeries &&
                            bandAreaHighlighted !== undefined &&
                            hoveredOrderHistory.orderType === 'liquidity'
                        ) {
                            const highlightedLines: Array<lineData[]> = [[]];

                            highlightedLines.push(
                                [
                                    {
                                        x:
                                            hoveredOrderHistory.tsStart.getTime() *
                                            1000,
                                        y: hoveredOrderHistory.orderPrice,
                                        ctx: undefined,
                                        denomInBase: denomInBase,
                                    },
                                    {
                                        x:
                                            hoveredOrderHistory.tsEnd.getTime() *
                                            1000,
                                        y: hoveredOrderHistory.orderPrice,
                                        ctx: undefined,
                                        denomInBase: denomInBase,
                                    },
                                ],
                                [
                                    {
                                        x:
                                            hoveredOrderHistory.tsStart.getTime() *
                                            1000,
                                        y: hoveredOrderHistory.orderPriceCompleted,
                                        ctx: undefined,
                                        denomInBase: denomInBase,
                                    },
                                    {
                                        x:
                                            hoveredOrderHistory.tsEnd.getTime() *
                                            1000,
                                        y: hoveredOrderHistory.orderPriceCompleted,
                                        ctx: undefined,
                                        denomInBase: denomInBase,
                                    },
                                ],
                            );

                            highlightedLines.forEach((lineData) => {
                                liquidityLineSeries(lineData);

                                liquidityLineSeries.decorate(
                                    (context: CanvasRenderingContext2D) => {
                                        context.strokeStyle =
                                            'rgba(95, 255, 242, 0.6)';
                                    },
                                );
                            });

                            const range = [
                                scaleData?.xScale(
                                    hoveredOrderHistory?.tsStart.getTime() *
                                        1000,
                                ),
                                scaleData.xScale(
                                    hoveredOrderHistory?.tsEnd.getTime() * 1000,
                                ),
                            ];

                            bandAreaHighlighted.xScale().range(range);

                            const bandData = {
                                fromValue: hoveredOrderHistory.orderPrice,
                                toValue:
                                    hoveredOrderHistory.orderPriceCompleted,
                                denomInBase: denomInBase,
                            } as bandLineData;

                            bandAreaHighlighted([bandData]);
                        }
                    }

                    orderData.forEach((order, index) => {
                        if (
                            showSwap &&
                            circleSeries &&
                            circleSeries.length > 0 &&
                            order.orderType === 'swap'
                        ) {
                            const circleData = [
                                {
                                    x: order.tsEnd.getTime() * 1000,
                                    y: order.orderPriceCompleted,
                                    denomInBase: denomInBase,
                                },
                            ];

                            circleSeries[index](circleData);

                            if (
                                showSwap &&
                                hoveredOrderHistory &&
                                isHoveredOrderHistory &&
                                circleSeriesHighlighted.length > 0 &&
                                hoveredOrderHistory.orderType === 'swap' &&
                                hoveredOrderHistory.tsId === order.tsId
                            ) {
                                const circleDataHg = [
                                    {
                                        x:
                                            hoveredOrderHistory.tsEnd.getTime() *
                                            1000,
                                        y: hoveredOrderHistory.orderPriceCompleted,
                                        denomInBase: denomInBase,
                                    },
                                ];

                                circleSeriesHighlighted[index](circleDataHg);
                            }
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
                        }
                    });
                })
                .on('measure', (event: CustomEvent) => {
                    lineSeries.context(ctx);
                    liquidityLineSeries.context(ctx);
                    if (circleSeries !== undefined && circleSeries.length > 0) {
                        circleSeries.forEach((element: any) => {
                            element.context(ctx);
                        });
                    }
                    if (
                        circleSeriesHighlighted !== undefined &&
                        circleSeriesHighlighted.length > 0
                    ) {
                        circleSeriesHighlighted.forEach((element: any) => {
                            element.context(ctx);
                        });
                    }
                    bandArea.context(ctx);
                    if (bandAreaHighlighted !== undefined) {
                        bandAreaHighlighted.context(ctx);
                    }
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
        liquidityLineSeries,
        bandAreaHighlighted,
    ]);

    return <d3fc-canvas className='d3_order_canvas' ref={d3OrderCanvas} />;
}
