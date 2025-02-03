import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { useContext, useEffect, useRef, useState } from 'react';
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
import { LimitOrderIF, TransactionIF } from '../../../../ambient-utils/types';
import { GraphDataContext } from '../../../../contexts';
import { ChartThemeIF } from '../../../../contexts/ChartContext';

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
    filteredTransactionalData:
        | Array<{
              order: TransactionIF;
              totalValueUSD: number;
              tokenFlowDecimalCorrected: number;
              mergedIds: Array<{ hash: string; type: string }>;
          }>
        | undefined;
    filteredLimitTxData:
        | Array<{
              order: LimitOrderIF;
              totalValueUSD: number;
              tokenFlowDecimalCorrected: number;
              mergedIds: Array<{ hash: string; type: string }>;
          }>
        | undefined;
    circleScale: d3.ScaleLinear<number, number> | undefined;
    chartThemeColors: ChartThemeIF | undefined;
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
        selectedOrderHistory,
        isSelectedOrderHistory,
        drawSettings,
        filteredTransactionalData,
        filteredLimitTxData,
        circleScale,
        chartThemeColors,
    } = props;

    const d3OrderCanvas = useRef<HTMLDivElement | null>(null);

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

    const limitLineSeries = createLinearLineSeries(
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

    useEffect(() => {
        if (scaleData) {
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
                isActive: boolean;
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
                            id: limitOrder.limitOrderId,
                            triangleData: triangleLimitData,
                            lineData: lineData,
                        });
                    }
                });

                setLimitLineData(() => {
                    return limitLineDataArray;
                });
            }

            if (showSwap && filteredTransactionalData && circleScale) {
                filteredTransactionalData.forEach((transaction) => {
                    const circleSerie = createCircle(
                        scaleData?.xScale,
                        scaleData?.yScale,
                        circleScale(transaction.totalValueUSD),
                        1,
                        denomInBase,
                        transaction.order.isBuy,
                        chartThemeColors,
                    );

                    const circleData = [
                        {
                            x: transaction.order.txTime * 1000,
                            y: denomInBase
                                ? transaction.order.swapInvPriceDecimalCorrected
                                : transaction.order.swapPriceDecimalCorrected,
                            denomInBase: denomInBase,
                            isBuy: transaction.order.isBuy,
                        },
                    ];

                    circleSerieArray.push({
                        id: transaction.order.txId,
                        data: circleData,
                        serie: circleSerie,
                    });
                });
            }

            if (showSwap && filteredLimitTxData && circleScale) {
                filteredLimitTxData.forEach((transaction) => {
                    const lineData: Array<{
                        x: number;
                        y: number;
                        denomInBase: boolean;
                        isBid: boolean;
                    }> = [];

                    lineData.push({
                        x: transaction.order.timeFirstMint * 1000,
                        y: denomInBase
                            ? transaction.order.invLimitPriceDecimalCorrected
                            : transaction.order.limitPriceDecimalCorrected,
                        denomInBase: denomInBase,
                        isBid: transaction.order.isBid,
                    });
                    lineData.push({
                        x: transaction.order.crossTime * 1000,
                        y: denomInBase
                            ? transaction.order.invLimitPriceDecimalCorrected
                            : transaction.order.limitPriceDecimalCorrected,
                        denomInBase: denomInBase,
                        isBid: transaction.order.isBid,
                    });

                    const circleSerie = createCircle(
                        scaleData?.xScale,
                        scaleData?.yScale,
                        circleScale(transaction.totalValueUSD),
                        1,
                        denomInBase,
                        transaction.order.isBid,
                        chartThemeColors,
                    );

                    const circleData = [
                        {
                            x: transaction.order.crossTime * 1000,
                            y: denomInBase
                                ? transaction.order
                                      .invLimitPriceDecimalCorrected
                                : transaction.order.limitPriceDecimalCorrected,
                            denomInBase: denomInBase,
                            isBuy: transaction.order.isBid,
                        },
                    ];

                    limitCircleSerieArray.push({
                        id: transaction.order.limitOrderId,
                        data: circleData,
                        serie: circleSerie,
                        lineData: lineData,
                    });
                });
            }

            setLimitCircleSeries(() => {
                return limitCircleSerieArray;
            });

            setCircleSeries(() => {
                return circleSerieArray;
            });

            if (userPositionsByPool) {
                userPositionsByPool.positions.forEach((order) => {
                    if (
                        (order.positionLiq === 0 && showHistorical) ||
                        (order.positionLiq > 0 && showLiquidity)
                    ) {
                        const newBandScale = createScaleForBandArea(
                            order?.timeFirstMint * 1000,
                            order.positionLiq > 0
                                ? new Date().getTime() + 5 * 86400 * 1000
                                : order?.latestUpdateTime * 1000,
                        );

                        let bandColor = 'rgba(95, 255, 242, 0.15)';

                        if (ctx) {
                            const style = getComputedStyle(ctx.canvas);

                            const accent3RgbaColor =
                                style.getPropertyValue('--accent3');

                            const highlightedBandColor =
                                d3.color(accent3RgbaColor);

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
                                x:
                                    order.positionLiq > 0
                                        ? new Date().getTime() +
                                          5 * 86400 * 1000
                                        : order.latestUpdateTime * 1000,
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
                                    order.positionLiq > 0
                                        ? new Date().getTime() +
                                          5 * 86400 * 1000
                                        : order.latestUpdateTime * 1000,
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
                            isActive: order.positionLiq > 0,
                        });
                    }
                });

                setBandAreaHistorical(() => {
                    return bandAreaArrayHistorical;
                });
            }
        }
    }, [
        filteredTransactionalData,
        filteredLimitTxData,
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

        if (scaleData && ctx && chartThemeColors) {
            const decorateCircle = (
                context: CanvasRenderingContext2D,
                element: any,
                isHighlighted: boolean,
            ) => {
                const colorPalette = calculateCircleColor(
                    chartThemeColors.downCandleBodyColor.copy(),
                    chartThemeColors.downCandleBorderColor.copy(),
                    chartThemeColors.upCandleBodyColor.copy(),
                    chartThemeColors.upCandleBorderColor.copy(),
                    isHighlighted,
                );

                const isBuy =
                    (denomInBase && !element.data[0].isBuy) ||
                    (!denomInBase && element.data[0].isBuy);

                context.strokeStyle = isBuy
                    ? colorPalette.circleBuyStrokeColor
                    : colorPalette.circleSellStrokeColor;

                context.fillStyle = isBuy
                    ? colorPalette.buyFill
                    : colorPalette.sellFill;

                context.lineWidth = 1;
            };

            d3.select(d3OrderCanvas.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);

                    const sellColor =
                        chartThemeColors.downCandleBodyColor.copy();
                    const buyColor = chartThemeColors.upCandleBodyColor.copy();

                    if (bandAreaHistorical && bandAreaHistorical.length > 0) {
                        bandAreaHistorical.forEach((element: any) => {
                            if (
                                (element.isActive && showLiquidity) ||
                                (!element.isActive && showHistorical)
                            ) {
                                const isShapeSelected =
                                    (selectedOrderHistory &&
                                        isSelectedOrderHistory &&
                                        (selectedOrderHistory.type ===
                                            'historical' ||
                                            selectedOrderHistory.type ===
                                                'historicalLiq') &&
                                        selectedOrderHistory.id ===
                                            element.id) ||
                                    (hoveredOrderHistory &&
                                        isHoveredOrderHistory &&
                                        (hoveredOrderHistory.type ===
                                            'historical' ||
                                            hoveredOrderHistory.type ===
                                                'historicalLiq') &&
                                        hoveredOrderHistory.id === element.id);

                                if (isShapeSelected) {
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
                            }
                        });
                    }

                    if (showLiquidity) {
                        if (
                            limitLineData &&
                            limitLineData.length > 0 &&
                            lineSeries &&
                            triangleLimit
                        ) {
                            limitLineData.forEach((limitData: any) => {
                                const isShapeSelected =
                                    (selectedOrderHistory &&
                                        isSelectedOrderHistory &&
                                        selectedOrderHistory.type ===
                                            'limitSwapLine' &&
                                        selectedOrderHistory.id ===
                                            limitData.id) ||
                                    (hoveredOrderHistory &&
                                        isHoveredOrderHistory &&
                                        hoveredOrderHistory.type ===
                                            'limitSwapLine' &&
                                        hoveredOrderHistory.id ===
                                            limitData.id);

                                if (isShapeSelected) {
                                    lineSeries.decorate(
                                        (context: CanvasRenderingContext2D) => {
                                            context.strokeStyle =
                                                (denomInBase &&
                                                    !limitData.lineData[0]
                                                        .isBid) ||
                                                (!denomInBase &&
                                                    limitData.lineData[0].isBid)
                                                    ? sellColor.toString()
                                                    : buyColor.toString();

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
                                                    ? sellColor.toString()
                                                    : buyColor.toString();

                                            context.fillStyle =
                                                (denomInBase &&
                                                    !limitData.lineData[0]
                                                        .isBid) ||
                                                (!denomInBase &&
                                                    limitData.lineData[0].isBid)
                                                    ? sellColor.toString()
                                                    : buyColor.toString();

                                            context.lineWidth = 1;
                                        },
                                    );
                                } else {
                                    lineSeries.decorate(
                                        (context: CanvasRenderingContext2D) => {
                                            context.setLineDash([4, 2]);

                                            const buyColorHex = buyColor.copy();
                                            const sellColorHex =
                                                sellColor.copy();

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

                                            const buyColorHex = buyColor.copy();
                                            const sellColorHex =
                                                sellColor.copy();

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

                    if (
                        showSwap &&
                        limitCircleSeries &&
                        limitCircleSeries.length > 0
                    ) {
                        limitCircleSeries.forEach((element: any) => {
                            const isShapeSelected =
                                (selectedOrderHistory &&
                                    isSelectedOrderHistory &&
                                    selectedOrderHistory.type ===
                                        'claimableLimit' &&
                                    selectedOrderHistory.id === element.id) ||
                                (hoveredOrderHistory &&
                                    isHoveredOrderHistory &&
                                    hoveredOrderHistory.type ===
                                        'claimableLimit' &&
                                    hoveredOrderHistory.id === element.id);

                            if (isShapeSelected) {
                                element.serie.decorate(
                                    (context: CanvasRenderingContext2D) =>
                                        decorateCircle(context, element, true),
                                );

                                limitLineSeries.decorate(
                                    (context: CanvasRenderingContext2D) => {
                                        context.strokeStyle =
                                            (denomInBase &&
                                                !element.lineData[0].isBid) ||
                                            (!denomInBase &&
                                                element.lineData[0].isBid)
                                                ? buyColor?.toString()
                                                : sellColor?.toString();

                                        context.setLineDash([4, 2]);

                                        context.lineWidth = 1;
                                    },
                                );

                                limitLineSeries(element.lineData);

                                if (ctx) ctx.setLineDash([0, 0]);

                                if (ctx) ctx.restore();
                            } else {
                                element.serie.decorate(
                                    (context: CanvasRenderingContext2D) =>
                                        decorateCircle(context, element, false),
                                );

                                if (ctx) ctx.restore();
                            }

                            element.serie(element.data);
                        });
                    }

                    if (showSwap && circleSeries && circleSeries.length > 0) {
                        circleSeries.forEach((element: any) => {
                            const isShapeSelected =
                                (selectedOrderHistory &&
                                    isSelectedOrderHistory &&
                                    (selectedOrderHistory.type === 'swap' ||
                                        selectedOrderHistory.type ===
                                            'limitOrder') &&
                                    selectedOrderHistory.id === element.id) ||
                                (hoveredOrderHistory &&
                                    isHoveredOrderHistory &&
                                    (hoveredOrderHistory.type === 'swap' ||
                                        hoveredOrderHistory.type ===
                                            'limitOrder') &&
                                    hoveredOrderHistory.id === element.id);

                            if (isShapeSelected) {
                                element.serie.decorate(
                                    (context: CanvasRenderingContext2D) =>
                                        decorateCircle(context, element, true),
                                );

                                if (ctx) ctx.restore();
                            } else {
                                element.serie.decorate(
                                    (context: CanvasRenderingContext2D) =>
                                        decorateCircle(context, element, false),
                                );

                                if (ctx) ctx.restore();
                            }

                            element.serie(element.data);
                        });
                    }
                })
                .on('measure', () => {
                    if (lineSeries !== undefined) lineSeries.context(ctx);
                    if (limitLineSeries !== undefined)
                        limitLineSeries.context(ctx);
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
        diffHashSig(filteredLimitTxData),
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
        chartThemeColors,
    ]);

    return <d3fc-canvas className='d3_order_canvas' ref={d3OrderCanvas} />;
}
