import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { DetailedHTMLProps, HTMLAttributes, useEffect, useRef, useState } from 'react';
import './Chart.css';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { POOL_PRIMARY, sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { CandleData } from '../../utils/state/graphDataSlice';

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

export default function Chart() {
    const d3Container = useRef(null);
    const d3PlotArea = useRef(null);
    const d3Xaxis = useRef(null);
    const d3Yaxis = useRef(null);

    const tradeData = useAppSelector((state) => state.tradeData);
    const graphData = useAppSelector((state) => state.graphData);

    const [currentPeriodCandleData, setCurrentPeriodCandleData] = useState<CandleData[]>();

    useEffect(() => {
        const poolIdx = POOL_PRIMARY;
        const sortedTokenAddresses = sortBaseQuoteTokens(
            tradeData.tokenA.address,
            tradeData.tokenB.address,
        );
        const baseTokenAddress = sortedTokenAddresses[0];
        const quoteTokenAddress = sortedTokenAddresses[1];

        const poolToFind = JSON.stringify({
            baseAddress: baseTokenAddress,
            quoteAddress: quoteTokenAddress,
            poolIdx: poolIdx,
        }).toLowerCase();

        const indexOfPool = graphData.candlesForAllPools.pools
            .map((item) => JSON.stringify(item.pool).toLowerCase())
            .findIndex((pool) => pool === poolToFind);

        const durationToFind = tradeData.activeChartPeriod;
        const indexOfDuration = graphData.candlesForAllPools.pools[
            indexOfPool
        ]?.candlesByPoolAndDuration
            .map((item) => item.duration)
            .findIndex((duration) => duration === durationToFind);

        setCurrentPeriodCandleData(
            graphData.candlesForAllPools.pools[indexOfPool]?.candlesByPoolAndDuration[
                indexOfDuration
            ]?.candles,
        );
    }, [tradeData, graphData]);

    useEffect(() => {
        if (currentPeriodCandleData) console.log({ currentPeriodCandleData });
    }, [currentPeriodCandleData]);

    // const generator = d3fc.randomFinancial()
    //     .startDate(new Date(2021, 0, 1))
    //     .startPrice(99);
    // const [data] = useState(generator(30));
    const [data] = useState([
        {
            date: new Date('2020-12-31T21:00:00.000Z'),
            open: 99,
            high: 99.17266879493313,
            low: 98.68576124727899,
            close: 99.11289180715468,
            volume: 1126,
        },
        {
            date: new Date('2021-01-01T21:00:00.000Z'),
            open: 99.11289180715468,
            high: 99.11289180715468,
            low: 98.38094823218387,
            close: 98.38094823218387,
            volume: 1214,
        },
        {
            date: new Date('2021-01-02T21:00:00.000Z'),
            open: 98.38094823218387,
            high: 98.38899623931027,
            low: 97.94515973922842,
            close: 98.03210336736818,
            volume: 1063,
        },
        {
            date: new Date('2021-01-03T21:00:00.000Z'),
            open: 98.03210336736818,
            high: 98.03210336736818,
            low: 97.29170793728635,
            close: 97.29170793728635,
            volume: 1082,
        },
        {
            date: new Date('2021-01-04T21:00:00.000Z'),
            open: 97.29170793728635,
            high: 97.78720047054037,
            low: 97.12570376472861,
            close: 97.78720047054037,
            volume: 1042,
        },
        {
            date: new Date('2021-01-05T21:00:00.000Z'),
            open: 97.78720047054037,
            high: 98.02675494366058,
            low: 97.34455781908238,
            close: 97.34455781908238,
            volume: 1079,
        },
        {
            date: new Date('2021-01-06T21:00:00.000Z'),
            open: 97.34455781908238,
            high: 97.92644606990005,
            low: 97.34455781908238,
            close: 97.80471529575736,
            volume: 994,
        },
        {
            date: new Date('2021-01-07T21:00:00.000Z'),
            open: 97.80471529575736,
            high: 97.81858287875707,
            low: 97.14209174399105,
            close: 97.15666341152085,
            volume: 1101,
        },
        {
            date: new Date('2021-01-08T21:00:00.000Z'),
            open: 97.15666341152085,
            high: 97.17026116123341,
            low: 96.69597932759751,
            close: 96.69597932759751,
            volume: 1205,
        },
        {
            date: new Date('2021-01-09T21:00:00.000Z'),
            open: 96.69597932759751,
            high: 96.94731644133094,
            low: 95.92121490439148,
            close: 95.93846758936876,
            volume: 1105,
        },
        {
            date: new Date('2021-01-10T21:00:00.000Z'),
            open: 95.93846758936876,
            high: 96.69483018175475,
            low: 95.93846758936876,
            close: 96.27274625349257,
            volume: 1057,
        },
        {
            date: new Date('2021-01-11T21:00:00.000Z'),
            open: 96.27274625349257,
            high: 96.27274625349257,
            low: 95.34313636858965,
            close: 95.34313636858965,
            volume: 978,
        },
        {
            date: new Date('2021-01-12T21:00:00.000Z'),
            open: 95.34313636858965,
            high: 95.45880666372278,
            low: 94.95805988665121,
            close: 95.40529463754531,
            volume: 926,
        },
        {
            date: new Date('2021-01-13T21:00:00.000Z'),
            open: 95.40529463754531,
            high: 95.57623720403276,
            low: 94.67589443381303,
            close: 94.89194831878045,
            volume: 1224,
        },
        {
            date: new Date('2021-01-14T21:00:00.000Z'),
            open: 94.89194831878045,
            high: 95.17525047194249,
            low: 94.82047125329441,
            close: 95.03691831654177,
            volume: 828,
        },
        {
            date: new Date('2021-01-15T21:00:00.000Z'),
            open: 95.03691831654177,
            high: 95.03691831654177,
            low: 94.30919838336993,
            close: 94.51369190034856,
            volume: 1048,
        },
        {
            date: new Date('2021-01-16T21:00:00.000Z'),
            open: 94.51369190034856,
            high: 95.41161487896201,
            low: 94.46470019932677,
            close: 95.12563298751766,
            volume: 999,
        },
        {
            date: new Date('2021-01-17T21:00:00.000Z'),
            open: 95.12563298751766,
            high: 95.12563298751766,
            low: 94.51782472749765,
            close: 94.8701424055532,
            volume: 904,
        },
        {
            date: new Date('2021-01-18T21:00:00.000Z'),
            open: 94.8701424055532,
            high: 95.56820744841899,
            low: 94.81094188242002,
            close: 95.12700911814602,
            volume: 976,
        },
        {
            date: new Date('2021-01-19T21:00:00.000Z'),
            open: 95.12700911814602,
            high: 95.33945671897365,
            low: 94.91793588062043,
            close: 95.33945671897365,
            volume: 928,
        },
        {
            date: new Date('2021-01-20T21:00:00.000Z'),
            open: 95.33945671897365,
            high: 95.37819302325853,
            low: 94.60251425936559,
            close: 94.61931308356769,
            volume: 931,
        },
        {
            date: new Date('2021-01-21T21:00:00.000Z'),
            open: 94.61931308356769,
            high: 95.2677901122447,
            low: 94.61931308356769,
            close: 94.93790102096116,
            volume: 1062,
        },
        {
            date: new Date('2021-01-22T21:00:00.000Z'),
            open: 94.93790102096116,
            high: 95.59934247132743,
            low: 94.93790102096116,
            close: 95.50706448910168,
            volume: 921,
        },
        {
            date: new Date('2021-01-23T21:00:00.000Z'),
            open: 95.50706448910168,
            high: 96.04760857400342,
            low: 95.40593556735499,
            close: 96.03066750137036,
            volume: 940,
        },
        {
            date: new Date('2021-01-24T21:00:00.000Z'),
            open: 96.03066750137036,
            high: 97.11141642485443,
            low: 95.93810359984609,
            close: 97.05929568282836,
            volume: 986,
        },
        {
            date: new Date('2021-01-25T21:00:00.000Z'),
            open: 97.05929568282836,
            high: 97.31634328242373,
            low: 96.8244648735381,
            close: 97.0329859838135,
            volume: 763,
        },
        {
            date: new Date('2021-01-26T21:00:00.000Z'),
            open: 97.0329859838135,
            high: 97.0329859838135,
            low: 96.13394713400355,
            close: 96.22006592720184,
            volume: 962,
        },
        {
            date: new Date('2021-01-27T21:00:00.000Z'),
            open: 96.22006592720184,
            high: 97.19403155351475,
            low: 96.22006592720184,
            close: 97.19403155351475,
            volume: 1208,
        },
        {
            date: new Date('2021-01-28T21:00:00.000Z'),
            open: 97.19403155351475,
            high: 97.19403155351475,
            low: 96.05280745900902,
            close: 96.10946054741967,
            volume: 962,
        },
        {
            date: new Date('2021-01-29T21:00:00.000Z'),
            open: 96.10946054741967,
            high: 96.18093827017171,
            low: 95.75387647980443,
            close: 95.96447478420912,
            volume: 931,
        },
    ]);

    const [targets, setTargets] = useState([
        {
            name: 'high',
            value: 98.42,
        },
        {
            name: 'low',
            value: 97.2,
        },
    ]);
    const [liquidityData] = useState([
        {
            tick: 95,
            value: 435006,
        },
        {
            tick: 95.5,
            value: 345006,
        },
        {
            tick: 96,
            value: 200006,
        },
        {
            tick: 96.5,
            value: 150006,
        },
        {
            tick: 97,
            value: 67006,
        },
        {
            tick: 97.5,
            value: 49006,
        },
        {
            tick: 98,
            value: 45006,
        },
        {
            tick: 98.5,
            value: 128736,
        },
        {
            tick: 99,
            value: 678736,
        },
        {
            tick: 99.5,
            value: 736123,
        },
        {
            tick: 100,
            value: 999204,
        },
    ]);
    // console.log(Helooo);

    useEffect(() => {
        console.log('update chart');

        const millisPerDay = 24 * 60 * 60 * 1000;
        const priceRange = d3fc.extentLinear().accessors([(d: any) => d.high, (d: any) => d.low]);
        const xExtent = d3fc
            .extentDate()
            .accessors([(d: any) => d.date])
            .padUnit('domain')
            // ensure that the scale is padded by one day in either direction
            .pad([millisPerDay, millisPerDay]);

        const xScale = d3.scaleTime();
        const yScale = d3.scaleLinear();
        const liquidityTickScale = d3.scaleBand();
        const liquidityScale = d3.scaleLinear();
        const barThreshold = 98.5;

        // bar chart
        const liquidityExtent = d3fc
            .extentLinear(liquidityData)
            .include([0])
            .accessors([(d: any) => d.value]);

        xScale.domain(xExtent(data));
        yScale.domain(priceRange(data));
        liquidityScale.domain(liquidityExtent(liquidityData));

        // axes
        const xAxis = d3fc.axisBottom().scale(xScale);
        const yAxis = d3fc.axisRight().scale(yScale);

        const gridlines = d3fc.annotationSvgGridline().xScale(xScale).yScale(yScale);
        const candlestick = d3fc
            .autoBandwidth(d3fc.seriesSvgCandlestick())
            .decorate((selection: any) => {
                selection
                    .enter()
                    .style('fill', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'))
                    .style('stroke', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'));
            })
            .xScale(xScale)
            .yScale(yScale);

        const barSeries = d3fc
            .autoBandwidth(d3fc.seriesSvgBar())
            .widthFraction(1)
            .orient('horizontal')
            .mainValue((d: any) => d.value)
            .crossValue((d: any) => d.tick)
            .xScale(liquidityScale)
            .yScale(yScale)
            .decorate((selection: any) => {
                // The selection passed to decorate is the one which the component creates
                // within its internal data join, here we use the update selection to
                // apply a style to path elements created by the bar series
                selection.select('.bar > path').style('fill', (d: any) => {
                    return d.tick < barThreshold
                        ? 'rgba(205, 193, 255, 0.25)'
                        : 'rgba(115, 113, 252, 0.25)';
                });
            });

        const horizontalLine = d3fc
            .annotationSvgLine()
            .value((d: any) => d.value)
            .xScale(xScale)
            .yScale(yScale);

        const valueFormatter = d3.format('.2f');

        const drag = d3.drag().on('drag', function (event, d: any) {
            const newValue = yScale.invert(d3.pointer(event)[1] - 90);
            setTargets((prevState) => {
                const newTargets = [...prevState];
                newTargets.filter((target: any) => target.name === d.name)[0].value = newValue;
                return newTargets;
            });
        });

        horizontalLine.decorate((selection: any) => {
            selection.enter().select('g.left-handle').append('text').attr('x', 5).attr('y', -5);
            selection.enter().select('line').attr('class', 'redline').attr('stroke', 'red');
            selection
                .select('g.left-handle text')
                .text((d: any) => d.name + ' - ' + valueFormatter(d.value));
            selection
                .enter()
                .append('line')
                .attr('class', 'detector')
                .attr('stroke', 'transparent')
                .attr('x2', '100%')
                .attr('stroke-width', 5)
                .style('pointer-events', 'all')
                .on('mouseover', (event: any) => {
                    d3.select(event.currentTarget).style('cursor', 'ns-resize');
                })
                .on('mouseout', (event: any) => {
                    d3.select(event.currentTarget).style('cursor', 'default');
                })
                .call(drag);
        });

        const gridJoin = d3fc.dataJoin('g', 'grid');
        const candleJoin = d3fc.dataJoin('g', 'candle');
        const targetsJoin = d3fc.dataJoin('g', 'targets');
        const barJoin = d3fc.dataJoin('g', 'bar');

        // handle the plot area measure event in order to compute the scale ranges
        d3.select(d3PlotArea.current).on('measure', function (event: any) {
            xScale.range([0, event.detail.width]);
            yScale.range([event.detail.height, 0]);
            liquidityTickScale.range([event.detail.height, 0]);
            liquidityScale.range([event.detail.width, event.detail.width / 2]);
        });

        d3.select(d3PlotArea.current).on('draw', function (event: any) {
            const svg = d3.select(event.target).select('svg');

            gridJoin(svg, [data]).call(gridlines);
            candleJoin(svg, [data]).call(candlestick);
            barJoin(svg, [liquidityData]).call(barSeries);
            targetsJoin(svg, [targets]).call(horizontalLine);
        });

        d3.select(d3Xaxis.current).on('draw', function (event: any) {
            d3.select(event.target).select('svg').call(xAxis);
        });

        d3.select(d3Yaxis.current).on('draw', function (event: any) {
            d3.select(event.target).select('svg').call(yAxis);
        });
        const nd = d3.select('#group').node() as any;
        nd.requestRedraw();
    }, [targets, data]);

    return (
        <div ref={d3Container} className='main_layout' data-testid={'chart'}>
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
