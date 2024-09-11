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
    lineValue,
    renderCanvasArray,
    setCanvasResolution,
} from '../../../../pages/platformAmbient/Chart/ChartUtils/chartUtils';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { useMediaQuery } from '@material-ui/core';
import TransactionDetailsLiquidityGraph from './TransactionDetailsLiquidityGraph';
import { CACHE_UPDATE_FREQ_IN_MS } from '../../../../ambient-utils/constants';
import { toDisplayPrice } from '@crocswap-libs/sdk';
import { ChartContext } from '../../../../contexts/ChartContext';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TransactionDetailsGraphIF {
    tx: any;
    timeFirstMintMemo: number | undefined;
    transactionType: string;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    isAccountView: boolean;
}

export default function TransactionDetailsGraph(
    props: TransactionDetailsGraphIF,
) {
    const {
        tx,
        timeFirstMintMemo,
        transactionType,
        isBaseTokenMoneynessGreaterOrEqual,
        isAccountView,
    } = props;
    const { chainData, crocEnv, activeNetwork } = useContext(CrocEnvContext);
    const { cachedFetchTokenPrice, cachedQuerySpotPrice } =
        useContext(CachedDataContext);

    const oneHourMiliseconds = 60 * 60 * 1000;
    const oneWeekMiliseconds = oneHourMiliseconds * 24 * 7;
    const isServerEnabled =
        import.meta.env.VITE_CACHE_SERVER_IS_ENABLED !== undefined
            ? import.meta.env.VITE_CACHE_SERVER_IS_ENABLED === 'true'
            : true;

    const baseTokenAddress = tx.base;
    const quoteTokenAddress = tx.quote;

    const {
        isDenomBase,
        currentPoolPriceTick,
        baseToken: baseOnTrade,
        quoteToken: quoteOnTrade,
    } = useContext(TradeDataContext);
    const { chartThemeColors } = useContext(ChartContext);

    const txPoolMatchesTrade =
        baseTokenAddress.toLowerCase() === baseOnTrade.address.toLowerCase() &&
        quoteTokenAddress.toLowerCase() === quoteOnTrade.address.toLowerCase();

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
    const [poolPricePixel, setPoolPricePixel] = useState(0);
    const [poolPrice, setPoolPrice] = useState(0);
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

    const verticalLineLabels = (isSmallRange: boolean) => {
        switch (tx.changeType) {
            case 'mint':
                return isSmallRange ? 'Add' : 'Add Liq.';
            case 'burn':
                return isSmallRange ? 'Remove' : 'Remove Liq. ';
            case 'harvest':
                return isSmallRange ? 'Harvest' : 'Harvest Liq. ';
            default:
                return '';
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
    const [svgWidth, setSvgWidth] = useState(0);

    const { chainId, base, quote, baseDecimals, quoteDecimals } = props.tx;

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
                timeFirstMintMemo === undefined;

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
                        return timeFirstMintMemo
                            ? timeFirstMintMemo
                            : tx.txTime;
                    case 'liqchange':
                        return timeFirstMintMemo
                            ? timeFirstMintMemo
                            : tx.txTime;
                    default:
                        return new Date().getTime();
                }
            };

            const minTime = time() * 1000 - oneWeekMiliseconds;

            const nowTime = Date.now();
            let diff = (nowTime - minTime) / 200;

            if (
                timeFirstMintMemo &&
                tx.txTime &&
                timeFirstMintMemo !== tx.txTime &&
                Math.abs(tx.txTime - nowTime) < oneWeekMiliseconds
            ) {
                diff = (Math.abs(tx.txTime - timeFirstMintMemo) * 1000) / 200;
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

                const offsetInSeconds = oneHourMiliseconds / 1000;

                const startBoundary =
                    Math.floor(localMaxTime / 1000) + offsetInSeconds;

                try {
                    if (!crocEnv) {
                        return;
                    }

                    const poolPriceNonDisplay = cachedQuerySpotPrice(
                        crocEnv,
                        base,
                        quote,
                        chainId,
                        Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
                    );

                    const poolPrice = toDisplayPrice(
                        await poolPriceNonDisplay,
                        baseDecimals,
                        quoteDecimals,
                    );

                    const poolPriceDisplay = (
                        !isAccountView
                            ? isDenomBase
                            : !isBaseTokenMoneynessGreaterOrEqual
                    )
                        ? 1 / poolPrice
                        : poolPrice;

                    setPoolPrice(poolPriceDisplay);

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
                        cachedQuerySpotPrice,
                    );

                    if (graphData) {
                        setIsDataEmpty(false);
                        setGraphData(() => {
                            return graphData.candles;
                        });
                    } else {
                        setGraphData(() => {
                            return undefined;
                        });
                        setIsDataEmpty(true);
                    }
                } catch (error) {
                    console.warn(error);
                }
            }
        })();
    }, [fetchEnabled, timeFirstMintMemo, tx.changeType]);

    useEffect(() => {
        if (scaleData !== undefined && chartThemeColors) {
            const d3LineColor = chartThemeColors.downCandleBorderColor?.copy();
            const d3RangeTriangleColor =
                chartThemeColors.downCandleBorderColor?.copy();
            const d3BandColor = chartThemeColors.downCandleBorderColor?.copy();

            if (d3RangeTriangleColor) d3RangeTriangleColor.opacity = 0.8;
            if (d3BandColor) d3BandColor.opacity = 0.075;

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
                    selection
                        .enter()
                        .style(
                            'stroke',
                            d3LineColor ? d3LineColor.toString() : '#7371FC',
                        );
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
                selection
                    .enter()
                    .attr(
                        'stroke',
                        d3RangeTriangleColor
                            ? d3RangeTriangleColor.toString()
                            : 'rgba(97, 71, 247, 0.8)',
                    );
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
                .label((d: any) => d.name)
                .value((d: any) => d.value)
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale);

            verticalDashLine.decorate((selection: any) => {
                selection.enter().select('line').attr('class', 'verticalLine');

                const topHandles = selection.select('g.top-handle').nodes();
                topHandles.forEach((element: any) => {
                    d3.select(element).style('font', '10px Lexend Deca');
                    d3.select(element).selectAll('text').style('fill', 'black');
                    const textWidth = (d3.select(element).select('text') as any)
                        .node()
                        .getBBox().width;
                    d3.select(element).selectAll('rect').remove();

                    if (textWidth) {
                        d3.select(element).attr(
                            'transform',
                            `translate(${textWidth / 2 - 1}, ${-19})`,
                        );

                        const textNode = d3.select(element) as any;
                        const bbox = textNode.node().getBBox();
                        textNode
                            .insert('rect', ':first-child')
                            .attr('x', bbox.x - 1)
                            .attr('y', bbox.y)
                            .attr('width', bbox.width + 2)
                            .attr('height', bbox.height)
                            .style('fill', '#61646F')
                            .attr('rx', 3);
                    }
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
                            .style(
                                'stroke',
                                d3RangeTriangleColor
                                    ? d3RangeTriangleColor.toString()
                                    : 'rgba(97, 71, 247, 0.8)',
                            )
                            .style(
                                'fill',
                                d3RangeTriangleColor
                                    ? d3RangeTriangleColor.toString()
                                    : 'rgba(97, 71, 247, 0.8)',
                            );
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
                    const time = timeFirstMintMemo
                        ? timeFirstMintMemo * 1000
                        : tx.txTime * 1000;
                    selection
                        .select('path')
                        .style(
                            'transform',
                            'translateX(' + scaleData.xScale(time) + 'px )',
                        );
                    selection
                        .select('path')
                        .attr(
                            'fill',
                            d3BandColor ? d3BandColor.toString() : '#7371FC1A',
                        );
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
        chartThemeColors,
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
        if (d3PlotGraph) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const svgDiv = d3.select(d3PlotGraph.current) as any;

            if (svgDiv) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const resizeObserver = new ResizeObserver((result: any) => {
                    const width = result[0].contentRect.width;

                    if (svgWidth !== width) {
                        setSvgWidth(width);
                    } else {
                        graphData &&
                            transactionType !== 'liqchange' &&
                            setIsDataLoading(false);
                    }
                });

                resizeObserver.observe(svgDiv.node());

                return () => resizeObserver.unobserve(svgDiv.node());
            }
        }
    }, [graphData, svgWidth]);

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
                    const time = timeFirstMintMemo
                        ? timeFirstMintMemo * 1000
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
                        timeFirstMintMemo,
                        tx.txTime,
                        tx.latestUpdateTime,
                    ]);

                    const minimumDifferenceMinMax = 75;

                    if (result) {
                        const minTime = result.min * 1000;
                        const maxTime = result.max * 1000;
                        const maxTimePixel = xScale(maxTime);

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

                        if (xScale(minTime) <= 0) {
                            xScale.domain([
                                minTime - 2 * bufferOneCandle,
                                xScale.domain()[1],
                            ]);
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
        timeFirstMintMemo,
        tx.swapInvPriceDecimalCorrected,
        tx.swapPriceDecimalCorrected,
        graphData,
        svgWidth,
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
        if (
            poolPricePixel &&
            scaleData &&
            graphData.length > 0 &&
            transactionType === 'liqchange'
        ) {
            const lastDataPixel = scaleData.xScale(graphData[0].time * 1000);
            const diff = lastDataPixel - poolPricePixel * 10 + 10;

            if (lastDataPixel > poolPricePixel * 10) {
                const newMaxDomain = scaleData?.xScale
                    .invert(svgWidth + diff)
                    .getTime();

                const oldMaxDomain = scaleData?.xScale.domain()[1];
                scaleData?.xScale.domain([
                    scaleData?.xScale.domain()[0],
                    Math.max(newMaxDomain, oldMaxDomain),
                ]);
            }
            render();
        }
    }, [scaleData, poolPricePixel, graphData]);

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
                            const time = timeFirstMintMemo
                                ? timeFirstMintMemo * 1000
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
                            const time = timeFirstMintMemo
                                ? timeFirstMintMemo * 1000
                                : tx.txTime * 1000;

                            const timeEnd =
                                tx.txTime &&
                                timeFirstMintMemo !== tx.txTime &&
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

                            const timeStart = timeFirstMintMemo
                                ? timeFirstMintMemo * 1000
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

                            const verticalLineData: lineValue[] = [];

                            let isSmallRange = false;

                            if (
                                tx.txTime &&
                                timeFirstMintMemo &&
                                tx.txTime !== timeFirstMintMemo
                            ) {
                                const diff = Math.abs(
                                    scaleData.xScale(tx.txTime * 1000) -
                                        scaleData.xScale(
                                            timeFirstMintMemo * 1000,
                                        ),
                                );

                                const checkDiffMinMax = diff > 30;

                                isSmallRange = diff < 70 && diff > 30;

                                if (
                                    !(
                                        (tx.changeType === 'mint' ||
                                            tx.positionType === 'ambient') &&
                                        diff < 10
                                    )
                                ) {
                                    const verticalLineDatum = {
                                        name: checkDiffMinMax
                                            ? verticalLineLabels(isSmallRange)
                                            : '',
                                        value: tx.txTime * 1000,
                                    };

                                    verticalLineData.push(verticalLineDatum);
                                }
                            }

                            if (
                                tx.latestUpdateTime &&
                                ((tx.txTime &&
                                    tx.latestUpdateTime !== tx.txTime) ||
                                    (timeFirstMintMemo &&
                                        tx.latestUpdateTime !==
                                            timeFirstMintMemo))
                            ) {
                                const diff = Math.abs(
                                    scaleData.xScale(timeStart) -
                                        scaleData.xScale(
                                            tx.latestUpdateTime * 1000,
                                        ),
                                );

                                isSmallRange = diff < 70 && diff > 30;
                                if (diff > 10) {
                                    verticalLineData.push({
                                        name:
                                            tx.positionLiq === 0
                                                ? ' Remove Liq.'
                                                : ' Update Liq.',
                                        value: tx.latestUpdateTime * 1000,
                                    });
                                }
                            }
                            verticalLineData.push({
                                name: isSmallRange ? 'Open' : 'Open Position',
                                value: timeStart,
                            });

                            verticalLinesJoin(svg, [verticalLineData]).call(
                                verticalDashLine,
                            );

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
            timeFirstMintMemo,
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
        <>
            {
                // access the width information of the chart before creating the chart
                isDataLoading && loadingSpinner
            }
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
                    <div
                        style={{
                            display: 'grid',
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden',
                            gridTemplateColumns: '1px auto 1fr auto',
                            gridTemplateRows:
                                'minmax(0em, max-content) auto 1fr auto',
                        }}
                    >
                        {transactionType === 'liqchange' && (
                            <TransactionDetailsLiquidityGraph
                                tx={tx}
                                isDenomBase={
                                    !(!isAccountView
                                        ? isDenomBase
                                        : !isBaseTokenMoneynessGreaterOrEqual)
                                }
                                yScale={scaleData?.yScale}
                                transactionType={transactionType}
                                poolPriceDisplay={poolPrice}
                                setPoolPricePixel={setPoolPricePixel}
                                poolPricePixel={poolPricePixel}
                                svgWidth={svgWidth}
                                lastCandleData={
                                    graphData ? graphData[0] : undefined
                                }
                                setIsDataLoading={setIsDataLoading}
                                chartThemeColors={chartThemeColors}
                                currentPoolPriceTick={
                                    isAccountView && !txPoolMatchesTrade
                                        ? undefined
                                        : currentPoolPriceTick
                                }
                            />
                        )}
                        <d3fc-svg
                            id='d3PlotGraph'
                            ref={d3PlotGraph}
                            style={{
                                width: '100%',
                                display: isDataLoading ? 'none' : 'inline',
                            }}
                        ></d3fc-svg>
                    </div>
                    <d3fc-canvas
                        className='y-axis'
                        ref={d3Yaxis}
                        style={{
                            width: mobileView ? '10%' : '15%',
                            display: isDataLoading ? 'none' : 'inline',
                        }}
                    ></d3fc-canvas>
                </div>
                <d3fc-canvas
                    className='x-axis'
                    ref={d3Xaxis}
                    style={{ height: '20px', width: '100%' }}
                ></d3fc-canvas>
            </div>
        </>
    );
    let dataToRender;

    switch (true) {
        case isDataTakingTooLongToFetch || isDataEmpty:
            dataToRender = placeholderImage;
            break;
        default:
            dataToRender = chartRender;
    }
    return dataToRender;
}
