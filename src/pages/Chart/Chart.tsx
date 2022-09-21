import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import moment from 'moment';
import { DetailedHTMLProps, HTMLAttributes, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { formatDollarAmountAxis } from '../../utils/numbers';
import { CandleData } from '../../utils/state/graphDataSlice';
import {
    setLimitPrice,
    setPinnedMaxPrice,
    setPinnedMinPrice,
    setSimpleRangeWidth,
    setTargetData,
    targetData,
} from '../../utils/state/tradeDataSlice';
import { CandleChartData } from '../Trade/TradeCharts/TradeCharts';
import FeeRateSubChart from '../Trade/TradeCharts/TradeChartsLoading/FeeRateSubChart';
import TvlSubChart from '../Trade/TradeCharts/TradeChartsLoading/TvlSubChart';
import VolumeSubChart from '../Trade/TradeCharts/TradeChartsLoading/VolumeSubChart';
import { ChartUtils } from '../Trade/TradeCharts/TradeCandleStickChart';
import './Chart.css';

/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'd3fc-group': DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
            'd3fc-svg': DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
        }
    }
}

type chartItemStates = {
    showTvl: boolean;
    showVolume: boolean;
    showFeeRate: boolean;
};
interface ChartData {
    priceData: ChartUtils | undefined;
    liquidityData: any;
    changeState: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    denomInBase: boolean;
    targetData: targetData[] | undefined;
    limitPrice: string | undefined;
    setLimitRate: React.Dispatch<React.SetStateAction<string>>;
    limitRate: string;
    isAdvancedModeActive: boolean | undefined;
    simpleRangeWidth: number | undefined;
    pinnedMinPriceDisplayTruncated: number | undefined;
    pinnedMaxPriceDisplayTruncated: number | undefined;
    truncatedPoolPrice: number | undefined;
    spotPriceDisplay: string | undefined;
    feeData: any[];
    volumeData: any[];
    tvlData: any[];
    chartItemStates: chartItemStates;
    setCurrentData: React.Dispatch<React.SetStateAction<CandleChartData | undefined>>;
    upBodyColor: string;
    upBorderColor: string;
    downBodyColor: string;
    downBorderColor: string;
}

