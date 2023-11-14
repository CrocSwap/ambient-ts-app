import { useContext, useEffect, useRef, useState } from 'react';

import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { useLocation } from 'react-router-dom';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { getPinnedPriceValuesFromTicks } from '../../Trade/Range/rangeFunctions';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { RangeContext } from '../../../contexts/RangeContext';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { createTriangle } from '../ChartUtils/triangle';
import {
    lineValue,
    renderCanvasArray,
    scaleData,
    setCanvasResolution,
} from '../ChartUtils/chartUtils';

interface propsIF {
    scaleData: scaleData | undefined;
    tokenA: TokenIF;
    tokenB: TokenIF;
    isDenomBase: boolean;
    rescale: boolean | undefined;
    currentPoolPriceTick: number;
    poolPriceDisplay: number;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    changeScale: any;
    isTokenABase: boolean;
    chainId: string;
    topBoundary: number | undefined;
    period: number;
    ranges: Array<lineValue>;
    setRanges: React.Dispatch<React.SetStateAction<lineValue[]>>;
    liqMode: string;
    liqTransitionPointforCurve: number;
    liqTransitionPointforDepth: number;
    lineSellColor: string;
    lineBuyColor: string;
}

export default function RangeLinesChart(props: propsIF) {
    const {
        scaleData,
        tokenA,
        tokenB,
        isDenomBase,
        currentPoolPriceTick,
        poolPriceDisplay,
        rescale,
        changeScale,
        isTokenABase,
        chainId,
        topBoundary,
        period,
        ranges,
        setRanges,
        liqMode,
        liqTransitionPointforCurve,
        liqTransitionPointforDepth,
        lineSellColor,
        lineBuyColor,
    } = props;

    const d3CanvasRangeLine = useRef<HTMLCanvasElement | null>(null);

    const location = useLocation();
    const position = location?.state?.position;

    const tradeData = useAppSelector((state) => state.tradeData);

    const {
        minRangePrice: minPrice,
        maxRangePrice: maxPrice,
        rescaleRangeBoundariesWithSlider,

        simpleRangeWidth,
    } = useContext(RangeContext);

    const tokenADecimals = tokenA.decimals;
    const tokenBDecimals = tokenB.decimals;
    const baseTokenDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteTokenDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const [horizontalLine, setHorizontalLine] = useState<any>();
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const [horizontalBand, setHorizontalBand] = useState<any>();
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const [triangle, setTriangle] = useState<any>();

    useEffect(() => {
        if (scaleData !== undefined) {
            const horizontalLine = d3fc
                .annotationCanvasLine()
                .value((d: any) => d.value)
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale);

            horizontalLine.decorate((context: any) => {
                context.visibility =
                    location.pathname.includes('pool') ||
                    location.pathname.includes('reposition')
                        ? 'visible'
                        : 'hidden';
                context.strokeStyle = 'var(--accent2)';
                context.fillStyle = 'transparent';
                context.pointerEvents = 'none';
                context.lineWidth = 1.5;
            });

            const horizontalBand = d3fc
                .annotationCanvasBand()
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale)
                .fromValue((d: any) => d[0])
                .toValue((d: any) => d[1])
                .decorate((context: any) => {
                    context.fillStyle = '#7371FC1A';
                });

            const triangleRange = createTriangle(
                scaleData?.xScale,
                scaleData?.yScale,
            );

            setTriangle(() => {
                return triangleRange;
            });

            setHorizontalLine(() => {
                return horizontalLine;
            });

            setHorizontalBand(() => {
                return horizontalBand;
            });
        }
    }, [scaleData]);

    useEffect(() => {
        if (
            minPrice !== 0 &&
            maxPrice !== 0 &&
            !isNaN(maxPrice) &&
            !isNaN(minPrice) &&
            topBoundary !== undefined
        ) {
            setRanges((prevState: lineValue[]) => {
                const newTargets = [...prevState];
                newTargets.filter(
                    (target: lineValue) => target.name === 'Max',
                )[0].value =
                    !tradeData.advancedMode && simpleRangeWidth === 100
                        ? topBoundary
                        : maxPrice;

                newTargets.filter(
                    (target: lineValue) => target.name === 'Min',
                )[0].value =
                    !tradeData.advancedMode && simpleRangeWidth === 100
                        ? 0
                        : minPrice;

                return newTargets;
            });
        }
    }, [minPrice, maxPrice, tradeData.advancedMode, simpleRangeWidth]);

    useEffect(() => {
        if (position !== undefined) {
            setBalancedLines(true);
        }
    }, [position?.positionId]);

    useEffect(() => {
        if (location.pathname.includes('reposition')) {
            setBalancedLines();
        }
    }, [location.pathname]);

    useEffect(() => {
        const isRange =
            location.pathname.includes('pool') ||
            location.pathname.includes('reposition');

        d3.select(d3CanvasRangeLine.current)
            .select('canvas')
            .style('display', isRange ? 'inline' : 'none');
    }, [
        location,
        location.pathname,
        period,
        simpleRangeWidth,
        tradeData.advancedMode,
    ]);

    useEffect(() => {
        if (
            location.pathname.includes('pool') ||
            location.pathname.includes('reposition')
        ) {
            const canvas = d3
                .select(d3CanvasRangeLine.current)
                .select('canvas')
                .node() as HTMLCanvasElement;
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

            if (horizontalLine && horizontalBand) {
                d3.select(d3CanvasRangeLine.current)
                    .on('draw', () => {
                        if (
                            location.pathname.includes('pool') ||
                            location.pathname.includes('reposition')
                        ) {
                            setCanvasResolution(canvas);
                            ctx.setLineDash([20, 18]);
                            horizontalLine(ranges);
                            horizontalBand([
                                [ranges[0].value, ranges[1].value],
                            ]);
                            triangle([ranges[0].value, ranges[1].value]);
                        }
                    })
                    .on('measure', () => {
                        ctx.setLineDash([20, 18]);
                        horizontalLine.context(ctx);
                        horizontalBand.context(ctx);
                        triangle.context(ctx);
                    });
            }
        }
    }, [ranges, horizontalLine, location.pathname]);

    useEffect(() => {
        const passValue =
            liqMode === 'curve'
                ? liqTransitionPointforCurve
                : liqTransitionPointforDepth;

        if (triangle !== undefined) {
            let color = 'rgba(235, 235, 255)';

            triangle.decorate((context: any, datum: any) => {
                color = datum > passValue ? lineSellColor : lineBuyColor;
                const rotateDegree = 90;
                context.rotate((rotateDegree * Math.PI) / 180);
                context.strokeStyle = color;
                context.fillStyle = color;
            });
        }

        if (
            horizontalLine !== undefined &&
            (location.pathname.includes('pool') ||
                location.pathname.includes('reposition'))
        ) {
            horizontalLine.decorate((context: any, datum: any) => {
                context.visibility =
                    location.pathname.includes('pool') ||
                    location.pathname.includes('reposition')
                        ? 'visible'
                        : 'hidden';
                context.strokeStyle =
                    datum.value > passValue ? lineSellColor : lineBuyColor;
                context.pointerEvents = 'none';
                context.lineWidth = 1.5;
                context.fillStyle = 'transparent';
            });
        }
    }, [
        horizontalLine,
        ranges,
        triangle,
        location.pathname,
        liqMode,
        liqTransitionPointforCurve,
        liqTransitionPointforDepth,
    ]);

    useEffect(() => {
        displayHorizontalLines();
    }, [simpleRangeWidth, tradeData.advancedMode, location]);

    const displayHorizontalLines = () => {
        if (
            location.pathname.includes('reposition') ||
            location.pathname.includes('pool')
        ) {
            if (tradeData.advancedMode || simpleRangeWidth !== 100) {
                d3.select(d3CanvasRangeLine.current)
                    .select('canvas')
                    .style('display', 'inline');
            } else {
                d3.select(d3CanvasRangeLine.current)
                    .select('canvas')
                    .style('display', 'none');
            }
        }
    };

    const setBalancedLines = (isRepositionLinesSet = false) => {
        if (tokenA.address !== tokenB.address) {
            if (
                location.pathname.includes('reposition') &&
                position !== undefined &&
                isRepositionLinesSet
            ) {
                const lowTick = currentPoolPriceTick - 10 * 100;
                const highTick = currentPoolPriceTick + 10 * 100;

                const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                    isDenomBase,
                    position.baseDecimals || 18,
                    position.quoteDecimals || 18,
                    lowTick,
                    highTick,
                    lookupChain(position.chainId).gridSize,
                );

                setRanges((prevState: lineValue[]) => {
                    const newTargets = [...prevState];

                    newTargets.filter(
                        (target: lineValue) => target.name === 'Max',
                    )[0].value = Number(
                        pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                    );

                    newTargets.filter(
                        (target: lineValue) => target.name === 'Min',
                    )[0].value = Number(
                        pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                    );

                    return newTargets;
                });
            } else if (
                simpleRangeWidth === 100 ||
                rescaleRangeBoundariesWithSlider
            ) {
                if (simpleRangeWidth === 100) {
                    setDefaultRangeData();
                } else {
                    setRanges((prevState: lineValue[]) => {
                        const newTargets = [...prevState];

                        newTargets.filter(
                            (target: lineValue) => target.name === 'Max',
                        )[0].value = maxPrice !== undefined ? maxPrice : 0;

                        newTargets.filter(
                            (target: lineValue) => target.name === 'Min',
                        )[0].value = minPrice !== undefined ? minPrice : 0;

                        if (
                            poolPriceDisplay !== undefined &&
                            rescaleRangeBoundariesWithSlider &&
                            rescale
                        ) {
                            changeScale();
                        }

                        return newTargets;
                    });
                }
            } else {
                const lowTick =
                    currentPoolPriceTick - (simpleRangeWidth || 10) * 100;
                const highTick =
                    currentPoolPriceTick + (simpleRangeWidth || 10) * 100;

                const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                    isDenomBase,
                    baseTokenDecimals,
                    quoteTokenDecimals,
                    lowTick,
                    highTick,
                    lookupChain(chainId).gridSize,
                );
                setRanges((prevState: lineValue[]) => {
                    const newTargets = [...prevState];

                    newTargets.filter(
                        (target: lineValue) => target.name === 'Max',
                    )[0].value = Number(
                        pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                    );

                    newTargets.filter(
                        (target: lineValue) => target.name === 'Min',
                    )[0].value = Number(
                        pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                    );

                    return newTargets;
                });
            }
        }
    };

    useEffect(() => {
        renderCanvasArray([d3CanvasRangeLine]);
    }, [ranges, liqTransitionPointforDepth, liqTransitionPointforCurve]);

    const setDefaultRangeData = () => {
        if (scaleData) {
            const maxPrice = topBoundary !== undefined ? topBoundary : Infinity;

            setRanges((prevState: lineValue[]) => {
                const newTargets = [...prevState];
                newTargets.filter(
                    (target: lineValue) => target.name === 'Max',
                )[0].value = maxPrice;
                newTargets.filter(
                    (target: lineValue) => target.name === 'Min',
                )[0].value = 0;

                return newTargets;
            });

            d3.select(d3CanvasRangeLine.current)
                .select('canvas')
                .style('display', 'none');
        }
    };

    return (
        <d3fc-canvas
            ref={d3CanvasRangeLine}
            className='range-line-canvas'
            id='range-line-canvas'
        ></d3fc-canvas>
    );
}
