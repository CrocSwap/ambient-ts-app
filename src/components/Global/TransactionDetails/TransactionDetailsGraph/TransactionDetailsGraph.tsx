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
import { ChainDataContext } from '../../../../contexts/ChainDataContext';

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
    const [triangleRange, setTriangleRange] = useState();
    const [triangleLimit, setTriangleLimit] = useState();
    const [horizontalBand, setHorizontalBand] = useState();
    const { isActiveNetworkBlast } = useContext(ChainDataContext);

    const [period, setPeriod] = useState<number | undefined>();

    const [yAxis, setYaxis] = useState<any>();
    const [xAxis, setXaxis] = useState<any>();

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

    const takeSmallerPeriodForRemoveRange = (diff: number) => {
        if (diff <= 60) {
            return 60;
        } else if (diff <= 300) {
            return 60;
        } else if (diff <= 900) {
            return 300;
        } else if (diff <= 3600) {
            return 900;
        } else if (diff <= 14400) {
            return 3600;
        } else {
            return 14400;
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
                        return tx?.txTime !== undefined
                            ? tx.txTime
                            : new Date().getTime();
                    case 'limitOrder':
                        return tx?.txTime !== undefined
                            ? tx?.txTime
                            : tx.timeFirstMint;
                    case 'liqchange':
                        return tx.timeFirstMint !== undefined
                            ? tx.timeFirstMint
                            : tx.txTime;
                    default:
                        return new Date().getTime();
                }
            };

            let minDateDiff = oneHourMiliseconds * 24 * 7;

            if (transactionType === 'swap') {
                minDateDiff = oneHourMiliseconds * 8;
            }

            const minDate = time() * 1000 - minDateDiff;

            const diff =
                new Date().getTime() - minDate < 43200000
                    ? 43200000
                    : new Date().getTime() - minDate;

            let startTime = undefined;

            let period = isActiveNetworkBlast
                ? 300
                : decidePeriod(Math.floor(diff / 1000 / 200));

            const isTxLiqRemove =
                transactionType === 'liqchange' &&
                (tx.changeType === 'burn' || tx.changeType === 'harvest');

            if (isTxLiqRemove) {
                const diffTime = Math.abs(tx.txTime - tx.timeFirstMint);
                if (diffTime < period) {
                    period = takeSmallerPeriodForRemoveRange(diffTime);
                    startTime = tx.txTime + 5 * period;
                }
            }

            setPeriod(period);
            if (period !== undefined) {
                const calcNumberCandlesNeeded = Math.floor(
                    (diff * 2) / (period * 1000),
                );
                const maxNumCandlesNeeded = 2999;

                const numCandlesNeeded = startTime
                    ? 25
                    : calcNumberCandlesNeeded < maxNumCandlesNeeded
                    ? calcNumberCandlesNeeded
                    : maxNumCandlesNeeded;

                const offsetInSeconds = 120;

                const startBoundary = startTime
                    ? startTime
                    : Math.floor(new Date().getTime() / 1000) - offsetInSeconds;

                try {
                    if (!crocEnv) {
                        return;
                    }
                    const graphData = await fetchCandleSeriesCroc(
                        fetchEnabled,
                        chainData,
                        activeNetwork.graphCacheUrl,
                        period,
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

    useEffect(() => {
        if (graphData !== undefined) {
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
            xScale.domain(localDomain);

            const minDomain = localDomain[0].getTime();
            const maxDomain = localDomain[1].getTime();

            if (transactionType === 'limitOrder' && tx !== undefined) {
                const buffer = oneHourMiliseconds * 24 * 3;
                const time = tx.timeFirstMint
                    ? tx.timeFirstMint * 1000
                    : tx.txTime * 1000;

                if (time + buffer >= maxDomain) {
                    xScale.domain([minDomain, maxDomain + buffer]);
                }

                if (time - buffer <= minDomain) {
                    xScale.domain([time - buffer, maxDomain]);
                }
            }

            if (transactionType === 'swap') {
                const buffer = oneHourMiliseconds * 1;

                if (tx.txTime * 1000 + buffer >= maxDomain) {
                    xScale.domain([minDomain, maxDomain + buffer]);
                }

                if (tx.txTime * 1000 - buffer <= minDomain) {
                    xScale.domain([tx.txTime * 1000 - buffer, maxDomain]);
                }
            }

            if (transactionType === 'liqchange' && period) {
                const buffer = period * 1000;
                const firstTime = tx.timeFirstMint
                    ? tx.timeFirstMint * 1000
                    : tx.txTime * 1000;

                const lastTime = tx.txTime
                    ? tx.txTime * 1000
                    : tx.timeFirstMint * 1000;

                if (lastTime + buffer * 3 >= maxDomain) {
                    xScale.domain([
                        xScale.domain()[0].getTime(),
                        maxDomain + buffer * 20,
                    ]);
                }

                if (firstTime - buffer * 3 <= minDomain) {
                    xScale.domain([
                        firstTime - buffer * 100,
                        xScale.domain()[1].getTime(),
                    ]);
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
                xScaleCopy: xScale.copy(),
            };

            setScaleData(() => {
                return scaleData;
            });
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
        graphData,
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
                            if (tx.positionType !== 'ambient') {
                                const time = tx.timeFirstMint
                                    ? tx.timeFirstMint * 1000
                                    : tx.txTime * 1000;

                                const timeEnd =
                                    tx.txTime &&
                                    tx.timeFirstMint !== tx.txTime &&
                                    tx.changeType !== 'mint'
                                        ? tx.txTime * 1000
                                        : scaleData.xScale
                                              .domain()[1]
                                              .getTime();

                                // zoom in when short period of time between mint and last candle
                                // const bandPixel =
                                //     scaleData.xScale(timeEnd) -
                                //     scaleData.xScale(time);

                                // if (bandPixel < 20 && period) {
                                //     const tempDomain =
                                //         timeEnd + period * 1000 * 40;
                                //     const newMaxDomain = Math.min(
                                //         tempDomain,
                                //         scaleData.xScale.domain()[1].getTime(),
                                //     );
                                //     scaleData.xScale.domain([
                                //         time - period * 1000 * 20,
                                //         newMaxDomain,
                                //     ]);
                                // }

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
