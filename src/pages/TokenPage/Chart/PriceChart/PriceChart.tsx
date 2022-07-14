import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import dayjs from 'dayjs';
import {
    DetailedHTMLProps,
    Dispatch,
    HTMLAttributes,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import './PriceChart.module.css';
import utc from 'dayjs/plugin/utc';

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

dayjs.extend(utc);

export default function PriceChart(props: PriceChartProps) {
    const d3Container = useRef(null);
    const d3PlotArea = useRef(null);
    const d3Xaxis = useRef(null);
    const d3Yaxis = useRef(null);

    const timeFormat = d3.timeFormat('%m/%d %I.00 %p');
    const [data] = useState(props.data);
    const [verticalLineChart, setVerticalLineChart] = useState([
        {
            x: new Date(),
            y: 0,
        },
    ]);

    const xMin = d3.min(data, function (d) {
        return new Date(Math.min(d.time) * 1000);
    });
    const xMax = d3.max(data, function (d) {
        return new Date(Math.max(d.time) * 1000);
    });

    useEffect(() => {
        const millisPerDay = 24 * 60 * 60 * 1000;
        const priceRange = d3fc.extentLinear().accessors([(d: any) => d.high, (d: any) => d.low]);
        const xExtent = d3fc
            .extentDate()
            .accessors([(d: any) => new Date(d.time * 1000)])
            .padUnit('domain')
            .pad([millisPerDay, millisPerDay]);

        setVerticalLineChart(() => {
            verticalLineChart[0].x = new Date(data[0].time * 1000);
            return verticalLineChart;
        });

        const xScale = d3.scaleTime();
        const yScale = d3.scaleLinear();
        xScale.domain(xExtent(data));
        yScale.domain(priceRange(data));

        // axes
        const xAxis = d3fc.axisBottom().scale(xScale).tickFormat(timeFormat);
        const yAxis = d3fc.axisRight().scale(yScale);
        const verticalLine = d3fc
            .annotationSvgLine()
            .orient('vertical')
            .value((d: any) => d.x)
            .xScale(xScale)
            .yScale(yScale);

        verticalLine.decorate((selection: any) => {
            selection.enter().select('g.top-handle').append('text').attr('x', 5).attr('y', -5);
            selection
                .enter()
                .select('line')
                .attr('class', 'line')
                .attr('stroke', '#cdc1ff')
                .attr('stroke-width', 0.5)
                .style('stroke-dasharray', '6 6')
                .style('pointer-events', 'all');
            selection.select('g.top-handle text').text('');
        });

        const candlestick = d3fc
            .autoBandwidth(d3fc.seriesSvgCandlestick())
            .crossValue((d: any) => new Date(d.time * 1000))
            .decorate((selection: any) => {
                selection
                    .enter()
                    .style('fill', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'))
                    .style('stroke', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'));
                // .on('mouseover', (event: any) => {

                //     const x0 = new Date(event.currentTarget['__data__'].time * 1000);
                //     setVerticalLineChart(() => {
                //         verticalLineChart[0].x = x0;
                //         return verticalLineChart;
                //     });

                //     console.error(verticalLineChart);

                // })
                // .on('mouseout', (event: any) => {
                //     const x0 = new Date(event.currentTarget['__data__'].time * 1000);
                //     setVerticalLineChart(() => {
                //         verticalLineChart[0].x = x0;
                //         return verticalLineChart;
                //     });
                // });
            })
            .xScale(xScale)
            .yScale(yScale);

        const candleJoin = d3fc.dataJoin('g', 'candle');
        const verticalLineJoin = d3fc.dataJoin('g', 'verticalLine');

        // handle the plot area measure event in order to compute the scale ranges
        d3.select(d3PlotArea.current).on('measure', function (event: any) {
            // xScale.domain([xMin!,xMax!]);
            xScale.range([0, event.detail.width]);
            yScale.range([event.detail.height, 0]);
        });

        d3.select(d3PlotArea.current).on('draw', function (event: any) {
            const svg = d3.select(event.target).select('svg');
            candleJoin(svg, [data]).call(candlestick);

            verticalLineJoin(svg, [verticalLineChart]).call(verticalLine);
        });

        d3.select(d3Xaxis.current).on('draw', function (event: any) {
            d3.select(event.target).select('svg').call(xAxis);
        });

        d3.select(d3PlotArea.current).on('mouseover', function (event: any) {
            const x0 = xScale.invert(d3.pointer(event)[0]);
            const result = { x: x0, y: 0 };
            setVerticalLineChart([result]);
        });

        d3.select(d3Yaxis.current).on('draw', function (event: any) {
            d3.select(event.target).select('svg').call(yAxis);
        });
        const nd = d3.select('#group').node() as any;
        nd.requestRedraw();
    }, [verticalLineChart]);

    return (
        <div ref={d3Container} style={{ height: '100%', width: '100%' }} data-testid={'chart'}>
            <d3fc-group
                id='group'
                className='hellooo'
                style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column' }}
                auto-resize
            >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
                        <d3fc-svg
                            ref={d3PlotArea}
                            className='plot-area'
                            style={{ flex: 1, overflow: 'hidden' }}
                        ></d3fc-svg>
                        <d3fc-svg ref={d3Yaxis} style={{ width: '3em' }}></d3fc-svg>
                    </div>
                    <d3fc-svg
                        ref={d3Xaxis}
                        className='x-axis'
                        style={{ height: '2em', marginRight: '3em' }}
                    ></d3fc-svg>
                </div>
            </d3fc-group>
        </div>
    );
}
