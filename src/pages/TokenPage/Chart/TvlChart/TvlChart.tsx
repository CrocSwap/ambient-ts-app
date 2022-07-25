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

interface TvlChartProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    setValue?: Dispatch<SetStateAction<number | undefined>>; // used for value on hover
    setLabel?: Dispatch<SetStateAction<string | undefined>>; // used for value on hover
    value?: number;
    label?: string;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'd3fc-group': DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
            'd3fc-svg': DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
        }
    }
}

export default function TvlChart(props: TvlChartProps) {
    const d3Container = useRef(null);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);
        const xExtent = d3fc
            .extentDate()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .accessors([(d: any) => new Date(d.time)]);

        const data = {
            series: props.data,
            crosshair: [{ x: 0, y: 0 }],
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
                    .style('pointer-events', 'all')
                    .style('fill', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'))
                    .style('stroke', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'));
            });

        const areaSeries = d3fc
            .seriesSvgArea()
            .mainValue((d: any) => d.value)
            .crossValue((d: any) => new Date(d.time))
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
            .crossValue((d: any) => new Date(d.time))
            .xScale(xScale)
            .yScale(yScale)
            .decorate((selection: any) => {
                selection.enter().style('stroke', () => '#7371FC');
                selection.attr('stroke-width', '3');
            });

        const multi = d3fc
            .seriesSvgMulti()
            .series([lineSeries, areaSeries, crossHair])
            .mapping((data: any, index: number, series: any) => {
                switch (series[index]) {
                    case crossHair:
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

        const chart = d3fc
            .chartCartesian({
                xScale: xScale,
                yScale: yScale,
            })
            .yTicks([5])
            .yDomain(yExtent(data.series))
            .xDomain(xExtent(data.series))
            .svgPlotArea(multi);

        const pointer = d3fc.pointer().on('point', (event: any) => {
            if (event.length > 0) {
                const xVal = xScale.invert(event[0].x);
                data.crosshair = [
                    {
                        x: event[0].x,
                        y: yScale(xVal),
                    },
                ];

                const parsed = data.series.find(
                    (item) =>
                        moment(new Date(item.time)).format('DD/MM/YYYY') ===
                        moment(xVal).format('DD/MM/YYYY'),
                );

                props.setValue?.(parsed?.value);
                props.setLabel?.(moment.utc(xVal).format('DD/MM/YYYY'));
            }
            render();
        });

        function render() {
            d3.select('.demo').datum(data).call(chart);
            d3.select('.demo .plot-area').call(pointer);
        }

        render();
    }, []);

    return (
        <div
            ref={d3Container}
            className='demo'
            style={{ height: '100%', width: '100%' }}
            data-testid={'chart'}
        ></div>
    );
}
