import {
    MouseEvent,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import * as d3 from 'd3';
import {
    diffHashSig,
    diffHashSigScaleData,
} from '../../../utils/functions/diffHashSig';

import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { PoolContext } from '../../../contexts/PoolContext';
import { formatAmountWithoutDigit } from '../../../utils/numbers';
import { LiquidityDataLocal } from '../../Trade/TradeCharts/TradeCharts';
import {
    lineValue,
    liquidityChartData,
    renderCanvasArray,
    scaleData,
    setCanvasResolution,
} from '../ChartUtils/chartUtils';
import {
    createAreaSeries,
    decorateForLiquidityArea,
} from './LiquiditySeries/AreaSeries';
import {
    createLineSeries,
    decorateForLiquidityLine,
} from './LiquiditySeries/LineSeries';

interface liquidityPropsIF {
    liqMode: string;
    liquidityData: liquidityChartData;
    scaleData: scaleData | undefined;
    liquidityScale: d3.ScaleLinear<number, number> | undefined;
    liquidityDepthScale: d3.ScaleLinear<number, number> | undefined;
    ranges: lineValue[];
    chartMousemoveEvent: MouseEvent<HTMLDivElement> | undefined;
    liqTooltip:
        | d3.Selection<HTMLDivElement, unknown, null, undefined>
        | undefined;
    mouseLeaveEvent: MouseEvent<HTMLDivElement> | undefined;
    isActiveDragOrZoom: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mainCanvasBoundingClientRect: any;
}

type nearestLiquidity = {
    min: number | undefined;
    max: number | undefined;
};

export default function LiquidityChart(props: liquidityPropsIF) {
    const d3CanvasLiq = useRef<HTMLCanvasElement | null>(null);
    const d3CanvasLiqHover = useRef<HTMLCanvasElement | null>(null);
    const { pool: pool, poolPriceDisplay: poolPriceWithoutDenom } =
        useContext(PoolContext);
    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;
    const { poolPriceNonDisplay } = tradeData;

    const poolPriceDisplay = poolPriceWithoutDenom
        ? isDenomBase && poolPriceWithoutDenom
            ? 1 / poolPriceWithoutDenom
            : poolPriceWithoutDenom ?? 0
        : 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liqSeries, setLiqSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lineLiqSeries, setLineLiqSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lineLiqDepthBidSeries, setLineLiqDepthBidSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lineLiqDepthAskSeries, setLineLiqDepthAskSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liqDepthAskSeries, setLiqDepthAskSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liqDepthBidSeries, setLiqDepthBidSeries] = useState<any>();
    const [highlightedAreaCurveSeries, setHighlightedAreaCurveSeries] =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useState<any>();
    const [highlightedAreaBidSeries, setHighlightedAreaBidSeries] =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useState<any>();
    const [highlightedAreaAskSeries, setHighlightedAreaAskSeries] =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useState<any>();

    const [currentPriceData] = useState([{ value: -1 }]);
    const [liqTooltipSelectedLiqBar, setLiqTooltipSelectedLiqBar] = useState<
        LiquidityDataLocal | undefined
    >({
        activeLiq: 0,
        liqPrices: 0,
        deltaAverageUSD: 0,
        cumAverageUSD: 0,
        upperBound: 0,
        lowerBound: 0,
    });
    const {
        liqMode,
        liquidityData,
        scaleData,
        liquidityScale,
        liquidityDepthScale,
        ranges,
        chartMousemoveEvent,
        liqTooltip,
        mouseLeaveEvent,
        isActiveDragOrZoom,
        mainCanvasBoundingClientRect,
    } = props;

    const currentPoolPriceTick =
        poolPriceNonDisplay === undefined
            ? 0
            : Math.log(poolPriceNonDisplay) / Math.log(1.0001);

    const liqDataAsk = liquidityData?.liqAskData;

    const liqDataDepthAsk = liquidityData?.depthLiqAskData;

    const liqDataBid = liquidityData?.liqBidData;

    const liqDataDepthBid = useMemo<LiquidityDataLocal[]>(() => {
        return tradeData.advancedMode
            ? liquidityData?.depthLiqBidData
            : liquidityData?.depthLiqBidData.filter(
                  (d: LiquidityDataLocal) =>
                      d.liqPrices <= liquidityData?.topBoundary,
              );
    }, [
        tradeData.advancedMode,
        liquidityData?.depthLiqBidData,
        liquidityData?.topBoundary,
    ]);

    const [liquidityMouseMoveActive, setLiquidityMouseMoveActive] =
        useState<string>('none');

    useEffect(() => {
        if (
            scaleData !== undefined &&
            liquidityScale !== undefined &&
            liquidityDepthScale !== undefined
        ) {
            const d3CanvasLiqChart = createAreaSeries(
                liquidityScale,
                scaleData?.yScale,
                d3.curveBasis,
            );
            setLiqSeries(() => d3CanvasLiqChart);

            const d3CanvasLiqBidChartDepth = createAreaSeries(
                liquidityDepthScale,
                scaleData?.yScale,
                d3.curveStepAfter,
            );

            setLiqDepthBidSeries(() => d3CanvasLiqBidChartDepth);

            const d3CanvasLiqAskChartDepth = createAreaSeries(
                liquidityDepthScale,
                scaleData?.yScale,
                d3.curveStepBefore,
            );

            setLiqDepthAskSeries(() => d3CanvasLiqAskChartDepth);

            const d3CanvasLiqChartLine = createLineSeries(
                liquidityScale,
                scaleData?.yScale,
                d3.curveBasis,
            );
            setLineLiqSeries(() => d3CanvasLiqChartLine);

            const d3CanvasLiqBidChartDepthLine = createLineSeries(
                liquidityDepthScale,
                scaleData?.yScale,
                d3.curveStepAfter,
            );

            setLineLiqDepthBidSeries(() => d3CanvasLiqBidChartDepthLine);

            const d3CanvasLiqAskChartDepthLine = createLineSeries(
                liquidityDepthScale,
                scaleData?.yScale,
                d3.curveStepBefore,
            );

            setLineLiqDepthAskSeries(() => d3CanvasLiqAskChartDepthLine);
        }
    }, [scaleData, liquidityScale, pool, liquidityDepthScale]);

    useEffect(() => {
        const thresholdCurve = liquidityData?.liqTransitionPointforCurve;
        const thresholdDepth = liquidityData?.liqTransitionPointforDepth;

        if (liqSeries) {
            decorateForLiquidityArea(liqSeries, thresholdCurve);
            decorateForLiquidityLine(lineLiqSeries, thresholdCurve);
        }
        if (liqDepthAskSeries) {
            decorateForLiquidityArea(liqDepthAskSeries, thresholdDepth);
            decorateForLiquidityLine(lineLiqDepthAskSeries, thresholdDepth);
        }

        if (liqDepthBidSeries) {
            decorateForLiquidityArea(liqDepthBidSeries, thresholdDepth);
            decorateForLiquidityLine(lineLiqDepthBidSeries, thresholdDepth);
        }
    }, [
        liqMode,
        liquidityData?.liqTransitionPointforCurve,
        liquidityData?.liqTransitionPointforDepth,
        liqSeries,
        liqDepthAskSeries,
        liqDepthBidSeries,
        lineLiqSeries,
        lineLiqDepthAskSeries,
        lineLiqDepthBidSeries,
    ]);

    const clipCanvas = (
        low: number,
        high: number,
        canvas: HTMLCanvasElement,
    ) => {
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const height = low - high;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, high, canvas.width, height);
        ctx.clip();
    };

    const clipHighlightedLines = (canvas: HTMLCanvasElement) => {
        const _low = ranges.filter(
            (target: lineValue) => target.name === 'Min',
        )[0].value;
        const _high = ranges.filter(
            (target: lineValue) => target.name === 'Max',
        )[0].value;

        const low = _low > _high ? _high : _low;
        const high = _low > _high ? _low : _high;

        if (scaleData) {
            clipCanvas(scaleData?.yScale(low), scaleData?.yScale(high), canvas);
        }
    };

    useEffect(() => {
        setHighlightedAreaCurveSeries(() => liqSeries);
        setHighlightedAreaBidSeries(() => liqDepthBidSeries);
        setHighlightedAreaAskSeries(() => liqDepthAskSeries);
    }, [liqSeries, liqDepthBidSeries, liqDepthAskSeries]);

    const drawCurveLines = (canvas: HTMLCanvasElement) => {
        const isRange =
            location.pathname.includes('pool') ||
            location.pathname.includes('reposition');
        if (isRange) {
            clipHighlightedLines(canvas);
            lineLiqSeries(liqDataAsk);
            lineLiqSeries(liqDataBid);
        }
    };

    const drawDepthLines = (canvas: HTMLCanvasElement) => {
        const isRange =
            location.pathname.includes('pool') ||
            location.pathname.includes('reposition');
        if (isRange) {
            clipHighlightedLines(canvas);
            lineLiqDepthAskSeries(liqDataDepthAsk);
            lineLiqDepthBidSeries(liqDataDepthBid);
        }
    };

    const findLiqNearest = (
        liqDataAll: LiquidityDataLocal[],
    ): nearestLiquidity => {
        if (scaleData !== undefined) {
            const point = scaleData?.yScale.domain()[0];

            if (point == undefined) return { min: undefined, max: undefined };
            if (liqDataAll) {
                const tempLiqData = liqDataAll;

                const sortLiqaData = tempLiqData.sort(function (a, b) {
                    return a.liqPrices - b.liqPrices;
                });

                if (!sortLiqaData || sortLiqaData.length === 0)
                    return { min: undefined, max: undefined };
                const closestMin = sortLiqaData.reduce(function (prev, curr) {
                    return Math.abs(
                        curr.liqPrices - scaleData?.yScale.domain()[0],
                    ) < Math.abs(prev.liqPrices - scaleData?.yScale.domain()[0])
                        ? curr
                        : prev;
                });

                const closestMax = sortLiqaData.reduce(function (prev, curr) {
                    return Math.abs(
                        curr.liqPrices - scaleData?.yScale.domain()[1],
                    ) < Math.abs(prev.liqPrices - scaleData?.yScale.domain()[1])
                        ? curr
                        : prev;
                });

                if (closestMin !== undefined && closestMin !== undefined) {
                    return {
                        min: closestMin.liqPrices ? closestMin.liqPrices : 0,
                        max: closestMax.liqPrices,
                    };
                } else {
                    return { min: 0, max: 0 };
                }
            }
        }
        return { min: undefined, max: undefined };
    };

    const liqDataHover = (event: MouseEvent<HTMLDivElement>) => {
        if (
            scaleData !== undefined &&
            liquidityDepthScale !== undefined &&
            liquidityScale !== undefined
        ) {
            const allData =
                liqMode === 'curve'
                    ? liqDataBid.concat(liqDataAsk)
                    : liqDataDepthBid.concat(liqDataDepthAsk);

            if (!allData || allData.length === 0) return;
            const { min }: { min: number | undefined } = findLiqNearest(
                allData,
            ) as nearestLiquidity;

            if (min !== undefined) {
                let filteredAllData = allData.filter(
                    (item: LiquidityDataLocal) =>
                        min <= item.liqPrices &&
                        item.liqPrices <= scaleData?.yScale.domain()[1],
                );

                if (
                    filteredAllData === undefined ||
                    filteredAllData.length === 0
                ) {
                    filteredAllData = allData.filter(
                        (item: LiquidityDataLocal) => min <= item.liqPrices,
                    );
                }

                const liqMaxActiveLiq = d3.max(
                    filteredAllData,
                    function (d: LiquidityDataLocal) {
                        return d.activeLiq;
                    },
                );

                const canvas = d3
                    .select(d3CanvasLiq.current)
                    .select('canvas')
                    .node() as HTMLCanvasElement;

                const rect = canvas.getBoundingClientRect();

                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const currentDataY = scaleData?.yScale.invert(y);
                const currentDataX =
                    liqMode === 'depth'
                        ? liquidityDepthScale.invert(x)
                        : liquidityScale.invert(x);

                const bidMinBoudnary = d3.min(
                    liqDataBid,
                    (d: LiquidityDataLocal) => d.liqPrices,
                );
                const bidMaxBoudnary = d3.max(
                    liqDataBid,
                    (d: LiquidityDataLocal) => d.liqPrices,
                );

                const askMinBoudnary = d3.min(
                    liqDataAsk,
                    (d: LiquidityDataLocal) => d.liqPrices,
                );
                const askMaxBoudnary = d3.max(
                    liqDataAsk,
                    (d: LiquidityDataLocal) => d.liqPrices,
                );
                if (liqMaxActiveLiq && currentDataX <= liqMaxActiveLiq) {
                    if (
                        bidMinBoudnary !== undefined &&
                        bidMaxBoudnary !== undefined
                    ) {
                        if (
                            bidMinBoudnary < currentDataY &&
                            currentDataY < bidMaxBoudnary
                        ) {
                            setLiquidityMouseMoveActive('bid');
                            bidAreaFunc(event);
                        } else if (
                            askMinBoudnary !== undefined &&
                            askMaxBoudnary !== undefined
                        ) {
                            if (
                                askMinBoudnary < currentDataY &&
                                currentDataY < askMaxBoudnary
                            ) {
                                setLiquidityMouseMoveActive('ask');
                                askAreaFunc(event);
                            }
                        }
                    }
                } else {
                    if (liquidityMouseMoveActive !== 'none') {
                        liqTooltip?.style('visibility', 'hidden');
                        setLiquidityMouseMoveActive('none');
                    }
                }
            }
        }
    };

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasLiq.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (
            liqSeries &&
            liqDepthBidSeries &&
            liqDepthAskSeries &&
            scaleData &&
            liquidityDepthScale &&
            liquidityScale
        ) {
            d3.select(d3CanvasLiq.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    if (liqMode === 'curve') {
                        liqSeries(liqDataAsk);
                        liqSeries(liqDataBid);
                        drawCurveLines(canvas);
                    }
                    if (liqMode === 'depth') {
                        liqDepthBidSeries(liqDataDepthBid);
                        liqDepthAskSeries(liqDataDepthAsk);
                        drawDepthLines(canvas);
                    }
                })
                .on('measure', (event: CustomEvent) => {
                    liquidityScale.range([
                        event.detail.width,
                        (event.detail.width / 10) * 6,
                    ]);

                    liquidityDepthScale.range([
                        event.detail.width,
                        event.detail.width * 0.5,
                    ]);
                    scaleData?.yScale.range([event.detail.height, 0]);

                    liqSeries.context(ctx);
                    liqDepthBidSeries.context(ctx);
                    liqDepthAskSeries.context(ctx);
                    lineLiqDepthAskSeries.context(ctx);
                    lineLiqDepthBidSeries.context(ctx);

                    lineLiqSeries.context(ctx);
                });
        }
    }, [
        liqDataAsk,
        liqDataBid,
        liqDataDepthBid,
        liqDataDepthAsk,
        tradeData.advancedMode,
        liqSeries,
        liqDepthBidSeries,
        liqDepthAskSeries,
        liquidityScale,
        liquidityDepthScale,
        liqMode,
        location.pathname,
        ranges,
        lineLiqDepthAskSeries,
        lineLiqDepthBidSeries,
        lineLiqSeries,
    ]);

    useEffect(() => {
        const threshold =
            liqMode === 'curve'
                ? liquidityData?.liqTransitionPointforCurve
                : liquidityData?.liqTransitionPointforDepth;
        const canvas = d3
            .select(d3CanvasLiqHover.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (chartMousemoveEvent) {
            d3.select(d3CanvasLiqHover.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    if (liquidityMouseMoveActive !== 'none' && scaleData) {
                        const rectCanvas = canvas.getBoundingClientRect();
                        const offsetY =
                            chartMousemoveEvent.clientY - rectCanvas.top;

                        if (liquidityMouseMoveActive === 'ask') {
                            clipCanvas(
                                offsetY,
                                scaleData?.yScale(threshold),
                                canvas,
                            );

                            if (liqMode === 'curve') {
                                highlightedAreaCurveSeries(liqDataAsk);
                            }
                            if (liqMode === 'depth') {
                                highlightedAreaAskSeries(liqDataDepthAsk);
                            }
                        }
                        if (liquidityMouseMoveActive === 'bid') {
                            clipCanvas(
                                scaleData?.yScale(threshold),
                                offsetY,
                                canvas,
                            );
                            if (liqMode === 'curve') {
                                highlightedAreaCurveSeries(liqDataBid);
                            }

                            if (liqMode === 'depth') {
                                highlightedAreaBidSeries(liqDataDepthBid);
                            }
                        }
                    }
                })
                .on('measure', () => {
                    highlightedAreaCurveSeries.context(ctx);
                    highlightedAreaAskSeries.context(ctx);
                    highlightedAreaBidSeries.context(ctx);
                });
        }
    }, [
        highlightedAreaCurveSeries,
        highlightedAreaBidSeries,
        highlightedAreaAskSeries,
        liquidityMouseMoveActive,
        chartMousemoveEvent,
        liqDataDepthAsk,
        liqDataAsk,
        liqDataDepthBid,
        liqDataBid,
        liqMode,
        liquidityData?.liqTransitionPointforCurve,
        liquidityData?.liqTransitionPointforDepth,
    ]);

    useEffect(() => {
        if (
            liqTooltip !== undefined &&
            liquidityMouseMoveActive !== 'none' &&
            poolPriceDisplay !== undefined
        ) {
            const liqTextData = { totalValue: 0 };

            if (liqTooltipSelectedLiqBar?.liqPrices != null) {
                if (liquidityMouseMoveActive === 'ask') {
                    liquidityData?.liqAskData.map(
                        (liqData: LiquidityDataLocal) => {
                            if (
                                liqData?.liqPrices >
                                liqTooltipSelectedLiqBar?.liqPrices
                            ) {
                                liqTextData.totalValue =
                                    liqTextData.totalValue +
                                    liqData?.deltaAverageUSD;
                            }
                        },
                    );
                } else {
                    liquidityData?.liqBidData.map(
                        (liqData: LiquidityDataLocal) => {
                            if (
                                liqData?.liqPrices <
                                liqTooltipSelectedLiqBar.liqPrices
                            ) {
                                liqTextData.totalValue =
                                    liqTextData.totalValue +
                                    liqData?.deltaAverageUSD;
                            }
                        },
                    );
                }
            }
            const pinnedTick =
                liquidityMouseMoveActive === 'bid'
                    ? isDenomBase
                        ? liqTooltipSelectedLiqBar?.upperBound
                        : liqTooltipSelectedLiqBar?.lowerBound
                    : isDenomBase
                    ? liqTooltipSelectedLiqBar?.lowerBound
                    : liqTooltipSelectedLiqBar?.upperBound;

            const percentage = parseFloat(
                (Math.abs(pinnedTick - currentPoolPriceTick) / 100).toString(),
            ).toFixed(1);

            liqTooltip.html(
                '<p>' +
                    percentage +
                    '%</p>' +
                    '<p> $' +
                    formatAmountWithoutDigit(liqTextData.totalValue, 0) +
                    ' </p>',
            );
        }
    }, [
        liqTooltipSelectedLiqBar,
        liqMode,
        liquidityMouseMoveActive,
        liqTooltip,
        poolPriceDisplay,
        currentPoolPriceTick,
        liquidityData?.liqAskData,
        liquidityData?.liqBidData,
    ]);

    const bidAreaFunc = (event: MouseEvent) => {
        if (scaleData) {
            const canvas = d3
                .select(d3CanvasLiq.current)
                .select('canvas')
                .node() as HTMLCanvasElement;

            const rect = canvas.getBoundingClientRect();
            const leftSpaceRelativeToMainCanvas =
                mainCanvasBoundingClientRect.left;
            const offsetY = event.clientY - rect.top;
            const offsetX = event.clientX - leftSpaceRelativeToMainCanvas;

            currentPriceData[0] = {
                value: poolPriceDisplay !== undefined ? poolPriceDisplay : 0,
            };

            const filtered =
                liquidityData?.liqBidData.length > 1
                    ? liquidityData?.liqBidData.filter(
                          (d: LiquidityDataLocal) => d.liqPrices != null,
                      )
                    : liquidityData?.liqBidData;

            const mousePosition = scaleData?.yScale.invert(offsetY);

            let closest = filtered.find(
                (item: LiquidityDataLocal) =>
                    item.liqPrices ===
                    d3.min(filtered, (d: LiquidityDataLocal) => d.liqPrices),
            );

            filtered.map((data: LiquidityDataLocal) => {
                if (
                    mousePosition > data.liqPrices &&
                    data.liqPrices > closest?.liqPrices
                ) {
                    closest = data;
                }
            });

            if (closest) {
                setLiqTooltipSelectedLiqBar(() => {
                    return closest;
                });

                const pinnedTick = isDenomBase
                    ? closest?.upperBound
                    : closest?.lowerBound;

                const percentage = parseFloat(
                    (
                        Math.abs(pinnedTick - currentPoolPriceTick) / 100
                    ).toString(),
                ).toFixed(1);

                liqTooltip
                    ?.style(
                        'visibility',
                        percentage !== '0.0' ? 'visible' : 'hidden',
                    )
                    .style('top', event.pageY - 80 + 'px')
                    .style('left', offsetX - 80 + 'px');
            }
        }
    };

    const askAreaFunc = (event: MouseEvent) => {
        if (scaleData) {
            const canvas = d3
                .select(d3CanvasLiq.current)
                .select('canvas')
                .node() as HTMLCanvasElement;

            const rect = canvas.getBoundingClientRect();
            const leftSpaceRelativeToMainCanvas =
                mainCanvasBoundingClientRect.left;
            const offsetY = event.clientY - rect.top;
            const offsetX = event.clientX - leftSpaceRelativeToMainCanvas;

            currentPriceData[0] = {
                value: poolPriceDisplay !== undefined ? poolPriceDisplay : 0,
            };

            const filtered =
                liquidityData?.liqAskData.length > 1
                    ? liquidityData?.liqAskData.filter(
                          (d: LiquidityDataLocal) => d.liqPrices != null,
                      )
                    : liquidityData?.liqAskData;

            const mousePosition = scaleData?.yScale.invert(offsetY);

            let closest = filtered.find(
                (item: LiquidityDataLocal) =>
                    item.liqPrices ===
                    d3.max(filtered, (d: LiquidityDataLocal) => d.liqPrices),
            );
            if (closest !== undefined) {
                filtered.map((data: LiquidityDataLocal) => {
                    if (
                        mousePosition < data.liqPrices &&
                        data.liqPrices < closest?.liqPrices
                    ) {
                        closest = data;
                    }
                });
                setLiqTooltipSelectedLiqBar(() => {
                    return closest;
                });

                const pinnedTick = isDenomBase
                    ? closest?.lowerBound
                    : closest?.upperBound;

                const percentage = parseFloat(
                    (
                        Math.abs(pinnedTick - currentPoolPriceTick) / 100
                    ).toString(),
                ).toFixed(1);

                liqTooltip
                    ?.style(
                        'visibility',
                        percentage !== '0.0' ? 'visible' : 'hidden',
                    )
                    .style(
                        'top',
                        event.pageY -
                            mainCanvasBoundingClientRect.top +
                            50 +
                            'px',
                    )
                    .style('left', offsetX - 80 + 'px');
            }
        }
    };

    useEffect(() => {
        const liqDataAll = liquidityData?.depthLiqBidData.concat(
            liquidityData?.depthLiqAskData,
        );
        try {
            if (liqDataAll && liqDataAll.length === 0) return;
            const { min, max }: nearestLiquidity = findLiqNearest(liqDataAll);
            if (min !== undefined && max !== undefined) {
                const visibleDomain = liqDataAll.filter(
                    (liqData: LiquidityDataLocal) =>
                        liqData?.liqPrices >= min && liqData?.liqPrices <= max,
                );
                const maxLiq = d3.max(
                    visibleDomain,
                    (d: LiquidityDataLocal) => d.activeLiq,
                );
                if (maxLiq && parseFloat(maxLiq) !== 1 && liquidityDepthScale) {
                    liquidityDepthScale.domain([0, maxLiq]);
                }
            }
        } catch (error) {
            console.error({ error });
        }
    }, [
        diffHashSigScaleData(scaleData, 'y'),
        liquidityData?.depthLiqAskData,
        liquidityData?.depthLiqBidData,
    ]);

    useEffect(() => {
        if (chartMousemoveEvent && liqMode !== 'none') {
            liqDataHover(chartMousemoveEvent);
            renderCanvasArray([d3CanvasLiqHover]);
        }
    }, [chartMousemoveEvent, mainCanvasBoundingClientRect, liqMode]);

    useEffect(() => {
        if (liquidityMouseMoveActive !== 'none') {
            setLiquidityMouseMoveActive('none');
            liqTooltip?.style('visibility', 'hidden');
        }
    }, [mouseLeaveEvent]);

    useEffect(() => {
        if (liquidityMouseMoveActive !== 'none' && isActiveDragOrZoom) {
            liqTooltip?.style('visibility', 'hidden');
            setLiquidityMouseMoveActive('none');
        }
    }, [isActiveDragOrZoom]);

    useEffect(() => {
        if (liquidityMouseMoveActive === 'none') {
            d3.select(d3CanvasLiqHover.current)
                .select('canvas')
                .style('display', 'none');
        } else {
            d3.select(d3CanvasLiqHover.current)
                .select('canvas')
                .style('display', 'inline');
        }
    }, [liquidityMouseMoveActive]);

    useEffect(() => {
        renderCanvasArray([d3CanvasLiq]);
    }, [diffHashSig(liquidityData), ranges, liqMode, location.pathname]);

    return (
        <>
            <d3fc-canvas
                ref={d3CanvasLiqHover}
                style={{
                    position: 'relative',
                    width: '20%',
                    marginLeft: '80%',
                }}
            ></d3fc-canvas>
            <d3fc-canvas
                ref={d3CanvasLiq}
                style={{
                    position: 'relative',
                    width: '20%',
                    marginLeft: '80%',
                }}
            ></d3fc-canvas>
        </>
    );
}
