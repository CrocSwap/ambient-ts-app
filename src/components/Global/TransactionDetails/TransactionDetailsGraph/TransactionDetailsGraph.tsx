import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import './TransactionDetailsGraph.css';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import Spinner from '../../Spinner/Spinner';
import {
    formatAmountChartData,
    formatPoolPriceAxis,
} from '../../../../utils/numbers';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import { getFormattedNumber } from '../../../../ambient-utils/dataLayer';
import { fetchCandleSeriesCroc } from '../../../../ambient-utils/api';
import moment from 'moment';
import {
    renderCanvasArray,
    setCanvasResolution,
} from '../../../../pages/Chart/ChartUtils/chartUtils';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { useMediaQuery } from '@material-ui/core';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TransactionDetailsGraphIF {
    tx: any;
    // timeFirstMint?: number | undefined;
    transactionType: string;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    isAccountView: boolean;
}

export default function TransactionDetailsGraph(
    props: TransactionDetailsGraphIF,
) {
    const {
        tx,
        // timeFirstMint,
        transactionType,
        isBaseTokenMoneynessGreaterOrEqual,
        isAccountView,
    } = props;
    const { chainData, crocEnv, activeNetwork } = useContext(CrocEnvContext);
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);
    const oneHourMiliseconds = 60 * 60 * 1000;
    const oneWeekMiliseconds = oneHourMiliseconds * 24 * 7;
    const isServerEnabled =
        process.env.REACT_APP_CACHE_SERVER_IS_ENABLED !== undefined
            ? process.env.REACT_APP_CACHE_SERVER_IS_ENABLED === 'true'
            : true;

    const baseTokenAddress = tx.base;
    const quoteTokenAddress = tx.quote;

    const { isDenomBase } = useContext(TradeDataContext);

    const [graphData, setGraphData] = useState<any>();

    const d3PlotGraph = useRef(null);
    const d3Yaxis = useRef<HTMLCanvasElement | null>(null);
    const d3Xaxis = useRef<HTMLCanvasElement | null>(null);
    const graphMainDiv = useRef(null);

    const [scaleData, setScaleData] = useState<any>();
    const [lineSeries, setLineSeries] = useState<any>();
    const [crossPoint, setCrossPoint] = useState<any>();
    const [priceLine, setPriceLine] = useState();
    const [limitPriceLine, setLimitPriceLine] = useState();
    const [verticalDashLine, setVerticalDashLine] = useState();
    const [triangleRange, setTriangleRange] = useState();
    const [triangleLimit, setTriangleLimit] = useState();
    const [horizontalBand, setHorizontalBand] = useState();
    const [period, setPeriod] = useState<number | undefined>();
    const [yAxis, setYaxis] = useState<any>();
    const [xAxis, setXaxis] = useState<any>();
    const takeSmallerPeriodForRemoveRange = (diff: number) => {
        if (diff <= 600) {
            return 300;
        } else if (diff <= 3600) {
            return 900;
        } else if (diff <= 14400) {
            return 3600;
        } else if (diff <= 40000) {
            return 14400;
        } else {
            return 86400;
        }
    };

    const fetchEnabled = !!(
        chainData &&
        isServerEnabled &&
        baseTokenAddress &&
        quoteTokenAddress
    );

    const [isDataEmpty, setIsDataEmpty] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [isDataTakingTooLongToFetch, setIsDataTakingTooLongToFetch] =
        useState(false);
    const mobileView = useMediaQuery('(min-width: 800px)');

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
            const isTimeFirstMintInRemovalRange =
                transactionType === 'liqchange' &&
                tx.changeType !== 'mint' &&
                tx.timeFirstMint === undefined;

            if (isTimeFirstMintInRemovalRange) {
                return;
            }

            if (graphData === undefined) {
                setIsDataLoading(true);
            }
            const time = () => {
                switch (transactionType) {
                    case 'swap':
                        return tx.txTime;
                    case 'limitOrder':
                        return tx.timeFirstMint ? tx.timeFirstMint : tx.txTime;
                    case 'liqchange':
                        return tx.timeFirstMint ? tx.timeFirstMint : tx.txTime;
                    default:
                        return new Date().getTime();
                }
            };

            const minTime = time() * 1000 - oneWeekMiliseconds;

            const nowTime = Date.now();
            let diff = (nowTime - minTime) / 200;

            if (
                tx.timeFirstMint &&
                tx.txTime &&
                tx.timeFirstMint !== tx.txTime &&
                Math.abs(tx.txTime - nowTime) < oneWeekMiliseconds
            ) {
                diff = (Math.abs(tx.txTime - tx.timeFirstMint) * 1000) / 200;
            }
            let tempPeriod = takeSmallerPeriodForRemoveRange(
                Math.floor(diff / 1000),
            );

            if (nowTime - time() * 1000 < oneWeekMiliseconds) {
                tempPeriod = 3600;
            }

            setPeriod(tempPeriod);
            if (tempPeriod !== undefined) {
                const maxNumCandlesNeeded = 2999;

                const localMaxTime = nowTime + 2 * 1000 * tempPeriod;
                const localMinTime = minTime - 5 * 1000 * tempPeriod;
                const calcNumberCandlesNeeded = Math.floor(
                    (localMaxTime - localMinTime) / (tempPeriod * 1000),
                );

                const numCandlesNeeded = Math.min(
                    calcNumberCandlesNeeded,
                    maxNumCandlesNeeded,
                );

                const offsetInSeconds = 120;

                const startBoundary =
                    Math.floor(localMaxTime / 1000) - offsetInSeconds;

                try {
                    if (!crocEnv) {
                        return;
                    }
                    const graphData = await fetchCandleSeriesCroc(
                        fetchEnabled,
                        chainData,
                        activeNetwork.graphCacheUrl,
                        tempPeriod,
                        baseTokenAddress,
                        quoteTokenAddress,
                        startBoundary,
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
        })();
    }, [fetchEnabled, tx.timeFirstMint, tx.changeType]);

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
                            ? isDenomBase
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
                .seriesSvgLine()
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale)
                .crossValue((d: any) => d.x)
                .mainValue((d: any) => d.y);

            priceLine.decorate((selection: any) => {
                selection.enter().attr('class', 'priceLine');
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
                                scaleData.xScale(d[0].x) +
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

            const verticalDashLine = d3fc
                .annotationSvgLine()
                .orient('vertical')
                .label((d: any) => d.label)
                .value((d: any) => d.time)
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale);

            verticalDashLine.decorate((selection: any) => {
                selection.enter().select('line').attr('class', 'verticalLine');

                const topHandles = selection.select('g.top-handle').nodes();
                topHandles.forEach((element: any, i: number) => {
                    d3.select(element).attr(
                        'transform',
                        `translate(${35 + -i * 14}, ${-19})`,
                    );

                    d3.select(element).style('font', '10px Lexend Deca');
                    d3.select(element).selectAll('text').style('fill', 'black');

                    d3.select(element).selectAll('rect').remove();
                    const textNode = d3.select(element) as any;
                    const bbox = textNode.node().getBBox();
                    textNode
                        .insert('rect', ':first-child')
                        .attr('x', bbox.x - 3)
                        .attr('y', bbox.y)
                        .attr('width', bbox.width + 6)
                        .attr('height', bbox.height)
                        .style('fill', '#61646F')
                        .attr('rx', 3);
                });
            });

            setVerticalDashLine(() => {
                return verticalDashLine;
            });

            const triangleRange = d3fc
                .seriesSvgPoint()
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale)
                .crossValue((d: any) => d.x)
                .mainValue((d: any) => d.y)
                .size(50)
                .type(d3.symbolTriangle)
                .decorate((context: any, d: any) => {
                    context.nodes().forEach((selection: any, index: number) => {
                        d3.select(selection)
                            .attr(
                                'transform',
                                'translate(' +
                                    (scaleData?.xScale(d[index].x) +
                                        (index % 2 ? -4 : +4)) +
                                    ',' +
                                    scaleData?.yScale(d[index].y) +
                                    ') rotate(' +
                                    (index % 2 ? 270 : 90) +
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
                                    scaleData.xScale(d[0].x) +
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
                .xScale(scaleData.xScaleCopy)
                .yScale(scaleData?.yScale)
                .fromValue((d: any) => d[0])
                .toValue((d: any) => d[1])
                .decorate((selection: any) => {
                    const time = tx.timeFirstMint
                        ? tx.timeFirstMint * 1000
                        : tx.txTime * 1000;
                    selection
                        .select('path')
                        .style(
                            'transform',
                            'translateX(' + scaleData.xScale(time) + 'px )',
                        );
                    selection.select('path').attr('fill', '#7371FC1A');
                });

            setHorizontalBand(() => {
                return horizontalBand;
            });
        }
    }, [
        scaleData,
        isDenomBase,
        isAccountView,
        !isBaseTokenMoneynessGreaterOrEqual,
    ]);

    function findMinMaxTime(data: any[]) {
        if (!data || data.length === 0) {
            return null;
        }

        const filteredData = data.filter(
            (item: any) => typeof item === 'number' && !isNaN(item),
        );
        if (filteredData.length === 0 || filteredData.length === 1) {
            return null;
        }

        const minValue = Math.min(...filteredData);
        const maxValue = Math.max(...filteredData);

        return {
            min: minValue,
            max: maxValue,
        };
    }

    useEffect(() => {
        if (graphData !== undefined && period !== undefined) {
            const yExtent = d3fc
                .extentLinear()
                .accessors([
                    (d: any) =>
                        (
                            !isAccountView
                                ? isDenomBase
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

            const localDomain = xExtent(graphData);

            const minDomain = localDomain[0].getTime();
            const maxDomain = localDomain[1].getTime();

            const svgDiv = d3.select(graphMainDiv.current) as any;

            const svg = svgDiv.select('svg').node() as HTMLCanvasElement;

            if (svg) {
                const svgHeight = svg.getBoundingClientRect().height;
                const svgWidth = svg.getBoundingClientRect().width;

                xScale.range([0, svgWidth]);
                yScale.range([svgHeight, 0]);

                xScale.domain([minDomain, maxDomain]);

                const minDomainPixel = xScale(minDomain);
                const maxDomainPixel = xScale(maxDomain);

                const bufferOneCandle = period * 1000;
                const bufferPixel = 30;
                const oneCandlePixel =
                    xScale(maxDomain) - xScale(maxDomain - period * 1000);

                if (
                    transactionType === 'limitOrder' &&
                    tx !== undefined &&
                    period
                ) {
                    const time = tx.timeFirstMint
                        ? tx.timeFirstMint * 1000
                        : tx.txTime * 1000;

                    const maxDiffPixel = maxDomainPixel - xScale(time);
                    const minDiffPixel = xScale(time) - minDomainPixel;
                    const candleCountForBuffer = bufferPixel / oneCandlePixel;

                    if (maxDiffPixel < 30) {
                        xScale.domain([
                            minDomain,
                            maxDomain + bufferOneCandle * candleCountForBuffer,
                        ]);
                    }

                    if (minDiffPixel < 30) {
                        xScale.domain([
                            time - bufferOneCandle * candleCountForBuffer,
                            maxDomain,
                        ]);
                    }
                }

                if (transactionType === 'swap') {
                    const bufferPixel =
                        maxDomainPixel - xScale(tx.txTime * 1000);
                    const tempBuffer = 30 / oneCandlePixel;

                    if (bufferPixel < 10) {
                        xScale.domain([
                            minDomain,
                            maxDomain + bufferOneCandle * tempBuffer,
                        ]);
                    }

                    if (xScale(tx.txTime * 1000) - minDomainPixel < 10) {
                        xScale.domain([
                            tx.txTime * 1000 - bufferOneCandle * tempBuffer,
                            maxDomain,
                        ]);
                    }
                }

                if (transactionType === 'liqchange') {
                    const result = findMinMaxTime([
                        tx.timeFirstMint,
                        tx.txTime,
                        tx.latestUpdateTime,
                    ]);
                    const hasVerticalLines =
                        tx.changeType === 'mint' ||
                        tx.positionType === 'ambient';

                    const minimumDifferenceMinMax = hasVerticalLines ? 80 : 20;

                    if (result) {
                        const minTime = result.min * 1000;
                        const maxTime = result.max * 1000;
                        let minTimePixel = xScale(minTime);
                        let maxTimePixel = xScale(maxTime);

                        const maxDomainPixel = svgWidth;
                        const diffDomainBetweenLastTime =
                            maxDomainPixel - maxTimePixel;

                        if (
                            diffDomainBetweenLastTime < minimumDifferenceMinMax
                        ) {
                            const newMaxDomain = xScale.invert(
                                maxDomainPixel +
                                    (minimumDifferenceMinMax -
                                        diffDomainBetweenLastTime),
                            );

                            xScale.domain([xScale.domain()[0], newMaxDomain]);
                        }

                        if (xScale(minTime) < 0) {
                            xScale.domain([
                                minTime - 2 * bufferOneCandle,
                                xScale.domain()[1],
                            ]);
                        }

                        minTimePixel = xScale(minTime);
                        maxTimePixel = xScale(maxTime);
                        const diffMinMaxPixel = maxTimePixel - minTimePixel;

                        if (
                            minTime !== maxTime &&
                            diffMinMaxPixel < minimumDifferenceMinMax &&
                            diffMinMaxPixel > 25
                        ) {
                            const checkDiffMinMax =
                                maxTimePixel - minTimePixel <
                                    minimumDifferenceMinMax &&
                                maxTimePixel !== minTimePixel;

                            if (checkDiffMinMax) {
                                const candleCountMax =
                                    (xScale.domain()[1].getTime() - maxTime) /
                                    (1000 * period);

                                xScale.domain([
                                    Math.min(
                                        minTime - bufferOneCandle,
                                        xScale.invert(30).getTime(),
                                    ),
                                    Math.max(
                                        xScale
                                            .invert(
                                                xScale(maxTime) +
                                                    minimumDifferenceMinMax,
                                            )
                                            .getTime(),
                                        minTime +
                                            (candleCountMax / 3) *
                                                bufferOneCandle,
                                    ),
                                ]);
                            }
                        }
                    }
                }

                if (transactionType === 'swap') {
                    if (tx !== undefined) {
                        addExtraCandle(
                            tx.txTime,
                            tx.swapInvPriceDecimalCorrected,
                            tx.swapPriceDecimalCorrected,
                        );
                    }

                    yScale.domain(yExtent(graphData));

                    const yDomainMin = yScale.domain()[0];
                    const yDomainMax = yScale.domain()[1];

                    if (yDomainMin === yDomainMax) {
                        const buffer = (5 * yDomainMax) / svgHeight;

                        yScale.domain([
                            yDomainMin - buffer,
                            yDomainMax + buffer,
                        ]);
                    }
                } else if (transactionType === 'limitOrder') {
                    if (tx !== undefined) {
                        const lowBoundary = Math.min(
                            (
                                !isAccountView
                                    ? isDenomBase
                                    : !isBaseTokenMoneynessGreaterOrEqual
                            )
                                ? tx.askTickInvPriceDecimalCorrected
                                : tx.askTickPriceDecimalCorrected,
                            (
                                !isAccountView
                                    ? isDenomBase
                                    : !isBaseTokenMoneynessGreaterOrEqual
                            )
                                ? tx.bidTickInvPriceDecimalCorrected
                                : tx.bidTickPriceDecimalCorrected,
                        );
                        const topBoundary = Math.max(
                            (
                                !isAccountView
                                    ? isDenomBase
                                    : !isBaseTokenMoneynessGreaterOrEqual
                            )
                                ? tx.askTickInvPriceDecimalCorrected
                                : tx.askTickPriceDecimalCorrected,
                            (
                                !isAccountView
                                    ? isDenomBase
                                    : !isBaseTokenMoneynessGreaterOrEqual
                            )
                                ? tx.bidTickInvPriceDecimalCorrected
                                : tx.bidTickPriceDecimalCorrected,
                        );

                        const buffer =
                            Math.abs(
                                Math.min(yExtent(graphData)[0], lowBoundary) -
                                    Math.max(
                                        yExtent(graphData)[1],
                                        topBoundary,
                                    ),
                            ) / 8;

                        const boundaries = [
                            Math.min(yExtent(graphData)[0], lowBoundary) -
                                buffer,
                            Math.max(yExtent(graphData)[1], topBoundary) +
                                buffer,
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
                                    ? isDenomBase
                                    : !isBaseTokenMoneynessGreaterOrEqual
                            )
                                ? tx.askTickInvPriceDecimalCorrected
                                : tx.askTickPriceDecimalCorrected,
                            (
                                !isAccountView
                                    ? isDenomBase
                                    : !isBaseTokenMoneynessGreaterOrEqual
                            )
                                ? tx.bidTickInvPriceDecimalCorrected
                                : tx.bidTickPriceDecimalCorrected,
                        );
                        const topBoundary = Math.max(
                            (
                                !isAccountView
                                    ? isDenomBase
                                    : !isBaseTokenMoneynessGreaterOrEqual
                            )
                                ? tx.askTickInvPriceDecimalCorrected
                                : tx.askTickPriceDecimalCorrected,
                            (
                                !isAccountView
                                    ? isDenomBase
                                    : !isBaseTokenMoneynessGreaterOrEqual
                            )
                                ? tx.bidTickInvPriceDecimalCorrected
                                : tx.bidTickPriceDecimalCorrected,
                        );

                        const buffer =
                            Math.abs(
                                Math.min(yExtent(graphData)[0], lowBoundary) -
                                    Math.max(
                                        yExtent(graphData)[1],
                                        topBoundary,
                                    ),
                            ) / 8;

                        const boundaries = [
                            Math.min(yExtent(graphData)[0], lowBoundary) -
                                buffer,
                            Math.max(yExtent(graphData)[1], topBoundary) +
                                buffer,
                        ];

                        yScale.domain(boundaries);
                    } else {
                        yScale.domain(yExtent(graphData));
                    }
                }

                const scaleData = {
                    xScale: xScale,
                    yScale: yScale,
                    xScaleCopy: xScale.copy(),
                };

                setScaleData(() => {
                    return scaleData;
                });
            }
        }
    }, [
        tx.askTickInvPriceDecimalCorrected,
        tx.askTickPriceDecimalCorrected,
        tx.bidTickPriceDecimalCorrected,
        tx.bidTickInvPriceDecimalCorrected,
        tx.positionType,
        tx?.txTime,
        tx?.timeFirstMint,
        tx.swapInvPriceDecimalCorrected,
        tx.swapPriceDecimalCorrected,
        JSON.stringify(graphData),
    ]);

    useEffect(() => {
        if (scaleData) {
            const _yAxis = d3fc.axisRight().scale(scaleData?.yScale);

            setYaxis(() => {
                return _yAxis;
            });

            const xAxis = d3fc.axisBottom().scale(scaleData?.xScale);

            setXaxis(() => {
                return xAxis;
            });
        }
    }, [scaleData]);

    useEffect(() => {
        if (scaleData) {
            const d3XaxisCanvas = d3
                .select(d3Xaxis.current)
                .select('canvas')
                .node() as HTMLCanvasElement;

            if (d3XaxisCanvas) {
                const d3XaxisContext = d3XaxisCanvas.getContext(
                    '2d',
                ) as CanvasRenderingContext2D;

                d3.select(d3Xaxis.current).on('draw', function () {
                    if (xAxis) {
                        setCanvasResolution(d3XaxisCanvas);
                        drawXaxis(d3XaxisContext, scaleData?.xScale, 3);
                    }
                });

                renderCanvasArray([d3Xaxis]);
            }
        }
    }, [xAxis, scaleData, d3Xaxis, period]);

    const drawXaxis = (context: any, xScale: any, Y: any) => {
        if (period) {
            const _width = 15; // magic number of pixels to surrounding price
            const minDomainLocation = scaleData?.xScale.range()[0];
            const maxDomainLocation = scaleData?.xScale.range()[1];

            const tickSize = 6;
            let formatValue = undefined;

            context.beginPath();
            context.textAlign = 'center';
            context.textBaseline = 'top';
            context.fillStyle = 'rgba(189,189,189,0.6)';
            context.font = '10px Lexend Deca';

            const factor = mobileView ? 7 : 5;

            const tickTempValues = scaleData.xScale.ticks(factor);

            tickTempValues.map((tick: any) => {
                if (
                    moment(tick).format('HH:mm') === '00:00' ||
                    period === 86400
                ) {
                    formatValue = moment(tick).format('MMM DD');
                } else {
                    formatValue = moment(tick).format('HH:mm');
                }

                if (
                    moment(tick)
                        .format('DD')
                        .match(/^(01)$/) &&
                    moment(tick).format('HH:mm') === '00:00'
                ) {
                    formatValue =
                        moment(tick).format('MMM') === 'Jan'
                            ? moment(tick).format('YYYY')
                            : moment(tick).format('MMM');
                }

                if (
                    !(
                        minDomainLocation >= xScale(tick) - _width &&
                        minDomainLocation <= xScale(tick) + _width
                    ) &&
                    !(
                        maxDomainLocation >= xScale(tick) - _width &&
                        maxDomainLocation <= xScale(tick) + _width
                    )
                ) {
                    context.fillText(formatValue, xScale(tick), Y + tickSize);
                }
            });
            context.restore();

            renderCanvasArray([d3Xaxis]);
        }
    };

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

            let factor = height < 500 ? 6 : height.toString().length * 2;
            if (!mobileView) {
                factor = 5;
            }
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

                    const scientificValue = getFormattedNumber({
                        value: d,
                        abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
                    });

                    const textScientificArray = scientificValue.split('0.0');
                    const textScientific = textScientificArray[1].slice(1, 4);

                    const factor = Math.pow(10, 3 - textScientific.length);

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
                        factor * Number(textScientific),
                        X +
                            context.measureText(factor * Number(textScientific))
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
            priceLine !== undefined &&
            verticalDashLine !== undefined
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
                verticalDashLine,
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
        verticalDashLine,
    ]);

    const addExtraCandle = (
        time: number,
        askTickInvPriceDecimalCorrected: number,
        askTickPriceDecimalCorrected: number,
    ) => {
        graphData?.push({
            time: time,
            invPriceCloseExclMEVDecimalCorrected:
                askTickInvPriceDecimalCorrected,
            priceCloseExclMEVDecimalCorrected: askTickPriceDecimalCorrected,
        });
    };

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
            verticalDashLine: any,
        ) => {
            if (graphData.length > 0) {
                const lineJoin = d3fc.dataJoin('g', 'lineJoin');
                const crossPointJoin = d3fc.dataJoin('g', 'crossPoint');

                const horizontalBandJoin = d3fc.dataJoin('g', 'horizontalBand');
                const horizontalBandData: any[] = [];

                const rangelinesJoin = d3fc.dataJoin('g', 'rangeLines');

                const limitPriceLineJoin = d3fc.dataJoin('g', 'limitPriceLine');
                const triangleRangeJoin = d3fc.dataJoin('g', 'triangleRange');
                const triangleLimitJoin = d3fc.dataJoin('g', 'triangleLimit');
                const verticalLinesJoin = d3fc.dataJoin('g', 'verticalLines');
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
                            const time = tx.timeFirstMint
                                ? tx.timeFirstMint * 1000
                                : tx.txTime * 1000;
                            if (tx.claimableLiq > 0) {
                                addExtraCandle(
                                    time / 1000,
                                    tx.askTickInvPriceDecimalCorrected,
                                    tx.askTickPriceDecimalCorrected,
                                );
                                crossPointJoin(svg, [
                                    [
                                        {
                                            x: time,
                                            y: (
                                                !isAccountView
                                                    ? isDenomBase
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
                                                ? isDenomBase
                                                : !isBaseTokenMoneynessGreaterOrEqual
                                        )
                                            ? tx.askTickInvPriceDecimalCorrected
                                            : tx.askTickPriceDecimalCorrected,

                                        x: time,
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
                            const time = tx.timeFirstMint
                                ? tx.timeFirstMint * 1000
                                : tx.txTime * 1000;

                            const timeEnd =
                                tx.txTime &&
                                tx.timeFirstMint !== tx.txTime &&
                                tx.changeType !== 'mint'
                                    ? tx.txTime * 1000
                                    : scaleData.xScale.domain()[1].getTime();

                            scaleData.xScaleCopy.domain(
                                scaleData.xScale.domain(),
                            );
                            scaleData.xScaleCopy.range([
                                0,
                                scaleData.xScale(timeEnd) -
                                    scaleData.xScale(time),
                            ]);

                            const bidLine = (
                                !isAccountView
                                    ? isDenomBase
                                    : !isBaseTokenMoneynessGreaterOrEqual
                            )
                                ? tx.bidTickInvPriceDecimalCorrected
                                : tx.bidTickPriceDecimalCorrected;

                            const askLine = (
                                !isAccountView
                                    ? isDenomBase
                                    : !isBaseTokenMoneynessGreaterOrEqual
                            )
                                ? tx.askTickInvPriceDecimalCorrected
                                : tx.askTickPriceDecimalCorrected;

                            horizontalBandData[0] = [bidLine, askLine];

                            const timeStart = tx.timeFirstMint
                                ? tx.timeFirstMint * 1000
                                : tx.txTime * 1000;

                            const rangeLinesDataBid = [
                                { x: timeStart, y: bidLine },
                                { x: timeEnd, y: bidLine },
                            ];

                            const rangeLinesDataAsk = [
                                { x: timeStart, y: askLine },
                                { x: timeEnd, y: askLine },
                            ];

                            const triangleData = [
                                { x: timeStart, y: bidLine },
                                {
                                    x: timeEnd,
                                    y: bidLine,
                                },
                                { x: timeStart, y: askLine },
                                {
                                    x: timeEnd,
                                    y: askLine,
                                },
                            ];

                            if (
                                (tx.changeType === 'mint' ||
                                    tx.positionType === 'ambient') &&
                                period
                            ) {
                                const checkDiffMinUpdate =
                                    Math.abs(
                                        scaleData.xScale(timeStart) -
                                            scaleData.xScale(
                                                tx.latestUpdateTime * 1000,
                                            ),
                                    ) > 30;

                                const mintData = [
                                    { label: 'Open Position', time: timeStart },
                                ];

                                if (
                                    tx.txTime &&
                                    tx.timeFirstMint &&
                                    tx.txTime !== tx.timeFirstMint
                                ) {
                                    const checkDiffMinMax =
                                        Math.abs(
                                            scaleData.xScale(tx.txTime * 1000) -
                                                scaleData.xScale(
                                                    tx.timeFirstMint * 1000,
                                                ),
                                        ) > 30;

                                    checkDiffMinMax &&
                                        mintData.push({
                                            label: 'Add Liq.',
                                            time: tx.txTime * 1000,
                                        });
                                }

                                if (
                                    tx.latestUpdateTime &&
                                    checkDiffMinUpdate &&
                                    ((tx.txTime &&
                                        tx.latestUpdateTime !== tx.txTime) ||
                                        (tx.timeFirstMint &&
                                            tx.latestUpdateTime !==
                                                tx.timeFirstMint))
                                ) {
                                    mintData.push({
                                        label: ' Updated',
                                        time: tx.latestUpdateTime * 1000,
                                    });
                                }

                                verticalLinesJoin(svg, [mintData]).call(
                                    verticalDashLine,
                                );
                            }

                            if (tx.positionType !== 'ambient') {
                                horizontalBandJoin(svg, [
                                    horizontalBandData,
                                ]).call(horizontalBand);

                                svg.selectAll('.priceLine').remove();
                                rangelinesJoin(svg, [
                                    rangeLinesDataBid,
                                    rangeLinesDataAsk,
                                ]).call(priceLine);

                                triangleRangeJoin(svg, [triangleData]).call(
                                    triangleRange,
                                );
                            }
                        }

                        if (transactionType === 'swap' && tx !== undefined) {
                            crossPointJoin(svg, [
                                [
                                    {
                                        x: tx.txTime * 1000,
                                        y: (
                                            !isAccountView
                                                ? isDenomBase
                                                : !isBaseTokenMoneynessGreaterOrEqual
                                        )
                                            ? tx.swapInvPriceDecimalCorrected
                                            : tx.swapPriceDecimalCorrected,
                                    },
                                ],
                            ]).call(crossPoint);
                        }

                        lineJoin(svg, [
                            graphData.sort((a: any, b: any) => b.time - a.time),
                        ]).call(lineSeries);
                    },
                );

                render();
            }
        },
        [
            tx?.txTime,
            tx?.timeFirstMint,
            tx.swapInvPriceDecimalCorrected,
            tx.swapPriceDecimalCorrected,
            tx.bidTickInvPriceDecimalCorrected,
            tx.bidTickPriceDecimalCorrected,
            tx.askTickInvPriceDecimalCorrected,
            tx.askTickPriceDecimalCorrected,
            graphData,
        ],
    );

    const loadingSpinner = <Spinner size={100} bg='var(--dark1)' centered />;

    const placeholderImage = (
        <div className='transaction_details_graph_placeholder' />
    );

    const chartRender = (
        <div
            className='transaction_details_graph'
            ref={graphMainDiv}
            data-testid={'chart'}
            style={{
                height: '100%',
                width: '100%',
                padding: '3px',
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
                    style={{ width: mobileView ? '10%' : '15%' }}
                ></d3fc-canvas>
            </div>
            <d3fc-canvas
                className='x-axis'
                ref={d3Xaxis}
                style={{ height: '20px', width: '100%' }}
            ></d3fc-canvas>
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
