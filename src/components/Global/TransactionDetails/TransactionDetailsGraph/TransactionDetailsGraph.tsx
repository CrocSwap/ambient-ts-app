import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { memoizeFetchTransactionGraphData } from '../../../../App/functions/fetchTransactionDetailsGraphData';
import { useAppChain } from '../../../../App/hooks/useAppChain';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { LimitOrderIF } from '../../../../utils/interfaces/LimitOrderIF';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { ITransaction } from '../../../../utils/state/graphDataSlice';

import './TransactionDetailsGraph.css';

interface TransactionDetailsGraphIF {
    tx: any;
    transactionType: string;
    useTx?: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function TransactionDetailsGraph(props: TransactionDetailsGraphIF) {
    const { tx, transactionType, useTx } = props;

    const isServerEnabled =
        process.env.REACT_APP_CACHE_SERVER_IS_ENABLED !== undefined
            ? process.env.REACT_APP_CACHE_SERVER_IS_ENABLED === 'true'
            : true;

    const tradeData = useAppSelector((state) => state.tradeData);

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;

    const mainnetBaseTokenAddress = tradeData.mainnetBaseTokenAddress;
    const mainnetQuoteTokenAddress = tradeData.mainnetQuoteTokenAddress;

    const { isConnected } = useAccount();

    const isUserLoggedIn = isConnected;
    const [chainData] = useAppChain('0x5', isUserLoggedIn);

    const fetchGraphData = memoizeFetchTransactionGraphData();

    const [graphData, setGraphData] = useState();

    const d3PlotGraph = useRef(null);
    const d3Yaxis = useRef(null);
    const d3Xaxis = useRef(null);
    const graphMainDiv = useRef(null);

    const [scaleData, setScaleData] = useState<any>();
    const [lineSeries, setLineSeries] = useState<any>();
    const [crossPoint, setCrossPoint] = useState<any>();
    const [priceLine, setPriceLine] = useState();
    const [horizontalBand, setHorizontalBand] = useState();

    const decidePeriod = (diff: number) => {
        return diff <= 60
            ? 60
            : diff <= 300
            ? 300
            : diff <= 900
            ? 900
            : diff <= 3600
            ? 3600
            : diff <= 14400
            ? 14400
            : 86400;
    };

    useEffect(() => {
        (async () => {
            if (graphData === undefined) {
                const fetchEnabled = !!(
                    isServerEnabled &&
                    baseTokenAddress &&
                    quoteTokenAddress &&
                    mainnetBaseTokenAddress &&
                    mainnetQuoteTokenAddress
                );

                const time = () => {
                    switch (transactionType) {
                        case 'swap':
                            return tx?.time !== undefined ? tx.time : new Date().getTime();
                        case 'limitOrder':
                            return tx?.timeFirstMint !== undefined
                                ? tx?.timeFirstMint
                                : new Date().getTime();
                        case 'liqchange':
                            return tx?.timeFirstMint !== undefined
                                ? tx?.timeFirstMint
                                : new Date().getTime();
                        default:
                            return new Date().getTime();
                    }
                };

                const diff =
                    new Date().getTime() - time() * 1000 < 43200000
                        ? 43200000
                        : new Date().getTime() - time() * 1000;

                const period = decidePeriod(Math.floor(diff / 1000 / 200));
                if (period !== undefined) {
                    const numberofCandleNeeded = Math.floor((diff * 2) / (period * 1000));

                    const startBoundary = Math.floor(new Date().getTime() / 1000);

                    try {
                        const graphData = await fetchGraphData(
                            fetchEnabled,
                            mainnetBaseTokenAddress,
                            mainnetQuoteTokenAddress,
                            chainData,
                            period,
                            baseTokenAddress,
                            quoteTokenAddress,
                            startBoundary.toString(),
                            numberofCandleNeeded.toString(),
                        );

                        if (graphData) {
                            setGraphData(() => {
                                return graphData.candles;
                            });
                        } else {
                            setGraphData(() => {
                                return undefined;
                            });
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        })();
    }, []);

    useEffect(() => {
        if (scaleData !== undefined) {
            const lineSeries = d3fc
                .seriesSvgLine()
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale)
                .crossValue((d: any) => d.time * 1000)
                .mainValue((d: any) => d.invPriceCloseExclMEVDecimalCorrected)
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

            const crossPoint = d3fc
                .seriesSvgPoint()
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale)
                .crossValue((d: any) => d.x)
                .mainValue((d: any) => d.y)
                .size(14);

            setCrossPoint(() => {
                return crossPoint;
            });

            const horizontalBand = d3fc
                .annotationSvgBand()
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale)
                .fromValue((d: any) => d[0])
                .toValue((d: any) => d[1])
                .decorate((selection: any) => {
                    selection.select('path').attr('fill', '#7371FC1A');
                });

            setHorizontalBand(() => {
                return horizontalBand;
            });
        }
    }, [scaleData]);

    useEffect(() => {
        if (graphData !== undefined) {
            const yExtent = d3fc
                .extentLinear()
                .accessors([(d: any) => d.invPriceCloseExclMEVDecimalCorrected])
                .pad([0.05, 0.1]);

            const xExtent = d3fc.extentDate().accessors([(d: any) => d.time * 1000]);

            const xScale = d3.scaleTime();
            const yScale = d3.scaleLinear();

            xScale.domain(xExtent(graphData));

            if (transactionType === 'swap') {
                yScale.domain(yExtent(graphData));
            } else if (transactionType === 'limitOrder') {
                if (tx !== undefined) {
                    const lowBoundary = Math.min(
                        tx.askTickInvPriceDecimalCorrected,
                        tx.bidTickInvPriceDecimalCorrected,
                    );
                    const topBoundary = Math.max(
                        tx.askTickInvPriceDecimalCorrected,
                        tx.bidTickInvPriceDecimalCorrected,
                    );

                    const buffer =
                        Math.abs(
                            Math.min(yExtent(graphData)[0], lowBoundary) -
                                Math.max(yExtent(graphData)[1], topBoundary),
                        ) / 50;

                    const boundaries = [
                        Math.min(yExtent(graphData)[0], lowBoundary) - buffer,
                        Math.max(yExtent(graphData)[1], topBoundary) + buffer,
                    ];

                    yScale.domain(boundaries);
                } else {
                    yScale.domain(yExtent(graphData));
                }
            } else if (transactionType === 'liqchange') {
                if (tx !== undefined && tx.positionType !== 'ambient') {
                    const lowBoundary = Math.min(
                        tx.askTickInvPriceDecimalCorrected,
                        tx.bidTickInvPriceDecimalCorrected,
                    );
                    const topBoundary = Math.max(
                        tx.askTickInvPriceDecimalCorrected,
                        tx.bidTickInvPriceDecimalCorrected,
                    );

                    const buffer =
                        Math.abs(
                            Math.min(yExtent(graphData)[0], lowBoundary) -
                                Math.max(yExtent(graphData)[1], topBoundary),
                        ) / 50;

                    const boundaries = [
                        Math.min(yExtent(graphData)[0], lowBoundary) - buffer,
                        Math.max(yExtent(graphData)[1], topBoundary) + buffer,
                    ];

                    yScale.domain(boundaries);
                } else {
                    yScale.domain(yExtent(graphData));
                }
            }

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
        }
    }, [tx, graphData]);

    const render = useCallback(() => {
        const nd = d3.select('#d3PlotGraph').node() as any;
        nd.requestRedraw();
    }, []);

    useEffect(() => {
        if (
            graphData !== undefined &&
            scaleData !== undefined &&
            lineSeries !== undefined &&
            crossPoint !== undefined &&
            horizontalBand !== undefined &&
            priceLine !== undefined
        ) {
            drawChart(graphData, scaleData, lineSeries, priceLine, crossPoint, horizontalBand);
        }
    }, [scaleData, lineSeries, priceLine, graphData, crossPoint, transactionType, horizontalBand]);

    const drawChart = useCallback(
        (
            graphData: any,
            scaleData: any,
            lineSeries: any,
            priceLine: any,
            crossPoint: any,
            horizontalBand: any,
        ) => {
            if (graphData.length > 0) {
                const xAxis = d3fc.axisBottom().scale(scaleData.xScale).ticks(5);

                const priceJoin = d3fc.dataJoin('g', 'priceJoin');
                const startPriceJoin = d3fc.dataJoin('g', 'startPriceJoin');
                const finishPriceJoin = d3fc.dataJoin('g', 'finishPriceJoin');
                const lineJoin = d3fc.dataJoin('g', 'lineJoin');
                const crossPointJoin = d3fc.dataJoin('g', 'crossPoint');

                const horizontalBandJoin = d3fc.dataJoin('g', 'horizontalBand');
                const horizontalBandData: any[] = [];

                d3.select(d3PlotGraph.current).on('measure', function (event: any) {
                    scaleData.xScale.range([0, event.detail.width]);
                    scaleData.xScaleOriginal.range([0, event.detail.width]);
                    scaleData.yScale.range([event.detail.height, 0]);
                });

                // Zoom
                // d3.select(d3PlotGraph.current).on('measure.range', function (event: any) {
                //     const svg = d3.select(event.target).select('svg');

                //     const zoom = d3.zoom().on('zoom', (event: any) => {
                //         if (event.sourceEvent.type === 'wheel') {
                //             scaleData.xScale.domain(
                //                 event.transform.rescaleX(scaleData.xScaleOriginal).domain(),
                //             );
                //         } else {
                //             const domainX = scaleData.xScale.domain();
                //             const linearX = d3
                //                 .scaleTime()
                //                 .domain(scaleData.xScale.range())
                //                 .range([0, domainX[1] - domainX[0]]);

                //             const deltaX = linearX(-event.sourceEvent.movementX);
                //             scaleData.xScale.domain([
                //                 new Date(domainX[0].getTime() + deltaX),
                //                 new Date(domainX[1].getTime() + deltaX),
                //             ]);
                //         }

                //         render();
                //     }) as any;

                //     svg.call(zoom);
                // });

                // const prng = d3.randomNormal();
                // const data = d3.range(1e3).map((d) => ({
                //     x: prng(),
                //     y: prng(),
                // }));

                d3.select(d3PlotGraph.current).on('draw', function (event: any) {
                    const svg = d3.select(event.target).select('svg');

                    if (transactionType === 'swap' && tx !== undefined) {
                        priceJoin(svg, [[tx.invPriceDecimalCorrected]]).call(priceLine);
                        crossPointJoin(svg, [
                            [{ x: tx.time * 1000, y: tx.invPriceDecimalCorrected }],
                        ]).call(crossPoint);
                    }

                    if (transactionType === 'limitOrder' && tx !== undefined) {
                        horizontalBandData[0] = [
                            tx.bidTickInvPriceDecimalCorrected,
                            tx.askTickInvPriceDecimalCorrected,
                        ];

                        finishPriceJoin(svg, [[tx.bidTickInvPriceDecimalCorrected]]).call(
                            priceLine,
                        );
                        startPriceJoin(svg, [[tx.askTickInvPriceDecimalCorrected]]).call(priceLine);
                        horizontalBandJoin(svg, [horizontalBandData]).call(horizontalBand);
                    }

                    if (transactionType === 'liqchange' && tx !== undefined) {
                        if (tx.positionType !== 'ambient') {
                            horizontalBandData[0] = [
                                tx.bidTickInvPriceDecimalCorrected,
                                tx.askTickInvPriceDecimalCorrected,
                            ];

                            finishPriceJoin(svg, [[tx.bidTickInvPriceDecimalCorrected]]).call(
                                priceLine,
                            );
                            startPriceJoin(svg, [[tx.askTickInvPriceDecimalCorrected]]).call(
                                priceLine,
                            );
                            horizontalBandJoin(svg, [horizontalBandData]).call(horizontalBand);
                        }
                    }

                    lineJoin(svg, [graphData]).call(lineSeries);

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
