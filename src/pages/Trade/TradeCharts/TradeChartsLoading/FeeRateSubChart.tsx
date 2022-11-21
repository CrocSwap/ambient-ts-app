/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { formatDollarAmountAxis } from '../../../../utils/numbers';
import { FeeChartData } from '../TradeCharts';

interface FreeRateData {
    feeData: FeeChartData[] | undefined;
    period: number | undefined;
    setsubChartValues: React.Dispatch<React.SetStateAction<any>>;
    setZoomAndYdragControl: React.Dispatch<React.SetStateAction<any>>;
    crosshairForSubChart: any;
    xScale: any;
    xScaleCopy: any;
    render: any;
    zoomAndYdragControl: any;
    isMouseMoveForSubChart: any;
    setIsMouseMoveForSubChart: React.Dispatch<React.SetStateAction<boolean>>;
    setMouseMoveEventForSubChart: React.Dispatch<React.SetStateAction<any>>;
    setIsZoomForSubChart: React.Dispatch<React.SetStateAction<boolean>>;
    getNewCandleData: any;
    setMouseMoveChartName: React.Dispatch<React.SetStateAction<string | undefined>>;
    mouseMoveChartName: string | undefined;
}

export default function FeeRateSubChart(props: FreeRateData) {
    const {
        feeData,
        period,
        xScale,
        xScaleCopy,
        //     crosshairXForSubChart,
        crosshairForSubChart,
        zoomAndYdragControl,
        setsubChartValues,
        setZoomAndYdragControl,
        setMouseMoveEventForSubChart,
        setIsMouseMoveForSubChart,
        isMouseMoveForSubChart,
        setIsZoomForSubChart,
        getNewCandleData,
        setMouseMoveChartName,
        mouseMoveChartName,
    } = props;

    const d3PlotFeeRate = useRef(null);
    const d3Yaxis = useRef(null);

    // Fee Rate Chart
    useEffect(() => {
        if (feeData !== undefined) {
            drawChart(feeData, xScale);

            props.render();
        }
    }, [xScale, crosshairForSubChart, period, feeData, zoomAndYdragControl]);

    const render = useCallback(() => {
        const nd = d3.select('#d3PlotFeeRate').node() as any;
        nd.requestRedraw();
    }, []);

    const drawChart = useCallback(
        (feeData: any, xScale: any) => {
            if (feeData.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars

                //  const result = feeData.filter((v: number, i: number, a: any) => a.indexOf(v) !== i);
                const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);

                const yScale = d3.scaleLinear();
                yScale.domain(yExtent(feeData));

                const yAxis = d3fc
                    .axisRight()
                    .scale(yScale)
                    .tickFormat(formatDollarAmountAxis)
                    .tickArguments([2]);

                const crosshairDataLocal = [
                    {
                        x: crosshairForSubChart[0].x,
                        y:
                            isMouseMoveForSubChart && mouseMoveChartName === 'feeRate'
                                ? crosshairForSubChart[0].y
                                : -1,
                    },
                ];
                // if (yDomain[0]===yDomain[1]){
                //     yAxis.tickValues([yDomain[0]-1,yDomain[0]+1])
                // }

                const lineJoin = d3fc.dataJoin('g', 'lineJoin');
                const crosshairHorizontalJoin = d3fc.dataJoin('g', 'crosshairHorizontal');
                const crosshairVerticalJoin = d3fc.dataJoin('g', 'crosshairVertical');

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

                const lineSeries = d3fc
                    .seriesSvgLine()
                    .xScale(xScale)
                    .yScale(yScale)
                    .mainValue((d: any) => d.value)
                    .crossValue((d: any) => d.time)
                    .decorate((selection: any) => {
                        selection.style('stroke', () => '#7371FC');
                        selection.attr('stroke-width', '1');
                    });

                d3.select(d3PlotFeeRate.current).on('measure', function (event: any) {
                    xScale.range([0, event.detail.width]);
                    yScale.range([event.detail.height, 0]);
                });

                d3.select(d3PlotFeeRate.current).on('measure.range', function (event: any) {
                    let date: any | undefined = undefined;

                    const svg = d3.select(event.target).select('svg');
                    const zoom = d3
                        .zoom()
                        .scaleExtent([1, 10])
                        .on('start', () => {
                            if (date === undefined) {
                                date = feeData[feeData.length - 1].time;
                            }
                        })
                        .on('zoom', (event: any) => {
                            getNewCandleData(event, date, xScale);
                            xScale.domain(event.transform.rescaleX(xScaleCopy).domain());

                            setZoomAndYdragControl(event);
                            setIsMouseMoveForSubChart(false);
                            setIsZoomForSubChart(true);
                            setMouseMoveEventForSubChart(event);
                        }) as any;

                    svg.call(zoom);
                });

                d3.select(d3PlotFeeRate.current).on('draw', function (event: any) {
                    const svg = d3.select(event.target).select('svg');
                    lineJoin(svg, [feeData]).call(lineSeries);
                    crosshairHorizontalJoin(svg, [crosshairDataLocal]).call(crosshairHorizontal);
                    crosshairVerticalJoin(svg, [crosshairDataLocal]).call(crosshairVertical);
                });

                d3.select(d3Yaxis.current).on('draw', function (event: any) {
                    d3.select(event.target).select('svg').call(yAxis);
                });

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
                        data.length > 1 ? data.filter((d: any) => xValue(d) != null) : data;
                    const nearest = minimum(filtered, (d: any) =>
                        Math.abs(point.x - xScale(xValue(d))),
                    )[1];

                    return nearest?.value;
                };

                d3.select(d3PlotFeeRate.current).on('mousemove', function (event: any) {
                    setMouseMoveChartName('feeRate');
                    setIsMouseMoveForSubChart(true);
                    setIsZoomForSubChart(false);
                    setMouseMoveEventForSubChart(event);

                    setsubChartValues((prevState: any) => {
                        const newTargets = [...prevState];
                        newTargets.filter((target: any) => target.name === 'feeRate')[0].value =
                            snap(lineSeries, feeData, {
                                x: xScale(crosshairDataLocal[0].x),
                                y: crosshairDataLocal[0].y,
                            });

                        return newTargets;
                    });
                });

                d3.select(d3PlotFeeRate.current).on('mouseleave', () => {
                    setMouseMoveChartName(undefined);
                    setIsMouseMoveForSubChart(false);
                    setIsZoomForSubChart(false);
                    render();
                });
            }
        },
        [crosshairForSubChart],
    );

    return (
        <div
            className='main_layout_chart'
            id='fee_rate_chart'
            data-testid={'chart'}
            style={{ display: 'flex', flexDirection: 'row', height: '10%', width: '100%' }}
        >
            <d3fc-svg
                id='d3PlotFeeRate'
                ref={d3PlotFeeRate}
                style={{ flex: 1, flexGrow: 20, overflow: 'hidden' }}
            ></d3fc-svg>
            <d3fc-svg className='y-axis' ref={d3Yaxis} style={{ flexGrow: 1 }}></d3fc-svg>
        </div>
    );
}
