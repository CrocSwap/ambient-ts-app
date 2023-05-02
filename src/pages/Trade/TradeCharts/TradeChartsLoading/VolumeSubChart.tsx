/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { formatDollarAmountAxis } from '../../../../utils/numbers';
import { VolumeChartData } from '../TradeCharts';
import { useCallback, useEffect, useRef } from 'react';
import { diffHashSig } from '../../../../utils/functions/diffHashSig';

interface VolumeData {
    volumeData: VolumeChartData[] | undefined;
    period: number | undefined;
    setsubChartValues: React.Dispatch<React.SetStateAction<any>>;
    setZoomAndYdragControl: React.Dispatch<React.SetStateAction<any>>;
    setSelectedDate: React.Dispatch<React.SetStateAction<any>>;
    crosshairForSubChart: any;
    selectedDate: any;
    candlestick: any;
    xScale: any;
    xScaleCopy: any;
    setIsMouseMoveForSubChart: React.Dispatch<React.SetStateAction<boolean>>;
    setIsZoomForSubChart: React.Dispatch<React.SetStateAction<boolean>>;
    setMouseMoveEventForSubChart: React.Dispatch<React.SetStateAction<any>>;
    zoomAndYdragControl: any;
    render: any;
    getNewCandleData: any;
    isMouseMoveForSubChart: any;
    setMouseMoveChartName: React.Dispatch<
        React.SetStateAction<string | undefined>
    >;
    mouseMoveChartName: string | undefined;
}

