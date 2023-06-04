import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { memoizeFetchTransactionGraphData } from '../../../../App/functions/fetchTransactionDetailsGraphData';
import { ZERO_ADDRESS } from '../../../../constants';
import { testTokenMap } from '../../../../utils/data/testTokenMap';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

// Rest of your code

import './TransactionDetailsGraph.css';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import Spinner from '../../Spinner/Spinner';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TransactionDetailsGraphIF {
    tx: any;
    transactionType: string;
    useTx?: boolean;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    isAccountView: boolean;
}

export default function TransactionDetailsGraph(
    props: TransactionDetailsGraphIF,
) {
    const {
        tx,
        transactionType,
        isBaseTokenMoneynessGreaterOrEqual,
        isAccountView,
    } = props;
    const { chainData } = useContext(CrocEnvContext);

    const isServerEnabled =
        process.env.REACT_APP_CACHE_SERVER_IS_ENABLED !== undefined
            ? process.env.REACT_APP_CACHE_SERVER_IS_ENABLED === 'true'
            : true;

    // const tradeData = useAppSelector((state) => state.tradeData);

    const baseTokenAddress = tx.base;
    const quoteTokenAddress = tx.quote;

    const chainId = tx.chainId;

    const tradeData = useAppSelector((state) => state.tradeData);
    const denominationsInBase = tradeData.isDenomBase;

    const mainnetBaseTokenAddress =
        baseTokenAddress === ZERO_ADDRESS
            ? baseTokenAddress
            : testTokenMap
                  .get(baseTokenAddress.toLowerCase() + '_' + chainId)
                  ?.split('_')[0];
    const mainnetQuoteTokenAddress =
        quoteTokenAddress === ZERO_ADDRESS
            ? quoteTokenAddress
            : testTokenMap
                  .get(quoteTokenAddress.toLowerCase() + '_' + chainId)
                  ?.split('_')[0];

    const fetchGraphData = memoizeFetchTransactionGraphData();

    const [graphData, setGraphData] = useState<any>();

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

    const fetchEnabled = !!(
        chainData &&
        isServerEnabled &&
        baseTokenAddress &&
        quoteTokenAddress &&
        mainnetBaseTokenAddress &&
        mainnetQuoteTokenAddress
    );

    const [isDataEmpty, setIsDataEmpty] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [isDataTakingTooLongToFetch, setIsDataTakingTooLongToFetch] =
        useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isDataLoading) {
            timeoutId = setTimeout(() => {
                if (graphData === undefined)
                    setIsDataTakingTooLongToFetch(true);
            }, 10000); // Set the timeout threshold in milliseconds (e.g., 10 seconds)
        } else {
            setIsDataTakingTooLongToFetch(false);
        }

        return () => {
            clearTimeout(timeoutId);
        };
    }, [isDataLoading, graphData]);

    useEffect(() => {
        (async () => {
            setIsDataLoading(true);
            if (graphData === undefined) {
                const time = () => {
                    switch (transactionType) {
                        case 'swap':
                            return tx?.txTime !== undefined
                                ? tx.txTime
                                : new Date().getTime();
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
                    const calcNumberCandlesNeeded = Math.floor(
                        (diff * 2) / (period * 1000),
                    );
                    const maxNumCandlesNeeded = 3000;

                    const numCandlesNeeded =
                        calcNumberCandlesNeeded < maxNumCandlesNeeded
                            ? calcNumberCandlesNeeded
                            : maxNumCandlesNeeded;

                    const startBoundary = Math.floor(
                        new Date().getTime() / 1000,
                    );

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
                            numCandlesNeeded.toString(),
                        );

                        if (graphData) {
                            setIsDataLoading(false);
                            setIsDataEmpty(false);
                            setGraphData(() => {
                                return graphData.candles;
                            });
                        } else {
                            setGraphData(() => {
                                return undefined;
                            });
                            setIsDataLoading(false);
                            setIsDataEmpty(true);
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        })();
    }, [fetchEnabled]);

    useEffect(() => {
        if (scaleData !== undefined) {
            const lineSeries = d3fc
                .seriesSvgLine()
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale)
                .crossValue((d: any) => d.time * 1000)
                .mainValue((d: any) =>
                    (
                        !isAccountView
                            ? denominationsInBase
                            : !isBaseTokenMoneynessGreaterOrEqual
                    )
                        ? d.invPriceCloseExclMEVDecimalCorrected
                        : d.priceCloseExclMEVDecimalCorrected,
                )
                .decorate((selection: any) => {
                    selection.enter().style('stroke', '#7371FC');
                });

            setLineSeries(() => {
                return lineSeries;
            });

            const priceLine = d3fc
                .annotationSvgLine()
                .value((d: any) => d)
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale);

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
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale)
                .crossValue((d: any) => d.x)
                .mainValue((d: any) => d.y)
                .size(400)
                .decorate((sel: any) => {
                    sel.enter().attr('fill', 'rgba(255, 255, 255, 0.2)');
                    sel.enter().attr('stroke', 'rgba(255, 255, 255, 0.6)');
                });

            setCrossPoint(() => {
                return crossPoint;
            });

            const horizontalBand = d3fc
                .annotationSvgBand()
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale)
                .fromValue((d: any) => d[0])
                .toValue((d: any) => d[1])
                .decorate((selection: any) => {
                    selection.select('path').attr('fill', '#7371FC1A');
                });

            setHorizontalBand(() => {
                return horizontalBand;
            });
        }
    }, [
        scaleData,
        denominationsInBase,
        isAccountView,
        !isBaseTokenMoneynessGreaterOrEqual,
    ]);

    useEffect(() => {
        if (graphData !== undefined) {
            const yExtent = d3fc
                .extentLinear()
                .accessors([
                    (d: any) =>
                        (
                            !isAccountView
                                ? denominationsInBase
                                : !isBaseTokenMoneynessGreaterOrEqual
                        )
                            ? d.invPriceCloseExclMEVDecimalCorrected
                            : d.priceCloseExclMEVDecimalCorrected,
                ])
                .pad([0.05, 0.1]);

            const xExtent = d3fc
                .extentDate()
                .accessors([(d: any) => d.time * 1000]);

            const xScale = d3.scaleTime();
            const yScale = d3.scaleLinear();

            xScale.domain(xExtent(graphData));

            if (transactionType === 'swap') {
                yScale.domain(yExtent(graphData));
            } else if (transactionType === 'limitOrder') {
                if (tx !== undefined) {
                    const lowBoundary = Math.min(
                        (
                            !isAccountView
                                ? denominationsInBase
                                : !isBaseTokenMoneynessGreaterOrEqual
                        )
                            ? tx.askTickInvPriceDecimalCorrected
                            : tx.askTickPriceDecimalCorrected,
                        (
                            !isAccountView
                                ? denominationsInBase
                                : !isBaseTokenMoneynessGreaterOrEqual
                        )
                            ? tx.bidTickInvPriceDecimalCorrected
                            : tx.bidTickPriceDecimalCorrected,
                    );
                    const topBoundary = Math.max(
                        (
                            !isAccountView
                                ? denominationsInBase
                                : !isBaseTokenMoneynessGreaterOrEqual
                        )
                            ? tx.askTickInvPriceDecimalCorrected
                            : tx.askTickPriceDecimalCorrected,
                        (
                            !isAccountView
                                ? denominationsInBase
                                : !isBaseTokenMoneynessGreaterOrEqual
                        )
                            ? tx.bidTickInvPriceDecimalCorrected
                            : tx.bidTickPriceDecimalCorrected,
                    );

                    const buffer =
                        Math.abs(
                            Math.min(yExtent(graphData)[0], lowBoundary) -
                                Math.max(yExtent(graphData)[1], topBoundary),
                        ) / 4;

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
                        (
                            !isAccountView
                                ? denominationsInBase
                                : !isBaseTokenMoneynessGreaterOrEqual
                        )
                            ? tx.askTickInvPriceDecimalCorrected
                            : tx.askTickPriceDecimalCorrected,
                        (
                            !isAccountView
                                ? denominationsInBase
                                : !isBaseTokenMoneynessGreaterOrEqual
                        )
                            ? tx.bidTickInvPriceDecimalCorrected
                            : tx.bidTickPriceDecimalCorrected,
                    );
                    const topBoundary = Math.max(
                        (
                            !isAccountView
                                ? denominationsInBase
                                : !isBaseTokenMoneynessGreaterOrEqual
                        )
                            ? tx.askTickInvPriceDecimalCorrected
                            : tx.askTickPriceDecimalCorrected,
                        (
                            !isAccountView
                                ? denominationsInBase
                                : !isBaseTokenMoneynessGreaterOrEqual
                        )
                            ? tx.bidTickInvPriceDecimalCorrected
                            : tx.bidTickPriceDecimalCorrected,
                    );

                    const buffer =
                        Math.abs(
                            Math.min(yExtent(graphData)[0], lowBoundary) -
                                Math.max(yExtent(graphData)[1], topBoundary),
                        ) / 4;

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

            const yAxis = d3fc.axisRight().scale(yScale);

            if (transactionType !== 'swap' && tx.positionType !== 'ambient') {
                const topLineTick = (
                    !isAccountView
                        ? denominationsInBase
                        : !isBaseTokenMoneynessGreaterOrEqual
                )
                    ? tx.bidTickInvPriceDecimalCorrected
                    : tx.bidTickPriceDecimalCorrected;

                const lowLineTick = (
                    !isAccountView
                        ? denominationsInBase
                        : !isBaseTokenMoneynessGreaterOrEqual
                )
                    ? tx.askTickInvPriceDecimalCorrected
                    : tx.askTickPriceDecimalCorrected;

                const topLimit =
                    topLineTick > lowLineTick ? topLineTick : lowLineTick;
                const bottomLimit =
                    topLineTick < lowLineTick ? topLineTick : lowLineTick;

                const shouldRound = topLimit > 1 && bottomLimit > 1;

                const diff =
                    Math.abs(yScale.domain()[1] - yScale.domain()[0]) / 8;

                const lowerBoundaryFill = Math.abs(
                    yScale.domain()[0] - bottomLimit,
                );

                const lowerBoudnaryFactor = Math.ceil(lowerBoundaryFill / diff);

                const lowValues: any = [];

                if (lowerBoudnaryFactor < 2) {
                    lowValues[0] =
                        shouldRound &&
                        (!isAccountView
                            ? denominationsInBase
                            : !isBaseTokenMoneynessGreaterOrEqual)
                            ? Math.round(
                                  (bottomLimit - lowerBoundaryFill) / 10,
                              ) * 10
                            : bottomLimit - lowerBoundaryFill;
                } else {
                    for (let i = 1; i <= lowerBoudnaryFactor; i++) {
                        lowValues[i - 1] =
                            shouldRound &&
                            (!isAccountView
                                ? denominationsInBase
                                : !isBaseTokenMoneynessGreaterOrEqual)
                                ? Math.round(
                                      ((i === 1
                                          ? bottomLimit
                                          : lowValues[i - 2]) -
                                          Math.round(
                                              lowerBoundaryFill /
                                                  lowerBoudnaryFactor /
                                                  10,
                                          ) *
                                              10) /
                                          10,
                                  ) * 10
                                : (i === 1 ? bottomLimit : lowValues[i - 2]) -
                                  lowerBoundaryFill / lowerBoudnaryFactor;
                    }
                }

                const topBoundaryFill = Math.abs(
                    yScale.domain()[1] - diff / 2 - topLimit,
                );
                const topBoudnaryFactor = Math.ceil(topBoundaryFill / diff);

                const topValues: any = [];

                if (topBoudnaryFactor < 2) {
                    topValues[0] =
                        shouldRound &&
                        (!isAccountView
                            ? denominationsInBase
                            : !isBaseTokenMoneynessGreaterOrEqual)
                            ? Math.round((topLimit + topBoundaryFill) / 10) * 10
                            : topLimit + topBoundaryFill;
                } else {
                    for (let i = 1; i <= topBoudnaryFactor; i++) {
                        topValues[i - 1] =
                            shouldRound &&
                            (!isAccountView
                                ? denominationsInBase
                                : !isBaseTokenMoneynessGreaterOrEqual)
                                ? Math.round(
                                      ((i === 1 ? topLimit : topValues[i - 2]) +
                                          Math.round(
                                              topBoundaryFill /
                                                  topBoudnaryFactor /
                                                  10,
                                          ) *
                                              10) /
                                          10,
                                  ) * 10
                                : (i === 1 ? topLimit : topValues[i - 2]) +
                                  topBoundaryFill / topBoudnaryFactor;
                    }
                }

                const bandBoundaryFill = Math.abs(bottomLimit - topLimit);
                const bandBoudnaryFactor = Math.ceil(bandBoundaryFill / diff);

                const bandValues: any = [];

                if (bandBoundaryFill > diff) {
                    if (bandBoudnaryFactor < 2) {
                        bandValues[0] =
                            shouldRound &&
                            (!isAccountView
                                ? denominationsInBase
                                : !isBaseTokenMoneynessGreaterOrEqual)
                                ? Math.round(
                                      (topLimit - bandBoundaryFill) / 10,
                                  ) * 10
                                : topLimit - bandBoundaryFill;
                    } else {
                        for (let i = 1; i < bandBoudnaryFactor; i++) {
                            bandValues[i - 1] =
                                shouldRound &&
                                (!isAccountView
                                    ? denominationsInBase
                                    : !isBaseTokenMoneynessGreaterOrEqual)
                                    ? Math.round(
                                          (topLimit -
                                              bandBoundaryFill /
                                                  (bandBoudnaryFactor / i)) /
                                              10,
                                      ) * 10
                                    : topLimit -
                                      bandBoundaryFill /
                                          (bandBoudnaryFactor / i);
                        }
                    }
                }

                let linePrices = [];

                if (
                    shouldRound &&
                    (!isAccountView
                        ? denominationsInBase
                        : !isBaseTokenMoneynessGreaterOrEqual)
                ) {
                    linePrices =
                        Math.abs(
                            Math.round(topLimit / 10) * 10 -
                                Math.round(bottomLimit / 10) * 10,
                        ) >
                        diff / 2
                            ? [
                                  Math.round(topLimit / 10) * 10,
                                  Math.round(bottomLimit / 10) * 10,
                              ]
                            : [
                                  (Math.round(topLimit / 10) * 10 +
                                      Math.round(bottomLimit / 10) * 10) /
                                      2,
                              ];
                } else {
                    linePrices =
                        Math.abs(topLimit - bottomLimit) > diff / 2
                            ? [topLimit, bottomLimit]
                            : [(topLimit + bottomLimit) / 2];
                }

                yAxis.tickValues([
                    0,
                    ...linePrices,
                    ...lowValues,
                    ...topValues,
                    ...bandValues,
                ]);
            }

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
        nd?.requestRedraw();
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
            drawChart(
                graphData,
                scaleData,
                lineSeries,
                priceLine,
                crossPoint,
                horizontalBand,
            );
        }
    }, [
        scaleData,
        lineSeries,
        priceLine,
        graphData,
        crossPoint,
        transactionType,
        horizontalBand,
    ]);

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
                const buffer =
                    Math.abs(
                        scaleData.xScale.domain()[1].getTime() -
                            scaleData.xScale.domain()[0].getTime(),
                    ) / 30;

                const tickTempValues = scaleData.xScale.ticks(7);
                const tickValues: any[] = [];

                tickTempValues.map((tick: any) => {
                    if (
                        tick.getTime() + buffer <
                            scaleData.xScale.domain()[1].getTime() &&
                        tick.getTime() - buffer >
                            scaleData.xScale.domain()[0].getTime()
                    ) {
                        tickValues.push(tick);
                    }
                });

                const xAxis = d3fc
                    .axisBottom()
                    .scale(scaleData?.xScale)
                    .tickValues(tickValues);

                // const priceJoin = d3fc.dataJoin('g', 'priceJoin');
                // const startPriceJoin = d3fc.dataJoin('g', 'startPriceJoin');
                // const finishPriceJoin = d3fc.dataJoin('g', 'finishPriceJoin');
                const lineJoin = d3fc.dataJoin('g', 'lineJoin');
                const crossPointJoin = d3fc.dataJoin('g', 'crossPoint');

                const horizontalBandJoin = d3fc.dataJoin('g', 'horizontalBand');
                const horizontalBandData: any[] = [];

                d3.select(d3PlotGraph.current).on(
                    'measure',
                    function (event: any) {
                        scaleData?.xScale.range([0, event.detail.width]);
                        scaleData?.xScaleOriginal.range([
                            0,
                            event.detail.width,
                        ]);
                        scaleData?.yScale.range([event.detail.height, 0]);
                    },
                );

                // Zoom
                // d3.select(d3PlotGraph.current).on('measure.range', function (event: any) {
                //     const svg = d3.select(event.target).select('svg');

                //     const zoom = d3.zoom().on('zoom', (event: any) => {
                //         if (event.sourceEvent.type === 'wheel') {
                //             scaleData?.xScale.domain(
                //                 event.transform.rescaleX(scaleData?.xScaleOriginal).domain(),
                //             );
                //         } else {
                //             const domainX = scaleData?.xScale.domain();
                //             const linearX = d3
                //                 .scaleTime()
                //                 .domain(scaleData?.xScale.range())
                //                 .range([0, domainX[1] - domainX[0]]);

                //             const deltaX = linearX(-event.sourceEvent.movementX);
                //             scaleData?.xScale.domain([
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

                d3.select(d3PlotGraph.current).on(
                    'draw',
                    function (event: any) {
                        const svg = d3.select(event.target).select('svg');

                        if (
                            transactionType === 'limitOrder' &&
                            tx !== undefined
                        ) {
                            horizontalBandData[0] = [
                                (
                                    !isAccountView
                                        ? denominationsInBase
                                        : !isBaseTokenMoneynessGreaterOrEqual
                                )
                                    ? tx.bidTickInvPriceDecimalCorrected
                                    : tx.bidTickPriceDecimalCorrected,
                                (
                                    !isAccountView
                                        ? denominationsInBase
                                        : !isBaseTokenMoneynessGreaterOrEqual
                                )
                                    ? tx.askTickInvPriceDecimalCorrected
                                    : tx.askTickPriceDecimalCorrected,
                            ];

                            // finishPriceJoin(svg, [[denominationsInBase ? tx.bidTickInvPriceDecimalCorrected : tx.bidTickPriceDecimalCorrected]]).call(
                            //     priceLine,
                            // );
                            // startPriceJoin(svg, [[denominationsInBase ? tx.askTickInvPriceDecimalCorrected : tx.askTickPriceDecimalCorrected]]).call(priceLine);
                            horizontalBandJoin(svg, [horizontalBandData]).call(
                                horizontalBand,
                            );
                        }

                        if (
                            transactionType === 'liqchange' &&
                            tx !== undefined
                        ) {
                            if (tx.positionType !== 'ambient') {
                                horizontalBandData[0] = [
                                    (
                                        !isAccountView
                                            ? denominationsInBase
                                            : !isBaseTokenMoneynessGreaterOrEqual
                                    )
                                        ? tx.bidTickInvPriceDecimalCorrected
                                        : tx.bidTickPriceDecimalCorrected,
                                    (
                                        !isAccountView
                                            ? denominationsInBase
                                            : !isBaseTokenMoneynessGreaterOrEqual
                                    )
                                        ? tx.askTickInvPriceDecimalCorrected
                                        : tx.askTickPriceDecimalCorrected,
                                ];

                                // finishPriceJoin(svg, [[denominationsInBase ? tx.bidTickInvPriceDecimalCorrected : tx.bidTickPriceDecimalCorrected]]).call(
                                //     priceLine,
                                // );
                                // startPriceJoin(svg, [[denominationsInBase ? tx.askTickInvPriceDecimalCorrected : tx.askTickPriceDecimalCorrected]]).call(
                                //     priceLine,
                                // );
                                horizontalBandJoin(svg, [
                                    horizontalBandData,
                                ]).call(horizontalBand);
                            }
                        }

                        lineJoin(svg, [graphData]).call(lineSeries);

                        if (transactionType === 'swap' && tx !== undefined) {
                            // priceJoin(svg, [[tx.invPriceDecimalCorrected]]).call(priceLine);
                            crossPointJoin(svg, [
                                [
                                    {
                                        x: tx.txTime * 1000,
                                        y: (
                                            !isAccountView
                                                ? denominationsInBase
                                                : !isBaseTokenMoneynessGreaterOrEqual
                                        )
                                            ? tx.swapInvPriceDecimalCorrected
                                            : tx.swapPriceDecimalCorrected,
                                    },
                                ],
                            ]).call(crossPoint);
                        }

                        d3.select(d3Yaxis.current)
                            .select('svg')
                            .call(scaleData?.yAxis);
                        d3.select(d3Xaxis.current).select('svg').call(xAxis);
                    },
                );

                render();
            }
        },
        [tx],
    );

    const loadingSpinner = (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Spinner size={100} bg='var(--dark1)' />
        </div>
    );

    const placeholderImage = (
        <div className='transaction_details_graph_placeholder'></div>
    );

    const chartRender = (
        <div
            className='main_layout_chart'
            ref={graphMainDiv}
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
                <d3fc-svg
                    className='y-axis'
                    ref={d3Yaxis}
                    style={{ width: '10%' }}
                ></d3fc-svg>
            </div>
            <d3fc-svg
                className='x-axis'
                ref={d3Xaxis}
                style={{ height: '20px', width: '100%' }}
            ></d3fc-svg>
        </div>
    );
    let dataToRender;

    switch (true) {
        case isDataTakingTooLongToFetch || isDataEmpty:
            dataToRender = placeholderImage;
            break;
        case isDataLoading:
            dataToRender = loadingSpinner;
            break;
        default:
            dataToRender = chartRender;
    }
    return dataToRender;
}
