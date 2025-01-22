import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import {
    MouseEvent,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { diffHashSig } from '../../../../ambient-utils/dataLayer';
import { AuctionsContext } from '../../../../contexts/AuctionsContext';
import { ChartContext } from '../../../../contexts/ChartContext';
import {
    getXandYLocationForChart,
    renderCanvasArray,
    setCanvasResolution,
} from '../../../../pages/platformAmbient/Chart/ChartUtils/chartUtils';
import ScatterTooltip from './ScatterTooltip';
import useScatterChartData from './useScatterChartData';
import Xaxis from './Xaxis';
import Yaxis from './Yaxis';

export const axisColor = '#939C9E'; // text2
export const textColor = '#939C9E'; // text2
export const dotGridColor = '#29585D'; // accent3
export const fillColor = '#0D0F13'; // dark1
export const accentColor = '#62EBF1'; // accent1

export type scatterData = {
    name?: string;
    timeRemaining: number;
    userBidSize?: string;
    price: number;
    size: number;
    isShow: boolean;
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

    const { hoveredTicker, setHoveredTicker, selectedTicker, showComplete } =
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
        if (timeRemaining < 0) {
            return Math.abs(timeRemaining / 60);
        }
        return timeRemaining / 60;
    };

    const navigateUrlBase = '/auctions';
    const navigateUrl = navigateUrlBase + '/v1/';

    const showDotsData = useMemo(() => {
        const res = data.filter((i) => i.isShow);
        return res;
    }, [diffHashSig(data)]);

    const showDayCount = useMemo(() => {
        const showDataMinTimeRemaining = Math.ceil(
            d3.max(showDotsData, (d) => Math.abs(d.timeRemaining / 86400)) || 0,
        );

        const maxDayCount =
            showComplete &&
            showDataMinTimeRemaining &&
            showDataMinTimeRemaining > 7
                ? showDataMinTimeRemaining
                : 7;

        return maxDayCount;
    }, [diffHashSig(showDotsData)]);

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

                const maxPrice = Math.ceil(
                    d3.max(showDotsData, (d) => d.price) || 10000,
                );
                const maxPriceDecimalLenght =
                    Math.abs(maxPrice).toString().length;
                const maxYValuePow = Math.pow(10, maxPriceDecimalLenght - 1);
                const maxYValue =
                    Math.ceil(maxPrice / maxYValuePow) * maxYValuePow;

                const minYValue = maxPriceDecimalLenght > 5 ? -15000 : -500;
                const maxDomBuffer = calculateXTickStep(showDayCount) / 2;
                const oneDayMinutes = 1440;

                let maxXValue = showDayCount * oneDayMinutes + maxDomBuffer;

                let minXValue = -calculateXTickStep(showDayCount) / 2;

                if (afterOneWeek && !showComplete) {
                    maxXValue = oneDayMinutes + 30;
                    minXValue = -30;
                }

                const xScale = d3
                    .scaleLinear()
                    .domain([maxXValue, minXValue])
                    .range([0, width]);

                setXscale(() => xScale);

                const yScale = d3
                    .scaleLinear()
                    .domain([minYValue, maxYValue])
                    .range([height, 15]);

                setYscale(() => yScale);
            }
        }
    }, [
        diffHashSig(data),
        diffHashSig(showDotsData),
        showDayCount,
        afterOneWeek,
    ]);

    useEffect(() => {
        if (xScale && yScale) {
            const pointSeries = d3fc
                .seriesCanvasPoint()
                .xScale(xScale)
                .yScale(yScale)
                .crossValue((d: scatterData) =>
                    getTimeRemainingValue(d.timeRemaining),
                )
                .mainValue((d: scatterData) => d.price)
                .size((d: scatterData) => d.size)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .decorate((context: CanvasRenderingContext2D, d: any) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any

                    context.fillStyle =
                        d.price === selectedDot?.price &&
                        d.timeRemaining === selectedDot?.timeRemaining
                            ? accentColor
                            : fillColor;
                    context.strokeStyle =
                        d.size < 5 ? dotGridColor : accentColor;
                });

            setPointSeries(() => pointSeries);
        }
    }, [xScale, yScale, chartSize, selectedDot]);

    const calculateXTickStep = (showDayCount: number): number => {
        const oneWeekDay = 7;

        const getDayCountForMonth = (months: number) => oneWeekDay * months * 4;

        const thresholds = [
            { threshold: getDayCountForMonth(10), step: 1441 * 21 },
            { threshold: getDayCountForMonth(8), step: 1441 * 14 },
            { threshold: getDayCountForMonth(5), step: 1441 * 7 },
            { threshold: getDayCountForMonth(3), step: 1441 * (7 / 2) },
            { threshold: getDayCountForMonth(1), step: 1441 * (7 / 4) },
            { threshold: oneWeekDay, step: 1441 },
        ];

        const defaultStep = 1441 / 4;

        for (const { threshold, step } of thresholds) {
            if (showDayCount > threshold) {
                return step;
            }
        }
        return defaultStep;
    };

    useEffect(() => {
        if (xScale && yScale && pointSeries && chartSize) {
            const canvas = d3
                .select(d3Chart.current)
                .select('canvas')
                .node() as HTMLCanvasElement;
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

            d3.select(d3Chart.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);

                    const heightYAxis = chartSize.height;
                    const tickCount = heightYAxis < 350 ? 5 : 10;
                    const yTicks = yScale.ticks(tickCount);

                    const dataPoint: scatterData[] = [];

                    const xTickStep = calculateXTickStep(showDayCount);

                    const xTicks =
                        afterOneWeek && !showComplete
                            ? d3.range(0, 1441, 60)
                            : d3.range(0, xScale.domain()[0], xTickStep);
                    xTicks.forEach((x) => {
                        yTicks.forEach((y) => {
                            dataPoint.push({
                                price: y,
                                timeRemaining: x * 60,
                                size: 2,
                                isShow: true,
                            });
                        });
                    });

                    pointSeries(dataPoint);
                    const dataWithSelected = selectedDot
                        ? [...showDotsData, selectedDot]
                        : showDotsData;

                    const dataWithHovered = hoveredDot
                        ? [...dataWithSelected, hoveredDot]
                        : dataWithSelected;

                    if (data !== undefined) {
                        pointSeries(dataWithHovered);
                    }
                })
                .on('measure', (event: CustomEvent) => {
                    xScale.range([0, event.detail.width]);
                    yScale.range([event.detail.height, 15]);
                    pointSeries.context(ctx);
                });

            renderCanvasArray([d3Chart]);
        }
    }, [
        diffHashSig(showDotsData),
        xScale,
        yScale,
        pointSeries,
        selectedDot,
        hoveredDot,
        showComplete,
    ]);

    useEffect(() => {
        if (d3Chart) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const svgDiv = d3.select(d3Chart.current) as any;

            if (svgDiv) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const resizeObserver = new ResizeObserver((result: any) => {
                    renderCanvasArray([d3Chart]);
                    setChartSize(result[0].contentRect);
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
                .select('canvas')
                .node() as HTMLCanvasElement;

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
                .select('canvas')
                .on('mousemove', (event: MouseEvent<HTMLDivElement>) => {
                    const nearestData = findNearestCircle(event);

                    d3.select(d3Chart.current)
                        .select('canvas')
                        .style(
                            'cursor',
                            nearestData &&
                                nearestData.name !== selectedDot?.name
                                ? 'pointer'
                                : 'default',
                        );
                    setHoveredTicker(
                        nearestData ? nearestData.name : undefined,
                    );
                })
                .on('click', function (event) {
                    const nearestData = findNearestCircle(event);
                    if (nearestData) {
                        if (nearestData.name !== selectedDot?.name) {
                            navigate(navigateUrl + nearestData.name);
                        }
                        d3.select(d3Chart.current)
                            .select('canvas')
                            .style('cursor', 'default');
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
                chartSize={chartSize}
            />
            <d3fc-canvas
                ref={d3Chart}
                style={{
                    gridColumnStart: 2,
                    gridColumnEnd: 3,
                    gridRow: 1,
                    width: '100%',
                }}
            ></d3fc-canvas>
            <Xaxis
                data={data.map((i) => i.timeRemaining)}
                scale={xScale}
                afterOneWeek={afterOneWeek}
                axisColor={axisColor}
                textColor={textColor}
                showDayCount={showDayCount}
                chartSize={chartSize}
                showComplete={showComplete}
                calculateXTickStep={calculateXTickStep}
            />
            <ScatterTooltip hoveredDot={hoveredDot} selectedDot={selectedDot} />
        </div>
    );
}
