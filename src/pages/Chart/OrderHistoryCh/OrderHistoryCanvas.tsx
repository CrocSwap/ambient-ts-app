import { useEffect, useRef, useState } from 'react';
import {
    bandLineData,
    lineData,
    renderCanvasArray,
    scaleData,
    setCanvasResolution,
} from '../ChartUtils/chartUtils';
import { createCircle } from '../ChartUtils/circle';
import { createLinearLineSeries } from '../Draw/DrawCanvas/LinearLineSeries';
import * as d3 from 'd3';
import { createBandArea } from '../Draw/DrawCanvas/BandArea';
import { diffHashSig } from '../../../ambient-utils/dataLayer';
import { TransactionIF } from '../../../ambient-utils/types';

interface OrderHistoryCanvasProps {
    scaleData: scaleData;
    denomInBase: boolean;
    showSwap: boolean;
    showLiquidity: boolean;
    showHistorical: boolean;
    hoveredOrderHistory: TransactionIF | undefined;
    isHoveredOrderHistory: boolean;
    drawSettings: any;
    userTransactionData: TransactionIF[] | undefined;
}

export default function OrderHistoryCanvas(props: OrderHistoryCanvasProps) {
    const {
        scaleData,
        denomInBase,
        showSwap,
        showLiquidity,
        showHistorical,
        hoveredOrderHistory,
        isHoveredOrderHistory,
        drawSettings,
        userTransactionData,
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
        drawSettings['Brush'].line,
    );

    const liquidityLineSeries = createLinearLineSeries(
        scaleData?.xScale,
        scaleData?.yScale,
        denomInBase,
        { color: 'rgba(95, 255, 242, 0.7)', lineWidth: 1.5, dash: [0, 0] },
    );

    function createScaleForBandArea(x: number, x2: number) {
        const newXScale = scaleData?.xScale.copy();

        newXScale.range([scaleData?.xScale(x), scaleData?.xScale(x2)]);

        return newXScale;
    }

    useEffect(() => {
        if (userTransactionData) {
            const domainRight = d3.max(userTransactionData, (data) => {
                if (data.entityType === 'swap') return data.totalValueUSD;
            });
            const domainLeft = d3.min(userTransactionData, (data) => {
                if (data.entityType === 'swap') return data.totalValueUSD;
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
        }
    }, [userTransactionData]);

    useEffect(() => {
        if (userTransactionData && circleScale) {
            const circleSerieArray: any[] = [];

            userTransactionData.forEach((order) => {
                const circleSerie = createCircle(
                    scaleData?.xScale,
                    scaleData?.yScale,
                    circleScale(order.totalValueUSD),
                    1,
                    denomInBase,
                    false,
                    false,
                    order.isBuy,
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
    }, [userTransactionData, circleScale]);

    useEffect(() => {
        if (userTransactionData && scaleData) {
            userTransactionData.forEach((order) => {
                if (order.entityType === 'liqchange') {
                    const newBandScale = createScaleForBandArea(
                        order?.txTime * 1000,
                        order?.txTime * 1000,
                    );

                    const bandArea = createBandArea(
                        newBandScale,
                        scaleData?.yScale,
                        denomInBase,
                        { background: { color: 'rgba(95, 255, 242, 0.15)' } },
                    );

                    setBandArea(() => {
                        return bandArea;
                    });
                }
            });
        }
    }, [diffHashSig(userTransactionData)]);

    // useEffect(() => {
    //     if (
    //         hoveredOrderHistory &&
    //         scaleData &&
    //     ) {
    //         if (hoveredOrderHistory.orderType === 'liquidity') {
    //             const newBandScale = createScaleForBandArea(
    //                 hoveredOrderHistory?.tsStart.getTime() * 1000,
    //                 hoveredOrderHistory?.tsEnd.getTime() * 1000,
    //             );

    //             const bandArea = createBandArea(
    //                 newBandScale,
    //                 scaleData?.yScale,
    //                 denomInBase,
    //                 'rgba(95, 255, 242, 0.15)',
    //             );

    //             setBandAreaHighlighted(() => {
    //                 return bandArea;
    //             });
    //         }
    //     }
    // }, [userTransactionData, hoveredOrderHistory]);

    useEffect(() => {
        const canvas = d3
            .select(d3OrderCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (userTransactionData && scaleData) {
            d3.select(d3OrderCanvas.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);

                    // if (isHoveredOrderHistory && hoveredOrderHistory) {
                    //     if (
                    //         showLiquidity &&
                    //         liquidityLineSeries &&
                    //         bandAreaHighlighted !== undefined &&
                    //         hoveredOrderHistory.orderType === 'liquidity'
                    //     ) {
                    //         const highlightedLines: Array<lineData[]> = [[]];

                    //         highlightedLines.push(
                    //             [
                    //                 {
                    //                     x:
                    //                         hoveredOrderHistory.tsStart.getTime() *
                    //                         1000,
                    //                     y: hoveredOrderHistory.orderPrice,
                    //                     denomInBase: denomInBase,
                    //                 },
                    //                 {
                    //                     x:
                    //                         hoveredOrderHistory.tsEnd.getTime() *
                    //                         1000,
                    //                     y: hoveredOrderHistory.orderPrice,
                    //                     denomInBase: denomInBase,
                    //                 },
                    //             ],
                    //             [
                    //                 {
                    //                     x:
                    //                         hoveredOrderHistory.tsStart.getTime() *
                    //                         1000,
                    //                     y: hoveredOrderHistory.orderPriceCompleted,
                    //                     denomInBase: denomInBase,
                    //                 },
                    //                 {
                    //                     x:
                    //                         hoveredOrderHistory.tsEnd.getTime() *
                    //                         1000,
                    //                     y: hoveredOrderHistory.orderPriceCompleted,
                    //                     denomInBase: denomInBase,
                    //                 },
                    //             ],
                    //         );

                    //         highlightedLines.forEach((lineData) => {
                    //             liquidityLineSeries(lineData);

                    //             liquidityLineSeries.decorate(
                    //                 (context: CanvasRenderingContext2D) => {
                    //                     context.strokeStyle =
                    //                         'rgba(95, 255, 242, 0.6)';
                    //                 },
                    //             );
                    //         });

                    //         const range = [
                    //             scaleData?.xScale(
                    //                 hoveredOrderHistory?.tsStart.getTime() *
                    //                     1000,
                    //             ),
                    //             scaleData.xScale(
                    //                 hoveredOrderHistory?.tsEnd.getTime() * 1000,
                    //             ),
                    //         ];

                    //         bandAreaHighlighted.xScale().range(range);

                    //         const bandData = {
                    //             fromValue: hoveredOrderHistory.orderPrice,
                    //             toValue:
                    //                 hoveredOrderHistory.orderPriceCompleted,
                    //             denomInBase: denomInBase,
                    //         } as bandLineData;

                    //         bandAreaHighlighted([bandData]);
                    //     }
                    // }

                    userTransactionData.forEach((order, index) => {
                        if (
                            showSwap &&
                            circleSeries &&
                            circleSeries.length > 0 &&
                            order.entityType === 'swap'
                        ) {
                            const circleData = [
                                {
                                    x: order.txTime * 1000,
                                    y: denomInBase
                                        ? order.swapInvPriceDecimalCorrected
                                        : order.swapPriceDecimalCorrected,
                                    denomInBase: denomInBase,
                                },
                            ];

                            circleSeries[index](circleData);

                            if (
                                showSwap &&
                                hoveredOrderHistory &&
                                isHoveredOrderHistory &&
                                circleSeriesHighlighted.length > 0 &&
                                hoveredOrderHistory.entityType === 'swap' &&
                                hoveredOrderHistory.txId === order.txId
                            ) {
                                const circleDataHg = [
                                    {
                                        x: hoveredOrderHistory.txTime * 1000,
                                        y: denomInBase
                                            ? order.swapInvPriceDecimalCorrected
                                            : order.swapPriceDecimalCorrected,
                                        denomInBase: denomInBase,
                                    },
                                ];

                                circleSeriesHighlighted[index](circleDataHg);
                            }
                        }

                        if (
                            showHistorical &&
                            order.entityType === 'limitOrder' &&
                            lineSeries
                        ) {
                            console.log(order.changeType, index);

                            if (
                                order.changeType === 'mint' ||
                                order.changeType === 'recover'
                            ) {
                                const lineData: lineData[] = [];

                                lineData.push({
                                    x: order.txTime * 1000,
                                    y: denomInBase
                                        ? order.invLimitPriceDecimalCorrected
                                        : order.invLimitPriceDecimalCorrected,
                                    denomInBase: denomInBase,
                                });
                                lineData.push({
                                    x:
                                        order.changeType === 'mint' ||
                                        order.changeType === 'recover'
                                            ? new Date().getTime()
                                            : (order.txTime + 3600 * 2) * 1000,
                                    y: denomInBase
                                        ? order.invLimitPriceDecimalCorrected
                                        : order.invLimitPriceDecimalCorrected,
                                    denomInBase: denomInBase,
                                });

                                lineSeries.decorate(
                                    (context: CanvasRenderingContext2D) => {
                                        context.strokeStyle = order.isBuy
                                            ? 'rgba(115, 113, 252)'
                                            : 'rgba(205, 193, 255)';
                                    },
                                );

                                lineSeries(lineData);
                            }
                        }

                        // if (
                        //     showLiquidity &&
                        //     order.entityType === 'liqchange' &&
                        //     bandArea &&
                        //     lineSeries
                        // ) {
                        //     const range = [
                        //         scaleData?.xScale(order?.txTime * 1000),
                        //         scaleData.xScale(
                        //             (order?.txTime + 3600 * 4) * 1000,
                        //         ),
                        //     ];

                        //     bandArea.xScale().range(range);

                        //     const bandData = {
                        //         fromValue: denomInBase
                        //             ? order.bidTickInvPriceDecimalCorrected
                        //             : order.bidTickPriceDecimalCorrected,
                        //         toValue: denomInBase
                        //             ? order.askTickInvPriceDecimalCorrected
                        //             : order.askTickPriceDecimalCorrected,
                        //         denomInBase: denomInBase,
                        //     } as bandLineData;

                        //     lineSeries;

                        //     bandArea([bandData]);

                        //     const lineData: lineData[][] = [];

                        //     lineData.push([
                        //         {
                        //             x: order.txTime * 1000,
                        //             y: denomInBase
                        //                 ? order.askTickInvPriceDecimalCorrected
                        //                 : order.askTickPriceDecimalCorrected,
                        //             denomInBase: denomInBase,
                        //         },
                        //         {
                        //             x: (order.txTime + 3600 * 4) * 1000,
                        //             y: denomInBase
                        //                 ? order.askTickInvPriceDecimalCorrected
                        //                 : order.askTickPriceDecimalCorrected,
                        //             denomInBase: denomInBase,
                        //         },
                        //     ]);

                        //     lineData.push([
                        //         {
                        //             x: order.txTime * 1000,
                        //             y: denomInBase
                        //                 ? order.bidTickInvPriceDecimalCorrected
                        //                 : order.bidTickPriceDecimalCorrected,
                        //             denomInBase: denomInBase,
                        //         },
                        //         {
                        //             x: (order.txTime + 3600 * 4) * 1000,
                        //             y: denomInBase
                        //                 ? order.bidTickInvPriceDecimalCorrected
                        //                 : order.bidTickPriceDecimalCorrected,
                        //             denomInBase: denomInBase,
                        //         },
                        //     ]);

                        //     lineData.forEach((line) => {
                        //         liquidityLineSeries(line);
                        //     });
                        // }
                    });
                })
                .on('measure', () => {
                    if (lineSeries !== undefined) lineSeries.context(ctx);
                    if (liquidityLineSeries !== undefined)
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
                    if (bandArea !== undefined) bandArea.context(ctx);
                    if (bandAreaHighlighted !== undefined) {
                        bandAreaHighlighted.context(ctx);
                    }
                });
        }

        renderCanvasArray([d3OrderCanvas]);
    }, [
        diffHashSig(userTransactionData),
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
