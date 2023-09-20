import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
    bandLineData,
    drawDataHistory,
    lineData,
    renderCanvasArray,
    scaleData,
    selectedDrawnData,
    setCanvasResolution,
} from '../../ChartUtils/chartUtils';
import { diffHashSig } from '../../../../utils/functions/diffHashSig';
import { createCircle } from '../../ChartUtils/circle';
import { createLinearLineSeries } from './LinearLineSeries';
import { createBandArea, createPointsOfBandLine } from './BandArea';
import { TradeDataIF } from '../../../../utils/state/tradeDataSlice';

interface DrawCanvasProps {
    scaleData: scaleData;
    setDrawnShapeHistory: React.Dispatch<
        React.SetStateAction<drawDataHistory[]>
    >;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setCrossHairDataFunc: any;
    activeDrawingType: string;
    currentPool: TradeDataIF;
    setActiveDrawingType: React.Dispatch<React.SetStateAction<string>>;
    setSelectedDrawnShape: React.Dispatch<
        React.SetStateAction<selectedDrawnData | undefined>
    >;
}

function DrawCanvas(props: DrawCanvasProps) {
    const d3DrawCanvas = useRef<HTMLDivElement | null>(null);
    const [lineData, setLineData] = useState<lineData[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    const {
        scaleData,
        setDrawnShapeHistory,
        setCrossHairDataFunc,
        activeDrawingType,
        setActiveDrawingType,
        setSelectedDrawnShape,
        currentPool,
    } = props;

    const circleSeries = createCircle(
        scaleData?.xScale,
        scaleData?.yScale,
        50,
        1,
    );

    const lineSeries = createLinearLineSeries(
        scaleData?.xScale,
        scaleData?.yScale,
    );

    function createScaleForBandArea(x: number, x2: number) {
        const newXScale = scaleData?.xScale.copy();

        newXScale.range([scaleData?.xScale(x), scaleData?.xScale(x2)]);

        return newXScale;
    }

    useEffect(() => {
        const canvas = d3
            .select(d3DrawCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const canvasRect = canvas.getBoundingClientRect();

        const threshold = 15;
        // let clickCount = 0;
        let isDrawing = false;
        const tempLineData: lineData[] = [];

        let touchTimeout: NodeJS.Timeout | null = null; // Declare touchTimeout

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
            'mousedown',
            (event: PointerEvent) => {
                startDrawing(event.clientX, event.clientY);
            },
        );
        d3.select(d3DrawCanvas.current).on('mouseup', (event: PointerEvent) => {
            endDrawing(event.clientX, event.clientY);
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

            if (tempLineData.length > 0) {
                endDrawing(mouseX, mouseY);
            } else {
                tempLineData.push({
                    x: valueX,
                    y: valueY,
                    ctx: undefined,
                });
            }

            setLineData(tempLineData);
            renderCanvasArray([d3DrawCanvas]);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function endDrawing(mouseX: number, mouseY: number) {
            const offsetY = mouseY - canvasRect?.top;
            const offsetX = mouseX - canvasRect?.left;

            const valueX = scaleData?.xScale.invert(offsetX);
            const valueY = scaleData?.yScale.invert(offsetY);

            const firstValueX = scaleData?.xScale(tempLineData[0].x);
            const firstValueY = scaleData?.yScale(tempLineData[0].y);

            const checkThreshold = Math.hypot(
                offsetX - firstValueX,
                offsetY - firstValueY,
            );

            if (checkThreshold > threshold) {
                const newBandScale = createScaleForBandArea(
                    tempLineData[0].x,
                    valueX,
                );

                const bandArea = createBandArea(
                    newBandScale,
                    scaleData?.yScale,
                );

                bandArea
                    .xScale()
                    .range([firstValueX, scaleData?.xScale(valueX)]);

                tempLineData[1] = {
                    x: valueX,
                    y: valueY,
                    ctx: bandArea,
                };

                isDrawing = false;
                setActiveDrawingType('Cross');

                setDrawnShapeHistory((prevData: drawDataHistory[]) => {
                    if (tempLineData.length > 0) {
                        const endPoint = {
                            data: tempLineData,
                            type: activeDrawingType,
                            time: Date.now(),
                            pool: currentPool,
                        };

                        setSelectedDrawnShape({
                            data: endPoint,
                            selectedCircle: undefined,
                        });

                        return [...prevData, endPoint];
                    }
                    return prevData;
                });

                setActiveDrawingType('Cross');
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function draw(mouseX: number, mouseY: number) {
            const offsetY = mouseY - canvasRect?.top;
            const offsetX = mouseX - canvasRect?.left;

            setCrossHairDataFunc(offsetX, offsetY);

            if (!isDrawing) return;

            const newBandScale = createScaleForBandArea(
                tempLineData[0].x,
                scaleData.xScale.invert(offsetX),
            );

            const bandArea = createBandArea(newBandScale, scaleData?.yScale);

            const valueX = scaleData?.xScale.invert(offsetX);
            const valueY = scaleData?.yScale.invert(offsetY);
            if (tempLineData.length === 1) {
                tempLineData.push({
                    x: valueX,
                    y: valueY,
                    ctx: bandArea,
                });
            } else {
                tempLineData[1] = {
                    x: valueX,
                    y: valueY,
                    ctx: bandArea,
                };
            }

            setSelectedDrawnShape({
                data: {
                    data: tempLineData,
                    type: activeDrawingType,
                    time: Date.now(),
                    pool: currentPool,
                },
                selectedCircle: undefined,
            });

            renderCanvasArray([d3DrawCanvas]);
        }
    }, []);

    // Draw
    useEffect(() => {
        const canvas = d3
            .select(d3DrawCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (lineSeries && scaleData && activeDrawingType === 'Brush') {
            d3.select(d3DrawCanvas.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    lineSeries(lineData);
                    circleSeries(lineData);
                })
                .on('measure', (event: CustomEvent) => {
                    lineSeries.context(ctx);
                    circleSeries.context(ctx);
                    scaleData?.yScale.range([event.detail.height, 0]);
                });
        }
    }, [diffHashSig(lineData), lineSeries]);

    useEffect(() => {
        const canvas = d3
            .select(d3DrawCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (
            scaleData &&
            lineData.length > 1 &&
            activeDrawingType === 'Square'
        ) {
            d3.select(d3DrawCanvas.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);

                    const bandData = {
                        fromValue: lineData[0].y,
                        toValue: lineData[1].y,
                    } as bandLineData;

                    const lineOfBand = createPointsOfBandLine(lineData);

                    lineData[1].ctx([bandData]);

                    lineOfBand?.forEach((item) => {
                        lineSeries(item);
                        circleSeries(item);
                    });
                })
                .on('measure', (event: CustomEvent) => {
                    lineData[1].ctx.context(ctx);
                    lineSeries.context(ctx);
                    circleSeries.context(ctx);
                    scaleData?.yScale.range([event.detail.height, 0]);
                });
        }
    }, [diffHashSig(lineData)]);

    return <d3fc-canvas ref={d3DrawCanvas} />;
}

export default DrawCanvas;