export default function VolumeSubChart(props: VolumeData) {
    const {
        volumeData,
        period,
        xScale,
        crosshairForSubChart,
        xScaleCopy,
        candlestick,
        selectedDate,
        zoomAndYdragControl,
        setsubChartValues,
        getNewCandleData,
        isMouseMoveForSubChart,
    } = props;

    const d3PlotBar = useRef(null);
    const d3Yaxis = useRef(null);

    useEffect(() => {
        if (volumeData !== undefined) {
            drawChart(volumeData, xScale);

            props.render();
        }
    }, [
        xScale,
        crosshairForSubChart,
        period,
        selectedDate,
        volumeData,
        zoomAndYdragControl,
        diffHashSig(candlestick.bandwidth()),
    ]);

    const render = useCallback(() => {
        const nd = d3.select('#d3PlotBar').node() as any;
        nd.requestRedraw();
    }, []);

    const drawChart = useCallback(
        (volumeData: any, xScale: any) => {
            if (volumeData.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const yExtent = d3fc
                    .extentLinear()
                    .accessors([(d: any) => d.value]);
                const yScale = d3.scaleLinear();
                yScale.domain(yExtent(volumeData));
                const yAxis = d3fc
                    .axisRight()
                    .scale(yScale)
                    .tickFormat(formatDollarAmountAxis)
                    .tickArguments([2]);

                const crosshairDataLocal = [
                    {
                        x: crosshairForSubChart[0].x,
                        y:
                            isMouseMoveForSubChart &&
                            props.mouseMoveChartName === 'volume'
                                ? crosshairForSubChart[0].y
                                : -1,
                    },
                ];

                const barJoin = d3fc.dataJoin('g', 'bar');
                const crosshairHorizontalJoin = d3fc.dataJoin(
                    'g',
                    'crosshairHorizontal',
                );
                const crosshairVerticalJoin = d3fc.dataJoin(
                    'g',
                    'crosshairVertical',
                );

                const crosshairHorizontal = d3fc
                    .annotationSvgLine()
                    .orient('vertical')
                    .value((d: any) => d.x)
                    .xScale(xScale)
                    .yScale(yScale)
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
                    .value((d: any) => yScale.invert(d.y))
                    .xScale(xScale)
                    .yScale(yScale);

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

                const barSeries = d3fc
                    .seriesSvgBar()
                    .align('center')
                    .bandwidth(candlestick.bandwidth())
                    .xScale(xScale)
                    .yScale(yScale)
                    .crossValue((d: any) => d.time)
                    .mainValue((d: any) => d.value)
                    .decorate((selection: any) => {
                        selection.style('fill', (d: any) => {
                            return selectedDate !== undefined &&
                                selectedDate.getTime() === d.time.getTime()
                                ? '#E480FF'
                                : 'rgba(115,113,252, 0.6)';
                        });
                        selection.style('stroke', (d: any) =>
                            selectedDate !== undefined &&
                            selectedDate.getTime() === d.time.getTime()
                                ? '#E480FF'
                                : 'rgba(115,113,252, 0.6)',
                        );
                        selection.on('mouseover', (event: any) => {
                            d3.select(event.currentTarget).style(
                                'cursor',
                                'pointer',
                            );
                        });
                        selection.on('click', (event: any) => {
                            if (
                                selectedDate === undefined ||
                                selectedDate !== event.target.__data__.time
                            ) {
                                d3.select(event.currentTarget)
                                    .style('fill', '#E480FF')
                                    .style('stroke', '#E480FF');

                                props.setSelectedDate(() => {
                                    return event.target.__data__.time;
                                });
                            } else {
                                props.setSelectedDate(() => {
                                    return undefined;
                                });
                            }
                        });
                    });

                d3.select(d3PlotBar.current).on(
                    'measure',
                    function (event: any) {
                        xScale.range([0, event.detail.width]);
                        yScale.range([event.detail.height, 0]);
                    },
                );

                d3.select(d3PlotBar.current).on(
                    'measure.range',
                    function (event: any) {
                        let date: any | undefined = undefined;
                        const svg = d3.select(event.target).select('svg');
                        const zoom = d3
                            .zoom()
                            .scaleExtent([1, 10])
                            .on('start', () => {
                                if (date === undefined) {
                                    date =
                                        volumeData[volumeData.length - 1].time;
                                }
                            })
                            .on('zoom', (event: any) => {
                                getNewCandleData(event, date, xScale);
                                xScale.domain(
                                    event.transform
                                        .rescaleX(xScaleCopy)
                                        .domain(),
                                );

                                props.setZoomAndYdragControl(event);
                                props.setIsMouseMoveForSubChart(false);
                                props.setIsZoomForSubChart(true);
                                props.setMouseMoveEventForSubChart(event);
                            }) as any;

                        svg.call(zoom);
                    },
                );

                d3.select(d3PlotBar.current).on('draw', function (event: any) {
                    const svg = d3.select(event.target).select('svg');
                    crosshairHorizontalJoin(svg, [crosshairDataLocal]).call(
                        crosshairHorizontal,
                    );
                    crosshairVerticalJoin(svg, [crosshairDataLocal]).call(
                        crosshairVertical,
                    );
                    barJoin(svg, [volumeData]).call(barSeries);
                });

                d3.select(d3Yaxis.current).on('draw', function (event: any) {
                    d3.select(event.target).select('svg').call(yAxis);
                });

                const minimum = (volumeData: any, accessor: any) => {
                    return volumeData
                        .map(function (dataPoint: any, index: any) {
                            return [
                                accessor(dataPoint, index),
                                dataPoint,
                                index,
                            ];
                        })
                        .reduce(
                            function (accumulator: any, dataPoint: any) {
                                return accumulator[0] > dataPoint[0]
                                    ? dataPoint
                                    : accumulator;
                            },
                            [Number.MAX_VALUE, null, -1],
                        );
                };

                const snap = (series: any, volumeData: any, point: any) => {
                    if (point == undefined) return [];
                    const xScale = series.xScale(),
                        xValue = series.crossValue();

                    const filtered =
                        volumeData.length > 1
                            ? volumeData.filter((d: any) => xValue(d) !== null)
                            : volumeData;
                    const nearest = minimum(filtered, (d: any) =>
                        Math.abs(point.x - xScale(xValue(d))),
                    )[1];

                    return nearest !== undefined && !!nearest
                        ? nearest.value
                        : 0;
                };

                d3.select('#volume_chart').on(
                    'mousemove',
                    function (event: any) {
                        props.setMouseMoveChartName('volume');
                        props.setIsMouseMoveForSubChart(true);
                        props.setIsZoomForSubChart(false);
                        props.setMouseMoveEventForSubChart(event);

                        setsubChartValues((prevState: any) => {
                            const newTargets = [...prevState];
                            newTargets.filter(
                                (target: any) => target.name === 'volume',
                            )[0].value = snap(barSeries, volumeData, {
                                x: xScale(crosshairDataLocal[0].x),
                                y: -1,
                            });

                            return newTargets;
                        });
                    },
                );

                d3.select('#volume_chart').on('mouseleave', () => {
                    props.setIsMouseMoveForSubChart(false);
                    props.setIsZoomForSubChart(false);
                    props.setMouseMoveChartName(undefined);
                    render();
                });
            }
        },
        [crosshairForSubChart, selectedDate],
    );

    return (
        <div
            className='main_layout_chart'
            id='volume_chart'
            data-testid={'chart'}
            style={{
                display: 'flex',
                flexDirection: 'row',
                height: '10%',
                width: '100%',
            }}
        >
            <d3fc-svg
                id='d3PlotBar'
                ref={d3PlotBar}
                style={{ flex: 1, flexGrow: 20, overflow: 'hidden' }}
            ></d3fc-svg>
            <d3fc-svg
                className='y-axis'
                ref={d3Yaxis}
                style={{ flexGrow: 1 }}
            ></d3fc-svg>
        </div>
    );
}
