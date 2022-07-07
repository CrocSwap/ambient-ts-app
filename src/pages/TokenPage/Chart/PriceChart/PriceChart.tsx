/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';

import * as d3fc from 'd3fc';
import dayjs from 'dayjs';
import {
    DetailedHTMLProps,
    Dispatch,
    HTMLAttributes,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from 'react';

interface PriceChartProps {
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

export default function PriceChart(props: PriceChartProps) {
    const d3Container = useRef(null);
    const d3PlotArea = useRef(null);
    const d3Xaxis = useRef(null);
    const d3Yaxis = useRef(null);
    const data = props.data;

    const [targets, setTargets] = useState([
        {
            time: '2021-05-14',
            value: 1000000,
        },
    ]);
    useEffect(() => {
        const priceRange = d3fc.extentLinear().accessors([(d: any) => d.value]);
        // // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const xExtent = d3fc
            .extentDate()
            .accessors([(d: any) => new Date(dayjs(d.time).format('YYYY-MM-DD'))]);
        const yScale = d3.scaleLinear();

        const xScale = d3.scaleTime().domain(xExtent(data)).range([10, 10]);

        // yScale.domain(priceRange(data));

        // // axes
        // const xAxis = d3fc.axisBottom().scale(xScale);
        // const yAxis = d3fc.axisRight().scale(yScale);

        // const areaSeries = d3fc
        //     .seriesSvgArea()
        //     .mainValue((d: any) => d.value)
        //     .crossValue((d: any) => new Date(dayjs(d.time).format('YYYY-MM-DD')))
        //     .xScale(xScale)
        //     .yScale(yScale)
        //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
        //     .decorate((selection: any) => {
        //         // eslint-disable-next-line @typescript-eslint/no-unused-vars
        //         selection
        //             // eslint-disable-next-line @typescript-eslint/no-unused-vars
        //             .style('fill', (d: any) => {
        //                 return 'rgba(115, 113, 252, 0.25)';
        //             })
        //             // eslint-disable-next-line @typescript-eslint/no-explicit-any
        //             .on('mouseover', (event: any) => {
        //                 const x0 = xScale.invert(d3.pointer(event)[0]);
        //                 const y0 = yScale.invert(d3.pointer(event)[1]);

        //                 props.setValue!(y0);
        //                 const formattedTime = dayjs(x0).format('MMM D, YYYY');
        //                 props.setLabel!(formattedTime);
        //                 setTargets([{ time: dayjs(props.value).format('YYYY-MM-DD'), value: y0 }]);
        //             });
        //     });

        // const lineSeries = d3fc
        //     .seriesSvgLine()
        //     .mainValue((d: any) => d.value)
        //     .crossValue((d: any) => new Date(d.time))
        //     .xScale(xScale)
        //     .yScale(yScale)
        //     .decorate((selection: any) => {
        //         // eslint-disable-next-line @typescript-eslint/no-unused-vars
        //         selection
        //             .enter()
        //             .style('stroke', (d: any) => '#7371FC')
        //             .on('mouseover', (event: any) => {
        //                 const x0 = xScale.invert(d3.pointer(event)[0]);
        //                 const y0 = yScale.invert(d3.pointer(event)[1]);

        //                 props.setValue!(y0);
        //                 const formattedTime = dayjs(x0).format('MMM D, YYYY');
        //                 props.setLabel!(formattedTime);
        //                 setTargets([{ time: dayjs(props.value).format('YYYY-MM-DD'), value: y0 }]);
        //             });
        //     });

        // const verticalLine = d3fc
        //     .annotationSvgLine()
        //     .orient('vertical')
        //     .value((d: any) => new Date(d.time))
        //     .xScale(xScale)
        //     .yScale(yScale);

        // verticalLine.decorate((selection: any) => {
        //     selection.enter().select('g.top-handle').append('text').attr('x', 5).attr('y', -5);
        //     selection
        //         .enter()
        //         .select('line')
        //         .attr('class', 'line')
        //         .attr('stroke', '#cdc1ff')
        //         .attr('stroke-width', 0.5)
        //         .style('stroke-dasharray', '6 6');
        //     selection.select('g.top-handle text').text('');
        // });

        // const areaJoin = d3fc.dataJoin('g', 'webgl');
        // const lineJoin = d3fc.dataJoin('g', 'line');
        // const targetsJoin = d3fc.dataJoin('g', 'targets');

        // d3.select(d3PlotArea.current).on('measure', function (event: any) {
        //     xScale.range([0, event.detail.width]);
        //     yScale.range([event.detail.height, 0]);
        // });

        // d3.select(d3PlotArea.current).on('draw', function (event: any) {
        //     const svg = d3.select(event.target).select('svg');
        //     areaJoin(svg, [data]).call(areaSeries);
        //     lineJoin(svg, [data]).call(lineSeries);
        //     targetsJoin(svg, [targets]).call(verticalLine);
        // });

        // d3.select(d3Xaxis.current).on('draw', function (event: any) {
        //     d3.select(event.target).select('svg').call(xAxis);
        // });

        // d3.select(d3Yaxis.current).on('draw', function (event: any) {
        //     d3.select(event.target).select('svg').call(yAxis);
        // });
        // const nd = d3.select('#group').node() as any;
        // nd.requestRedraw();
    }, [props.value, props.label, targets, data]);

    return (
        <div ref={d3Container} style={{ height: '100%', width: '100%' }} data-testid={'chart'}>
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
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
                        <d3fc-svg
                            ref={d3PlotArea}
                            className='plot-area'
                            style={{ flex: 1, overflow: 'hidden' }}
                        ></d3fc-svg>
                        {/* <d3fc-svg ref={d3Yaxis} style={{ width: '3em' }}></d3fc-svg> */}
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
