import { useContext, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { lineValue, renderCanvasArray, setCanvasResolution } from '../Chart';
import { diffHashSig } from '../../../utils/functions/diffHashSig';
import { createAreaSeries } from '../Series/AreaSeries';
import { createLineSeries } from '../Series/LineSeries';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { PoolContext } from '../../../contexts/PoolContext';
import { formatAmountWithoutDigit } from '../../../utils/numbers';
import { LiquidityDataLocal } from '../../Trade/TradeCharts/TradeCharts';

interface liquidityPropsIF {
    liqMode: string;
    liquidityData: any;
    scaleData: any;
    liquidityScale: any;
    liquidityDepthScale: any;
    ranges: lineValue[];
    liqDataHoverEvent: any;
    liqTooltip: any;
    mouseLeaveEvent: any;
}

export default function LiquidityChart(props: liquidityPropsIF) {
    const d3CanvasLiqBid = useRef<HTMLInputElement | null>(null);
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

    const [liqBidSeries, setLiqBidSeries] = useState<any>();
    const [lineBidSeries, setLineBidSeries] = useState<any>();
    const [lineBidDepthSeries, setLineBidDepthSeries] = useState<any>();

    const [liqBidDepthSeries, setLiqBidDepthSeries] = useState<any>();
    const [highlightedAreaSeries, setHighlightedAreaSeries] = useState<any>();
    const [currentPriceData] = useState([{ value: -1 }]);
    const [liqTooltipSelectedLiqBar, setLiqTooltipSelectedLiqBar] = useState({
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
    } = props;

    const currentPoolPriceTick =
        poolPriceNonDisplay === undefined
            ? 0
            : Math.log(poolPriceNonDisplay) / Math.log(1.0001);

    const liqDataAsk = liquidityData?.liqAskData;

    const liqDataDepthAsk = liquidityData?.depthLiqAskData;

    const liqDataBid = liquidityData?.liqBidData;

    const liqDataDepthBid = liquidityData?.depthLiqBidData;

    const [liquidityMouseMoveActive, setLiquidityMouseMoveActive] =
        useState<string>('none');
    const threshold =
        liqMode === 'curve'
            ? liquidityData?.liqTransitionPointforCurve
            : liquidityData?.liqTransitionPointforDepth;
    useEffect(() => {
        if (scaleData !== undefined) {
            const d3CanvasLiqBidChart = createAreaSeries(
                liquidityScale,
                scaleData?.yScale,
                threshold,
                'curve',
            );
            setLiqBidSeries(() => d3CanvasLiqBidChart);

            const d3CanvasLiqBidChartDepth = createAreaSeries(
                liquidityDepthScale,
                scaleData?.yScale,
                threshold,
                'depth',
            );

            setLiqBidDepthSeries(() => d3CanvasLiqBidChartDepth);

            const d3CanvasLiqBidChartLine = createLineSeries(
                liquidityScale,
                scaleData?.yScale,
                threshold,
                'curve',
            );
            setLineBidSeries(() => d3CanvasLiqBidChartLine);

            const d3CanvasLiqBidChartDepthLine = createLineSeries(
                liquidityDepthScale,
                scaleData?.yScale,
                threshold,
                'depth',
            );
            setLineBidDepthSeries(() => d3CanvasLiqBidChartDepthLine);

            renderCanvasArray([d3CanvasLiqBid]);
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

    const clipAskHighlightedLines = (canvas: HTMLCanvasElement) => {
        const _low = ranges.filter((target: any) => target.name === 'Min')[0]
            .value;
        const _high = ranges.filter((target: any) => target.name === 'Max')[0]
            .value;

        const low = _low > _high ? _high : _low;
        const high = _low > _high ? _low : _high;

        clipCanvas(scaleData?.yScale(low), scaleData?.yScale(high), canvas);
    };

    useEffect(() => {
        if (liqMode === 'curve') {
            setHighlightedAreaSeries(() => liqBidSeries);
        } else {
            setHighlightedAreaSeries(() => liqBidDepthSeries);
        }
    }, [liqMode, liqBidSeries, liqBidDepthSeries]);

    const drawCurveLines = (canvas: HTMLCanvasElement) => {
        const isRange =
            location.pathname.includes('range') ||
            location.pathname.includes('reposition');
        if (isRange) {
            clipAskHighlightedLines(canvas);
            lineBidSeries(liqDataAsk);
            lineBidSeries(liqDataBid);
        }
    };

    const drawDepthLines = (canvas: HTMLCanvasElement) => {
        const isRange =
            location.pathname.includes('range') ||
            location.pathname.includes('reposition');
        if (isRange) {
            clipAskHighlightedLines(canvas);
            lineBidDepthSeries(liqDataDepthAsk);

            lineBidDepthSeries(liqDataDepthBid);
        }
    };

    const findLiqNearest = (liqDataAll: any[]) => {
        if (scaleData !== undefined) {
            const point = scaleData?.yScale.domain()[0];

            if (point == undefined) return 0;
            if (liqDataAll) {
                const tempLiqData = liqDataAll;

                const sortLiqaData = tempLiqData.sort(function (a, b) {
                    return a.liqPrices - b.liqPrices;
                });

                if (!sortLiqaData || sortLiqaData.length === 0) return;

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
    };

    const liqDataHover = (event: any) => {
        const liqDataBid =
            liqMode === 'depth'
                ? liquidityData?.depthLiqBidData
                : liquidityData?.liqBidData;
        const liqDataAsk =
            liqMode === 'depth'
                ? liquidityData?.depthLiqAskData
                : liquidityData?.liqAskData;

        const allData = liqDataBid.concat(liqDataAsk);

        if (!allData || allData.length === 0) return;
        const { min }: any = findLiqNearest(allData);

        let filteredAllData = allData.filter(
            (item: any) =>
                min <= item.liqPrices &&
                item.liqPrices <= scaleData?.yScale.domain()[1],
        );

        if (filteredAllData === undefined || filteredAllData.length === 0) {
            filteredAllData = allData.filter(
                (item: any) => min <= item.liqPrices,
            );
        }

        const liqMaxActiveLiq = d3.max(filteredAllData, function (d: any) {
            return d.activeLiq;
        });

        const canvas = d3
            .select(d3CanvasLiqBid.current)
            .select('canvas')
            .node() as any;

        const rect = canvas.getBoundingClientRect();
        // liqMode === 'curve'
        //     ? canvas.getBoundingClientRect()
        //     : canvasDepth.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const currentDataY = scaleData?.yScale.invert(y);
        const currentDataX =
            liqMode === 'depth'
                ? liquidityDepthScale.invert(x)
                : liquidityScale.invert(x);

        const bidMinBoudnary = d3.min(liqDataBid, (d: any) => d.liqPrices);
        const bidMaxBoudnary = d3.max(liqDataBid, (d: any) => d.liqPrices);

        const askMinBoudnary = d3.min(liqDataAsk, (d: any) => d.liqPrices);
        const askMaxBoudnary = d3.max(liqDataAsk, (d: any) => d.liqPrices);

        if (liqMaxActiveLiq && currentDataX <= liqMaxActiveLiq) {
            if (bidMinBoudnary !== undefined && bidMaxBoudnary !== undefined) {
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
                liqTooltip.style('visibility', 'hidden');
                setLiquidityMouseMoveActive('none');
            }
        }
    };

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasLiqBid.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (liqBidSeries && liqBidDepthSeries) {
            d3.select(d3CanvasLiqBid.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    if (liqMode === 'curve') {
                        liqBidSeries(liqDataAsk);
                        liqBidSeries(liqDataBid);

                        drawCurveLines(canvas);
                    }
                    if (liqMode === 'depth') {
                        liqBidDepthSeries(liqDataDepthBid);
                        liqBidDepthSeries(liqDataDepthAsk);
                        drawDepthLines(canvas);
                    }
                })
                .on('measure', (event: any) => {
                    liqBidSeries.context(ctx);
                    liqBidDepthSeries.context(ctx);
                    lineBidDepthSeries.context(ctx);
                    lineBidSeries.context(ctx);
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
        liqBidSeries,
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
        if (highlightedAreaSeries) {
            d3.select(d3CanvasLiqHover.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    if (liquidityMouseMoveActive !== 'none') {
                        if (liquidityMouseMoveActive === 'ask') {
                            clipCanvas(
                                liqDataHoverEvent.offsetY,
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
                                liqDataHoverEvent.offsetY,
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
    }, [highlightedAreaSeries, liquidityMouseMoveActive, liqDataHoverEvent]);

    useEffect(() => {
        if (
            liqTooltip !== undefined &&
            liquidityMouseMoveActive !== 'none' &&
            poolPriceDisplay !== undefined
        ) {
            const liqTextData = { totalValue: 0 };

            if (liqTooltipSelectedLiqBar.liqPrices != null) {
                if (liquidityMouseMoveActive === 'ask') {
                    liquidityData?.liqAskData.map((liqData: any) => {
                        if (
                            liqData?.liqPrices >
                            liqTooltipSelectedLiqBar.liqPrices
                        ) {
                            liqTextData.totalValue =
                                liqTextData.totalValue +
                                liqData?.deltaAverageUSD;
                        }
                    });
                } else {
                    liquidityData?.liqBidData.map((liqData: any) => {
                        if (
                            liqData?.liqPrices <
                            liqTooltipSelectedLiqBar.liqPrices
                        ) {
                            liqTextData.totalValue =
                                liqTextData.totalValue +
                                liqData?.deltaAverageUSD;
                        }
                    });
                }
                // }
            }
            const pinnedTick =
                liquidityMouseMoveActive === 'bid'
                    ? liqTooltipSelectedLiqBar.upperBound
                    : liqTooltipSelectedLiqBar.lowerBound;

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

    const bidAreaFunc = (event: any) => {
        currentPriceData[0] = {
            value: poolPriceDisplay !== undefined ? poolPriceDisplay : 0,
        };

        const filtered =
            liquidityData?.liqBidData.length > 1
                ? liquidityData?.liqBidData.filter(
                      (d: any) => d.liqPrices != null,
                  )
                : liquidityData?.liqBidData;

        const mousePosition = scaleData?.yScale.invert(event.offsetY);

        let closest = filtered.find(
            (item: any) =>
                item.liqPrices === d3.min(filtered, (d: any) => d.liqPrices),
        );

        filtered.map((data: any) => {
            if (
                mousePosition > data.liqPrices &&
                data.liqPrices > closest.liqPrices
            ) {
                closest = data;
            }
        });

        setLiqTooltipSelectedLiqBar(() => {
            return closest;
        });

        const pinnedTick = closest.upperBound;

        const percentage = parseFloat(
            (Math.abs(pinnedTick - currentPoolPriceTick) / 100).toString(),
        ).toFixed(1);

        liqTooltip
            .style('visibility', percentage !== '0.0' ? 'visible' : 'hidden')
            .style('top', event.pageY - 80 + 'px')
            .style('left', event.offsetX - 80 + 'px');

        liquidityData.liqHighligtedAskSeries = [];
    };

    const askAreaFunc = (event: any) => {
        currentPriceData[0] = {
            value: poolPriceDisplay !== undefined ? poolPriceDisplay : 0,
        };

        const filtered =
            liquidityData?.liqAskData.length > 1
                ? liquidityData?.liqAskData.filter(
                      (d: any) => d.liqPrices != null,
                  )
                : liquidityData?.liqAskData;

        const mousePosition = scaleData?.yScale.invert(event.offsetY);

        let closest = filtered.find(
            (item: any) =>
                item.liqPrices === d3.max(filtered, (d: any) => d.liqPrices),
        );
        if (closest !== undefined) {
            filtered.map((data: any) => {
                if (
                    mousePosition < data.liqPrices &&
                    data.liqPrices < closest.liqPrices
                ) {
                    closest = data;
                }
            });

            setLiqTooltipSelectedLiqBar(() => {
                return closest;
            });
        }

        const pinnedTick = closest.lowerBound;

        const percentage = parseFloat(
            (Math.abs(pinnedTick - currentPoolPriceTick) / 100).toString(),
        ).toFixed(1);

        liqTooltip
            .style('visibility', percentage !== '0.0' ? 'visible' : 'hidden')
            .style('top', event.pageY - 80 + 'px')
            .style('left', event.offsetX - 80 + 'px');

        // renderCanvasArray([d3CanvasLiqAsk, d3CanvasLiqAskDepth]);
    };

    useEffect(() => {
        const liqDataAll = liquidityData?.depthLiqBidData.concat(
            liquidityData?.depthLiqAskData,
        );
        try {
            if (liqDataAll && liqDataAll.length === 0) return;
            const { min, max }: any = findLiqNearest(liqDataAll);
            const visibleDomain = liqDataAll.filter(
                (liqData: LiquidityDataLocal) =>
                    liqData?.liqPrices >= min && liqData?.liqPrices <= max,
            );
            const maxLiq = d3.max(visibleDomain, (d: any) => d.activeLiq);
            if (maxLiq && parseFloat(maxLiq) !== 1) {
                liquidityDepthScale.domain([0, maxLiq]);
            }
        } catch (error) {
            console.error({ error });
        }
    }, [
        scaleData && scaleData?.yScale.domain()[0],
        scaleData && scaleData?.yScale.domain()[1],
    ]);

    useEffect(() => {
        liqDataHover(liqDataHoverEvent);
        renderCanvasArray([d3CanvasLiqHover]);
    }, [liqDataHoverEvent]);

    useEffect(() => {
        if (liquidityMouseMoveActive !== 'none') {
            liqTooltip.style('visibility', 'hidden');
            setLiquidityMouseMoveActive('none');
        }
    }, [mouseLeaveEvent]);

    useEffect(() => {
        renderCanvasArray([d3CanvasLiqHover]);
    }, [liquidityMouseMoveActive]);

    useEffect(() => {
        if (scaleData !== undefined) {
            renderCanvasArray([d3CanvasLiqBid]);
        }
    }, [scaleData, liquidityData, location]);

    return (
        <>
            <d3fc-canvas
                ref={d3CanvasLiqHover}
                style={{
                    position: 'relative',
                    width: '20%',
                    left: '80%',
                }}
            ></d3fc-canvas>
            <d3fc-canvas
                ref={d3CanvasLiqBid}
                className='liq-bid-canvas'
                style={{
                    position: 'relative',
                    width: '20%',
                    left: '80%',
                }}
            ></d3fc-canvas>
        </>
    );
}
