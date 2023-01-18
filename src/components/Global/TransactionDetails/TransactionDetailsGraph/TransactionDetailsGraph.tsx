import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ITransaction } from '../../../../utils/state/graphDataSlice';

import './TransactionDetailsGraph.css';

interface TransactionDetailsGraphIF {
    tx: ITransaction;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function TransactionDetailsGraph(props: TransactionDetailsGraphIF) {
    const { tx } = props;

    const d3PlotGraph = useRef(null);
    const d3Yaxis = useRef(null);
    const d3Xaxis = useRef(null);
    const graphMainDiv = useRef(null);

    const fakeData = [
        {
            date: '2023-01-16T12:00:00.000Z',
            price: 1544.5935405791975,
            time: 1673870400,
        },
        {
            date: '2023-01-16T11:00:00.000Z',
            price: 1547.3711833470268,
            time: 1673866800,
        },
        {
            date: '2023-01-16T10:00:00.000Z',
            price: 1543.7638699107645,
            time: 1673863200,
        },
        {
            date: '2023-01-16T09:00:00.000Z',
            price: 1536.8323412,
            time: 1673859600,
        },
        {
            date: '2023-01-16T08:00:00.000Z',
            price: 1565.5059853841185,
            time: 1673856000,
        },
        {
            date: '2023-01-16T07:00:00.000Z',
            price: 1571.7627023952696,
            time: 1673852400,
        },
        {
            date: '2023-01-16T06:00:00.000Z',
            price: 1573.8987999141439,
            time: 1673848800,
        },
        {
            date: '2023-01-16T05:00:00.000Z',
            price: 1572.5326239316419,
            time: 1673845200,
        },
        {
            date: '2023-01-16T04:00:00.000Z',
            price: 1568.2093627041809,
            time: 1673841600,
        },
        {
            date: '2023-01-16T03:00:00.000Z',
            price: 1574.385737802135,
            time: 1673838000,
        },
        {
            date: '2023-01-16T02:00:00.000Z',
            price: 1568.7048403954536,
            time: 1673834400,
        },
        {
            date: '2023-01-16T01:00:00.000Z',
            price: 1559.1245340414328,
            time: 1673830800,
        },
        {
            date: '2023-01-16T00:00:00.000Z',
            price: 1551.9288970162597,
            time: 1673827200,
        },
        {
            date: '2023-01-15T23:00:00.000Z',
            price: 1556.620533539514,
            time: 1673823600,
        },
        {
            date: '2023-01-15T22:00:00.000Z',
            price: 1552.4324122022174,
            time: 1673820000,
        },
        {
            date: '2023-01-15T21:00:00.000Z',
            price: 1554.9898073354818,
            time: 1673816400,
        },
        {
            date: '2023-01-15T20:00:00.000Z',
            price: 1551.338858937899,
            time: 1673812800,
        },
        {
            date: '2023-01-15T19:00:00.000Z',
            price: 1547.4514378722447,
            time: 1673809200,
        },
        {
            date: '2023-01-15T18:00:00.000Z',
            price: 1551.700564885043,
            time: 1673805600,
        },
        {
            date: '2023-01-15T17:00:00.000Z',
            price: 1546.5022717521022,
            time: 1673802000,
        },
        {
            date: '2023-01-15T16:00:00.000Z',
            price: 1556.3412339406318,
            time: 1673798400,
        },
        {
            date: '2023-01-15T15:00:00.000Z',
            price: 1541.0225373610515,
            time: 1673794800,
        },
        {
            date: '2023-01-15T14:00:00.000Z',
            price: 1530.9008932499999,
            time: 1673791200,
        },
        {
            date: '2023-01-15T13:00:00.000Z',
            price: 1531.7968561806995,
            time: 1673787600,
        },
        {
            date: '2023-01-15T12:00:00.000Z',
            price: 1534.30502237348,
            time: 1673784000,
        },
        {
            date: '2023-01-15T11:00:00.000Z',
            price: 1530.808509090909,
            time: 1673780400,
        },
        {
            date: '2023-01-15T10:00:00.000Z',
            price: 1532.1584268206443,
            time: 1673776800,
        },
        {
            date: '2023-01-15T09:00:00.000Z',
            price: 1521.733300108666,
            time: 1673773200,
        },
        {
            date: '2023-01-15T08:00:00.000Z',
            price: 1529.2373125776674,
            time: 1673769600,
        },
        {
            date: '2023-01-15T07:00:00.000Z',
            price: 1525.613525392161,
            time: 1673766000,
        },
        {
            date: '2023-01-15T06:00:00.000Z',
            price: 1529.7068447866895,
            time: 1673762400,
        },
        {
            date: '2023-01-15T05:00:00.000Z',
            price: 1527.2779870256672,
            time: 1673758800,
        },
        {
            date: '2023-01-15T04:00:00.000Z',
            price: 1526.274840642659,
            time: 1673755200,
        },
        {
            date: '2023-01-15T03:00:00.000Z',
            price: 1523.235121540585,
            time: 1673751600,
        },
        {
            date: '2023-01-15T02:00:00.000Z',
            price: 1528.257632518417,
            time: 1673748000,
        },
        {
            date: '2023-01-15T01:00:00.000Z',
            price: 1528.9973562362056,
            time: 1673744400,
        },
    ];

    const [scaleData, setScaleData] = useState<any>();
    const [lineSeries, setLineSeries] = useState<any>();
    const [priceLine, setPriceLine] = useState();

    useEffect(() => {
        if (scaleData !== undefined) {
            const lineSeries = d3fc
                .seriesSvgLine()
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale)
                .crossValue((d: any) => d.time * 1000)
                .mainValue((d: any) => d.price)
                .decorate((selection: any) => {
                    selection.enter().style('stroke', '#7371FC');
                });

            setLineSeries(() => {
                return lineSeries;
            });

            const priceLine = d3fc
                .annotationSvgLine()
                .value((d: any) => d)
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale);

            priceLine.decorate((selection: any) => {
                selection.enter().select('g.right-handle').remove();
                selection.enter().select('line').attr('class', 'priceLine');
                selection.select('g.left-handle').remove();
            });

            setPriceLine(() => {
                return priceLine;
            });
        }
    }, [scaleData]);

    useEffect(() => {
        const diff = new Date().getTime() - tx.time * 1000;
        const endBoundary = new Date(tx.time * 1000 + diff);
        const startBoundary = new Date(tx.time * 1000 - diff);

        console.log(endBoundary, new Date(tx.time * 1000), startBoundary);

        const yExtent = d3fc
            .extentLinear()
            .accessors([(d: any) => d.price])
            .pad([0, 0.1]);

        const xExtent = d3fc.extentDate().accessors([(d: any) => d.time * 1000]);

        const xScale = d3.scaleTime();
        const yScale = d3.scaleLinear();

        xScale.domain(xExtent(fakeData));
        yScale.domain(yExtent(fakeData));

        const xScaleOriginal = xScale.copy();

        const yAxis = d3fc.axisRight().scale(yScale).ticks(5);

        const scaleData = {
            xScale: xScale,
            yScale: yScale,
            xScaleOriginal: xScaleOriginal,
            yAxis: yAxis,
        };

        setScaleData(() => {
            return scaleData;
        });
    }, [tx]);

    const render = useCallback(() => {
        const nd = d3.select('#d3PlotGraph').node() as any;
        nd.requestRedraw();
    }, []);

    useEffect(() => {
        if (scaleData !== undefined && lineSeries !== undefined && priceLine !== undefined) {
            drawChart(scaleData, lineSeries, priceLine);
        }
    }, [scaleData, lineSeries, priceLine]);

    const drawChart = useCallback(
        (scaleData: any, lineSeries: any, priceLine: any) => {
            if (fakeData.length > 0) {
                const xAxis = d3fc.axisBottom().scale(scaleData.xScale).ticks(3);

                const priceJoin = d3fc.dataJoin('g', 'priceJoin');
                const lineJoin = d3fc.dataJoin('g', 'lineJoin');

                d3.select(d3PlotGraph.current).on('measure', function (event: any) {
                    scaleData.xScale.range([0, event.detail.width]);
                    scaleData.xScaleOriginal.range([0, event.detail.width]);
                    scaleData.yScale.range([event.detail.height, 0]);
                });

                d3.select(d3PlotGraph.current).on('measure.range', function (event: any) {
                    const svg = d3.select(event.target).select('svg');

                    const zoom = d3.zoom().on('zoom', (event: any) => {
                        if (event.sourceEvent.type === 'wheel') {
                            scaleData.xScale.domain(
                                event.transform.rescaleX(scaleData.xScaleOriginal).domain(),
                            );
                        } else {
                            const domainX = scaleData.xScale.domain();
                            const linearX = d3
                                .scaleTime()
                                .domain(scaleData.xScale.range())
                                .range([0, domainX[1] - domainX[0]]);

                            const deltaX = linearX(-event.sourceEvent.movementX);
                            scaleData.xScale.domain([
                                new Date(domainX[0].getTime() + deltaX),
                                new Date(domainX[1].getTime() + deltaX),
                            ]);
                        }

                        render();
                    }) as any;

                    svg.call(zoom);
                });

                d3.select(d3PlotGraph.current).on('draw', function (event: any) {
                    const svg = d3.select(event.target).select('svg');
                    priceJoin(svg, [[1550]]).call(priceLine);
                    lineJoin(svg, [fakeData]).call(lineSeries);

                    d3.select(d3Yaxis.current).select('svg').call(scaleData.yAxis);
                    d3.select(d3Xaxis.current).select('svg').call(xAxis);
                });

                render();
            }
        },
        [tx],
    );

    return (
        <div
            className='main_layout_chart'
            ref={graphMainDiv}
            id='tvl_chart'
            data-testid={'chart'}
            style={{
                height: '100%',
                width: '100%',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    height: '90%',
                    width: '100%',
                }}
            >
                <d3fc-svg
                    id='d3PlotGraph'
                    ref={d3PlotGraph}
                    style={{ height: '300px', width: '90%' }}
                ></d3fc-svg>
                <d3fc-svg className='y-axis' ref={d3Yaxis} style={{ width: '10%' }}></d3fc-svg>
            </div>
            <d3fc-svg
                className='x-axis'
                ref={d3Xaxis}
                style={{ height: '20px', width: '100%' }}
            ></d3fc-svg>
        </div>
    );
}
