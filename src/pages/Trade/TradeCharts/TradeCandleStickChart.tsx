import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { DetailedHTMLProps, HTMLAttributes, useEffect, useMemo } from 'react';
import { formatDollarAmountAxis } from '../../../utils/numbers';
import { CandleData, CandlesByPoolAndDuration } from '../../../utils/state/graphDataSlice';
import { targetData } from '../../../utils/state/tradeDataSlice';
import Chart from '../../Chart/Chart';
import './TradeCandleStickChart.css';

/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'd3fc-group': DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
            'd3fc-svg': DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
        }
    }
}

interface ChartData {
    tvlData: any[];
    volumeData: any[];
    feeData: any[];
    priceData: CandlesByPoolAndDuration | undefined;
    changeState: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    chartItemStates: chartItemStates;
    denomInBase: boolean;
    targetData: targetData[] | undefined;
    limitPrice: string | undefined;
    setLimitRate: React.Dispatch<React.SetStateAction<string>>;
    limitRate: string;
    liquidityData: any;
    isAdvancedModeActive: boolean | undefined;
    simpleRangeWidth: number | undefined;
    pinnedMinPriceDisplayTruncated: number | undefined;
    pinnedMaxPriceDisplayTruncated: number | undefined;
    truncatedPoolPrice: number | undefined;
}

interface CandleChartData {
    date: any;
    open: any;
    high: any;
    low: any;
    close: any;
    time: any;
    allSwaps: any;
}

interface ChartUtils {
    period: any;
    chartData: CandleChartData[];
}

type chartItemStates = {
    showTvl: boolean;
    showVolume: boolean;
    showFeeRate: boolean;
};

