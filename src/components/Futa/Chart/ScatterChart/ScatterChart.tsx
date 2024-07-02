/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */
import { useEffect, useRef, useState } from 'react';
// import { FlexContainer } from '../../../../styled/Common';
import Xaxis from './Xaxis';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import {
    getXandYLocationForChart,
    renderCanvasArray,
} from '../../../../pages/platformAmbient/Chart/ChartUtils/chartUtils';
import { diffHashSig } from '../../../../ambient-utils/dataLayer';
import Yaxis from './Yaxis';
import ScatterTooltip from './ScatterTooltip';
// import { renderCanvasArray } from '../../../../pages/platformAmbient/Chart/ChartUtils/chartUtils';

export const axisColor = '#939C9E'; // text2
export const textColor = '#939C9E'; // text2
export const dotGridColor = '#29585D'; // accent3
export const fillColor = '#0D0F13'; // dark1
export const accentColor = '#62EBF1'; // accent1

export type scatterData = {
    name: string;
    timeRemaining: number;
    price: number;
};

export default function ScatterChart() {
    const d3Chart = useRef<HTMLDivElement | null>(null);
    const d3MainDiv = useRef<HTMLDivElement | null>(null);

    const [xScale, setXscale] = useState<d3.ScaleLinear<number, number>>();
    const [yScale, setYscale] = useState<d3.ScaleLinear<number, number>>();
    const [chartSize, setChartSize] = useState<any>();
    const [hoveredDot, setHoveredDot] = useState<scatterData | undefined>();
    const [selectedDot, setSelectedDot] = useState<scatterData | undefined>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pointSeries, setPointSeries] = useState<any>();
    const data = [
        { name: 'DOGE', timeRemaining: 40, price: 67316 },
        { name: 'PEPE', timeRemaining: 900, price: 34466 },
        { name: 'BODEN', timeRemaining: 1260, price: 27573 },
        { name: 'APU', timeRemaining: 420, price: 979579 },
        { name: 'BOME', timeRemaining: 40, price: 626930 },
        { name: 'USA', timeRemaining: 300, price: 11294 },
        { name: 'BITCOIN', timeRemaining: 60, price: 17647 },
        { name: 'WIF', timeRemaining: 600, price: 5782 },
        { name: 'TRUMP', timeRemaining: 420, price: 22058 },
        { name: 'DEGEN', timeRemaining: 300, price: 5782 },
        { name: 'LOCKIN', timeRemaining: 5, price: 27573 },
    ];

    useEffect(() => {
        if (data) {
            const scatterChartDiv = d3.select(d3MainDiv.current).node();

            if (scatterChartDiv) {
                const scatterChartSize =
                    scatterChartDiv.getBoundingClientRect();
                const width = scatterChartSize.width;
                const height = scatterChartSize.height;

                const maxYValue =
                    Math.ceil((d3.max(data, (d) => d.price) || 0) / 100000) *
                    100000;

                const minXValue = -60;
                const maxXValue = 1440 + 60;
                const xScale = d3
                    .scaleLinear()
                    .domain([minXValue, maxXValue])
                    .range([0, width]);

                setXscale(() => xScale);

                const yScale = d3
                    .scaleLinear()
                    .domain([-50000, maxYValue])
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
                .crossValue((d: any) => d.timeRemaining)
                .mainValue((d: any) => d.price)
                .size(60)
                .decorate((context: any, d: any) => {
                    context.nodes().forEach((selection: any, index: number) => {
                        d3.select(selection)
                            .attr(
                                'transform',
                                'translate(' +
                                    xScale(d[index].timeRemaining) +
                                    ',' +
                                    yScale(d[index].price) +
                                    ')',
                            )
                            .style(
                                'fill',
                                selectedDot?.name === d[index].name ||
                                    (hoveredDot?.name === d[index].name &&
                                        selectedDot?.name !== d[index].name)
                                    ? accentColor
                                    : fillColor,
                            )
                            .style('stroke', accentColor);
                    });
                });

            setPointSeries(() => pointSeries);
        }
    }, [xScale, yScale, selectedDot, hoveredDot]);

    useEffect(() => {
        if (xScale && yScale && pointSeries) {
            const circleJoin = d3fc.dataJoin('g', 'circleJoin');

            d3.select(d3Chart.current)
                .on('draw', (event) => {
                    const svg = d3.select(event.target).select('svg');

                    const xTicks = d3.range(0, 1441, 60);
                    const yTicks = yScale.ticks();
                    svg.select('#gridCircles').remove();
                    svg.select('.circleJoin').remove();

                    svg.append('g').attr('id', 'gridCircles');

                    xTicks.forEach((x) => {
                        yTicks.forEach((y) => {
                            svg.select('#gridCircles')
                                .append('circle')
                                .attr('cx', xScale(x))
                                .attr('cy', yScale(y))
                                .attr('r', 1)
                                .attr('fill', dotGridColor);
                        });
                    });

                    circleJoin(svg, [data]).call(pointSeries);
                })

                .on('measure', (event: CustomEvent) => {
                    xScale.range([0, event.detail.width]);
                    yScale.range([event.detail.height, 15]);
                });

            renderCanvasArray([d3Chart]);
        }
    }, [diffHashSig(data), xScale, yScale, chartSize, pointSeries]);

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

    const findNearestCircle = (event: any) => {
        if (xScale && yScale) {
            const canvas = d3
                .select(d3Chart.current)
                .select('svg')
                .node() as any;

            const rectSvg = canvas.getBoundingClientRect();

            const { offsetX, offsetY } = getXandYLocationForChart(
                event,
                rectSvg,
            );

            const dataAtMouse = data.filter((d) => {
                const x = xScale(d.timeRemaining);
                const y = yScale(d.price);
                return Math.abs(x - offsetX) < 5 && Math.abs(y - offsetY) < 5;
            });
            if (dataAtMouse.length > 0) {
                return dataAtMouse[dataAtMouse.length - 1];
            }
        }
        return undefined;
    };

    useEffect(() => {
        if (xScale && yScale) {
            d3.select(d3Chart.current)
                .select('svg')
                .on('mousemove', (event: any) => {
                    const nearestData = findNearestCircle(event);
                    setHoveredDot(nearestData);
                })
                .on('click', function (event) {
                    const nearestData = findNearestCircle(event);

                    setSelectedDot(
                        nearestData?.name === selectedDot?.name
                            ? undefined
                            : nearestData,
                    );
                })
                .on('mouseout', function () {
                    setHoveredDot(undefined);
                });
        }
    }, [xScale, yScale, selectedDot]);

    return (
        <div
            ref={d3MainDiv}
            style={{
                width: '100%',
                height: '100%',
                display: 'grid',
                gridTemplateRows: '1fr 1px 20px',
                gridTemplateColumns: '50px 1fr 155px',
            }}
        >
            <Yaxis data={data.map((i) => i.price)} scale={yScale} />
            <d3fc-svg
                ref={d3Chart}
                style={{
                    gridColumnStart: 2,
                    gridColumnEnd: 3,
                    gridRow: 1,
                    width: '100%',
                }}
            ></d3fc-svg>
            <Xaxis data={data.map((i) => i.timeRemaining)} scale={xScale} />
            <ScatterTooltip hoveredDot={hoveredDot} selectedDot={selectedDot} />
        </div>
    );
}
