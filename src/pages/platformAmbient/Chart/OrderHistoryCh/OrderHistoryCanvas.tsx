import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    bandLineData,
    lineData,
    renderCanvasArray,
    scaleData,
    setCanvasResolution,
} from '../ChartUtils/chartUtils';
import { calculateCircleColor, createCircle } from '../ChartUtils/circle';
import { createLinearLineSeries } from '../Draw/DrawCanvas/LinearLineSeries';
import { createBandArea } from '../Draw/DrawCanvas/BandArea';
import { diffHashSig } from '../../../../ambient-utils/dataLayer';
import { TransactionIF } from '../../../../ambient-utils/types';
import { BrandContext } from '../../../../contexts/BrandContext';
import { GraphDataContext } from '../../../../contexts';

interface OrderHistoryCanvasProps {
    scaleData: scaleData;
    denomInBase: boolean;
    showSwap: boolean;
    showLiquidity: boolean;
    showHistorical: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hoveredOrderHistory: any;
    isHoveredOrderHistory: boolean;
    selectedOrderHistory: TransactionIF | undefined;
    isSelectedOrderHistory: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    drawSettings: any;
    userTransactionData: TransactionIF[] | undefined;
    circleScale: d3.ScaleLinear<number, number>;
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
        // selectedOrderHistory,
        // isSelectedOrderHistory,
        drawSettings,
        userTransactionData,
        circleScale,
    } = props;

    const d3OrderCanvas = useRef<HTMLDivElement | null>(null);

    const { platformName } = useContext(BrandContext);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [bandAreaActive, setBandAreaActive] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [bandAreaHistorical, setBandAreaHistorical] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [circleSeries, setCircleSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [limitCircleSeries, setLimitCircleSeries] = useState<any>();

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

    const triangleLimit = d3fc
        .seriesCanvasPoint()
        .xScale(scaleData.xScale)
        .yScale(scaleData.yScale)
        /* eslint-disable @typescript-eslint/no-explicit-any */
        .crossValue((d: any) => d.x)
        /* eslint-disable @typescript-eslint/no-explicit-any */
        .mainValue((d: any) => d.y)
        .size(90)
        .type(d3.symbolTriangle);

    function createScaleForBandArea(x: number, x2: number) {
        const newXScale = scaleData?.xScale.copy();

        newXScale.range([scaleData?.xScale(x), scaleData?.xScale(x2)]);

        return newXScale;
    }

    const { userLimitOrdersByPool, userPositionsByPool } =
        useContext(GraphDataContext);

    const activeUserPositionsByPool = useMemo(
        () =>
            userPositionsByPool?.positions.filter(
                (position) => position.positionLiq != 0,
            ),
        [userPositionsByPool],
    );

    const historicalUserPositionsByPool = useMemo(
        () =>
            userPositionsByPool?.positions.filter(
                (position) => position.positionLiq === 0,
            ),
        [userPositionsByPool],
    );

    useEffect(() => {
        if (userTransactionData && circleScale && scaleData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const circleSerieArray: any[] = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const limitCircleSerieArray: any[] = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const bandAreaArrayActive: any[] = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const bandAreaArrayHistorical: any[] = [];

            const canvas = d3
                .select(d3OrderCanvas.current)
                .select('canvas')
                .node() as HTMLCanvasElement;
            const ctx = canvas.getContext('2d');

            if (showLiquidity) {
                userLimitOrdersByPool.limitOrders.forEach(
                    (limitOrder, index) => {
                        if (limitOrder.claimableLiq > 0) {
                            const circleSerie = createCircle(
                                scaleData?.xScale,
                                scaleData?.yScale,
                                circleScale(limitOrder.totalValueUSD),
                                1,
                                denomInBase,
                                false,
                                false,
                                (denomInBase && !limitOrder.isBid) ||
                                    (!denomInBase && limitOrder.isBid),
                                '--accent2',
                                ['futa'].includes(platformName)
                                    ? '--negative'
                                    : '--accent4',
                            );

                            limitCircleSerieArray.push({
                                serie: circleSerie,
                                index: index,
                            });
                        }
                    },
                );

                setLimitCircleSeries(() => {
                    return limitCircleSerieArray;
                });
            }

            if (showSwap) {
                userTransactionData.forEach((order) => {
                    const circleSerie = createCircle(
                        scaleData?.xScale,
                        scaleData?.yScale,
                        circleScale(order.totalValueUSD),
                        1,
                        denomInBase,
                        false,
                        false,
                        (denomInBase && !order.isBuy) ||
                            (!denomInBase && order.isBuy),
                        '--accent1',
                        ['futa'].includes(platformName)
                            ? '--negative'
                            : '--accent5',
                    );

                    circleSerieArray.push(circleSerie);
                });

                setCircleSeries(() => {
                    return circleSerieArray;
                });
            }

            if (showHistorical && activeUserPositionsByPool) {
                activeUserPositionsByPool.forEach((order) => {
                    const newBandScale = createScaleForBandArea(
                        order?.timeFirstMint * 1000,
                        new Date().getTime() + 5 * 86400 * 1000,
                    );

                    const bandArea = createBandArea(
                        newBandScale,
                        scaleData?.yScale,
                        denomInBase,
                        { background: { color: 'rgba(95, 255, 242, 0.15)' } },
                    );

                    bandAreaArrayActive.push(bandArea);
                });

                setBandAreaActive(() => {
                    return bandAreaArrayActive;
                });
            }

            if (showHistorical && historicalUserPositionsByPool) {
                historicalUserPositionsByPool.forEach((order) => {
                    const newBandScale = createScaleForBandArea(
                        order?.timeFirstMint * 1000,
                        order?.latestUpdateTime * 1000,
                    );

                    let bandColor = 'rgba(95, 255, 242, 0.15)';

                    if (ctx) {
                        const style = getComputedStyle(ctx.canvas);

                        const accent3RgbaColor =
                            style.getPropertyValue('--accent3');

                        const highlightedBandColor = d3.color(accent3RgbaColor);

                        if (highlightedBandColor) {
                            highlightedBandColor.opacity = 0.15;

                            bandColor = highlightedBandColor.toString();
                        }
                    }

                    const bandArea = createBandArea(
                        newBandScale,
                        scaleData?.yScale,
                        denomInBase,
                        { background: { color: bandColor } },
                    );

                    bandAreaArrayHistorical.push(bandArea);
                });

                setBandAreaHistorical(() => {
                    return bandAreaArrayHistorical;
                });
            }
        }
    }, [
        userTransactionData,
        userPositionsByPool,
        userLimitOrdersByPool,
        circleScale,
        showHistorical,
        showSwap,
        showLiquidity,
        scaleData,
    ]);

    useEffect(() => {
        const canvas = d3
            .select(d3OrderCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (scaleData) {
            d3.select(d3OrderCanvas.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);

                    // if (activeUserPositionsByPool && showHistorical) {
                    //     activeUserPositionsByPool.forEach((order, index) => {
                    //         if (bandAreaActive && liquidityLineSeries) {
                    //             const range = [
                    //                 scaleData?.xScale(
                    //                     order?.timeFirstMint * 1000,
                    //                 ),
                    //                 scaleData.xScale(
                    //                     new Date().getTime() + 5 * 86400 * 1000,
                    //                 ),
                    //             ];

                    //             if (bandAreaActive[index] !== undefined) {
                    //                 bandAreaActive[index].xScale().range(range);
                    //             }

                    //             const bandData = {
                    //                 fromValue: denomInBase
                    //                     ? order.bidTickInvPriceDecimalCorrected
                    //                     : order.bidTickPriceDecimalCorrected,
                    //                 toValue: denomInBase
                    //                     ? order.askTickInvPriceDecimalCorrected
                    //                     : order.askTickPriceDecimalCorrected,
                    //                 denomInBase: denomInBase,
                    //             } as bandLineData;

                    //             bandAreaActive[index]([bandData]);

                    //             const lineData: lineData[][] = [];

                    //             lineData.push([
                    //                 {
                    //                     x: order.timeFirstMint * 1000,
                    //                     y: denomInBase
                    //                         ? order.askTickInvPriceDecimalCorrected
                    //                         : order.askTickPriceDecimalCorrected,
                    //                     denomInBase: denomInBase,
                    //                 },
                    //                 {
                    //                     x:
                    //                         new Date().getTime() +
                    //                         5 * 86400 * 1000,
                    //                     y: denomInBase
                    //                         ? order.askTickInvPriceDecimalCorrected
                    //                         : order.askTickPriceDecimalCorrected,
                    //                     denomInBase: denomInBase,
                    //                 },
                    //             ]);

                    //             lineData.push([
                    //                 {
                    //                     x: order.timeFirstMint * 1000,
                    //                     y: denomInBase
                    //                         ? order.bidTickInvPriceDecimalCorrected
                    //                         : order.bidTickPriceDecimalCorrected,
                    //                     denomInBase: denomInBase,
                    //                 },
                    //                 {
                    //                     x:
                    //                         new Date().getTime() +
                    //                         5 * 86400 * 1000,
                    //                     y: denomInBase
                    //                         ? order.bidTickInvPriceDecimalCorrected
                    //                         : order.bidTickPriceDecimalCorrected,
                    //                     denomInBase: denomInBase,
                    //                 },
                    //             ]);

                    //             lineData.forEach((line) => {
                    //                 liquidityLineSeries(line);
                    //             });
                    //         }
                    //     });
                    // }

                    if (historicalUserPositionsByPool && showHistorical) {
                        historicalUserPositionsByPool.forEach(
                            (order, index) => {
                                if (bandAreaHistorical && liquidityLineSeries) {
                                    const range = [
                                        scaleData?.xScale(
                                            order?.timeFirstMint * 1000,
                                        ),
                                        scaleData.xScale(
                                            order?.latestUpdateTime * 1000,
                                        ),
                                    ];

                                    if (
                                        hoveredOrderHistory &&
                                        hoveredOrderHistory.type ===
                                            'historical' &&
                                        hoveredOrderHistory.order.positionId ===
                                            order.positionId
                                    ) {
                                        bandAreaHistorical[index].decorate(
                                            (
                                                context: CanvasRenderingContext2D,
                                            ) => {
                                                const style = getComputedStyle(
                                                    context.canvas,
                                                );

                                                const accent3RgbaColor =
                                                    style.getPropertyValue(
                                                        '--accent3',
                                                    );

                                                const highlightedBandColor =
                                                    d3.color(accent3RgbaColor);

                                                if (highlightedBandColor) {
                                                    highlightedBandColor.opacity = 0.3;

                                                    context.fillStyle =
                                                        highlightedBandColor.toString();
                                                }
                                            },
                                        );

                                        const lineData: lineData[][] = [];

                                        lineData.push([
                                            {
                                                x: order.timeFirstMint * 1000,
                                                y: denomInBase
                                                    ? order.askTickInvPriceDecimalCorrected
                                                    : order.askTickPriceDecimalCorrected,
                                                denomInBase: denomInBase,
                                            },
                                            {
                                                x:
                                                    order.latestUpdateTime *
                                                    1000,
                                                y: denomInBase
                                                    ? order.askTickInvPriceDecimalCorrected
                                                    : order.askTickPriceDecimalCorrected,
                                                denomInBase: denomInBase,
                                            },
                                        ]);

                                        lineData.push([
                                            {
                                                x: order.timeFirstMint * 1000,
                                                y: denomInBase
                                                    ? order.bidTickInvPriceDecimalCorrected
                                                    : order.bidTickPriceDecimalCorrected,
                                                denomInBase: denomInBase,
                                            },
                                            {
                                                x:
                                                    order.latestUpdateTime *
                                                    1000,
                                                y: denomInBase
                                                    ? order.bidTickInvPriceDecimalCorrected
                                                    : order.bidTickPriceDecimalCorrected,
                                                denomInBase: denomInBase,
                                            },
                                        ]);

                                        lineData.forEach((line) => {
                                            liquidityLineSeries(line);
                                        });
                                    } else {
                                        bandAreaHistorical[index].decorate(
                                            (
                                                context: CanvasRenderingContext2D,
                                            ) => {
                                                const style = getComputedStyle(
                                                    context.canvas,
                                                );

                                                const accent3RgbaColor =
                                                    style.getPropertyValue(
                                                        '--accent3',
                                                    );

                                                const highlightedBandColor =
                                                    d3.color(accent3RgbaColor);

                                                if (highlightedBandColor) {
                                                    highlightedBandColor.opacity = 0.15;

                                                    context.fillStyle =
                                                        highlightedBandColor.toString();
                                                }
                                            },
                                        );
                                    }

                                    if (
                                        bandAreaHistorical[index] !== undefined
                                    ) {
                                        bandAreaHistorical[index]
                                            .xScale()
                                            .range(range);

                                        const bandData = {
                                            fromValue: denomInBase
                                                ? order.bidTickInvPriceDecimalCorrected
                                                : order.bidTickPriceDecimalCorrected,
                                            toValue: denomInBase
                                                ? order.askTickInvPriceDecimalCorrected
                                                : order.askTickPriceDecimalCorrected,
                                            denomInBase: denomInBase,
                                        } as bandLineData;

                                        bandAreaHistorical[index]([bandData]);
                                    }
                                }
                            },
                        );
                    }

                    if (showLiquidity && userLimitOrdersByPool) {
                        userLimitOrdersByPool.limitOrders.forEach(
                            (limitOrder, index) => {
                                if (
                                    limitOrder.claimableLiq > 0 &&
                                    limitCircleSeries &&
                                    limitCircleSeries.length > 0
                                ) {
                                    const circleData = [
                                        {
                                            x: limitOrder.crossTime * 1000,
                                            y: denomInBase
                                                ? limitOrder.invLimitPriceDecimalCorrected
                                                : limitOrder.limitPriceDecimalCorrected,
                                            denomInBase: denomInBase,
                                        },
                                    ];

                                    limitCircleSeries.find((serie: any) => {
                                        if (serie.index === index) {
                                            serie.serie(circleData);
                                        }
                                    });
                                }

                                if (limitOrder.claimableLiq === 0) {
                                    const lineData: lineData[] = [];

                                    lineData.push({
                                        x: limitOrder.timeFirstMint * 1000,
                                        y: denomInBase
                                            ? limitOrder.invLimitPriceDecimalCorrected
                                            : limitOrder.limitPriceDecimalCorrected,
                                        denomInBase: denomInBase,
                                    });
                                    lineData.push({
                                        x:
                                            new Date().getTime() +
                                            5 * 86400 * 1000,
                                        y: denomInBase
                                            ? limitOrder.invLimitPriceDecimalCorrected
                                            : limitOrder.limitPriceDecimalCorrected,
                                        denomInBase: denomInBase,
                                    });

                                    lineSeries.decorate(
                                        (context: CanvasRenderingContext2D) => {
                                            context.setLineDash([4, 2]);
                                            context.strokeStyle =
                                                (denomInBase &&
                                                    !limitOrder.isBid) ||
                                                (!denomInBase &&
                                                    limitOrder.isBid)
                                                    ? 'rgba(115, 113, 252)'
                                                    : 'rgba(205, 193, 255)';
                                        },
                                    );

                                    lineSeries(lineData);

                                    if (ctx) ctx.setLineDash([0, 0]);

                                    ctx?.restore();

                                    if (triangleLimit) {
                                        triangleLimit.decorate(
                                            (
                                                context: CanvasRenderingContext2D,
                                            ) => {
                                                // context.setLineDash([0, 0]);
                                                const rotateDegree = 90;
                                                context.rotate(
                                                    (rotateDegree * Math.PI) /
                                                        180,
                                                );

                                                context.strokeStyle =
                                                    (denomInBase &&
                                                        !limitOrder.isBid) ||
                                                    (!denomInBase &&
                                                        limitOrder.isBid)
                                                        ? 'rgba(115, 113, 252)'
                                                        : 'rgba(205, 193, 255)';

                                                context.fillStyle =
                                                    (denomInBase &&
                                                        !limitOrder.isBid) ||
                                                    (!denomInBase &&
                                                        limitOrder.isBid)
                                                        ? 'rgba(115, 113, 252)'
                                                        : 'rgba(205, 193, 255)';
                                            },
                                        );

                                        triangleLimit([
                                            {
                                                x:
                                                    limitOrder.timeFirstMint *
                                                    1000,
                                                y: denomInBase
                                                    ? limitOrder.invLimitPriceDecimalCorrected
                                                    : limitOrder.limitPriceDecimalCorrected,
                                            },
                                        ]);
                                    }
                                }
                            },
                        );
                    }

                    if (showSwap && userTransactionData) {
                        userTransactionData.forEach((order, index) => {
                            if (
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

                                if (
                                    hoveredOrderHistory &&
                                    isHoveredOrderHistory &&
                                    hoveredOrderHistory.type === 'swap' &&
                                    hoveredOrderHistory.order.txId ===
                                        order.txId
                                ) {
                                    circleSeries[index].decorate(
                                        (context: CanvasRenderingContext2D) => {
                                            const colorPalette =
                                                calculateCircleColor(
                                                    context,
                                                    '--accent1',
                                                    ['futa'].includes(
                                                        platformName,
                                                    )
                                                        ? '--negative'
                                                        : '--accent5',
                                                    true,
                                                );

                                            const isBuy =
                                                (denomInBase && !order.isBuy) ||
                                                (!denomInBase && order.isBuy);

                                            context.strokeStyle = isBuy
                                                ? colorPalette.circleBuyStrokeColor
                                                : colorPalette.circleStrokeColor;

                                            context.fillStyle = isBuy
                                                ? colorPalette.buyFill
                                                : colorPalette.sellFill;

                                            context.lineWidth = 1;
                                        },
                                    );

                                    if (ctx) ctx.restore();
                                } else {
                                    circleSeries[index].decorate(
                                        (context: CanvasRenderingContext2D) => {
                                            const colorPalette =
                                                calculateCircleColor(
                                                    context,
                                                    '--accent1',
                                                    ['futa'].includes(
                                                        platformName,
                                                    )
                                                        ? '--negative'
                                                        : '--accent5',
                                                    false,
                                                );

                                            const isBuy =
                                                (denomInBase && !order.isBuy) ||
                                                (!denomInBase && order.isBuy);

                                            context.strokeStyle = isBuy
                                                ? colorPalette.circleBuyStrokeColor
                                                : colorPalette.circleStrokeColor;

                                            context.fillStyle = isBuy
                                                ? colorPalette.buyFill
                                                : colorPalette.sellFill;

                                            context.lineWidth = 1;
                                        },
                                    );

                                    if (ctx) ctx.restore();
                                }

                                circleSeries[index](circleData);
                            }
                        });
                    }
                })
                .on('measure', () => {
                    if (lineSeries !== undefined) lineSeries.context(ctx);
                    if (triangleLimit !== undefined) triangleLimit.context(ctx);
                    if (liquidityLineSeries !== undefined)
                        liquidityLineSeries.context(ctx);
                    if (circleSeries !== undefined && circleSeries.length > 0) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        circleSeries.forEach((element: any) => {
                            element.context(ctx);
                        });
                    }
                    if (
                        limitCircleSeries !== undefined &&
                        limitCircleSeries.length > 0
                    ) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        limitCircleSeries.forEach((element: any) => {
                            element.serie.context(ctx);
                        });
                    }
                    if (
                        bandAreaActive !== undefined &&
                        bandAreaActive.length > 0
                    ) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        bandAreaActive.forEach((element: any) => {
                            element.context(ctx);
                        });
                    }
                    if (
                        bandAreaHistorical !== undefined &&
                        bandAreaHistorical.length > 0
                    ) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        bandAreaHistorical.forEach((element: any) => {
                            element.context(ctx);
                        });
                    }
                });
        }

        renderCanvasArray([d3OrderCanvas]);
    }, [
        diffHashSig(userTransactionData),
        diffHashSig(activeUserPositionsByPool),
        diffHashSig(userLimitOrdersByPool),
        lineSeries,
        triangleLimit,
        denomInBase,
        bandAreaActive,
        bandAreaHistorical,
        circleSeries,
        limitCircleSeries,
        showHistorical,
        showLiquidity,
        showSwap,
        liquidityLineSeries,
        scaleData,
    ]);

    return <d3fc-canvas className='d3_order_canvas' ref={d3OrderCanvas} />;
}
