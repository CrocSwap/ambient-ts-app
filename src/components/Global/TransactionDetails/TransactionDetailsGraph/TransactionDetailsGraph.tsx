import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ZERO_ADDRESS } from '../../../../constants';
import { testTokenMap } from '../../../../utils/data/testTokenMap';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

import './TransactionDetailsGraph.css';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import Spinner from '../../Spinner/Spinner';
import {
    formatAmountChartData,
    formatPoolPriceAxis,
} from '../../../../utils/numbers';
import {
    renderCanvasArray,
    setCanvasResolution,
} from '../../../../pages/Chart/Chart';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import { fetchCandleSeriesCroc } from '../../../../App/functions/fetchCandleSeries';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TransactionDetailsGraphIF {
    tx: any;
    transactionType: string;
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
    const { chainData, crocEnv } = useContext(CrocEnvContext);
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);
    const oneHourMiliseconds = 60 * 60 * 1000;

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
        chainId === '0x1'
            ? baseTokenAddress
            : baseTokenAddress === ZERO_ADDRESS
            ? baseTokenAddress
            : testTokenMap
                  .get(baseTokenAddress.toLowerCase() + '_' + chainId)
                  ?.split('_')[0];
    const mainnetQuoteTokenAddress =
        chainId === '0x1'
            ? quoteTokenAddress
            : quoteTokenAddress === ZERO_ADDRESS
            ? quoteTokenAddress
            : testTokenMap
                  .get(quoteTokenAddress.toLowerCase() + '_' + chainId)
                  ?.split('_')[0];

    const [graphData, setGraphData] = useState<any>();

    const d3PlotGraph = useRef(null);
    const d3Yaxis = useRef<HTMLInputElement | null>(null);
    const d3Xaxis = useRef(null);
    const graphMainDiv = useRef(null);

    const [scaleData, setScaleData] = useState<any>();
    const [lineSeries, setLineSeries] = useState<any>();
    const [crossPoint, setCrossPoint] = useState<any>();
    const [priceLine, setPriceLine] = useState();
    const [limitPriceLine, setLimitPriceLine] = useState();
    const [triangleRange, setTriangleRange] = useState();
    const [triangleLimit, setTriangleLimit] = useState();
    const [horizontalBand, setHorizontalBand] = useState();

    const [yAxis, setYaxis] = useState<any>();

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

                    const offsetInSeconds = 120;

                    const endTime =
                        Math.floor(new Date().getTime() / 1000) -
                        offsetInSeconds;

                    try {
                        if (!crocEnv) {
                            return;
                        }

                        const graphData = await fetchCandleSeriesCroc(
                            fetchEnabled,
                            chainData,
                            period,
                            baseTokenAddress,
                            quoteTokenAddress,
                            endTime,
                            numCandlesNeeded,
                            crocEnv,
                            cachedFetchTokenPrice,
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
                        console.warn(error);
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

            const limitPriceLine = d3fc
                .annotationSvgLine()
                .value((d: any) => d.y)
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale);

            limitPriceLine.decorate((selection: any, d: any) => {
                if (d[0].x) {
                    selection.nodes().forEach((context: any) => {
                        d3.select(context).attr(
                            'transform',
                            'translate(' +
                                scaleData.xScale(d[0].x * 1000) +
                                ',' +
                                scaleData?.yScale(d[0].y) +
                                ')',
                        );
                    });
                }

                selection.enter().select('g.right-handle').remove();
                selection
                    .enter()
                    .select('line')
                    .attr('class', 'limitPriceLine');
                selection.select('g.left-handle').remove();
            });

            setLimitPriceLine(() => {
                return limitPriceLine;
            });

            const triangleRange = d3fc
                .seriesSvgPoint()
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale)
                .crossValue(() => {
                    return scaleData.xScale.domain()[0];
                })
                .mainValue((d: any) => d)
                .size(90)
                .type(d3.symbolTriangle)
                .decorate((context: any, d: any) => {
                    context.nodes().forEach((selection: any, index: number) => {
                        const lastPx = scaleData.xScale(
                            scaleData.xScale.domain()[1],
                        );

                        d3.select(selection)
                            .attr(
                                'transform',
                                'translate(' +
                                    (index % 2 ? 0 : lastPx) +
                                    ',' +
                                    scaleData?.yScale(d[index]) +
                                    ') rotate(' +
                                    (index % 2 ? 90 : 270) +
                                    ')',
                            )
                            .style('stroke', 'rgba(97, 71, 247, 0.8)')
                            .style('fill', 'rgba(97, 71, 247, 0.8)');
                    });
                });

            setTriangleRange(() => {
                return triangleRange;
            });

            const triangleLimit = d3fc
                .seriesSvgPoint()
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale)
                .crossValue(() => {
                    return scaleData.xScale.domain()[0];
                })
                .mainValue((d: any) => d.y)
                .size(90)
                .type(d3.symbolTriangle)
                .decorate((context: any, d: any) => {
                    context.nodes().forEach((selection: any) => {
                        if (d[0].x) {
                            d3.select(selection).attr(
                                'transform',
                                'translate(' +
                                    scaleData.xScale(d[0].x * 1000) +
                                    ',' +
                                    scaleData?.yScale(d[0].y) +
                                    ') rotate(90)',
                            );
                        }
                    });
                });

            setTriangleLimit(() => {
                return triangleLimit;
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
                        ) / 8;

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
                        ) / 8;

                    const boundaries = [
                        Math.min(yExtent(graphData)[0], lowBoundary) - buffer,
                        Math.max(yExtent(graphData)[1], topBoundary) + buffer,
                    ];

                    yScale.domain(boundaries);
                } else {
                    yScale.domain(yExtent(graphData));
                }
            }

            const scaleData = {
                xScale: xScale,
                yScale: yScale,
            };

            setScaleData(() => {
                return scaleData;
            });
        }
    }, [tx, graphData]);

    useEffect(() => {
        if (scaleData) {
            const _yAxis = d3fc.axisRight().scale(scaleData?.yScale);

            setYaxis(() => {
                return _yAxis;
            });
        }
    }, [scaleData]);

    useEffect(() => {
        if (scaleData) {
            const d3YaxisCanvas = d3
                .select(d3Yaxis.current)
                .select('canvas')
                .node() as HTMLCanvasElement;

            if (d3YaxisCanvas) {
                const d3YaxisContext = d3YaxisCanvas.getContext(
                    '2d',
                ) as CanvasRenderingContext2D;

                d3.select(d3Yaxis.current).on('draw', function () {
                    if (yAxis) {
                        setCanvasResolution(d3YaxisCanvas);
                        drawYaxis(
                            d3YaxisContext,
                            scaleData?.yScale,
                            d3YaxisCanvas.width / (2 * window.devicePixelRatio),
                        );
                    }
                });

                renderCanvasArray([d3Yaxis]);
            }
        }
    }, [yAxis, scaleData, d3Yaxis]);

    const drawYaxis = (context: any, yScale: any, X: any) => {
        const canvas = d3
            .select(d3Yaxis.current)
            .select('canvas')
            .node() as HTMLCanvasElement;

        if (canvas !== null) {
            const height = canvas.height;

            const factor = height < 500 ? 6 : height.toString().length * 2;

            context.stroke();
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = 'rgba(189,189,189,0.6)';
            context.font = '10px Lexend Deca';

            const yScaleCopy = yScale.copy();

            const domain = yScale.domain();

            const buffer = Math.abs(domain[0] - domain[1]) / 30;

            yScaleCopy.domain([domain[0] + buffer, domain[1] - buffer]);

            const yScaleTicks = yScaleCopy.ticks(factor);

            let switchFormatter = false;

            yScaleTicks.forEach((element: any) => {
                if (element > 99999) {
                    switchFormatter = true;
                }
            });

            const formatTicks = switchFormatter
                ? formatPoolPriceAxis
                : formatAmountChartData;

            yScaleTicks.forEach((d: number) => {
                const digit = d.toString().split('.')[1]?.length;

                const isScientific = d.toString().includes('e');

                if (isScientific) {
                    const splitNumber = d.toString().split('e');
                    const subString =
                        Math.abs(Number(splitNumber[1])) -
                        (splitNumber.includes('.') ? 2 : 1);

                    const precision = splitNumber[0]
                        .toString()
                        .replace('.', '');

                    const factor = Math.pow(10, 3 - precision.length);

                    const textHeight =
                        context.measureText('0.0').actualBoundingBoxAscent +
                        context.measureText('0.0').actualBoundingBoxDescent;

                    context.beginPath();
                    context.fillText(
                        '0.0',
                        X -
                            context.measureText('0.0').width / 2 -
                            context.measureText(subString).width / 2,
                        yScale(d),
                    );
                    context.fillText(subString, X, yScale(d) + textHeight / 3);
                    context.fillText(
                        factor * Number(precision),
                        X +
                            context.measureText(factor * Number(precision))
                                .width /
                                2 +
                            context.measureText(subString).width / 2,
                        yScale(d),
                    );
                } else {
                    context.beginPath();
                    context.fillText(
                        formatTicks(d, digit ? digit : 2),
                        X,
                        yScale(d),
                    );
                }
            });

            render();
        }
    };

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
            triangleRange !== undefined &&
            triangleLimit !== undefined &&
            limitPriceLine !== undefined &&
            priceLine !== undefined
        ) {
            drawChart(
                graphData,
                scaleData,
                lineSeries,
                priceLine,
                limitPriceLine,
                crossPoint,
                horizontalBand,
                triangleRange,
                triangleLimit,
            );
        }
    }, [
        scaleData,
        lineSeries,
        priceLine,
        limitPriceLine,
        graphData,
        crossPoint,
        transactionType,
        horizontalBand,
        triangleRange,
        triangleLimit,
    ]);

    const drawChart = useCallback(
        (
            graphData: any,
            scaleData: any,
            lineSeries: any,
            priceLine: any,
            limitPriceLine: any,
            crossPoint: any,
            horizontalBand: any,
            triangleRange: any,
            triangleLimit: any,
        ) => {
            if (graphData.length > 0) {
                const minDomain = scaleData.xScale.domain()[0].getTime();
                const maxDomain = scaleData.xScale.domain()[1].getTime();
                const buffer = Math.abs(maxDomain - minDomain) / 30;

                if (transactionType === 'limitOrder' && tx !== undefined) {
                    if (tx.timeFirstMint * 1000 + buffer >= maxDomain) {
                        scaleData?.xScale.domain([
                            minDomain,
                            maxDomain + oneHourMiliseconds * 5,
                        ]);
                    }

                    // if (tx.timeFirstMint*1000-buffer <= minDomain) {
                    //     scaleData?.xScale.domain([tx.timeFirstMint*1000-oneHourMiliseconds * 24 ,maxDomain])
                    // }
                }
                const tickTempValues = scaleData.xScale.ticks(7);
                const tickValues: any[] = [];

                tickTempValues.map((tick: any) => {
                    if (
                        tick.getTime() + buffer < maxDomain &&
                        tick.getTime() - buffer > minDomain
                    ) {
                        tickValues.push(tick);
                    }
                });

                const xAxis = d3fc
                    .axisBottom()
                    .scale(scaleData?.xScale)
                    .tickValues(tickValues);

                const lineJoin = d3fc.dataJoin('g', 'lineJoin');
                const crossPointJoin = d3fc.dataJoin('g', 'crossPoint');

                const horizontalBandJoin = d3fc.dataJoin('g', 'horizontalBand');
                const horizontalBandData: any[] = [];

                const rangelinesJoin = d3fc.dataJoin('g', 'rangeLines');
                const limitPriceLineJoin = d3fc.dataJoin('g', 'limitPriceLine');
                const triangleRangeJoin = d3fc.dataJoin('g', 'triangleRange');
                const triangleLimitJoin = d3fc.dataJoin('g', 'triangleLimit');

                d3.select(d3PlotGraph.current).on(
                    'measure',
                    function (event: any) {
                        scaleData?.xScale.range([0, event.detail.width]);
                        scaleData?.yScale.range([event.detail.height, 0]);
                    },
                );

                d3.select(d3PlotGraph.current).on(
                    'draw',
                    function (event: any) {
                        const svg = d3.select(event.target).select('svg');

                        if (
                            transactionType === 'limitOrder' &&
                            tx !== undefined
                        ) {
                            if (tx.timeFirstMint === undefined) {
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

                                horizontalBandJoin(svg, [
                                    horizontalBandData,
                                ]).call(horizontalBand);
                            } else if (tx.claimableLiq > 0) {
                                crossPointJoin(svg, [
                                    [
                                        {
                                            x: tx.timeFirstMint
                                                ? tx.timeFirstMint * 1000
                                                : tx.txTime * 1000,
                                            y: (
                                                !isAccountView
                                                    ? denominationsInBase
                                                    : !isBaseTokenMoneynessGreaterOrEqual
                                            )
                                                ? tx.askTickInvPriceDecimalCorrected
                                                : tx.askTickPriceDecimalCorrected,
                                        },
                                    ],
                                ]).call(crossPoint);
                            } else {
                                const limitLine = [
                                    {
                                        y: (
                                            !isAccountView
                                                ? denominationsInBase
                                                : !isBaseTokenMoneynessGreaterOrEqual
                                        )
                                            ? tx.askTickInvPriceDecimalCorrected
                                            : tx.askTickPriceDecimalCorrected,

                                        x: tx.timeFirstMint,
                                    },
                                ];

                                limitPriceLineJoin(svg, [limitLine]).call(
                                    limitPriceLine,
                                );

                                triangleLimitJoin(svg, [limitLine]).call(
                                    triangleLimit,
                                );
                            }
                        }

                        if (
                            transactionType === 'liqchange' &&
                            tx !== undefined
                        ) {
                            if (tx.positionType !== 'ambient') {
                                const bidLine = (
                                    !isAccountView
                                        ? denominationsInBase
                                        : !isBaseTokenMoneynessGreaterOrEqual
                                )
                                    ? tx.bidTickInvPriceDecimalCorrected
                                    : tx.bidTickPriceDecimalCorrected;

                                const askLine = (
                                    !isAccountView
                                        ? denominationsInBase
                                        : !isBaseTokenMoneynessGreaterOrEqual
                                )
                                    ? tx.askTickInvPriceDecimalCorrected
                                    : tx.askTickPriceDecimalCorrected;

                                horizontalBandData[0] = [bidLine, askLine];

                                const rangeLinesData = [bidLine, askLine];

                                const triangleData = [
                                    bidLine,
                                    bidLine,
                                    askLine,
                                    askLine,
                                ];

                                horizontalBandJoin(svg, [
                                    horizontalBandData,
                                ]).call(horizontalBand);

                                rangelinesJoin(svg, [rangeLinesData]).call(
                                    priceLine,
                                );

                                triangleRangeJoin(svg, [triangleData]).call(
                                    triangleRange,
                                );
                            }
                        }

                        lineJoin(svg, [graphData]).call(lineSeries);

                        if (transactionType === 'swap' && tx !== undefined) {
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

                        d3.select(d3Xaxis.current).select('svg').call(xAxis);
                    },
                );

                render();
            }
        },
        [tx],
    );

    const loadingSpinner = <Spinner size={100} bg='var(--dark1)' centered />;

    const placeholderImage = (
        <div className='transaction_details_graph_placeholder' />
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
                    style={{ width: '90%' }}
                ></d3fc-svg>

                <d3fc-canvas
                    className='y-axis'
                    ref={d3Yaxis}
                    style={{ width: '10%' }}
                ></d3fc-canvas>
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
