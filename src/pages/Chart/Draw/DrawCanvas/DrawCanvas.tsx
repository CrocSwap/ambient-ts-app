import React, { useContext, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
    bandLineData,
    calculateFibRetracement,
    calculateFibRetracementBandAreas,
    drawDataHistory,
    fibLevels,
    lineData,
    renderCanvasArray,
    scaleData,
    selectedDrawnData,
    setCanvasResolution,
} from '../../ChartUtils/chartUtils';
import { diffHashSig } from '../../../../utils/functions/diffHashSig';
import { createCircle } from '../../ChartUtils/circle';
import { createLinearLineSeries } from './LinearLineSeries';
import {
    createArrowPointsOfDPRangeLine,
    createBandArea,
    createPointsOfBandLine,
    createPointsOfDPRangeLine,
} from './BandArea';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';

interface DrawCanvasProps {
    scaleData: scaleData;
    setDrawnShapeHistory: React.Dispatch<
        React.SetStateAction<drawDataHistory[]>
    >;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setCrossHairDataFunc: any;
    activeDrawingType: string;
    setActiveDrawingType: React.Dispatch<React.SetStateAction<string>>;
    setSelectedDrawnShape: React.Dispatch<
        React.SetStateAction<selectedDrawnData | undefined>
    >;
    denomInBase: boolean;
    addDrawActionStack: (item: drawDataHistory, isNewShape: boolean) => void;
}