export default function Chart(props: ChartData) {
    const {
        denomInBase,
        isAdvancedModeActive,
        pinnedMinPriceDisplayTruncated,
        pinnedMaxPriceDisplayTruncated,
        simpleRangeWidth,
        spotPriceDisplay,
    } = props;

    const { showFeeRate, showTvl, showVolume } = props.chartItemStates;
    const { upBodyColor, upBorderColor, downBodyColor, downBorderColor } = props;

    const parsedChartData = props.priceData;

    const d3Container = useRef(null);
    const d3PlotArea = useRef(null);

    const d3Xaxis = useRef(null);
    const d3Yaxis = useRef(null);

    const dispatch = useAppDispatch();

    const location = useLocation();

    const [ranges, setRanges] = useState([
        {
            name: 'Max',
            value: 0,
        },
        {
            name: 'Min',
            value: 0,
        },
    ]);

    const [limit, setLimit] = useState([
        {
            name: 'Limit',
            value: 0,
        },
    ]);

    const [market, setMarket] = useState([
        {
            name: 'Market Value',
            value: 0,
        },
    ]);

    const [subChartValues, setsubChartValues] = useState([
        {
            name: 'feeRate',
            value: 0,
        },
        {
            name: 'tvl',
            value: 0,
        },
        {
            name: 'volume',
            value: 0,
        },
    ]);

    // Rules
    const [isChartSelected, setIsChartSelected] = useState<boolean>(false);
    const [isHighMoved, setIsHighMoved] = useState<boolean>(false);
    const [isLowMoved, setIsLowMoved] = useState<boolean>(false);
    const [isLineSwapped, setIsLineSwapped] = useState<boolean>(false);
    const [drawControl, setDrawControl] = useState(false);
    const [dragControl, setDragControl] = useState(false);

    // Data
    const [crosshairData, setCrosshairData] = useState([{ x: 0, y: -1 }]);

    // d3
    const [transactionFilter, setTransactionFilter] = useState<CandleData>();
    const [ghostLines, setGhostLines] = useState<any>();
    const [horizontalLine, setHorizontalLine] = useState<any>();

    // Utils
    const [zoomUtils, setZoomUtils] = useState<any>();
    const [zoomStatus, setZoomStatus] = useState();
    const [scaleData, setScaleData] = useState<any>();
    const [dragType, setDragType] = useState<any>();

    const valueFormatter = d3.format('.5f');

    const setDefaultRangeData = () => {
        setRanges((prevState) => {
            const newTargets = [...prevState];
            newTargets.filter((target: any) => target.name === 'Max')[0].value =
                props.priceData !== undefined
                    ? Math.max(
                          ...props.priceData.chartData.map((o) => {
                              return o.open !== undefined ? o.open : 0;
                          }),
                      )
                    : 0;
            newTargets.filter((target: any) => target.name === 'Min')[0].value =
                props.priceData !== undefined
                    ? Math.min(
                          ...props.priceData.chartData.map((o) => {
                              return o.close !== undefined ? o.close : Infinity;
                          }),
                      )
                    : 0;

            return newTargets;
        });
    };

    const render = useCallback(() => {
        const nd = d3.select('#group').node() as any;
        nd.requestRedraw();
    }, []);

    useEffect(() => {
        render();
    }, [props.chartItemStates]);

    useEffect(() => {
        d3.select(d3Xaxis.current)
            .select('svg')
            .append('text')
            .attr('class', 'popup')
            .attr('dy', '20px')
            .style('visibility', 'visible')
            .style('font-size', '13px');

        d3.select(d3Yaxis.current)
            .select('svg')
            .append('text')
            .attr('class', 'popup')
            .attr('dx', '5px')
            .attr('dy', '2px')
            .style('visibility', 'visible')
            .style('font-size', '13px');

        d3.select(d3Container.current)
            .select('.targets')
            .select('.annotation-line')
            .on('mouseover', (event: any) => {
                if (!location.pathname.includes('market')) {
                    d3.select(event.currentTarget).select('.detector').style('cursor', 'ns-resize');
                }
            });
    }, [location]);

    async function addHorizontalLineArea() {
        await d3.select(d3PlotArea.current).select('.targets').selectAll('#rect').remove();
        await d3.select(d3PlotArea.current).select('.targets').append('rect').attr('id', 'rect');
        const max = ranges.find((item) => item.name === 'Max')?.value as number;
        const min = ranges.find((item) => item.name === 'Min')?.value as number;
        if (scaleData && location.pathname.includes('range')) {
            d3.select(d3Container.current)
                .select('.targets')
                .select('#rect')
                .attr('fill', '#7371FC1A')
                .attr('width', '100%')
                .attr('opacity', '0.7')
                .attr('cursor', 'default')
                .attr(
                    'height',
                    Math.abs(scaleData.yScale(ranges[1].value) - scaleData.yScale(ranges[0].value)),
                )
                .attr('y', min > max ? scaleData.yScale(min) : scaleData.yScale(max));
        }
    }

    useEffect(() => {
        addHorizontalLineArea();
    }, [ranges, zoomStatus, drawControl]);

    // Scale
    useEffect(() => {
        if (parsedChartData !== undefined) {
            const priceRange = d3fc
                .extentLinear()
                .accessors([(d: any) => d.high, (d: any) => d.low])
                .pad([0.05, 0.05]);

            const xExtent = d3fc
                .extentDate()
                .accessors([(d: any) => d.date])
                .padUnit('domain')
                // ensure that the scale is padded by one day in either direction
                .pad([parsedChartData.period * 5000, (parsedChartData.period / 2) * 100000]);

            const xScale = d3.scaleTime();
            const yScale = d3.scaleLinear();

            xScale.domain(xExtent(parsedChartData.chartData));
            yScale.domain(priceRange(parsedChartData.chartData));

            const xScaleCopy = xScale.copy();
            const yScaleCopy = yScale.copy();

            const liquidityScale = d3.scaleLinear();
            const ghostScale = d3.scaleLinear();

            const displayValue =
                spotPriceDisplay !== undefined ? spotPriceDisplay.replace(',', '') : '0';
            const barThreshold = parseFloat(displayValue);

            // bar chart
            const liquidityExtent = d3fc
                .extentLinear(props.liquidityData.liqData)
                .include([0])
                .accessors([(d: any) => parseFloat(d.activeLiq)]);

            const ghostExtent = d3fc
                .extentLinear(props.liquidityData.liqSnapData)
                .include([0])
                .accessors([(d: any) => parseFloat(d.activeLiq)]);

            liquidityScale.domain(liquidityExtent(props.liquidityData.liqData));
            ghostScale.domain(ghostExtent(props.liquidityData.liqSnapData));

            const liqScale = liquidityScale
                .copy()
                .range([
                    Math.min(
                        ...props.liquidityData.liqData.map((o: any) => parseFloat(o.activeLiq)),
                    ) / 2.5,
                    Math.max(
                        ...props.liquidityData.liqData.map((o: any) => parseFloat(o.activeLiq)),
                    ) * 2.5,
                ]);

            setScaleData(() => {
                return {
                    xScale: xScale,
                    yScale: yScale,
                    liquidityScale: liquidityScale,
                    liqScale: liqScale,
                    xScaleCopy: xScaleCopy,
                    yScaleCopy: yScaleCopy,
                    barThreshold: barThreshold,
                    ghostScale: ghostScale,
                };
            });
        }
    }, [parsedChartData?.period, denomInBase]);

    // Zoom
    useEffect(() => {
        if (scaleData !== undefined) {
            let lastY = 0;
            let yOffset = 0;

            const zoom = d3
                .zoom()
                .scaleExtent([1, 10])
                // .translateExtent([
                //     [-150, -200],
                //     [1600, 600],
                // ])
                .on('zoom', (event: any) => {
                    scaleData.xScale.domain(
                        event.transform.rescaleX(scaleData.xScaleCopy).domain(),
                    );

                    if (event.sourceEvent && event.sourceEvent.type != 'wheel') {
                        lastY = event.transform.y - yOffset;
                        const translate = d3.zoomIdentity.translate(0, lastY);
                        scaleData.yScale.domain(translate.rescaleY(scaleData.yScaleCopy).domain());
                        setZoomStatus(event.sourceEvent.pageX + event.sourceEvent.pageY);
                    } else {
                        yOffset = event.transform.y - lastY;
                    }

                    render();
                }) as any;

            const yAxisZoom = d3
                .zoom()
                .scaleExtent([1, 5])
                .on('zoom', (event: any) => {
                    scaleData.yScale.domain(
                        event.transform.rescaleY(scaleData.yScaleCopy).domain(),
                    );
                    render();
                }) as any;

            const yAxisDrag = d3.drag().on('drag', (event: any) => {
                console.log({ event });
                const factor = Math.pow(2, -event.dy * 0.01);
                d3.select(d3PlotArea.current).call(yAxisZoom.scaleBy, factor);

                setZoomStatus(event.sourceEvent.pageX + event.sourceEvent.pageY);
            }) as any;

            setZoomUtils(() => {
                return {
                    zoom: zoom,
                    yAxisZoom: yAxisZoom,
                    yAxisDrag: yAxisDrag,
                };
            });
        }
    }, [scaleData]);

    // Targets
    useEffect(() => {
        const results: boolean[] = [];

        if (location.pathname.includes('market')) {
            let lastCandlePrice: number | undefined;
            props.priceData?.chartData.map((data) => {
                if (lastCandlePrice === undefined && data.close !== undefined) {
                    lastCandlePrice = data.close;
                }
            });
            setMarket(() => {
                return [
                    {
                        name: 'Current Market Price',
                        value: lastCandlePrice !== undefined ? lastCandlePrice : 0,
                    },
                ];
            });
        } else if (location.pathname.includes('limit')) {
            setLimit(() => {
                return [
                    {
                        name: 'Limit',
                        value: parseFloat(props.limitPrice !== undefined ? props.limitPrice : '0'),
                    },
                ];
            });
        } else if (location.pathname.includes('range')) {
            if (!isAdvancedModeActive && !isHighMoved && !isLowMoved) {
                if (simpleRangeWidth === 100) {
                    ranges.map((mapData) => {
                        if (mapData.value === 0) {
                            results.push(true);
                        }
                    });

                    if (results.length === 2) {
                        setDefaultRangeData();
                    }
                } else {
                    setRanges(() => {
                        return [
                            {
                                name: 'Min',
                                value:
                                    pinnedMinPriceDisplayTruncated !== undefined
                                        ? pinnedMinPriceDisplayTruncated
                                        : 0,
                            },
                            {
                                name: 'Max',
                                value:
                                    pinnedMaxPriceDisplayTruncated !== undefined
                                        ? pinnedMaxPriceDisplayTruncated
                                        : 0,
                            },
                        ];
                    });
                }
            } else if (isAdvancedModeActive) {
                ranges.map((mapData) => {
                    props.targetData?.map((data) => {
                        if (mapData.name === data.name && mapData.value == data.value) {
                            results.push(true);
                        }
                    });
                });

                if (
                    props.targetData === undefined ||
                    (props.targetData[0].value === 0 && props.targetData[1].value === 0)
                ) {
                    setDefaultRangeData();
                } else if (results.length < 2) {
                    setRanges(() => {
                        let high = props.targetData?.filter(
                            (target: any) => target.name === 'Max',
                        )[0].value;
                        const low = props.targetData?.filter(
                            (target: any) => target.name === 'Min',
                        )[0].value;

                        if (high !== undefined && low !== undefined) {
                            if (high !== 0 && high < low) {
                                high = low + low / 100;
                            }

                            const chartTargets = [
                                {
                                    name: 'Max',
                                    value:
                                        high !== undefined && high !== 0
                                            ? high
                                            : props.priceData !== undefined
                                            ? Math.max(
                                                  ...props.priceData.chartData.map((o) => {
                                                      return o.open !== undefined ? o.open : 0;
                                                  }),
                                              )
                                            : 0,
                                },
                                {
                                    name: 'Min',
                                    value:
                                        low !== undefined && low !== 0
                                            ? low
                                            : props.priceData !== undefined
                                            ? Math.min(
                                                  ...props.priceData.chartData.map((o) => {
                                                      return o.close !== undefined
                                                          ? o.close
                                                          : Infinity;
                                                  }),
                                              )
                                            : 0,
                                },
                            ];
                            setIsHighMoved(false);
                            setIsLowMoved(false);
                            return chartTargets;
                        }
                        setIsHighMoved(false);
                        setIsLowMoved(false);
                        return [
                            { name: 'Min', value: 0 },
                            { name: 'Max', value: 0 },
                        ];
                    });
                }
            }
        }
    }, [
        location,
        props.limitPrice,
        props.targetData,
        denomInBase,
        isAdvancedModeActive,
        simpleRangeWidth,
        pinnedMinPriceDisplayTruncated,
        pinnedMaxPriceDisplayTruncated,
    ]);

    // Ghost Lines
    useEffect(() => {
        if (scaleData !== undefined) {
            const ghostLines = d3fc
                .annotationSvgLine()
                .value((d: any) => d.pinnedMaxPriceDisplayTruncated)
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale);

            ghostLines.decorate((selection: any) => {
                selection.enter().attr('id', (d: any) => d.name);
                selection
                    .enter()
                    .append('rect')
                    .attr('width', '100%')
                    .attr('y', -20)
                    .attr('height', '8%')
                    .attr('fill', 'transparent')
                    .attr('stroke', 'none');
                selection.enter().select('g.right-handle').remove();
                selection.enter().select('line').attr('class', 'ghostline');
                selection.enter().style('visibility', 'hidden');
            });
            setGhostLines(() => {
                return ghostLines;
            });
        }
    }, [scaleData]);

    // Drag Type
    useEffect(() => {
        if (scaleData !== undefined) {
            const snap = (data: any, value: any) => {
                if (value == undefined) return [];

                const filtered =
                    data.lenght > 1
                        ? data.filter((d: any) => d.pinnedMaxPriceDisplayTruncated != null)
                        : data;

                const nearest = filtered.reduce(function (prev: any, curr: any) {
                    return Math.abs(curr.pinnedMaxPriceDisplayTruncated - value) <
                        Math.abs(prev.pinnedMaxPriceDisplayTruncated - value)
                        ? curr
                        : prev;
                });

                console.log({ filtered });

                return nearest.pinnedMaxPriceDisplayTruncated;
            };

            const dragRange = d3.drag().on('drag', function (event, d: any) {
                d3.select(d3Container.current)
                    .select('.ghostLines')
                    .selectAll('.horizontal')
                    .style('visibility', 'visible');

                const snappedValue =
                    Math.round(
                        snap(
                            props.liquidityData.liqSnapData,
                            scaleData.yScale.invert(d3.pointer(event)[1] - 200),
                        ) * 100,
                    ) / 100;

                if (!isAdvancedModeActive) {
                    let valueWithRange: number;

                    if (d.name === 'Max') {
                        setRanges((prevState) => {
                            const newTargets = [...prevState];

                            const low = newTargets.filter((target: any) => target.name === 'Min')[0]
                                .value;

                            const displayValue =
                                spotPriceDisplay !== undefined
                                    ? spotPriceDisplay.replace(',', '')
                                    : '';

                            const dragLimit = parseFloat(displayValue) / 100;

                            valueWithRange =
                                newTargets.filter((target: any) => target.name === 'Max')[0].value -
                                snappedValue;

                            if (snappedValue > parseFloat(displayValue) + dragLimit) {
                                newTargets.filter((target: any) => target.name === 'Max')[0].value =
                                    snappedValue;

                                newTargets.filter((target: any) => target.name === 'Min')[0].value =
                                    snap(props.liquidityData.liqData, low + valueWithRange);

                                render();
                            } else {
                                newTargets.filter((target: any) => target.name === 'Max')[0].value =
                                    snap(
                                        props.liquidityData.liqData,
                                        parseFloat(displayValue) + dragLimit * 1.01,
                                    );

                                newTargets.filter((target: any) => target.name === 'Min')[0].value =
                                    snap(
                                        props.liquidityData.liqData,
                                        parseFloat(displayValue) - dragLimit * 1.01,
                                    );

                                render();
                            }
                            return newTargets;
                        });
                        setIsHighMoved(true);
                    } else {
                        setRanges((prevState) => {
                            const newTargets = [...prevState];

                            const displayValue =
                                spotPriceDisplay !== undefined
                                    ? spotPriceDisplay.replace(',', '')
                                    : '';

                            const dragLimit = parseFloat(displayValue) / 100;

                            valueWithRange =
                                newTargets.filter((target: any) => target.name === 'Min')[0].value -
                                snappedValue;

                            const high = newTargets.filter(
                                (target: any) => target.name === 'Max',
                            )[0].value;

                            if (snappedValue < parseFloat(displayValue) - dragLimit) {
                                newTargets.filter((target: any) => target.name === 'Min')[0].value =
                                    snappedValue;

                                newTargets.filter((target: any) => target.name === 'Max')[0].value =
                                    snap(props.liquidityData.liqData, high + valueWithRange);

                                render();
                            } else {
                                newTargets.filter((target: any) => target.name === 'Max')[0].value =
                                    snap(
                                        props.liquidityData.liqData,
                                        parseFloat(displayValue) + dragLimit * 1.01,
                                    );

                                newTargets.filter((target: any) => target.name === 'Min')[0].value =
                                    snap(
                                        props.liquidityData.liqData,
                                        parseFloat(displayValue) - dragLimit * 1.01,
                                    );

                                render();
                            }

                            return newTargets;
                        });
                        setIsLowMoved(true);
                    }
                } else {
                    setRanges((prevState) => {
                        const newTargets = [...prevState];

                        const low = newTargets.filter((target: any) => target.name === 'Min')[0]
                            .value;

                        const high = newTargets.filter((target: any) => target.name === 'Max')[0]
                            .value;

                        if (d.name === 'Max' && snappedValue > low) {
                            newTargets.filter((target: any) => target.name === d.name)[0].value =
                                snappedValue;
                            setIsLineSwapped(false);
                        } else if (d.name === 'Min' && snappedValue < high) {
                            newTargets.filter((target: any) => target.name === d.name)[0].value =
                                snappedValue;
                            setIsLineSwapped(false);
                        } else if (d.name === 'Max' && snappedValue < low) {
                            newTargets.filter((target: any) => target.name === 'Max')[0].value =
                                snappedValue;

                            d3.select(d3Container.current)
                                .select('.targets')
                                .select('#Max')
                                .select('g.left-handle text')
                                .text((d: any) => 'Min' + ' - ' + valueFormatter(d.value));

                            d3.select(d3Container.current)
                                .select('.targets')
                                .select('#Current Market Price')
                                .select('g.left-handle text')
                                .text((d: any) => 'Min' + ' - ' + valueFormatter(d.value));

                            setIsLineSwapped(true);
                        } else if (d.name === 'Min' && snappedValue > high) {
                            newTargets.filter((target: any) => target.name === 'Min')[0].value =
                                snappedValue;

                            d3.select(d3Container.current)
                                .select('.targets')
                                .select('#Min')
                                .select('.left-handle')
                                .select('text')
                                .text(() => 'Max' + ' - ' + valueFormatter(snappedValue));

                            setIsLineSwapped(true);
                        }

                        render();
                        return newTargets;
                    });
                    setIsHighMoved(true);
                    setIsLowMoved(true);
                }
            });

            const dragLimit = d3.drag().on('drag', function (event) {
                const newValue = scaleData.yScale.invert(d3.pointer(event)[1] - 182);
                setLimit(() => {
                    return [{ name: 'Limit', value: newValue }];
                });
                render();
            });

            setDragType(() => {
                return location.pathname.includes('limit') ? dragLimit : dragRange;
            });
        }
    }, [spotPriceDisplay, location, scaleData, isAdvancedModeActive, dragControl]);

    useEffect(() => {
        setDragControl(false);
    }, [parsedChartData]);

    // Horizontal Lines
    useEffect(() => {
        if (scaleData !== undefined) {
            const horizontalLine = d3fc
                .annotationSvgLine()
                .value((d: any) => d.value)
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale);

            horizontalLine.decorate((selection: any) => {
                selection
                    .enter()
                    .attr('id', (d: any) => d.name)
                    .select('g.left-handle')
                    .append('text')
                    .attr('x', 5)
                    .attr('y', -5);
                selection
                    .enter()
                    .append('rect')
                    .attr('width', '100%')
                    .attr('y', -20)
                    .attr('height', '8%')
                    .attr('fill', 'transparent')
                    .attr('stroke', 'none');

                selection.enter().select('g.right-handle').remove();
                selection.enter().select('line').attr('class', 'redline');
                selection
                    .select('g.left-handle text')
                    .text((d: any) => d.name + ' - ' + valueFormatter(d.value))
                    .style('transform', (d: any) =>
                        d.name == 'Min' ? ' translate(0px, 20px)' : '',
                    );
                selection
                    .enter()
                    .select('line')
                    .on('mouseout', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'default');
                    });

                const targetData = location.pathname.includes('limit')
                    ? limit
                    : location.pathname.includes('range')
                    ? ranges
                    : location.pathname.includes('market')
                    ? market
                    : undefined;
            });
            setHorizontalLine(() => {
                return horizontalLine;
            });
        }
    }, [scaleData]);

    useEffect(() => {
        /* else */
        if (!location.pathname.includes('market')) {
            const max = ranges.find((item) => item.name === 'Max')?.value as number;
            const min = ranges.find((item) => item.name === 'Min')?.value as number;
            const nodes = d3
                .select(d3PlotArea.current)
                .select('.targets')
                .selectAll('.annotation-line')
                .nodes();
            nodes.forEach((res, index) => {
                d3.select(res)
                    .append('polygon')

                    .attr('points', index == 0 ? '0,0 7,15 15,0,15' : '0,20 18,20 8,0,20')
                    // .attr('points','0,0 7,15 15,0,15')
                    // .style('transform',(d: any) => d.name=='Min' ? 'rotate(295deg)' : '')
                    .style('transform', () => (index == 1 ? ' translate(0px, -20px)' : ''))
                    .attr('width', 15)
                    .attr('height', 10)
                    .attr('fill', 'gainsboro');
            });
        }
    }, [drawControl]);

    // Line Rules
    useEffect(() => {
        if (dragType !== undefined) {
            if (location.pathname.includes('limit')) {
                d3.select(d3Container.current)
                    .select('.targets')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget)
                            // .select('.detector')
                            .style('cursor', 'ns-resize');
                        d3.select(event.currentTarget).select('line').style('cursor', 'ns-resize');
                    })
                    .call(dragType);
            }

            if (location.pathname.includes('range')) {
                d3.select(d3Container.current)
                    .select('.targets')
                    .select('.horizontal')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget)
                            // .select('.detector')
                            .style('cursor', 'ns-resize');
                        d3.select(event.currentTarget).select('line').style('cursor', 'ns-resize');
                    })
                    .call(dragType);

                d3.select(d3Container.current)
                    .select('.targets')
                    .select('#Min')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'ns-resize');
                        d3.select(event.currentTarget).select('line').style('cursor', 'ns-resize');
                    })
                    .call(dragType);

                d3.select(d3Container.current)
                    .select('.targets')
                    .select('#Max')
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'ns-resize');
                        d3.select(event.currentTarget).select('line').style('cursor', 'ns-resize');
                    })
                    .call(dragType);
            }
        }
    }, [dragType, parsedChartData?.period, location, horizontalLine]);

    // Call drawChart()
    useEffect(() => {
        if (
            props.liquidityData.liqData !== undefined &&
            parsedChartData !== undefined &&
            scaleData !== undefined &&
            zoomUtils !== undefined
        ) {
            const targetData = location.pathname.includes('limit')
                ? limit
                : location.pathname.includes('range')
                ? ranges
                : location.pathname.includes('market')
                ? market
                : undefined;

            drawChart(
                parsedChartData.chartData,
                targetData,
                scaleData,
                props.liquidityData,
                upBodyColor,
                downBodyColor,
                upBorderColor,
                downBorderColor,
                zoomUtils,
                horizontalLine,
                ghostLines,
            );
        }
    }, [
        parsedChartData,
        scaleData,
        location,
        market,
        ranges,
        limit,
        zoomUtils,
        horizontalLine,
        ghostLines,
    ]);

    // Draw Chart
    const drawChart = useCallback(
        (
            chartData: any,
            targets: any,
            scaleData: any,
            liquidityData: any,
            upBodyColor: any,
            downBodyColor: any,
            upBorderColor: any,
            downBorderColor: any,
            zoomUtils: any,
            horizontalLine: any,
            ghostLines: any,
        ) => {
            if (chartData.length > 0) {
                let selectedCandle: any;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const crosshairData = [{ x: 0, y: -1 }];
                // console.error('draw', drawControl);

                const minimum = (data: any, accessor: any) => {
                    return data
                        .map(function (dataPoint: any, index: any) {
                            return [accessor(dataPoint, index), dataPoint, index];
                        })
                        .reduce(
                            function (accumulator: any, dataPoint: any) {
                                return accumulator[0] > dataPoint[0] ? dataPoint : accumulator;
                            },
                            [Number.MAX_VALUE, null, -1],
                        );
                };

                const snap = (series: any, data: any, point: any) => {
                    if (point == undefined) return [];
                    const xScale = series.xScale(),
                        xValue = series.crossValue();

                    const filtered =
                        data.lenght > 1 ? data.filter((d: any) => xValue(d) != null) : data;
                    const nearest = minimum(filtered, (d: any) =>
                        Math.abs(point.offsetX - xScale(xValue(d))),
                    )[1];

                    setCrosshairData([{ x: point.offsetX, y: -1 }]);

                    props.setCurrentData(nearest);
                    return [
                        {
                            x: nearest?.date,
                            y: scaleData.yScale.invert(point.offsetY),
                        },
                    ];
                };

                // axes
                const xAxis = d3fc.axisBottom().scale(scaleData.xScale);
                const yAxis = d3fc.axisRight().scale(scaleData.yScale);

                const barSeries = d3fc
                    .autoBandwidth(d3fc.seriesSvgBar())
                    .orient('horizontal')
                    .align('center')
                    .mainValue((d: any) => scaleData.liqScale.invert(parseFloat(d.activeLiq)))
                    .crossValue((d: any) => d.upperBoundPriceDecimalCorrected)
                    .xScale(scaleData.liquidityScale)
                    .yScale(scaleData.yScale)
                    .decorate((selection: any) => {
                        selection.select('.bar > path').style('fill', (d: any) => {
                            return d.upperBoundPriceDecimalCorrected > scaleData.barThreshold
                                ? 'rgba(115, 113, 252, 0.7)'
                                : 'rgba(205, 193, 255, 0.7)';
                        });
                        selection.select('.bar > path').style('stroke', (d: any) => {
                            d.upperBoundPriceDecimalCorrected > scaleData.barThreshold
                                ? 'rgba(115, 113, 252, 0.7)'
                                : 'rgba(205, 193, 255, 0.7)';
                        });
                    });

                const popup = d3
                    .select(d3Container.current)
                    .append('div')
                    .attr('class', 'popup')
                    .style('visibility', 'hidden');

                const crosshairHorizontal = d3fc
                    .annotationSvgLine()
                    .orient('vertical')
                    .value((d: any) => d.x)
                    .xScale(scaleData.xScale)
                    .yScale(scaleData.yScale)
                    .label('');

                crosshairHorizontal.decorate((selection: any) => {
                    selection.enter().select('line').attr('class', 'crosshair');
                    selection
                        .enter()
                        .append('line')
                        .attr('stroke-width', 1)
                        .style('pointer-events', 'all');
                    selection.enter().select('g.top-handle').remove();
                });

                const crosshairVertical = d3fc
                    .annotationSvgLine()
                    .value((d: any) => d.y)
                    .xScale(scaleData.xScale)
                    .yScale(scaleData.yScale);

                crosshairVertical.decorate((selection: any) => {
                    selection.enter().select('line').attr('class', 'crosshair');
                    selection
                        .enter()
                        .append('line')
                        .attr('stroke-width', 1)
                        .style('pointer-events', 'all');
                    selection.enter().select('g.left-handle').remove();
                    selection.enter().select('g.right-handle').remove();
                });

                const candlestick = d3fc
                    .autoBandwidth(d3fc.seriesSvgCandlestick())
                    .decorate((selection: any) => {
                        selection
                            .enter()
                            .style('fill', (d: any) =>
                                d.close > d.open ? upBodyColor : downBodyColor,
                            )
                            .style('stroke', (d: any) =>
                                d.close > d.open ? upBorderColor : downBorderColor,
                            );
                        selection
                            .enter()
                            .on('mouseover', (event: any) => {
                                d3.select(event.currentTarget).style('cursor', 'pointer');
                            })
                            .on('mouseout', (event: any) => {
                                d3.select(event.currentTarget).style('cursor', 'default');
                            })
                            .on('click', (event: any) => {
                                if (
                                    selectedCandle !== undefined &&
                                    event.currentTarget !== selectedCandle
                                ) {
                                    d3.select(selectedCandle)
                                        .style('fill', (d: any) =>
                                            d.close > d.open ? '#7371FC' : '#CDC1FF',
                                        )
                                        .style('stroke', (d: any) =>
                                            d.close > d.open ? '#7371FC' : '#CDC1FF',
                                        );
                                }
                                if (event.currentTarget === selectedCandle) {
                                    popup.style('visibility', 'hidden');
                                    d3.select(event.currentTarget)
                                        .style('fill', (d: any) =>
                                            d.close > d.open ? '#7371FC' : '#CDC1FF',
                                        )
                                        .style('stroke', (d: any) =>
                                            d.close > d.open ? '#7371FC' : '#CDC1FF',
                                        );
                                    setIsChartSelected(false);
                                    selectedCandle = undefined;
                                } else {
                                    selectedCandle = event.currentTarget;
                                    setIsChartSelected(true);
                                    setTransactionFilter(() => {
                                        return event.target.__data__;
                                    });

                                    d3.select(event.currentTarget)
                                        .style('fill', '#E480FF')
                                        .style('stroke', '#E480FF');

                                    popup
                                        .style('visibility', 'visible')
                                        .html(
                                            '<p>Showing Transactions for <span style="color: #E480FF">' +
                                                moment(event.target.__data__.date).format(
                                                    'DD MMM  HH:mm',
                                                ) +
                                                '</span> Candle</p>',
                                        )
                                        .style('left', '34%')
                                        .style('top', 500 + 'px');
                                }
                            });
                    })
                    .xScale(scaleData.xScale)
                    .yScale(scaleData.yScale);

                const candleJoin = d3fc.dataJoin('g', 'candle');
                const targetsJoin = d3fc.dataJoin('g', 'targets');
                const ghostJoin = d3fc.dataJoin('g', 'ghostLines');
                const barJoin = d3fc.dataJoin('g', 'bar');
                const crosshairHorizontalJoin = d3fc.dataJoin('g', 'crosshairHorizontal');
                const crosshairVerticalJoin = d3fc.dataJoin('g', 'crosshairVertical');

                // handle the plot area measure event in order to compute the scale ranges
                d3.select(d3PlotArea.current).on('measure', function (event: any) {
                    scaleData.xScale.range([0, event.detail.width]);
                    scaleData.yScale.range([event.detail.height, 0]);
                    scaleData.liquidityScale.range([event.detail.width, event.detail.width / 2]);
                });

                d3.select(d3PlotArea.current).on('draw', async function (event: any) {
                    const svg = d3.select(event.target).select('svg');

                    crosshairHorizontalJoin(svg, [crosshairData]).call(crosshairHorizontal);
                    crosshairVerticalJoin(svg, [crosshairData]).call(crosshairVertical);
                    barJoin(svg, [liquidityData.liqData]).call(barSeries);
                    candleJoin(svg, [chartData]).call(candlestick);
                    ghostJoin(svg, [liquidityData.liqSnapData]).call(ghostLines);
                    await targetsJoin(svg, [targets]).call(horizontalLine);
                    setDrawControl(event);
                    setDragControl(true);
                });
                d3.select(d3Xaxis.current).on('draw', function (event: any) {
                    d3.select(event.target).select('svg').call(xAxis);
                });

                d3.select(d3Yaxis.current).on('draw', function (event: any) {
                    d3.select(event.target).select('svg').call(yAxis);
                });

                d3.select(d3PlotArea.current).on('measure.range', function (event: any) {
                    const svg = d3.select(event.target).select('svg');
                    scaleData.xScaleCopy.range([0, event.detail.width]);
                    scaleData.yScaleCopy.range([event.detail.height, 0]);
                    svg.call(zoomUtils.zoom);
                });

                d3.select(d3PlotArea.current).on('mousemove', function (event: any) {
                    crosshairData[0] = snap(candlestick, chartData, event)[0];

                    const dateIndcLocation = event.offsetX;
                    const valueIndcLocation = event.offsetY;

                    d3.select(d3Xaxis.current)
                        .select('svg')
                        .select('text')
                        .style('visibility', 'visible')
                        .text(moment(crosshairData[0].x).format('DD MMM  HH:mm'))
                        .style('transform', 'translateX(' + dateIndcLocation + 'px)');

                    d3.select(d3Yaxis.current)
                        .select('svg')
                        .select('text')
                        .style('visibility', 'visible')
                        .text(scaleData.yScale.invert(event.offsetY))
                        .style('transform', 'translateY(' + valueIndcLocation + 'px)');

                    render();
                });

                d3.select(d3Yaxis.current)
                    .on('mouseover', (event: any) => {
                        d3.select(event.currentTarget).style('cursor', 'ns-resize');
                    })
                    .call(zoomUtils.yAxisDrag);

                render();
            }
        },
        [],
    );

    // Color Picker
    useEffect(() => {
        d3.select(d3PlotArea.current).select('.candle').selectAll('.up').style('fill', upBodyColor);
        d3.select(d3PlotArea.current)
            .select('.candle')
            .selectAll('.down')
            .style('fill', downBodyColor);
        d3.select(d3PlotArea.current)
            .select('.candle')
            .selectAll('.up')
            .style('stroke', upBorderColor);
        d3.select(d3PlotArea.current)
            .select('.candle')
            .selectAll('.down')
            .style('stroke', downBorderColor);
        render();
    }, [upBodyColor, downBodyColor, upBorderColor, downBorderColor]);

    // Candle transactions
    useEffect(() => {
        if (isChartSelected !== undefined && transactionFilter !== undefined) {
            props.changeState(isChartSelected, transactionFilter);
        }
    }, [isChartSelected, transactionFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const results: boolean[] = [];

            ranges.map((mapData) => {
                props.targetData?.map((data) => {
                    if (mapData.name === data.name && mapData.value == data.value) {
                        results.push(true);
                    }
                });
            });

            if (results.length < 2) {
                const low = ranges.filter((target: any) => target.name === 'Min')[0].value;
                const high = ranges.filter((target: any) => target.name === 'Max')[0].value;

                if (!isAdvancedModeActive) {
                    dispatch(setPinnedMinPrice(low));
                    dispatch(setPinnedMaxPrice(high));

                    if (spotPriceDisplay !== undefined && (isHighMoved || isLowMoved)) {
                        const displayValue = spotPriceDisplay.replace(',', '');

                        const dragLimit = parseFloat(displayValue) / 100;

                        const difference = isHighMoved
                            ? high - parseFloat(displayValue)
                            : isLowMoved
                            ? parseFloat(displayValue) - low
                            : 1;

                        if (!(dragLimit > difference)) {
                            const percentage = (difference * 100) / parseFloat(displayValue);

                            setIsHighMoved(false);
                            setIsLowMoved(false);
                            dispatch(setSimpleRangeWidth(Math.round(percentage)));
                        }
                    } else {
                        dispatch(setSimpleRangeWidth(simpleRangeWidth ? simpleRangeWidth : 1));
                    }
                } else {
                    const high = ranges.filter((target: any) => target.name === 'Max')[0].value;
                    const low = ranges.filter((target: any) => target.name === 'Min')[0].value;

                    const newTargetData: targetData[] = [
                        {
                            name: 'Max',
                            value: isLineSwapped ? low : high,
                        },
                        {
                            name: 'Min',
                            value: isLineSwapped ? high : low,
                        },
                    ];

                    dispatch(setTargetData(newTargetData));
                }
            }
        }, 1000);

        d3.select(d3Container.current)
            .select('.ghostLines')
            .selectAll('.horizontal')
            .style('visibility', 'hidden');

        return () => clearTimeout(timer);
    }, [ranges]);

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(setLimitPrice(limit[0].value.toString()));
            props.setLimitRate(limit[0].value.toString());
        }, 1000);
        return () => clearTimeout(timer);
    }, [limit]);

    return (
        <div ref={d3Container} className='main_layout_chart' data-testid={'chart'}>
            <d3fc-group
                id='group'
                className='hellooo'
                style={{
                    display: 'flex',
                    height: '100%',
                    width: '100%',
                    flexDirection: 'column',
                }}
                auto-resize
            >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'row',
                            overflow: 'hidden',
                        }}
                    >
                        <d3fc-svg
                            ref={d3PlotArea}
                            className='plot-area'
                            style={{ flex: 1, overflow: 'hidden' }}
                        ></d3fc-svg>
                        <d3fc-svg
                            className='y-axis'
                            ref={d3Yaxis}
                            style={{ width: '3em' }}
                        ></d3fc-svg>
                    </div>

                    {showFeeRate && (
                        <>
                            <hr />
                            <label>
                                Fee Rate{' '}
                                {formatDollarAmountAxis(
                                    subChartValues.filter(
                                        (value: any) => value.name === 'feeRate',
                                    )[0].value,
                                )}
                            </label>
                            <FeeRateSubChart
                                feeData={props.feeData}
                                crosshairData={crosshairData}
                                setsubChartValues={setsubChartValues}
                            />
                        </>
                    )}

                    {showTvl && (
                        <>
                            <hr />
                            <label>
                                TVL{' '}
                                {formatDollarAmountAxis(
                                    subChartValues.filter((value: any) => value.name === 'tvl')[0]
                                        .value,
                                )}
                            </label>
                            <TvlSubChart
                                tvlData={parsedChartData?.tvlChartData}
                                period={parsedChartData?.period}
                                crosshairData={crosshairData}
                                setsubChartValues={setsubChartValues}
                                xScale={scaleData !== undefined ? scaleData.xScale : undefined}
                            />
                        </>
                    )}

                    {showVolume === true && (
                        <>
                            <hr />
                            <label>
                                Volume{' '}
                                {formatDollarAmountAxis(
                                    subChartValues.filter(
                                        (value: any) => value.name === 'volume',
                                    )[0].value,
                                )}
                            </label>
                            <VolumeSubChart
                                volumeData={parsedChartData?.volumeChartData}
                                period={parsedChartData?.period}
                                crosshairData={crosshairData}
                                setsubChartValues={setsubChartValues}
                                xScale={scaleData !== undefined ? scaleData.xScale : undefined}
                            />
                        </>
                    )}

                    <d3fc-svg
                        ref={d3Xaxis}
                        className='x-axis'
                        style={{ height: '2em', marginRight: '3em', width: '100%' }}
                    ></d3fc-svg>
                </div>
            </d3fc-group>
        </div>
    );
}
