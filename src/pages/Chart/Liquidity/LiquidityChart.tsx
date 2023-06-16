import {
    MouseEvent,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import * as d3 from 'd3';
import { lineValue, renderCanvasArray, setCanvasResolution } from '../Chart';
import { diffHashSig } from '../../../utils/functions/diffHashSig';
import { createAreaSeries } from '../LiquiditySeries/AreaSeries';
import { createLineSeries } from '../LiquiditySeries/LineSeries';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { PoolContext } from '../../../contexts/PoolContext';
import { formatAmountWithoutDigit } from '../../../utils/numbers';
import { LiquidityDataLocal } from '../../Trade/TradeCharts/TradeCharts';
import {
    liquidityChartData,
    scaleData,
} from '../../Trade/TradeCharts/TradeCandleStickChart';

interface liquidityPropsIF {
    liqMode: string;
    liquidityData: liquidityChartData;
    scaleData: scaleData;
    liquidityScale: d3.ScaleLinear<number, number> | undefined;
    liquidityDepthScale: d3.ScaleLinear<number, number> | undefined;
    ranges: lineValue[];
    liqDataHoverEvent: MouseEvent<HTMLDivElement> | undefined;
    liqTooltip:
        | d3.Selection<HTMLDivElement, unknown, null, undefined>
        | undefined;
    mouseLeaveEvent: MouseEvent<HTMLDivElement> | undefined;
    isActiveDragOrZoom: boolean;
}

type nearestLiquidity = {
    min: number | undefined;
    max: number | undefined;
};

export default function LiquidityChart(props: liquidityPropsIF) {
    const d3CanvasLiq = useRef<HTMLInputElement | null>(null);
    const d3CanvasLiqHover = useRef<HTMLInputElement | null>(null);
    const { poolPriceDisplay: poolPriceWithoutDenom } = useContext(PoolContext);
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
    const [lineBidDepthSeries, setLineBidDepthSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liqDepthSeries, setLiqDepthSeries] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [highlightedAreaSeries, setHighlightedAreaSeries] = useState<any>();

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
        liqDataHoverEvent,
        liqTooltip,
        mouseLeaveEvent,
        isActiveDragOrZoom,
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
    }, [tradeData.advancedMode, liquidityData?.depthLiqBidData]);

    const [liquidityMouseMoveActive, setLiquidityMouseMoveActive] =
        useState<string>('none');
    const threshold =
        liqMode === 'curve'
            ? liquidityData?.liqTransitionPointforCurve
            : liquidityData?.liqTransitionPointforDepth;
    useEffect(() => {
        if (
            scaleData !== undefined &&
            liquidityScale !== undefined &&
            liquidityDepthScale !== undefined
        ) {
            const d3CanvasLiqChart = createAreaSeries(
                liquidityScale,
                scaleData?.yScale,
                threshold,
                'curve',
            );
            setLiqSeries(() => d3CanvasLiqChart);

            const d3CanvasLiqChartDepth = createAreaSeries(
                liquidityDepthScale,
                scaleData?.yScale,
                threshold,
                'depth',
            );

            setLiqDepthSeries(() => d3CanvasLiqChartDepth);

            const d3CanvasLiqChartLine = createLineSeries(
                liquidityScale,
                scaleData?.yScale,
                threshold,
                'curve',
            );
            setLineLiqSeries(() => d3CanvasLiqChartLine);

            const d3CanvasLiqChartDepthLine = createLineSeries(
                liquidityDepthScale,
                scaleData?.yScale,
                threshold,
                'depth',
            );
            setLineBidDepthSeries(() => d3CanvasLiqChartDepthLine);

            renderCanvasArray([d3CanvasLiq]);
        }
    }, [diffHashSig(scaleData), liquidityScale, liquidityDepthScale]);

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

        clipCanvas(scaleData?.yScale(low), scaleData?.yScale(high), canvas);
    };

    useEffect(() => {
        if (liqMode === 'curve') {
            setHighlightedAreaSeries(() => liqSeries);
        } else {
            setHighlightedAreaSeries(() => liqDepthSeries);
        }
    }, [liqMode, liqSeries, liqDepthSeries]);

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
            lineBidDepthSeries(liqDataDepthAsk);

            lineBidDepthSeries(liqDataDepthBid);
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
            liqDepthSeries &&
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
                        liqDepthSeries(liqDataDepthBid);
                        liqDepthSeries(liqDataDepthAsk);
                        drawDepthLines(canvas);
                    }
                })
                .on('measure', (event: CustomEvent) => {
                    liqSeries.context(ctx);
                    liqDepthSeries.context(ctx);
                    lineBidDepthSeries.context(ctx);
                    lineLiqSeries.context(ctx);
                    liquidityScale.range([
                        event.detail.width,
                        (event.detail.width / 10) * 6,
                    ]);

                    liquidityDepthScale.range([
                        event.detail.width,
                        event.detail.width * 0.5,
                    ]);
                });
        }
    }, [
        liqDataAsk,
        liqDataBid,
        liqDataDepthBid,
        liqDataDepthAsk,
        tradeData.advancedMode,
        liqSeries,
        liquidityScale,
        scaleData?.yScale,
        liqMode,
        scaleData,
        location,
        ranges,
    ]);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasLiqHover.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (highlightedAreaSeries && liqDataHoverEvent) {
            d3.select(d3CanvasLiqHover.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    if (liquidityMouseMoveActive !== 'none') {
                        const rectCanvas = canvas.getBoundingClientRect();
                        const offsetY =
                            liqDataHoverEvent.clientY - rectCanvas.top;
                        if (liquidityMouseMoveActive === 'ask') {
                            clipCanvas(
                                offsetY,
                                scaleData?.yScale(threshold),
                                canvas,
                            );
                            highlightedAreaSeries(
                                liqMode === 'depth'
                                    ? liqDataDepthAsk
                                    : liqDataAsk,
                            );
                        }
                        if (liquidityMouseMoveActive === 'bid') {
                            clipCanvas(
                                scaleData?.yScale(threshold),
                                offsetY,
                                canvas,
                            );
                            highlightedAreaSeries(
                                liqMode === 'depth'
                                    ? liqDataDepthBid
                                    : liqDataBid,
                            );
                        }
                    }
                })
                .on('measure', () => {
                    highlightedAreaSeries.context(ctx);
                });
        }
    }, [
        highlightedAreaSeries,
        liquidityMouseMoveActive,
        liqDataHoverEvent,
        liqDataDepthAsk,
        liqDataAsk,
        liqDataDepthBid,
        liqDataBid,
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
                // }
            }
            const pinnedTick =
                liquidityMouseMoveActive === 'bid'
                    ? liqTooltipSelectedLiqBar?.upperBound
                    : liqTooltipSelectedLiqBar?.lowerBound;

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
    }, [liqTooltipSelectedLiqBar, liqMode, liquidityMouseMoveActive]);

    const bidAreaFunc = (event: MouseEvent) => {
        const canvas = d3
            .select(d3CanvasLiq.current)
            .select('canvas')
            .node() as HTMLCanvasElement;

        const rect = canvas.getBoundingClientRect();
        const leftSpaceRelativeToMainCanvas = rect.left - canvas.width * 4;
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

            const pinnedTick = closest?.upperBound;

            const percentage = parseFloat(
                (Math.abs(pinnedTick - currentPoolPriceTick) / 100).toString(),
            ).toFixed(1);

            liqTooltip
                ?.style(
                    'visibility',
                    percentage !== '0.0' ? 'visible' : 'hidden',
                )
                .style('top', event.pageY - 80 + 'px')
                .style('left', offsetX - 80 + 'px');
        }
    };

    const askAreaFunc = (event: MouseEvent) => {
        const canvas = d3
            .select(d3CanvasLiq.current)
            .select('canvas')
            .node() as HTMLCanvasElement;

        const rect = canvas.getBoundingClientRect();
        const leftSpaceRelativeToMainCanvas = rect.left - canvas.width * 4;
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

            const pinnedTick = closest?.lowerBound;

            const percentage = parseFloat(
                (Math.abs(pinnedTick - currentPoolPriceTick) / 100).toString(),
            ).toFixed(1);

            liqTooltip
                ?.style(
                    'visibility',
                    percentage !== '0.0' ? 'visible' : 'hidden',
                )
                .style('top', event.pageY - 80 + 'px')
                .style('left', offsetX - 80 + 'px');
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
        scaleData && scaleData?.yScale.domain()[0],
        scaleData && scaleData?.yScale.domain()[1],
    ]);

    useEffect(() => {
        if (liqDataHoverEvent) {
            liqDataHover(liqDataHoverEvent);
            renderCanvasArray([d3CanvasLiqHover]);
        }
    }, [liqDataHoverEvent]);

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
        if (scaleData !== undefined) {
            renderCanvasArray([d3CanvasLiq]);
        }
    }, [scaleData, liquidityData, location, ranges]);

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
