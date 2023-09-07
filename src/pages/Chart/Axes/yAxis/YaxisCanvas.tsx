import { useEffect, useRef, useState, MouseEvent, memo } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useLocation } from 'react-router-dom';
import {
    formatAmountChartData,
    formatPoolPriceAxis,
} from '../../../../utils/numbers';
import { createRectLabel } from './YaxisUtils';
import { LiquidityDataLocal } from '../../../Trade/TradeCharts/TradeCharts';
import {
    diffHashSig,
    diffHashSigScaleData,
} from '../../../../utils/functions/diffHashSig';
import {
    crosshair,
    fillLiqAdvanced,
    lineValue,
    liquidityChartData,
    renderCanvasArray,
    renderSubchartCrCanvas,
    scaleData,
    setCanvasResolution,
    standardDeviation,
} from '../../ChartUtils/chartUtils';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';

interface yAxisIF {
    scaleData: scaleData | undefined;
    market: number;
    liqMode: string;
    liqTransitionPointforCurve: number;
    liqTransitionPointforDepth: number;
    lineSellColor: string;
    lineBuyColor: string;
    ranges: Array<lineValue>;
    limit: number;
    isAmbientOrAdvanced: boolean;
    checkLimitOrder: boolean;
    sellOrderStyle: string;
    crosshairActive: string;
    crosshairData: Array<crosshair>;
    reset: boolean | undefined;
    isLineDrag: boolean | undefined;
    setRescale: React.Dispatch<React.SetStateAction<boolean>>;
    setCrosshairActive: React.Dispatch<React.SetStateAction<string>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setMarketLineValue: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: any;
    liquidityData: liquidityChartData | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dragRange: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dragLimit: any;
    denomInBase: boolean;
    setYaxisWidth: React.Dispatch<React.SetStateAction<string>>;
    yAxisWidth: string;
    simpleRangeWidth: number;
    poolPriceDisplay: number;
    isChartZoom: boolean;
}

type yLabel = {
    x: number;
    y: number;
    width: number;
    height: number;
};

