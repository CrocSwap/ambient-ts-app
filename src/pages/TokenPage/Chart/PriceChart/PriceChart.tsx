import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import {
    DetailedHTMLProps,
    Dispatch,
    HTMLAttributes,
    SetStateAction,
    useEffect,
    useRef,
} from 'react';
import './PriceChart.module.css';
import moment from 'moment';

/* eslint-disable @typescript-eslint/no-explicit-any */

export type PriceChartProps = {
    data: any[];
    value?: number;
    label?: string;
    setValue?: Dispatch<SetStateAction<number | undefined>>; // used for value on hover
    setLabel?: Dispatch<SetStateAction<string | undefined>>; // used for value label on hover
};

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'd3fc-group': DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
            'd3fc-svg': DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
        }
    }
}

export default function PriceChart(props: PriceChartProps) {
    const d3Container = useRef(null);
    useEffect(() => {
        const millisPerDay = 24 * 60 * 60 * 1000;
        const yExtent = d3fc.extentLinear().accessors([(d: any) => d.high, (d: any) => d.low]);
        const xExtent = d3fc
            .extentDate()
            .accessors([(d: any) => new Date(d.time * 1000)])
            .padUnit('domain')
            .pad([millisPerDay, millisPerDay]);

        const data = {
            series: props.data,
            crosshair: [{ x: 0, y: 0 }],
        };

        const xScale = d3.scaleTime();
        const yScale = d3.scaleLinear();

        const crossHair = d3fc
            .annotationSvgCrosshair()
            .xLabel('')
            .decorate((selection: any) => {
                selection
                    .enter()
                    .style('pointer-events', 'all')
                    .style('fill', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'))
                    .style('stroke', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'));
            });

        const candlestick = d3fc
            .autoBandwidth(d3fc.seriesSvgCandlestick())
            .crossValue((d: any) => new Date(d.time * 1000))
            .decorate((selection: any) => {
                selection
                    .enter()
                    .style('fill', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'))
                    .style('stroke', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'));
            })
            .xScale(xScale)
            .yScale(yScale);

        const multi = d3fc
            .seriesSvgMulti()
            .series([candlestick, crossHair])
            .mapping((data: any, index: number) => (index === 0 ? data.series : data.crosshair));

        const chart = d3fc
            .chartCartesian({
                xScale: xScale,
                yScale: yScale,
            })
            .yTicks([5])
            .yDomain(yExtent(data.series))
            .xDomain(xExtent(data.series))
            .svgPlotArea(multi);

        // mouse-over events to control the annotation
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
                        moment(new Date(item.time * 1000)).format('DD/MM/YYYY h.00 a') ===
                        moment(xVal.getTime()).format('DD/MM/YYYY h.00 a'),
                );

                props.setValue?.(parsed?.open);
                props.setLabel?.(moment.utc(xVal).format('DD/MM/YYYY h.00 a'));
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