export default function TradeCandleStickChart(props: ChartData) {
    const { showFeeRate, showTvl, showVolume } = props.chartItemStates;

    const numberOfActiveItems = [showFeeRate, showTvl, showVolume].filter(Boolean);

    const chartHeight = 85 - numberOfActiveItems.length * 10;
    // console.log(chartHeight);
    // console.log(numberOfActiveItems.length);

    const data = {
        tvlData: props.tvlData,
        volumeData: props.volumeData,
        feeData: props.feeData,
        priceData: props.priceData,
        liquidityData: props.liquidityData,
    };

    const parsedChartData = useMemo(() => {
        const chartData: CandleChartData[] = [];
        let period = 1;
        props.priceData?.candles.map((data) => {
            if (data.period !== undefined) {
                period = data.period;
            }
            chartData.push({
                date: new Date(data.time * 1000),
                open: props.denomInBase
                    ? data.invPriceOpenDecimalCorrected
                    : data.priceOpenDecimalCorrected,
                close: props.denomInBase
                    ? data.invPriceCloseDecimalCorrected
                    : data.priceCloseDecimalCorrected,
                high: props.denomInBase
                    ? data.invMinPriceDecimalCorrected
                    : data.maxPriceDecimalCorrected,
                low: props.denomInBase
                    ? data.invMaxPriceDecimalCorrected
                    : data.minPriceDecimalCorrected,
                time: data.time,
                allSwaps: [],
            });
        });

        const chartUtils: ChartUtils = {
            period: period,
            chartData: chartData,
        };
        return chartUtils;
    }, [props.priceData, props.denomInBase]);

    // Volume Chart
    useEffect(() => {
        const chartData = {
            lineseries: data.volumeData,
        };

        const render = () => {
            d3.select('#chart-volume').datum(chartData).call(chart);
        };

        const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);

        const millisPerDay = 24 * 60 * 60 * 100;
        const xExtent = d3fc
            .extentDate()
            .accessors([(d: any) => d.time])
            .padUnit('domain')
            .pad([millisPerDay, 9000000000]);

        const xScale = d3.scaleTime();
        const yScale = d3.scaleLinear();

        xScale.domain(xExtent(chartData.lineseries));
        yScale.domain(yExtent(chartData.lineseries));

        const lineSeries = d3fc
            .autoBandwidth(d3fc.seriesSvgBar())
            .align('center')
            .crossValue((d: any) => d.time)
            .mainValue((d: any) => d.value)
            .decorate((selection: any) => {
                selection.enter().style('fill', '#7371FC');
            });

        const multi = d3fc
            .seriesSvgMulti()
            .series([lineSeries])
            .mapping((data: any) => {
                if (data.loading) {
                    return [];
                }
                return data.lineseries;
            });

        const chart = d3fc
            .chartCartesian({ xScale, yScale })
            .xTicks([0])
            .yTicks([2])
            // .yTickValues([Math.min(...chartData.lineseries.map((o) => o.value)), Math.max(...chartData.lineseries.map((o) => o.value))])
            .yTickFormat(formatDollarAmountAxis)
            .xLabel('')
            .yLabel('')
            .decorate((selection: any) => {
                selection.select('.x-axis').style('height', '1px');
            })
            .svgPlotArea(multi);

        render();
    }, [data]);

    // Tvl Chart
    useEffect(() => {
        const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);

        const millisPerDay = 24 * 60 * 60 * 100;
        const xExtent = d3fc
            .extentDate()
            .accessors([(d: any) => d.time])
            .padUnit('domain')
            .pad([millisPerDay, 9000000000]);

        const chartData = {
            series: data.tvlData,
            crosshair: [{ x: 0, y: -1 }],
        };

        const xScale = d3.scaleTime();
        const yScale = d3.scaleLinear();

        xScale.domain(xExtent(chartData.series));
        yScale.domain(yExtent(chartData.series));

        const areaSeries = d3fc
            .seriesSvgArea()
            .mainValue((d: any) => d.value)
            .crossValue((d: any) => d.time)
            .decorate((selection: any) => {
                selection.style('fill', () => {
                    return 'url(#mygrad)';
                });
            });

        const lineSeries = d3fc
            .seriesSvgLine()
            .mainValue((d: any) => d.value)
            .crossValue((d: any) => d.time)
            .decorate((selection: any) => {
                selection.enter().style('stroke', () => '#7371FC');
                selection.attr('stroke-width', '2');
            });

        const crosshair = d3fc
            .annotationSvgCrosshair()
            .xLabel('')
            .yLabel('')
            .decorate((selection: any) => {
                selection.enter().attr('stroke-dasharray', '3 3').style('pointer-events', 'all');
                selection
                    .selectAll('.point>path')
                    .attr('transform', 'scale(0.2)')
                    .style('fill', 'white');
                selection
                    .enter()
                    .select('g.annotation-line.horizontal')
                    .attr('visibility', 'hidden');
            });

        const multi = d3fc
            .seriesSvgMulti()
            .series([lineSeries, areaSeries, crosshair])
            .mapping((data: any, index: any, series: any) => {
                switch (series[index]) {
                    case crosshair:
                        return data.crosshair;
                    default:
                        return data.series;
                }
            });

        const svgmain = d3.select('.chart-tvl').select('svg');

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
            .style('stop-opacity', 0.7);

        lg.append('stop')
            .attr('offset', '110%')
            .style('stop-color', 'black')
            .style('stop-opacity', 0.7);

        const chart = d3fc
            .chartCartesian(xScale, yScale)
            .xTicks([0])
            .yTicks([2])
            .yTickFormat(formatDollarAmountAxis)
            .decorate((selection: any) => {
                selection.select('.x-axis').style('height', '1px');
            })
            .svgPlotArea(multi);

        function render() {
            d3.select('.chart-tvl').datum(chartData).call(chart);

            const pointer = d3fc.pointer().on('point', (event: any) => {
                if (event[0] !== undefined) {
                    chartData.crosshair[0].x = event[0].x;
                    render();
                }
            });

            d3.select('.chart-tvl .plot-area').call(pointer);
        }

        render();
    }, [data]);

    // Fee Rate Chart
    useEffect(() => {
        const yExtent = d3fc.extentLinear().accessors([(d: any) => d.value]);

        const millisPerDay = 24 * 60 * 60 * 100;
        const xExtent = d3fc
            .extentDate()
            .accessors([(d: any) => d.time])
            .padUnit('domain')
            .pad([millisPerDay, 9000000000]);

        const chartData = {
            series: data.feeData,
        };

        const xScale = d3.scaleTime();
        const yScale = d3.scaleLinear();

        xScale.domain(xExtent(chartData.series));
        yScale.domain(yExtent(chartData.series));

        const lineSeries = d3fc
            .seriesSvgLine()
            .mainValue((d: any) => d.value)
            .crossValue((d: any) => d.time)
            .decorate((selection: any) => {
                selection.enter().style('stroke', () => '#7371FC');
                selection.attr('stroke-width', '1');
            });

        const multi = d3fc
            .seriesSvgMulti()
            .series([lineSeries])
            .mapping((data: any) => {
                return data.series;
            });

        const chart = d3fc
            .chartCartesian(xScale, yScale)
            .xTicks([0])
            .yTicks([2])
            .yTickFormat(formatDollarAmountAxis)
            .decorate((selection: any) => {
                selection.select('.x-axis').style('height', '3px');
            })
            .svgPlotArea(multi);

        function render() {
            d3.select('.chart-fee').datum(chartData).call(chart);
        }

        render();
    }, [data]);

    return (
        <>
            <div style={{ height: `${chartHeight}%`, width: '100%' }}>
                <Chart
                    priceData={parsedChartData}
                    liquidityData={props.liquidityData.ranges}
                    changeState={props.changeState}
                    targetData={props.targetData}
                    limitPrice={props.limitPrice}
                    setLimitRate={props.setLimitRate}
                    limitRate={props.limitRate}
                    denomInBase={props.denomInBase}
                    isAdvancedModeActive={props.isAdvancedModeActive}
                    simpleRangeWidth={props.simpleRangeWidth}
                    pinnedMinPriceDisplayTruncated={props.pinnedMinPriceDisplayTruncated}
                    pinnedMaxPriceDisplayTruncated={props.pinnedMaxPriceDisplayTruncated}
                    truncatedPoolPrice={props.truncatedPoolPrice}
                />
            </div>

            {showFeeRate && (
                <>
                    <hr />
                    <div style={{ height: '15%', width: '100%' }} className='chart-fee'></div>
                </>
            )}
            {showTvl && (
                <>
                    <hr />
                    <div style={{ height: '15%', width: '100%' }} className='chart-tvl'></div>
                </>
            )}
            {showVolume === true && (
                <>
                    <hr />
                    <div style={{ height: '15%', width: '100%' }} id='chart-volume'></div>
                </>
            )}
        </>
    );
}