function YAxisCanvas(props: yAxisIF) {
    const {
        scaleData,
        ranges,
        liqMode,
        lineSellColor,
        lineBuyColor,
        market,
        liqTransitionPointforCurve,
        liqTransitionPointforDepth,
        isAmbientOrAdvanced,
        limit,
        checkLimitOrder,
        sellOrderStyle,
        crosshairActive,
        crosshairData,
        reset,
        isLineDrag,
        setRescale,
        setMarketLineValue,
        render,
        liquidityData,
        dragRange,
        dragLimit,
        setCrosshairActive,
        denomInBase,
        setYaxisWidth,
        yAxisWidth,
        simpleRangeWidth,
        poolPriceDisplay,
        isChartZoom,
    } = props;

    const d3Yaxis = useRef<HTMLInputElement | null>(null);

    const [yAxisLabels] = useState<yLabel[]>([]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [yAxis, setYaxis] = useState<any>();

    const [yAxisZoom, setYaxisZoom] =
        useState<d3.ZoomBehavior<Element, unknown>>();

    const [yAxisCanvasWidth, setYaxisCanvasWidth] = useState(70);

    const tradeData = useAppSelector((state) => state.tradeData);

    const location = useLocation();

    useEffect(() => {
        if (scaleData) {
            const _yAxis = d3fc.axisRight().scale(scaleData?.yScale);

            setYaxis(() => {
                return _yAxis;
            });
        }
    }, [scaleData, location]);

    function changeyAxisWidth() {
        let yTickValueLength =
            formatPoolPriceAxis(scaleData?.yScale.ticks()[0]).length - 1;
        let result = false;
        scaleData?.yScale.ticks().forEach((element: number) => {
            if (formatPoolPriceAxis(element).length > 4) {
                result = true;
                yTickValueLength =
                    yTickValueLength > formatPoolPriceAxis(element).length - 1
                        ? yTickValueLength
                        : formatPoolPriceAxis(element).length - 1;
            }
        });
        if (result) {
            if (yTickValueLength > 4 && yTickValueLength < 8) {
                setYaxisWidth('6rem');
                setYaxisCanvasWidth(70);
            }
            if (yTickValueLength >= 8) {
                setYaxisWidth('7rem');
                setYaxisCanvasWidth(85);
            }
            if (yTickValueLength >= 10) {
                setYaxisWidth('8rem');
                setYaxisCanvasWidth(100);
            }
            if (yTickValueLength >= 13) {
                setYaxisWidth('9rem');
                setYaxisCanvasWidth(117);
            }
            if (yTickValueLength >= 15) {
                setYaxisWidth('10rem');
                setYaxisCanvasWidth(134);
            }
            if (yTickValueLength >= 16) {
                setYaxisCanvasWidth(142);
            }
            if (yTickValueLength >= 17) {
                setYaxisCanvasWidth(147);
            }
            if (yTickValueLength >= 20) {
                setYaxisWidth('11rem');
                setYaxisCanvasWidth(152);
            }
        }
        if (yTickValueLength <= 4) setYaxisWidth('5rem');
    }

    const sameLocationRange = () => {
        if (scaleData) {
            const low = ranges.filter(
                (target: lineValue) => target.name === 'Min',
            )[0].value;
            const high = ranges.filter(
                (target: lineValue) => target.name === 'Max',
            )[0].value;

            if (high >= low) {
                const resultData =
                    scaleData?.yScale(low) - scaleData?.yScale(high);
                const resultLocationData = resultData < 0 ? -20 : 20;
                const isSameLocation = Math.abs(resultData) < 20;
                const sameLocationData =
                    scaleData?.yScale(high) + resultLocationData;

                return {
                    isSameLocationMin: isSameLocation,
                    sameLocationDataMin: sameLocationData,
                    isSameLocationMax: false,
                    sameLocationDataMax: 0,
                };
            } else {
                const resultData =
                    scaleData?.yScale(low) - scaleData?.yScale(high);
                const resultLocationData = resultData < 0 ? -20 : 20;
                const isSameLocation = Math.abs(resultData) < 20;
                const sameLocationData =
                    scaleData?.yScale(low) - resultLocationData;

                return {
                    isSameLocationMin: false,
                    sameLocationDataMin: 0,
                    isSameLocationMax: isSameLocation,
                    sameLocationDataMax: sameLocationData,
                };
            }
        }

        return {
            isSameLocationMin: false,
            sameLocationDataMin: 0,
            isSameLocationMax: false,
            sameLocationDataMax: 0,
        };
    };

    const sameLocationLimit = () => {
        if (scaleData) {
            const resultData =
                scaleData?.yScale(limit) - scaleData?.yScale(market);
            const resultLocationData = resultData < 0 ? -20 : 20;
            const isSameLocation = Math.abs(resultData) < 20;
            const sameLocationData =
                scaleData?.yScale(market) + resultLocationData;
            return {
                isSameLocation: isSameLocation,
                sameLocationData: sameLocationData,
            };
        }
        return {
            isSameLocation: false,
            sameLocationData: 0,
        };
    };

    const drawYaxis = (
        context: CanvasRenderingContext2D,
        yScale: d3.ScaleLinear<number, number>,
        X: number,
    ) => {
        yAxisLabels.length = 0;
        const low = ranges.filter(
            (target: lineValue) => target.name === 'Min',
        )[0].value;
        const high = ranges.filter(
            (target: lineValue) => target.name === 'Max',
        )[0].value;

        const canvas = d3
            .select(d3Yaxis.current)
            .select('canvas')
            .node() as HTMLCanvasElement;

        if (canvas !== null) {
            const height = canvas.height;

            const factor = height < 500 ? 5 : height.toString().length * 2;

            context.stroke();
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = 'rgba(189,189,189,0.8)';
            context.font = '12.425px Lexend Deca';

            const yScaleTicks = yScale.ticks(factor);

            const switchFormatter =
                yScaleTicks.find((element: number) => {
                    return element > 99999;
                }) !== undefined;

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

                    const textHeight =
                        context.measureText('0.0').actualBoundingBoxAscent +
                        context.measureText('0.0').actualBoundingBoxDescent;

                    context.beginPath();
                    context.fillText(
                        '0.0',
                        X -
                            context.measureText('0.0').width / 2 -
                            context.measureText(subString.toString()).width / 2,
                        yScale(d),
                    );
                    context.fillText(
                        subString.toString(),
                        X,
                        yScale(d) + textHeight / 3,
                    );

                    context.fillText(
                        textScientific,
                        X +
                            context.measureText(textScientific).width / 2 +
                            context.measureText(subString.toString()).width / 2,
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

            if (market) {
                const isScientificMarketTick = market.toString().includes('e');

                let marketSubString = undefined;

                let marketTick = getFormattedNumber({
                    value: market,
                    abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
                }).replace(',', '');
                if (isScientificMarketTick) {
                    const splitNumber = market.toString().split('e');
                    marketSubString =
                        Math.abs(Number(splitNumber[1])) -
                        (splitNumber.includes('.') ? 2 : 1);

                    const textScientificArray = marketTick.split('0.0');
                    marketTick = textScientificArray[1].slice(1, 4);
                }

                createRectLabel(
                    context,
                    yScale(market),
                    X,
                    'white',
                    'black',
                    marketTick,
                    undefined,
                    yAxisCanvasWidth,
                    marketSubString,
                );
            }

            if (
                location.pathname.includes('pool') ||
                location.pathname.includes('reposition')
            ) {
                const {
                    isSameLocationMin: isSameLocationMin,
                    sameLocationDataMin: sameLocationDataMin,
                    isSameLocationMax: isSameLocationMax,
                    sameLocationDataMax: sameLocationDataMax,
                } = sameLocationRange();

                const passValue = liquidityData
                    ? liqMode === 'curve'
                        ? liqTransitionPointforCurve
                        : liqTransitionPointforDepth
                    : poolPriceDisplay;

                if (simpleRangeWidth !== 100 || tradeData.advancedMode) {
                    const isScientificlowTick = low.toString().includes('e');

                    let lowTick = getFormattedNumber({
                        value: low,
                        abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
                    }).replace(',', '');
                    let lowSubString = undefined;

                    if (isScientificlowTick) {
                        const splitNumber = low.toString().split('e');
                        lowSubString =
                            Math.abs(Number(splitNumber[1])) -
                            (splitNumber.includes('.') ? 2 : 1);

                        const scientificValue = getFormattedNumber({
                            value: low,
                            abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
                        });

                        const textScientificArray =
                            scientificValue.split('0.0');
                        lowTick = textScientificArray[1].slice(1, 4);
                    }

                    createRectLabel(
                        context,
                        isSameLocationMin ? sameLocationDataMin : yScale(low),
                        X,
                        low > passValue ? lineSellColor : lineBuyColor,
                        low > passValue ? 'white' : 'black',
                        lowTick,
                        undefined,
                        yAxisCanvasWidth,
                        lowSubString,
                    );
                    addYaxisLabel(
                        isSameLocationMin ? sameLocationDataMin : yScale(low),
                    );

                    const isScientificHighTick = high.toString().includes('e');

                    let highTick = getFormattedNumber({
                        value: high,
                        abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
                    }).replace(',', '');

                    let highSubString = undefined;

                    if (isScientificHighTick) {
                        const splitNumber = high.toString().split('e');

                        highSubString =
                            Math.abs(Number(splitNumber[1])) -
                            (splitNumber.includes('.') ? 2 : 1);

                        const scientificValue = getFormattedNumber({
                            value: high,
                            abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
                        });

                        const textScientificArray =
                            scientificValue.split('0.0');
                        highTick = textScientificArray[1].slice(1, 4);
                    }

                    createRectLabel(
                        context,
                        isSameLocationMax ? sameLocationDataMax : yScale(high),
                        X,
                        high > passValue ? lineSellColor : lineBuyColor,
                        high > passValue ? 'white' : 'black',
                        highTick,
                        undefined,
                        yAxisCanvasWidth,
                        highSubString,
                    );
                    addYaxisLabel(
                        isSameLocationMax ? sameLocationDataMax : yScale(high),
                    );
                }
            }

            if (location.pathname.includes('/limit')) {
                const { isSameLocation, sameLocationData } =
                    sameLocationLimit();

                const isScientificLimitTick = limit.toString().includes('e');

                let limitTick = getFormattedNumber({
                    value: limit,
                    abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
                }).replace(',', '');

                let limitSubString = undefined;

                if (isScientificLimitTick) {
                    const splitNumber = limit.toString().split('e');

                    limitSubString =
                        Math.abs(Number(splitNumber[1])) -
                        (splitNumber.includes('.') ? 2 : 1);

                    const scientificValue = getFormattedNumber({
                        value: limit,
                        abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
                    });

                    const textScientificArray = scientificValue.split('0.0');
                    limitTick = textScientificArray[1].slice(1, 4);
                }

                if (checkLimitOrder) {
                    createRectLabel(
                        context,
                        isSameLocation ? sameLocationData : yScale(limit),
                        X,
                        sellOrderStyle === 'order_sell'
                            ? lineSellColor
                            : lineBuyColor,
                        sellOrderStyle === 'order_sell' ? 'white' : 'black',
                        limitTick,
                        undefined,
                        yAxisCanvasWidth,
                        limitSubString,
                    );
                } else {
                    createRectLabel(
                        context,
                        isSameLocation ? sameLocationData : yScale(limit),
                        X,
                        '#7772FE',
                        'white',
                        limitTick,
                        undefined,
                        yAxisCanvasWidth,
                        limitSubString,
                    );
                }
                addYaxisLabel(
                    isSameLocation ? sameLocationData : yScale(limit),
                );
            }

            if (crosshairActive === 'chart') {
                const isScientificCrTick = crosshairData[0].y
                    .toString()
                    .includes('e');

                let crSubString = undefined;
                const crosshairY = Number(crosshairData[0].y.toString());

                let crTick = getFormattedNumber({
                    value: crosshairY,
                    abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
                }).replace(',', '');
                if (isScientificCrTick) {
                    const splitNumber = crosshairData[0].y
                        .toString()
                        .split('e');

                    crSubString =
                        Math.abs(Number(splitNumber[1])) -
                        (splitNumber.includes('.') ? 2 : 1);

                    const textScientificArray = crTick.split('0.0');
                    crTick = textScientificArray[1].slice(1, 4);
                }

                createRectLabel(
                    context,
                    yScale(crosshairY),
                    X,
                    '#242F3F',
                    'white',
                    crTick,
                    undefined,
                    yAxisCanvasWidth,
                    crSubString,
                );
            }

            changeyAxisWidth();
        }
    };

    useEffect(() => {
        if (!isChartZoom) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let previousTouch: any | undefined = undefined; // event
            const canvas = d3
                .select(d3Yaxis.current)
                .select('canvas')
                .node() as HTMLCanvasElement;

            const rectCanvas = canvas.getBoundingClientRect();
            let firstLocation: number;
            let newCenter: number;
            let previousDeltaTouchYaxis: number;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const startZoom = (event: any) => {
                if (event.sourceEvent.type.includes('touch') && scaleData) {
                    // mobile
                    previousTouch = event.sourceEvent.changedTouches[0];
                    firstLocation = previousTouch.pageY - rectCanvas.top;
                    newCenter = scaleData?.yScale.invert(firstLocation);

                    if (event.sourceEvent.touches.length > 1) {
                        previousDeltaTouchYaxis = Math.hypot(
                            0,
                            event.sourceEvent.touches[0].pageY -
                                event.sourceEvent.touches[1].pageY,
                        );
                        firstLocation = previousDeltaTouchYaxis;
                        newCenter = scaleData?.yScale.invert(firstLocation);
                    }
                } else {
                    firstLocation = event.sourceEvent.offsetY;
                }
            };

            const yAxisZoom = d3
                .zoom()
                .on('start', (event) => {
                    startZoom(event);
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .on('zoom', async (event: any) => {
                    (async () => {
                        if (scaleData) {
                            const domainY = scaleData?.yScale.domain();
                            const center =
                                domainY[1] !== domainY[0]
                                    ? (domainY[1] + domainY[0]) / 2
                                    : domainY[0] / 2;
                            let deltaY;

                            if (event.sourceEvent.type === 'touchmove') {
                                const touch =
                                    event.sourceEvent.changedTouches[0];

                                const _currentPageY = touch.pageY;
                                const previousTouchPageY = previousTouch.pageY;
                                const _movementY =
                                    _currentPageY - previousTouchPageY;
                                deltaY = _movementY;
                            } else {
                                deltaY = event.sourceEvent.movementY / 1.5;
                                newCenter =
                                    scaleData?.yScale.invert(firstLocation);
                            }

                            const dy = event.sourceEvent.deltaY / 3;

                            const factor = Math.pow(
                                2,
                                event.sourceEvent.type === 'wheel'
                                    ? -dy * 0.003
                                    : event.sourceEvent.type === 'mousemove'
                                    ? -deltaY * 0.003
                                    : event.sourceEvent.type === 'touchmove'
                                    ? -deltaY * 0.005
                                    : 1,
                            );

                            if (
                                event.sourceEvent.type !== 'touchmove' ||
                                event.sourceEvent.touches.length === 1
                            ) {
                                const size = (domainY[1] - domainY[0]) / factor;

                                const diff = domainY[1] - domainY[0];

                                const distance =
                                    newCenter > center
                                        ? Math.abs(
                                              newCenter -
                                                  scaleData?.yScale.domain()[1],
                                          )
                                        : Math.abs(
                                              newCenter -
                                                  scaleData?.yScale.domain()[0],
                                          );
                                const diffFactor = (diff - distance) / distance;

                                const bottomDiff = size / (diffFactor + 1);
                                const topDiff = size - bottomDiff;

                                if (newCenter > center) {
                                    const domain = [
                                        newCenter - topDiff,
                                        newCenter + bottomDiff,
                                    ];
                                    scaleData?.yScale.domain(domain);
                                } else {
                                    const domain = [
                                        newCenter - bottomDiff,
                                        newCenter + topDiff,
                                    ];
                                    scaleData?.yScale.domain(domain);
                                }
                            } else if (event.sourceEvent.touches.length > 1) {
                                const touch1 = event.sourceEvent.touches[0];
                                const touch2 = event.sourceEvent.touches[1];
                                const deltaTouch = Math.hypot(
                                    0,
                                    touch1.pageY - touch2.pageY,
                                );

                                const currentDelta =
                                    scaleData?.yScale.invert(deltaTouch);
                                const delta =
                                    Math.abs(currentDelta - newCenter) * 0.03;

                                if (previousDeltaTouchYaxis > deltaTouch) {
                                    const domainMax =
                                        scaleData?.yScale.domain()[1] + delta;
                                    const domainMin =
                                        scaleData?.yScale.domain()[0] - delta;

                                    scaleData?.yScale.domain([
                                        Math.min(domainMin, domainMax),
                                        Math.max(domainMin, domainMax),
                                    ]);
                                }
                                if (previousDeltaTouchYaxis < deltaTouch) {
                                    const domainMax =
                                        scaleData?.yScale.domain()[1] -
                                        delta * 0.5;
                                    const domainMin =
                                        scaleData?.yScale.domain()[0] +
                                        delta * 0.5;

                                    if (domainMax === domainMin) {
                                        scaleData?.yScale.domain([
                                            Math.min(domainMin, domainMax) +
                                                delta,
                                            Math.max(domainMin, domainMax) -
                                                delta,
                                        ]);
                                    } else {
                                        scaleData?.yScale.domain([
                                            Math.min(domainMin, domainMax),
                                            Math.max(domainMin, domainMax),
                                        ]);
                                    }
                                }
                            }
                        }
                    })().then(() => {
                        if (event.sourceEvent.type.includes('touch')) {
                            // mobile
                            previousTouch = event.sourceEvent.changedTouches[0];

                            if (event.sourceEvent.touches.length > 1) {
                                previousDeltaTouchYaxis = Math.hypot(
                                    0,
                                    event.sourceEvent.touches[0].pageY -
                                        event.sourceEvent.touches[1].pageY,
                                );
                            }
                        }
                    });
                    if (tradeData.advancedMode && liquidityData) {
                        const liqAllBidPrices = liquidityData?.liqBidData.map(
                            (liqData: LiquidityDataLocal) => liqData.liqPrices,
                        );
                        const liqBidDeviation =
                            standardDeviation(liqAllBidPrices);

                        if (scaleData) {
                            fillLiqAdvanced(
                                liqBidDeviation,
                                scaleData,
                                liquidityData,
                            );
                        }
                    }

                    setRescale(() => {
                        return false;
                    });

                    setMarketLineValue();
                    render();
                })
                .filter((event) => {
                    const isWheel = event.type === 'wheel';

                    const isLabel =
                        yAxisLabels?.find((element: yLabel) => {
                            return (
                                event.offsetY > element?.y &&
                                event.offsetY < element?.y + element?.height
                            );
                        }) !== undefined;

                    return !isLabel || isWheel;
                });

            setYaxisZoom(() => {
                return yAxisZoom;
            });
        }
    }, [
        diffHashSigScaleData(scaleData, 'y'),
        liquidityData?.liqBidData,
        isChartZoom,
    ]);

    useEffect(() => {
        if (yAxis && yAxisZoom && d3Yaxis.current) {
            d3.select<Element, unknown>(d3Yaxis.current)
                .call(yAxisZoom)
                .on('dblclick.zoom', null);

            if (location.pathname.includes('market')) {
                d3.select(d3Yaxis.current).on('.drag', null);
            }
            if (
                location.pathname.includes('pool') ||
                location.pathname.includes('reposition')
            ) {
                d3.select(d3Yaxis.current).call(dragRange);
            }
            if (location.pathname.includes('/limit')) {
                d3.select(d3Yaxis.current).call(dragLimit);
            }
            renderCanvasArray([d3Yaxis]);
        }
    }, [
        location.pathname,
        yAxisZoom,
        dragLimit,
        dragRange,
        d3.select('#range-line-canvas')?.node(),
        d3.select('#limit-line-canvas')?.node(),
    ]);

    // Axis's
    useEffect(() => {
        if (scaleData) {
            const d3YaxisCanvas = d3
                .select(d3Yaxis.current)
                .select('canvas')
                .node() as HTMLCanvasElement;

            const d3YaxisContext = d3YaxisCanvas.getContext(
                '2d',
            ) as CanvasRenderingContext2D;

            d3.select(d3Yaxis.current).on('draw', function () {
                if (yAxis && scaleData) {
                    setCanvasResolution(d3YaxisCanvas);
                    drawYaxis(
                        d3YaxisContext,
                        scaleData?.yScale,
                        d3YaxisCanvas.width / (2 * window.devicePixelRatio),
                    );
                }
            });

            renderCanvasArray([d3Yaxis]);
            renderSubchartCrCanvas();
        }
    }, [
        market,
        diffHashSig(crosshairData),
        limit,
        isLineDrag,
        ranges,
        isAmbientOrAdvanced,
        yAxisCanvasWidth,
        reset,
        sellOrderStyle,
        checkLimitOrder,
        location,
        crosshairActive,
    ]);

    function addYaxisLabel(y: number) {
        const rect = {
            x: 0,
            y: y - 10,
            width: 70,
            height: 20,
        };
        yAxisLabels?.push(rect);
    }

    useEffect(() => {
        d3.select(d3Yaxis.current).on(
            'mousemove',
            (event: MouseEvent<HTMLDivElement>) => {
                d3.select(event.currentTarget).style('cursor', 'row-resize');
            },
        );
        d3.select(d3Yaxis.current).on('mouseover', () => {
            setCrosshairActive('none');
        });
    }, [denomInBase, liqMode, location.pathname, tradeData.advancedMode]);

    return (
        <d3fc-canvas
            className='y-axis-canvas'
            id='y-axis-canvas'
            ref={d3Yaxis}
            style={{
                width: yAxisWidth,
                gridColumn: 5,
                gridRow: 3,
            }}
        ></d3fc-canvas>
    );
}

export default memo(YAxisCanvas);
