import { useContext, useEffect, useMemo, useRef, useState } from 'react';
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
import useScatterChartData from './useScatterChartData';
import { useNavigate } from 'react-router-dom';
import { AuctionsContext } from '../../../../contexts/AuctionsContext';
import { ChartContext } from '../../../../contexts/ChartContext';

export const axisColor = '#939C9E'; // text2
export const textColor = '#939C9E'; // text2
export const dotGridColor = '#29585D'; // accent3
export const fillColor = '#0D0F13'; // dark1
export const accentColor = '#62EBF1'; // accent1

export type scatterData = {
    name: string;
    timeRemaining: number;
    userBidSize: string;
    price: number;
    size: number;
};

export const scatterDotDefaultSize = 144;
export const scatterDotSelectedSize = 196;

export default function ScatterChart() {
    const d3Chart = useRef<HTMLDivElement | null>(null);
    const d3MainDiv = useRef<HTMLDivElement | null>(null);

    const [xScale, setXscale] = useState<d3.ScaleLinear<number, number>>();
    const [yScale, setYscale] = useState<d3.ScaleLinear<number, number>>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [chartSize, setChartSize] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pointSeries, setPointSeries] = useState<any>();

    const { hoveredTicker, setHoveredTicker, selectedTicker } =
        useContext(AuctionsContext);

    const { chartThemeColors } = useContext(ChartContext);

    const axisColor = chartThemeColors?.text2?.toString() || '#939C9E';
    const textColor = chartThemeColors?.text2?.toString() || '#939C9E';
    const dotGridColor = chartThemeColors?.accent3?.toString() || '#29585D';
    const fillColor = chartThemeColors?.dark1?.toString() || '#0D0F13';
    const accentColor = chartThemeColors?.accent1?.toString() || '#62EBF1';

    const data = useScatterChartData();

    const afterOneWeek = false;

    const navigate = useNavigate();

    const getTimeRemainingValue = (timeRemaining: number) => {
        return timeRemaining / 60;
    };

    const navigateUrlBase = '/auctions';
    const navigateUrl = navigateUrlBase + '/v1/';

    const showDotsData = useMemo(() => {
        const res = data.filter((i) => i.isShow);
        return res;
    }, [diffHashSig(data)]);

    const selectedDot = useMemo(() => {
        const selectedDotData = showDotsData.find(
            (i) => i.name === selectedTicker,
        );

        if (selectedDotData) {
            return { ...selectedDotData, size: scatterDotSelectedSize };
        }

        return undefined;
    }, [showDotsData, hoveredTicker, selectedTicker]);

    const hoveredDot = useMemo(() => {
        const hoveredDotData = showDotsData.find(
            (i) => i.name === hoveredTicker,
        );

        if (hoveredDotData) {
            return { ...hoveredDotData, size: scatterDotSelectedSize };
        }

        return undefined;
    }, [showDotsData, hoveredTicker, selectedDot]);

    useEffect(() => {
        if (data && data.length) {
            const scatterChartDiv = d3.select(d3MainDiv.current).node();

            if (scatterChartDiv) {
                const scatterChartSize =
                    scatterChartDiv.getBoundingClientRect();
                const width = scatterChartSize.width;
                const height = scatterChartSize.height;

                const maxYValue =
                    Math.ceil((d3.max(data, (d) => d.price) || 0) / 100000) *
                    100000;

                const minXValue = -120;
                const maxXValue = afterOneWeek ? 1440 + 60 : 1440 * 7 + 60;
                const xScale = d3
                    .scaleLinear()
                    .domain([maxXValue, minXValue])
                    .range([0, width]);

                setXscale(() => xScale);

                const yScale = d3
                    .scaleLinear()
                    .domain([-50000, maxYValue])
                    .range([height, 15]);

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
                .crossValue((d: scatterData) =>
                    getTimeRemainingValue(d.timeRemaining),
                )
                .mainValue((d: scatterData) => d.price)
                .size((d: scatterData) => d.size)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .decorate((context: any, d: any) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    context.nodes().forEach((selection: any, index: number) => {
                        d3.select(selection)
                            .style(
                                'fill',
                                d[index].price === selectedDot?.price &&
                                    d[index].timeRemaining ===
                                        selectedDot?.timeRemaining
                                    ? accentColor
                                    : fillColor,
                            )
                            .style('stroke', accentColor);
                    });
                });

            setPointSeries(() => pointSeries);
        }
    }, [xScale, yScale, chartSize, selectedDot]);

    useEffect(() => {
        if (xScale && yScale && pointSeries) {
            const circleJoin = d3fc.dataJoin('g', 'circleJoin');

            d3.select(d3Chart.current)
                .on('draw', (event) => {
                    const svg = d3.select(event.target).select('svg');

                    const xTicks = afterOneWeek
                        ? d3.range(0, 1441, 60)
                        : d3.range(0, 1441 * 8, 1441 / 4);
                    const yTicks = d3.range(
                        0,
                        Number(d3.max(data, (d) => d.price)) + 100000,
                        100000,
                    );
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

                    const dataWithSelected = selectedDot
                        ? [...showDotsData, selectedDot]
                        : showDotsData;

                    const dataWithHovered = hoveredDot
                        ? [...showDotsData, hoveredDot]
                        : dataWithSelected;

                    circleJoin(svg, [dataWithHovered]).call(pointSeries);
                })

                .on('measure', (event: CustomEvent) => {
                    xScale.range([0, event.detail.width]);
                    yScale.range([event.detail.height, 15]);
                });

            renderCanvasArray([d3Chart]);
        }
    }, [
        diffHashSig(showDotsData),
        xScale,
        yScale,
        chartSize,
        pointSeries,
        selectedDot,
        hoveredDot,
    ]);

    useEffect(() => {
        if (d3Chart) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const svgDiv = d3.select(d3Chart.current) as any;

            if (svgDiv) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const resizeObserver = new ResizeObserver((result: any) => {
                    renderCanvasArray([d3Chart]);
                    setChartSize(result);
                });

                resizeObserver.observe(svgDiv.node());

                return () => resizeObserver.unobserve(svgDiv.node());
            }
        }
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findNearestCircle = (event: any) => {
        if (xScale && yScale) {
            const canvas = d3
                .select(d3Chart.current)
                .select('svg')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .node() as any;

            const rectSvg = canvas.getBoundingClientRect();

            const { offsetX, offsetY } = getXandYLocationForChart(
                event,
                rectSvg,
            );

            const dataAtMouse = showDotsData.filter((d) => {
                const x = xScale(getTimeRemainingValue(d.timeRemaining));
                const y = yScale(d.price);
                return Math.abs(x - offsetX) < 5 && Math.abs(y - offsetY) < 5;
            });
            if (dataAtMouse.length > 0) {
                const isSelectedDotIncluded = dataAtMouse.some(
                    (dot) => dot.name === selectedDot?.name,
                );

                const isHoveredDotIncluded = dataAtMouse.some(
                    (dot) => dot.name === hoveredDot?.name,
                );

                if (hoveredDot && isHoveredDotIncluded) {
                    return hoveredDot;
                }

                if (selectedDot && isSelectedDotIncluded) {
                    return selectedDot;
                }

                return dataAtMouse[dataAtMouse.length - 1];
            }
        }
        return undefined;
    };

    useEffect(() => {
        if (xScale && yScale) {
            d3.select(d3Chart.current)
                .select('svg')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .on('mousemove', (event: any) => {
                    const nearestData = findNearestCircle(event);

                    d3.select(d3Chart.current)
                        .select('svg')
                        .style('cursor', nearestData ? 'pointer' : 'default');
                    setHoveredTicker(
                        nearestData ? nearestData.name : undefined,
                    );
                })
                .on('click', function (event) {
                    const nearestData = findNearestCircle(event);
                    if (nearestData) {
                        nearestData.name !== selectedDot?.name
                            ? navigate(navigateUrl + nearestData.name)
                            : navigate(navigateUrlBase);
                    }
                })
                .on('mouseout', function () {
                    setHoveredTicker(undefined);
                });
        }
    }, [xScale, yScale, selectedDot, showDotsData]);

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
            <Yaxis
                data={data.map((i) => i.price)}
                scale={yScale}
                axisColor={axisColor}
                textColor={textColor}
            />
            <d3fc-svg
                ref={d3Chart}
                style={{
                    gridColumnStart: 2,
                    gridColumnEnd: 3,
                    gridRow: 1,
                    width: '100%',
                }}
            ></d3fc-svg>
            <Xaxis
                data={data.map((i) => i.timeRemaining)}
                scale={xScale}
                afterOneWeek={afterOneWeek}
                axisColor={axisColor}
                textColor={textColor}
            />
            <ScatterTooltip hoveredDot={hoveredDot} selectedDot={selectedDot} />
        </div>
    );
}