function DrawCanvas(props: DrawCanvasProps) {
    const d3DrawCanvas = useRef<HTMLDivElement | null>(null);
    const [lineData, setLineData] = useState<lineData[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [bandArea, setBandArea] = useState<any>();
    const {
        scaleData,
        setDrawnShapeHistory,
        setCrossHairDataFunc,
        activeDrawingType,
        setActiveDrawingType,
        setSelectedDrawnShape,
        denomInBase,
        addDrawActionStack,
    } = props;

    const circleSeries = createCircle(
        scaleData?.xScale,
        scaleData?.yScale,
        50,
        1,
        denomInBase,
    );

    const lineSeries = createLinearLineSeries(
        scaleData?.xScale,
        scaleData?.yScale,
        denomInBase,
    );

    const currentPool = useContext(TradeDataContext);

    function createScaleForBandArea(x: number, x2: number) {
        const newXScale = scaleData?.xScale.copy();

        newXScale.range([scaleData?.xScale(x), scaleData?.xScale(x2)]);

        return newXScale;
    }

    const {
        chainData: { poolIndex },
    } = useContext(CrocEnvContext);

    useEffect(() => {
        const canvas = d3
            .select(d3DrawCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const canvasRect = canvas.getBoundingClientRect();

        const threshold = 15;
        let cancelDraw = false;
        let isDrawing = false;
        const tempLineData: lineData[] = [];

        let touchTimeout: NodeJS.Timeout | null = null; // Declare touchTimeout

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cancelDrawEvent = (event: any) => {
            if (event.key === 'Escape') {
                cancelDraw = true;
                event.preventDefault();
                event.stopPropagation();
                document.removeEventListener('keydown', cancelDrawEvent);
            }
        };

        d3.select(d3DrawCanvas.current).on(
            'touchstart',
            (event: TouchEvent) => {
                const clientX = event.targetTouches[0].clientX;
                const clientY = event.targetTouches[0].clientY;
                startDrawing(clientX, clientY);
            },
        );

        d3.select(d3DrawCanvas.current).on('touchmove', (event: TouchEvent) => {
            const clientX = event.targetTouches[0].clientX;
            const clientY = event.targetTouches[0].clientY;
            draw(clientX, clientY);

            if (touchTimeout) {
                clearTimeout(touchTimeout);
            }
            // check touchmove end
            touchTimeout = setTimeout(() => {
                endDrawing(clientX, clientY);
            }, 500);
        });

        d3.select(d3DrawCanvas.current).on(
            'mousemove',
            (event: PointerEvent) => {
                draw(event.clientX, event.clientY);
            },
        );

        d3.select(d3DrawCanvas.current).on(
            'mousedown',
            (event: PointerEvent) => {
                document.addEventListener('keydown', cancelDrawEvent);

                startDrawing(event.clientX, event.clientY);
            },
        );

        d3.select(d3DrawCanvas.current).on('mouseup', (event: PointerEvent) => {
            endDrawing(event.clientX, event.clientY);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function startDrawing(mouseX: number, mouseY: number) {
            isDrawing = true;
            const offsetY = mouseY - canvasRect?.top;
            const offsetX = mouseX - canvasRect?.left;

            const valueX = scaleData?.xScale.invert(offsetX);
            const valueY = scaleData?.yScale.invert(offsetY);

            if (valueY > 0) {
                if (tempLineData.length > 0 || activeDrawingType === 'Ray') {
                    endDrawing(mouseX, mouseY);
                } else {
                    tempLineData.push({
                        x: valueX,
                        y: valueY,
                        denomInBase: denomInBase,
                    });
                }

                setLineData(tempLineData);
                renderCanvasArray([d3DrawCanvas]);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function endDrawing(mouseX: number, mouseY: number) {
            if (!cancelDraw) {
                let endDraw = false;
                const offsetY = mouseY - canvasRect?.top;
                const offsetX = mouseX - canvasRect?.left;

                const valueX = scaleData?.xScale.invert(offsetX);
                const valueY = scaleData?.yScale.invert(offsetY);

                if (activeDrawingType !== 'Ray') {
                    const firstValueX = scaleData?.xScale(tempLineData[0].x);
                    const firstValueY = scaleData?.yScale(tempLineData[0].y);

                    const checkThreshold = Math.hypot(
                        offsetX - firstValueX,
                        offsetY - firstValueY,
                    );

                    endDraw = checkThreshold > threshold;
                }

                if (endDraw || activeDrawingType === 'Ray') {
                    if (activeDrawingType === 'Ray') {
                        tempLineData[0] = {
                            x: valueX,
                            y: valueY,
                            denomInBase: denomInBase,
                        };
                    }

                    tempLineData[1] = {
                        x: valueX,
                        y: valueY,
                        denomInBase: denomInBase,
                    };

                    isDrawing = false;

                    setActiveDrawingType('Cross');

                    const endPoint = {
                        data: tempLineData,
                        type: activeDrawingType,
                        time: Date.now(),
                        pool: {
                            poolIndex: poolIndex,
                            tokenA: currentPool.tokenA.address,
                            tokenB: currentPool.tokenB.address,
                            isTokenABase: currentPool.isTokenABase,
                            denomInBase: currentPool.isDenomBase,
                        },
                        color: 'rgba(115, 113, 252, 1)',
                        background: 'rgba(115, 113, 252, 0.15)',
                        lineWidth: 1.5,
                        style:
                            activeDrawingType === 'FibRetracement'
                                ? [6, 6]
                                : [0, 0],
                        showGuideLine: !['DPRange', 'Rect'].includes(
                            activeDrawingType,
                        ),
                        showBorder: ['Rect'].includes(activeDrawingType),
                        showBackground: ['Rect', 'DPRange'].includes(
                            activeDrawingType,
                        ),
                        extraData: ['FibRetracement'].includes(
                            activeDrawingType,
                        )
                            ? structuredClone(fibLevels)
                            : [],
                    };

                    setDrawnShapeHistory((prevData: drawDataHistory[]) => {
                        if (tempLineData.length > 0) {
                            endPoint.time = Date.now();
                            setSelectedDrawnShape({
                                data: endPoint,
                                selectedCircle: undefined,
                            });

                            return [...prevData, endPoint];
                        }
                        return prevData;
                    });
                    addDrawActionStack(endPoint, true);
                }
            } else {
                setActiveDrawingType('Cross');
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function draw(mouseX: number, mouseY: number) {
            if (!cancelDraw) {
                const offsetY = mouseY - canvasRect?.top;
                const offsetX = mouseX - canvasRect?.left;

                const valueX = scaleData?.xScale.invert(offsetX);
                const valueY = scaleData?.yScale.invert(offsetY);

                setCrossHairDataFunc(offsetX, offsetY);

                if (!isDrawing || activeDrawingType === 'Ray') return;

                if (valueY > 0) {
                    const newBandScale = createScaleForBandArea(
                        tempLineData[0].x,
                        scaleData.xScale.invert(offsetX),
                    );

                    const bandArea = createBandArea(
                        newBandScale,
                        scaleData?.yScale,
                        denomInBase,
                    );

                    setBandArea(() => bandArea);

                    if (tempLineData.length === 1) {
                        tempLineData.push({
                            x: valueX,
                            y: valueY,
                            denomInBase: denomInBase,
                        });
                    } else {
                        tempLineData[1] = {
                            x: valueX,
                            y: valueY,
                            denomInBase: denomInBase,
                        };
                    }

                    setSelectedDrawnShape({
                        data: {
                            data: tempLineData,
                            type: activeDrawingType,
                            time: Date.now(),
                            pool: {
                                poolIndex: poolIndex,
                                tokenA: currentPool.tokenA.address,
                                tokenB: currentPool.tokenB.address,
                                isTokenABase: currentPool.isTokenABase,
                                denomInBase: currentPool.isDenomBase,
                            },
                            color: 'rgba(115, 113, 252, 1)',
                            background: 'rgba(115, 113, 252, 0.15)',
                            lineWidth: 1.5,
                            style:
                                activeDrawingType === 'FibRetracement'
                                    ? [6, 6]
                                    : [0, 0],
                            showGuideLine: !['DPRange', 'Rect'].includes(
                                activeDrawingType,
                            ),
                            showBorder: ['Rect'].includes(activeDrawingType),
                            showBackground: ['Rect', 'DPRange'].includes(
                                activeDrawingType,
                            ),
                            extraData: ['FibRetracement'].includes(
                                activeDrawingType,
                            )
                                ? structuredClone(fibLevels)
                                : [],
                        },
                        selectedCircle: undefined,
                    });
                }
            } else {
                setSelectedDrawnShape(undefined);
                setLineData([]);
            }

            renderCanvasArray([d3DrawCanvas]);
        }
    }, [activeDrawingType]);

    // Draw
    useEffect(() => {
        const canvas = d3
            .select(d3DrawCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (
            lineSeries &&
            scaleData &&
            (activeDrawingType === 'Brush' || activeDrawingType === 'Angle')
        ) {
            d3.select(d3DrawCanvas.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    if (ctx) ctx.setLineDash([0, 0]);
                    lineSeries(lineData);
                    circleSeries(lineData);

                    if (activeDrawingType === 'Angle' && lineData.length > 0) {
                        if (lineData.length > 1) {
                            const opposite = Math.abs(
                                scaleData.yScale(lineData[0].y) -
                                    scaleData.yScale(lineData[1].y),
                            );
                            const side = Math.abs(
                                scaleData.xScale(lineData[0].x) -
                                    scaleData.xScale(lineData[1].x),
                            );

                            const distance = opposite / side;

                            const minAngleLineLength =
                                side / 4 > 80
                                    ? Math.abs(lineData[0].x - lineData[1].x) /
                                      4
                                    : scaleData.xScale.invert(
                                          scaleData.xScale(lineData[0].x) + 80,
                                      ) - lineData[0].x;

                            const minAngleTextLength =
                                lineData[0].x +
                                minAngleLineLength +
                                scaleData.xScale.invert(
                                    scaleData.xScale(lineData[0].x) + 20,
                                ) -
                                lineData[0].x;

                            const angleLineData = [
                                {
                                    x: lineData[0].x,
                                    y: lineData[0].y,
                                    denomInBase: lineData[0].denomInBase,
                                },
                                {
                                    x: lineData[0].x + minAngleLineLength,
                                    y: lineData[0].y,
                                    denomInBase: lineData[0].denomInBase,
                                },
                            ];

                            const angle = Math.atan(distance) * (180 / Math.PI);

                            const supplement =
                                lineData[1].x > lineData[0].x
                                    ? -Math.atan(distance)
                                    : Math.PI + Math.atan(distance);

                            const arcX =
                                lineData[1].y > lineData[0].y ? supplement : 0;
                            const arcY =
                                lineData[1].y > lineData[0].y ? 0 : -supplement;

                            const radius =
                                scaleData.xScale(
                                    lineData[0].x + minAngleLineLength,
                                ) - scaleData.xScale(lineData[0].x);

                            if (ctx) {
                                ctx.setLineDash([5, 3]);
                                lineSeries(angleLineData);

                                ctx.beginPath();
                                ctx.arc(
                                    scaleData.xScale(lineData[0].x),
                                    scaleData.yScale(lineData[0].y),
                                    radius,
                                    arcX,
                                    arcY,
                                );
                                ctx.stroke();

                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillStyle = 'white';
                                ctx.font = '50 12px Lexend Deca';

                                const angleDisplay =
                                    lineData[1].x > lineData[0].x
                                        ? angle
                                        : 180 - angle;

                                ctx.fillText(
                                    (lineData[1].y > lineData[0].y ? '' : '-') +
                                        angleDisplay.toFixed(0).toString() +
                                        'º',
                                    scaleData.xScale(minAngleTextLength),
                                    scaleData.yScale(lineData[0].y),
                                );

                                ctx.closePath();
                            }
                        }
                    }
                })
                .on('measure', (event: CustomEvent) => {
                    lineSeries.context(ctx);
                    circleSeries.context(ctx);
                    scaleData?.yScale.range([event.detail.height, 0]);
                });
        }
    }, [diffHashSig(lineData), lineSeries, denomInBase]);

    useEffect(() => {
        const canvas = d3
            .select(d3DrawCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (
            scaleData &&
            lineData.length > 1 &&
            (activeDrawingType === 'Rect' || activeDrawingType === 'DPRange')
        ) {
            d3.select(d3DrawCanvas.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);

                    const bandData = {
                        fromValue: lineData[0].y,
                        toValue: lineData[1].y,
                        denomInBase: denomInBase,
                    } as bandLineData;

                    bandArea && bandArea([bandData]);

                    if (activeDrawingType === 'Rect') {
                        const lineOfBand = createPointsOfBandLine(lineData);

                        lineOfBand?.forEach((item) => {
                            lineSeries(item);
                            circleSeries(item);
                        });
                    }

                    if (activeDrawingType === 'DPRange') {
                        const lineOfBand = createPointsOfDPRangeLine(lineData);

                        lineOfBand?.forEach((item) => {
                            lineSeries(item);
                        });
                        circleSeries(lineData);

                        const height = Math.abs(
                            scaleData.yScale(lineData[0].y) -
                                scaleData.yScale(lineData[1].y),
                        );
                        const width = Math.abs(
                            scaleData.xScale(lineData[0].x) -
                                scaleData.xScale(lineData[1].x),
                        );

                        if (height > 70 && width > 70) {
                            const arrowArray = createArrowPointsOfDPRangeLine(
                                lineData,
                                scaleData,
                                denomInBase,
                            );

                            arrowArray.forEach((arrow) => {
                                lineSeries(arrow);
                            });
                        }
                    }
                })
                .on('measure', (event: CustomEvent) => {
                    bandArea && bandArea.context(ctx);
                    lineSeries.context(ctx);
                    circleSeries.context(ctx);
                    scaleData?.yScale.range([event.detail.height, 0]);
                });
        }
    }, [diffHashSig(lineData), denomInBase, bandArea]);

    useEffect(() => {
        const canvas = d3
            .select(d3DrawCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (
            scaleData &&
            lineData.length > 1 &&
            activeDrawingType === 'FibRetracement'
        ) {
            d3.select(d3DrawCanvas.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);

                    if (ctx) ctx.setLineDash([6, 6]);
                    lineSeries.decorate((context: CanvasRenderingContext2D) => {
                        context.strokeStyle = '#7371FC';
                        context.lineWidth = 1.5;
                    });
                    lineSeries(lineData);

                    const fibLineData = calculateFibRetracement(
                        lineData,
                        fibLevels,
                    );

                    if (ctx) ctx.setLineDash([0, 0]);

                    const bandAreaData = calculateFibRetracementBandAreas(
                        lineData,
                        fibLevels,
                    );

                    bandAreaData.forEach((bandData) => {
                        const color = d3.color(bandData.color);

                        if (color) {
                            color.opacity = 0.3;

                            bandArea.decorate(
                                (context: CanvasRenderingContext2D) => {
                                    context.fillStyle = color.toString();
                                },
                            );
                        }

                        bandArea([bandData]);
                    });

                    if (ctx) ctx.setLineDash([0, 0]);
                    fibLineData.forEach((lineData) => {
                        lineSeries.decorate(
                            (context: CanvasRenderingContext2D) => {
                                context.strokeStyle = lineData[0].color;
                                context.lineWidth = 1.5;
                            },
                        );
                        lineSeries(lineData);

                        if (ctx) {
                            ctx.fillStyle = lineData[0].color;
                            ctx.font = '12px Lexend Deca';
                            ctx.textAlign = 'right';
                            ctx.textBaseline = 'middle';

                            const lineLabel =
                                lineData[0].level +
                                ' (' +
                                lineData[0].y.toFixed(2).toString() +
                                ')';

                            ctx.fillText(
                                lineLabel,
                                scaleData.xScale(
                                    Math.min(lineData[0].x, lineData[1].x),
                                ) - 10,
                                scaleData.yScale(
                                    denomInBase === lineData[0].denomInBase
                                        ? lineData[0].y
                                        : 1 / lineData[0].y,
                                ),
                            );
                        }
                    });
                })
                .on('measure', (event: CustomEvent) => {
                    bandArea && bandArea.context(ctx);
                    lineSeries.context(ctx);
                    circleSeries.context(ctx);
                    scaleData?.yScale.range([event.detail.height, 0]);
                });
        }
    }, [diffHashSig(lineData), denomInBase, bandArea]);

    useEffect(() => {
        const canvas = d3
            .select(d3DrawCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (scaleData && lineData.length > 1 && activeDrawingType === 'Ray') {
            d3.select(d3DrawCanvas.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);

                    circleSeries([
                        {
                            denomInBase: lineData[0].denomInBase,
                            y: lineData[0].y,
                            x: lineData[0].x,
                        },
                    ]);
                })
                .on('measure', (event: CustomEvent) => {
                    // lineData[1].ctx.context(ctx);
                    circleSeries.context(ctx);
                    scaleData?.yScale.range([event.detail.height, 0]);
                });
        }
    }, [diffHashSig(lineData), denomInBase]);

    return <d3fc-canvas ref={d3DrawCanvas} />;
}

export default DrawCanvas;
