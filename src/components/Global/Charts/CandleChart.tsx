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
import moment from 'moment';

/* eslint-disable @typescript-eslint/no-explicit-any */

export type CandleChartProps = {
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

export default function CandleChart(props: CandleChartProps) {
    const d3Container = useRef(null);

    useEffect(() => {
        const valueFormatter = d3.format('.2f');

        const millisPerDay = 24 * 60 * 60 * 1000;
        const yExtent = d3fc.extentLinear().accessors([(d: any) => d.high, (d: any) => d.low]);
        const xExtent = d3fc
            .extentDate()
            .accessors([(d: any) => d.time])
            .padUnit('domain')
            .pad([millisPerDay, millisPerDay]);

        const data = {
            series: props.data,
            crosshair: [{ x: 0, y: -50 }],
            lineData: [{ value: valueFormatter(props.data[props.data.length - 1]?.open) }],
        };

        const xScale = d3.scaleTime();
        const yScale = d3.scaleLinear();

        xScale.domain(xExtent(data.series));
        yScale.domain(yExtent(data.series));

        const xScaleCopy = xScale.copy();

        const crossHair = d3fc
            .annotationSvgCrosshair()
            .xLabel('')
            .decorate((selection: any) => {
                selection.enter().attr('stroke-dasharray', '6 6').style('pointer-events', 'all');
            });

        const candlestick = d3fc
            .autoBandwidth(d3fc.seriesSvgCandlestick())
            .crossValue((d: any) => d.time)
            .decorate((selection: any) => {
                selection
                    .enter()
                    .style('fill', (d: any) => (d.close > d.open ? '#CDC1FF' : '#171D27'))
                    // .style('fill', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'))
                    .style('stroke', (d: any) => (d.close > d.open ? '#CDC1FF' : '#7371FC'));
            })
            .xScale(xScale)
            .yScale(yScale);

        const horizontalLine = d3fc.annotationSvgLine().value((d: any) => d.value);
        horizontalLine.decorate((selection: any) => {
            selection
                .enter()
                .select('g.left-handle')
                .append('text')
                .attr('x', 5)
                .attr('y', 15)
                .attr('stroke', '#7371FC');
            selection.select('g.left-handle text').text((d: any) => d.value);
            selection
                .enter()
                .select('line')
                .attr('class', 'detector')
                .attr('stroke', 'transparent')
                .attr('stroke', '#7371FC')
                .attr('x2', '100%')
                .attr('stroke-dasharray', '6 6')
                .attr('stroke-width', 5)
                .style('pointer-events', 'all');
        });

        const zoom = d3
            .zoom()
            .scaleExtent([1, 5])
            .on('zoom', (event: any) => {
                xScale.domain(event.transform.rescaleX(xScaleCopy).domain());
                const result = data.series.find(
                    (item) =>
                        moment(item.time).format('DD/MM/YYYY h.00 a') ===
                        moment(xScale.domain()[1].getTime()).format('DD/MM/YYYY h.00 a'),
                );
                data.lineData = [
                    {
                        value: result ? valueFormatter(result?.open) : '',
                    },
                ];
                render();
            });

        const multi = d3fc
            .seriesSvgMulti()
            .series([candlestick, crossHair, horizontalLine])
            .mapping((data: any, index: number, series: any) => {
                switch (series[index]) {
                    case crossHair:
                        return data.crosshair;
                    case horizontalLine:
                        return data.lineData;
                    default:
                        return data.series;
                }
            });

        const chart = d3fc
            .chartCartesian({
                xScale: xScale,
                yScale: yScale,
            })
            .yTicks([5])
            .yDomain(yExtent(data.series))
            .xDomain(xExtent(data.series))
            .svgPlotArea(multi)
            .decorate((sel: any) => {
                sel.enter()
                    .select('d3fc-svg.plot-area')
                    .on('measure.range', (event: any) => {
                        xScaleCopy.range([0, event.detail.width]);
                    })
                    .call(zoom);
            });

        // mouse-over events to control the annotation
        const pointer = d3fc.pointer().on('point', (event: any) => {
            if (event.length > 0) {
                const xVal = xScale.invert(event[0].x);
                data.crosshair = [
                    {
                        x: event[0].x,
                        y: -50,
                    },
                ];

                const parsed = data.series.find(
                    (item) =>
                        moment(item.time).format('DD/MM/YYYY h.00 a') ===
                        moment(xVal.getTime()).format('DD/MM/YYYY h.00 a'),
                );

                props.setValue?.(parsed?.open);
                props.setLabel?.(moment.utc(xVal).format('DD/MM/YYYY h.00 a'));
            }
            render();
        });

        function render() {
            d3.select('.chart').datum(data).call(chart);
            d3.select('.chart .plot-area').call(pointer);
        }

        render();
    }, []);

    return (
        <div
            ref={d3Container}
            className='chart'
            style={{ height: '100%', width: '100%' }}
            data-testid={'chart'}
        ></div>
    );
}
