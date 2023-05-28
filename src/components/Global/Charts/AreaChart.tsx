/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import moment from 'moment';
import {
    DetailedHTMLProps,
    Dispatch,
    HTMLAttributes,
    SetStateAction,
    useEffect,
    useRef,
} from 'react';
import { formatDollarAmountAxis } from '../../../utils/numbers';

interface AreaChartProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[] | undefined;
    setValueTvl?: Dispatch<SetStateAction<number | undefined>>; // used for value on hover
    setValueTvlDate?: Dispatch<SetStateAction<string | undefined>>; // used for value on hover
    valueTvl?: number;
    valueTvlDate?: string;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'd3fc-group': DetailedHTMLProps<
                HTMLAttributes<HTMLDivElement>,
                HTMLDivElement
            >;
            'd3fc-svg': DetailedHTMLProps<
                HTMLAttributes<HTMLDivElement>,
                HTMLDivElement
            >;
        }
    }
}

export default function AreaChart(props: AreaChartProps) {
    const d3Container = useRef(null);
    const chartValue = props.data;
    useEffect(() => {
        const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);
        const xExtent = d3fc.extentDate().accessors([(d: any) => d.time]);

        const data = {
            series: chartValue,
            crosshair: [{ x: 0, y: 0, yAxis: 0 }],
        };

        const xScale = d3.scaleTime();
        const yScale = d3.scaleLinear();
        const crossHair = d3fc
            .annotationSvgCrosshair()
            .xLabel('')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .decorate((selection: any) => {
                selection
                    .enter()
                    .attr('stroke-dasharray', '6 6')
                    .style('pointer-events', 'all');
                selection
                    .enter()
                    .select('g.annotation-line.horizontal')
                    .attr('visibility', 'hidden');
            });

        const areaSeries = d3fc
            .seriesSvgArea()
            .mainValue((d: any) => d.value)
            .crossValue((d: any) => d.time)
            .xScale(xScale)
            .yScale(yScale)
            .decorate((selection: any) => {
                selection.style('fill', () => {
                    return 'url(#mygrad)';
                });
            });

        const lineSeries = d3fc
            .seriesSvgLine()
            .mainValue((d: any) => d.value)
            .crossValue((d: any) => d.time)
            .xScale(xScale)
            .yScale(yScale)
            .decorate((selection: any) => {
                selection.enter().style('stroke', () => '#7371FC');
                selection.attr('stroke-width', '3');
            });

        const crosshairVertical = d3fc
            .annotationSvgLine()
            .value((d: any) => d.yAxis)
            .xScale(xScale)
            .yScale(yScale);

        crosshairVertical.decorate((selection: any) => {
            selection
                .enter()
                .attr('stroke-dasharray', '6 6')
                .style('pointer-events', 'all');
            selection.enter().select('g.left-handle').remove();
            selection.enter().select('g.right-handle').remove();
        });

        const multi = d3fc
            .seriesSvgMulti()
            .series([lineSeries, areaSeries, crossHair, crosshairVertical])
            .mapping((data: any, index: number, series: any) => {
                switch (series[index]) {
                    case crossHair:
                        return data.crosshair;
                    case crosshairVertical:
                        return data.crosshair;
                    default:
                        return data.series;
                }
            });

        const svgmain = d3.select('.demo').select('svg');

        const lg = svgmain
            .append('defs')
            .append('linearGradient')
            .attr('id', 'mygrad')
            .attr('x1', '100%')
            .attr('x2', '100%')
            .attr('y1', '0%')
            .attr('y2', '100%');
        lg.append('stop')
            .attr('offset', '10%')
            .style('stop-color', '#7d7cfb')
            .style('stop-opacity', 1);

        lg.append('stop')
            .attr('offset', '100%')
            .style('stop-color', 'black')
            .style('stop-opacity', 1);

        const xFormat = d3.timeFormat(' %b %Y ');
        const chart = d3fc
            .chartCartesian({
                xScale: xScale,
                yScale: yScale,
                xAxis: {
                    bottom: (d: any) =>
                        d3fc.axisLabelRotate(d3fc.axisOrdinalBottom(d)),
                },
            })
            .yTicks([5])
            .yDomain(yExtent(data.series))
            .xDomain(xExtent(data.series))
            .yTickFormat(formatDollarAmountAxis)
            .xTickFormat(xFormat)
            .svgPlotArea(multi)
            .decorate((sel: any) => {
                sel.enter().style('min-height', '300px');
            });

        const pointer = d3fc.pointer().on('point', (event: any) => {
            if (event.length > 0) {
                data.crosshair = snap(lineSeries, data.series, event[0]);
            }
            render();
        });

        const snap = (series: any, data: any, point: any) => {
            if (point == undefined) return [];
            const xScale = series.xScale(),
                xValue = series.crossValue();
            const filtered =
                data.length > 1
                    ? data.filter((d: any) => xValue(d) != null)
                    : data;
            const nearest = minimum(filtered, (d: any) =>
                Math.abs(point.x - xScale(xValue(d))),
            )[1];
            const newX = new Date(nearest?.time.getTime());
            const value = new Date(newX.setTime(newX.getTime()));
            props.setValueTvl?.(nearest?.value);
            props.setValueTvlDate?.(getDate(value));
            return [
                {
                    x: xScale(value),
                    y: yScale(nearest?.value),
                    yAxis: yScale.invert(point.y),
                },
            ];
        };

        const minimum = (data: any, accessor: any) => {
            return data
                .map(function (dataPoint: any, index: any) {
                    return [accessor(dataPoint, index), dataPoint, index];
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

        const getDate = (date: any) => {
            return date === undefined
                ? '-'
                : moment.utc(date).format('MMM D, YYYY');
        };

        function render() {
            d3.select('.demo').datum(data).call(chart);
            d3.select('.demo .plot-area').call(pointer);
        }

        render();
    }, [chartValue]);

    return (
        <div
            ref={d3Container}
            className='demo'
            style={{ height: '100%', width: '100%', minHeight: '300px' }}
            data-testid={'chart'}
        ></div>
    );
}
