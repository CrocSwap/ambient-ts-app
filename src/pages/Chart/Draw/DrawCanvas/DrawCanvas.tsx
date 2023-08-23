import React, { useEffect, useRef, useState, useContext } from 'react';
import * as d3 from 'd3';
import {
    drawDataHistory,
    lineData,
    renderCanvasArray,
    scaleData,
    setCanvasResolution,
} from '../../ChartUtils/chartUtils';
import { diffHashSig } from '../../../../utils/functions/diffHashSig';
import { ChartContext } from '../../../../contexts/ChartContext';
import { createCircle } from '../../ChartUtils/circle';
import { createLinearLineSeries } from './LinearLineSeries';

interface DrawCanvasProps {
    scaleData: scaleData;
    setDrawnShapeHistory: React.Dispatch<
        React.SetStateAction<drawDataHistory[]>
    >;
}

function DrawCanvas(props: DrawCanvasProps) {
    const d3DrawCanvas = useRef<HTMLDivElement | null>(null);
    const [lineData, setLineData] = useState<lineData[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    const { scaleData, setDrawnShapeHistory } = props;
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

    const { setIsDrawActive } = useContext(ChartContext);

    useEffect(() => {
        const canvas = d3
            .select(d3DrawCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;

        const threshold = 15;
        // let clickCount = 0;
        let isDrawing = false;
        const tempLineData: lineData[] = [];

        d3.select(d3DrawCanvas.current).on(
            'mousedown',
            (event: PointerEvent) => {
                startDrawing(event);
            },
        );

        d3.select(d3DrawCanvas.current).on('mouseup', (event: PointerEvent) => {
            endDrawing(event);
        });

        canvas.addEventListener('mousemove', draw);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function startDrawing(event: any) {
            isDrawing = true;
            const { offsetX, offsetY } = event;
            const valueX = scaleData?.xScale.invert(offsetX);
            const valueY = scaleData?.yScale.invert(offsetY);

            if (tempLineData.length > 0) {
                endDrawing(event);
            } else {
                tempLineData.push({
                    x: valueX,
                    y: valueY,
                });
            }

            setLineData(tempLineData);
            renderCanvasArray([d3DrawCanvas]);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function endDrawing(event: any) {
            const { offsetX, offsetY } = event;
            const valueX = scaleData?.xScale.invert(offsetX);
            const valueY = scaleData?.yScale.invert(offsetY);
            const firstValueX = scaleData?.xScale(tempLineData[0].x);
            const firstValueY = scaleData?.yScale(tempLineData[0].y);
            const checkThreshold = Math.hypot(
                offsetX - firstValueX,
                offsetY - firstValueY,
            );

            if (checkThreshold > threshold) {
                tempLineData[1] = {
                    x: valueX,
                    y: valueY,
                };
                isDrawing = false;
                setIsDrawActive(false);
                setDrawnShapeHistory((prevData: drawDataHistory[]) => {
                    if (tempLineData.length > 0) {
                        return [
                            ...prevData,
                            {
                                data: tempLineData,
                                type: 'line',
                                time: Date.now(),
                            },
                        ];
                    }
                    return prevData;
                });
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function draw(event: any) {
            if (!isDrawing) return;
            const { offsetX, offsetY } = event;
            const valueX = scaleData?.xScale.invert(offsetX);
            const valueY = scaleData?.yScale.invert(offsetY);
            if (tempLineData.length === 1) {
                tempLineData.push({
                    x: valueX,
                    y: valueY,
                });
            } else {
                tempLineData[1] = {
                    x: valueX,
                    y: valueY,
                };
            }
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

        if (lineSeries && scaleData) {
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

    return <d3fc-canvas ref={d3DrawCanvas} />;
}

export default DrawCanvas;
