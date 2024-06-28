/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */
import { useEffect, useRef, useState } from 'react';
import { FlexContainer } from '../../../../styled/Common';
import Xaxis from './Xaxis';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { renderCanvasArray } from '../../../../pages/platformAmbient/Chart/ChartUtils/chartUtils';
import { diffHashSig } from '../../../../ambient-utils/dataLayer';
// import { renderCanvasArray } from '../../../../pages/platformAmbient/Chart/ChartUtils/chartUtils';
export default function ScatterChart() {
    const d3Chart = useRef<HTMLDivElement | null>(null);

    const [xScale, setXscale] = useState<d3.ScaleLinear<number, number>>();
    const [yScale, setYscale] = useState<d3.ScaleLinear<number, number>>();
    const [chartSize, setChartSize] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pointSeries, setPointSeries] = useState<any>();
    const data = [
        { name: 'DOGE', time_remaining: 40, price: 67316 },
        { name: 'PEPE', time_remaining: 900, price: 34466 },
        { name: 'BODEN', time_remaining: 1260, price: 27573 },
        { name: 'APU', time_remaining: 420, price: 979579 },
        { name: 'BOME', time_remaining: 40, price: 626930 },
        { name: 'USA', time_remaining: 300, price: 11294 },
        { name: 'BITCOIN', time_remaining: 60, price: 17647 },
        { name: 'WIF', time_remaining: 600, price: 5782 },
        { name: 'TRUMP', time_remaining: 420, price: 22058 },
        { name: 'DEGEN', time_remaining: 300, price: 5782 },
        { name: 'LOCKIN', time_remaining: 5, price: 27573 },
    ];

    useEffect(() => {
        if (data) {
            const scatterChartDiv = d3
                .select(d3Chart.current)
                .select('svg')
                .node() as HTMLCanvasElement;

            if (scatterChartDiv) {
                const scatterChartSize =
                    scatterChartDiv.getBoundingClientRect();
                const width = scatterChartSize.width;
                const height = scatterChartSize.height;

                console.log(
                    'event.detail',
                    { height, width },
                    { scatterChartSize },
                );

                const maxYValue =
                    Math.ceil((d3.max(data, (d) => d.price) || 0) / 100000) *
                    100000;
                const minYValue =
                    Math.ceil((d3.min(data, (d) => d.price) || 0) / 100000) *
                    100000;

                const maxXValue = d3.max(data, (d) => d.time_remaining) || 0;
                const minXValue = d3.min(data, (d) => d.time_remaining) || 0;

                const xScale = d3
                    .scaleLinear()
                    .domain([minXValue, maxXValue])
                    .range([0, width]);

                setXscale(() => xScale);

                const yScale = d3
                    .scaleLinear()
                    .domain([minYValue, maxYValue])
                    .range([height, 0]);

                setYscale(() => yScale);
            }
        }
    }, [diffHashSig(data), chartSize]);

    useEffect(() => {
        if (xScale && yScale) {
            const pointSeries = d3fc
                .seriesSvgPoint()
                .xScale(xScale)
                .yScale(yScale)
                .crossValue((d: any) => d.time_remaining)
                .mainValue((d: any) => d.price)
                .size(50)
                .decorate((context: any, d: any) => {
                    context.nodes().forEach((selection: any, index: number) => {
                        d3.select(selection)
                            .attr(
                                'transform',
                                'translate(' +
                                    xScale(d[index].time_remaining) +
                                    ',' +
                                    yScale(d[index].price) +
                                    ')',
                            )
                            .style('fill', 'rgba(97, 71, 247, 0.8)');
                    });
                });

            setPointSeries(() => pointSeries);
        }
    }, [xScale, yScale]);

    useEffect(() => {
        if (xScale && yScale && pointSeries) {
            const circleJoin = d3fc.dataJoin('g', 'circleJoin');

            d3.select(d3Chart.current)
                .on('draw', (event) => {
                    const svg = d3.select(event.target).select('svg');
                    circleJoin(svg, [data]).call(pointSeries);
                })
                .on('measure', (event: CustomEvent) => {
                    xScale.range([0, event.detail.width]);
                    yScale.range([event.detail.height, 0]);
                });

            renderCanvasArray([d3Chart]);
        }
    }, [diffHashSig(data), xScale, yScale, chartSize]);

    useEffect(() => {
        if (d3Chart) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const svgDiv = d3.select(d3Chart.current) as any;

            if (svgDiv) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const resizeObserver = new ResizeObserver((result: any) => {
                    setChartSize(result);
                });

                resizeObserver.observe(svgDiv.node());

                return () => resizeObserver.unobserve(svgDiv.node());
            }
        }
    }, []);

    return (
        <FlexContainer
            style={{
                width: '100%',
                height: '100%',
            }}
            flexDirection='column'
        >
            <d3fc-svg ref={d3Chart} style={{ flex: 8 }}></d3fc-svg>
            0 <Xaxis />
        </FlexContainer>
    );
}
