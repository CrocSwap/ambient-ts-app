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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedOrderHistory: any;
    isSelectedOrderHistory: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    drawSettings: any;
    filteredTransactionalData: TransactionIF[] | undefined;
    circleScale: d3.ScaleLinear<number, number>;
    circleScaleLimitOrder: d3.ScaleLinear<number, number>;
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
        filteredTransactionalData,
        circleScale,
        circleScaleLimitOrder,
    } = props;

    const d3OrderCanvas = useRef<HTMLDivElement | null>(null);

    const { platformName } = useContext(BrandContext);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [bandAreaHistorical, setBandAreaHistorical] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [circleSeries, setCircleSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [limitCircleSeries, setLimitCircleSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [limitLineData, setLimitLineData] = useState<any>();

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

    const historicalUserPositionsByPool = useMemo(
        () =>
            userPositionsByPool?.positions.filter(
                (position) => position.positionLiq === 0,
            ),
        [userPositionsByPool],
    );

    useEffect(() => {
        if (circleScaleLimitOrder && circleScale && scaleData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const circleSerieArray: Array<{
                id: string;
                data: any;
                serie: any;
            }> = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const limitCircleSerieArray: Array<{
                id: string;
                data: any;
                serie: any;
                lineData: any;
            }> = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const bandAreaArrayHistorical: Array<{
                id: string;
                data: any;
                serie: any;
                lineData: any[];
            }> = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const limitLineDataArray: any[] = [];

            const canvas = d3
                .select(d3OrderCanvas.current)
                .select('canvas')
                .node() as HTMLCanvasElement;
            const ctx = canvas.getContext('2d');

            if (showLiquidity) {
                userLimitOrdersByPool.limitOrders.forEach((limitOrder) => {
                    if (limitOrder.claimableLiq > 0) {
                        const circleSerie = createCircle(
                            scaleData?.xScale,
                            scaleData?.yScale,
                            circleScaleLimitOrder(limitOrder.totalValueUSD),
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

                        const circleData = [
                            {
                                x: limitOrder.crossTime * 1000,
                                y: denomInBase
                                    ? limitOrder.invLimitPriceDecimalCorrected
                                    : limitOrder.limitPriceDecimalCorrected,
                                denomInBase: denomInBase,
                                isBid: limitOrder.isBid,
                            },
                        ];

                        const lineData: lineData[] = [];

                        lineData.push({
                            x: limitOrder.timeFirstMint * 1000,
                            y: denomInBase
                                ? limitOrder.invLimitPriceDecimalCorrected
                                : limitOrder.limitPriceDecimalCorrected,
                            denomInBase: denomInBase,
                        });
                        lineData.push({
                            x: limitOrder.crossTime * 1000,
                            y: denomInBase
                                ? limitOrder.invLimitPriceDecimalCorrected
                                : limitOrder.limitPriceDecimalCorrected,
                            denomInBase: denomInBase,
                        });

                        limitCircleSerieArray.push({
                            id: limitOrder.positionHash,
                            data: circleData,
                            serie: circleSerie,
                            lineData: lineData,
                        });
                    }

                    if (limitOrder.claimableLiq === 0) {
                        const lineData: Array<{
                            x: number;
                            y: number;
                            denomInBase: boolean;
                            isBid: boolean;
                        }> = [];

                        lineData.push({
                            x: limitOrder.timeFirstMint * 1000,
                            y: denomInBase
                                ? limitOrder.invLimitPriceDecimalCorrected
                                : limitOrder.limitPriceDecimalCorrected,
                            denomInBase: denomInBase,
                            isBid: limitOrder.isBid,
                        });
                        lineData.push({
                            x: new Date().getTime() + 5 * 86400 * 1000,
                            y: denomInBase
                                ? limitOrder.invLimitPriceDecimalCorrected
                                : limitOrder.limitPriceDecimalCorrected,
                            denomInBase: denomInBase,
                            isBid: limitOrder.isBid,
                        });

                        const triangleLimitData = [
                            {
                                x: limitOrder.timeFirstMint * 1000,
                                y: denomInBase
                                    ? limitOrder.invLimitPriceDecimalCorrected
                                    : limitOrder.limitPriceDecimalCorrected,
                            },
                        ];

                        limitLineDataArray.push({
                            id: limitOrder.positionHash,
                            triangleData: triangleLimitData,
                            lineData: lineData,
                        });
                    }
                });

                setLimitCircleSeries(() => {
                    return limitCircleSerieArray;
                });

                setLimitLineData(() => {
                    return limitLineDataArray;
                });
            }

            if (showSwap && filteredTransactionalData) {
                filteredTransactionalData.forEach((order) => {
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

                    const circleData = [
                        {
                            x: order.txTime * 1000,
                            y: denomInBase
                                ? order.swapInvPriceDecimalCorrected
                                : order.swapPriceDecimalCorrected,
                            denomInBase: denomInBase,
                            isBuy: order.isBuy,
                        },
                    ];

                    circleSerieArray.push({
                        id: order.txId,
                        data: circleData,
                        serie: circleSerie,
                    });
                });

                setCircleSeries(() => {
                    return circleSerieArray;
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

                    const bandData = {
                        fromValue: denomInBase
                            ? order.bidTickInvPriceDecimalCorrected
                            : order.bidTickPriceDecimalCorrected,
                        toValue: denomInBase
                            ? order.askTickInvPriceDecimalCorrected
                            : order.askTickPriceDecimalCorrected,
                        denomInBase: denomInBase,
                    } as bandLineData;

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
                            x: order.latestUpdateTime * 1000,
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
                            x: order.latestUpdateTime * 1000,
                            y: denomInBase
                                ? order.bidTickInvPriceDecimalCorrected
                                : order.bidTickPriceDecimalCorrected,
                            denomInBase: denomInBase,
                        },
                    ]);

                    bandAreaArrayHistorical.push({
                        id: order.positionId,
                        serie: bandArea,
                        data: bandData,
                        lineData: lineData,
                    });
                });

                setBandAreaHistorical(() => {
                    return bandAreaArrayHistorical;
                });
            }
        }
    }, [
        filteredTransactionalData,
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

                    if (showHistorical) {
                        if (
                            bandAreaHistorical &&
                            bandAreaHistorical.length > 0
                        ) {
                            bandAreaHistorical.forEach((element: any) => {
                                if (
                                    hoveredOrderHistory &&
                                    hoveredOrderHistory.type === 'historical' &&
                                    hoveredOrderHistory.id === element.id
                                ) {
                                    element.serie.decorate(
                                        (context: CanvasRenderingContext2D) => {
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

                                    element.lineData.forEach((line: any) => {
                                        liquidityLineSeries(line);
                                    });
                                } else {
                                    element.serie.decorate(
                                        (context: CanvasRenderingContext2D) => {
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

                                const range = [
                                    scaleData?.xScale(element.lineData[0][0].x),
                                    scaleData.xScale(element.lineData[0][1].x),
                                ];

                                element.serie.xScale().range(range);

                                element.serie([element.data]);

                                if (ctx) ctx.restore();
                            });
                        }
                    }

                    if (showLiquidity) {
                        if (limitCircleSeries && limitCircleSeries.length > 0) {
                            limitCircleSeries.forEach((limit: any) => {
                                if (
                                    hoveredOrderHistory &&
                                    isHoveredOrderHistory &&
                                    hoveredOrderHistory.type ===
                                        'limitCircle' &&
                                    hoveredOrderHistory.id === limit.id
                                ) {
                                    lineSeries.decorate(
                                        (context: CanvasRenderingContext2D) => {
                                            context.setLineDash([4, 2]);

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
                                                (denomInBase &&
                                                    !limit.data[0].isBid) ||
                                                (!denomInBase &&
                                                    limit.data[0].isBid);

                                            context.strokeStyle = isBuy
                                                ? colorPalette.circleBuyStrokeColor
                                                : colorPalette.circleStrokeColor;

                                            context.lineWidth = 1.5;
                                        },
                                    );

                                    lineSeries(limit.lineData);

                                    if (ctx) ctx.setLineDash([0, 0]);

                                    limit.serie.decorate(
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
                                                (denomInBase &&
                                                    !limit.data[0].isBid) ||
                                                (!denomInBase &&
                                                    limit.data[0].isBid);

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
                                    limit.serie.decorate(
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
                                                (denomInBase &&
                                                    !limit.data[0].isBid) ||
                                                (!denomInBase &&
                                                    limit.data[0].isBid);

                                            context.strokeStyle = isBuy
                                                ? colorPalette.circleBuyStrokeColor
                                                : colorPalette.circleStrokeColor;

                                            context.fillStyle = isBuy
                                                ? colorPalette.buyFill
                                                : colorPalette.sellFill;

                                            context.lineWidth = 1;
                                        },
                                    );
                                }

                                limit.serie(limit.data);
                            });
                        }

                        if (
                            limitLineData &&
                            limitLineData.length > 0 &&
                            lineSeries &&
                            triangleLimit &&
                            ctx
                        ) {
                            limitLineData.forEach((limitData: any) => {
                                const style = getComputedStyle(ctx.canvas);

                                const sellColor =
                                    style.getPropertyValue('--accent1');
                                const buyColor =
                                    style.getPropertyValue('--accent5');

                                const buyColorHex = d3.color(buyColor);
                                const sellColorHex = d3.color(sellColor);

                                if (
                                    hoveredOrderHistory &&
                                    isHoveredOrderHistory &&
                                    hoveredOrderHistory.type ===
                                        'limitCircle' &&
                                    hoveredOrderHistory.id === limitData.id
                                ) {
                                    lineSeries.decorate(
                                        (context: CanvasRenderingContext2D) => {
                                            context.strokeStyle =
                                                (denomInBase &&
                                                    !limitData.lineData[0]
                                                        .isBid) ||
                                                (!denomInBase &&
                                                    limitData.lineData[0].isBid)
                                                    ? sellColor?.toString()
                                                    : buyColor?.toString();

                                            context.setLineDash([4, 2]);

                                            context.lineWidth = 1;
                                        },
                                    );

                                    triangleLimit.decorate(
                                        (context: CanvasRenderingContext2D) => {
                                            const rotateDegree = 90;
                                            context.rotate(
                                                (rotateDegree * Math.PI) / 180,
                                            );

                                            context.strokeStyle =
                                                (denomInBase &&
                                                    !limitData.lineData[0]
                                                        .isBid) ||
                                                (!denomInBase &&
                                                    limitData.lineData[0].isBid)
                                                    ? sellColor
                                                    : buyColor;

                                            context.fillStyle =
                                                (denomInBase &&
                                                    !limitData.lineData[0]
                                                        .isBid) ||
                                                (!denomInBase &&
                                                    limitData.lineData[0].isBid)
                                                    ? sellColor
                                                    : buyColor;

                                            context.lineWidth = 1;
                                        },
                                    );
                                } else {
                                    lineSeries.decorate(
                                        (context: CanvasRenderingContext2D) => {
                                            context.setLineDash([4, 2]);

                                            if (buyColorHex && sellColorHex) {
                                                buyColorHex.opacity = 0.7;
                                                sellColorHex.opacity = 0.7;

                                                context.strokeStyle =
                                                    (denomInBase &&
                                                        !limitData.lineData[0]
                                                            .isBid) ||
                                                    (!denomInBase &&
                                                        limitData.lineData[0]
                                                            .isBid)
                                                        ? sellColorHex?.toString()
                                                        : buyColorHex?.toString();
                                            }

                                            context.lineWidth = 1;
                                        },
                                    );

                                    triangleLimit.decorate(
                                        (context: CanvasRenderingContext2D) => {
                                            // context.setLineDash([0, 0]);
                                            const rotateDegree = 90;
                                            context.rotate(
                                                (rotateDegree * Math.PI) / 180,
                                            );

                                            if (buyColorHex && sellColorHex) {
                                                buyColorHex.opacity = 0.7;
                                                sellColorHex.opacity = 0.7;

                                                context.strokeStyle =
                                                    (denomInBase &&
                                                        !limitData.lineData[0]
                                                            .isBid) ||
                                                    (!denomInBase &&
                                                        limitData.lineData[0]
                                                            .isBid)
                                                        ? sellColorHex.toString()
                                                        : buyColorHex.toString();

                                                context.fillStyle =
                                                    (denomInBase &&
                                                        !limitData.lineData[0]
                                                            .isBid) ||
                                                    (!denomInBase &&
                                                        limitData.lineData[0]
                                                            .isBid)
                                                        ? sellColorHex.toString()
                                                        : buyColorHex.toString();
                                            }

                                            context.lineWidth = 1;
                                        },
                                    );
                                }

                                lineSeries(limitData.lineData);

                                if (ctx) ctx.setLineDash([0, 0]);
                                ctx?.restore();

                                triangleLimit(limitData.triangleData);

                                ctx?.restore();
                            });
                        }
                    }

                    if (showSwap && circleSeries && circleSeries.length > 0) {
                        circleSeries.forEach((element: any) => {
                            if (
                                hoveredOrderHistory &&
                                isHoveredOrderHistory &&
                                hoveredOrderHistory.type === 'swap' &&
                                hoveredOrderHistory.id === element.id
                            ) {
                                element.serie.decorate(
                                    (context: CanvasRenderingContext2D) => {
                                        const colorPalette =
                                            calculateCircleColor(
                                                context,
                                                '--accent1',
                                                ['futa'].includes(platformName)
                                                    ? '--negative'
                                                    : '--accent5',
                                                true,
                                            );

                                        const isBuy =
                                            (denomInBase &&
                                                !element.data[0].isBuy) ||
                                            (!denomInBase &&
                                                element.data[0].isBuy);

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
                                element.serie.decorate(
                                    (context: CanvasRenderingContext2D) => {
                                        const colorPalette =
                                            calculateCircleColor(
                                                context,
                                                '--accent1',
                                                ['futa'].includes(platformName)
                                                    ? '--negative'
                                                    : '--accent5',
                                                false,
                                            );

                                        const isBuy =
                                            (denomInBase &&
                                                !element.data[0].isBuy) ||
                                            (!denomInBase &&
                                                element.data[0].isBuy);

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

                            element.serie(element.data);
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
                            element.serie.context(ctx);
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
                        bandAreaHistorical !== undefined &&
                        bandAreaHistorical.length > 0
                    ) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        bandAreaHistorical.forEach((element: any) => {
                            element.serie.context(ctx);
                        });
                    }
                });
        }

        renderCanvasArray([d3OrderCanvas]);
    }, [
        diffHashSig(filteredTransactionalData),
        diffHashSig(userLimitOrdersByPool),
        lineSeries,
        triangleLimit,
        denomInBase,
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
