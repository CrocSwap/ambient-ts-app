import React, { useEffect, useRef, useState, useContext } from 'react';
import * as d3 from 'd3';
import {
    renderCanvasArray,
    scaleData,
    setCanvasResolution,
} from '../../ChartUtils/chartUtils';
import { diffHashSig } from '../../../../utils/functions/diffHashSig';
import { ChartContext } from '../../../../contexts/ChartContext';

interface DrawCanvasProps {
    scaleData: scaleData;
    setLineDataHistory: React.Dispatch<React.SetStateAction<lineData[][]>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lineSeries: any;
}
export type lineData = { x: number; y: number };

function DrawCanvas(props: DrawCanvasProps) {
    const d3DrawCanvas = useRef<HTMLCanvasElement | null>(null);
    const [lineData, setLineData] = useState<lineData[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    const { scaleData, setLineDataHistory, lineSeries } = props;
    const { setIsDrawActive } = useContext(ChartContext);

    useEffect(() => {
        const canvas = d3
            .select(d3DrawCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;

        let clickCount = 0;
        let isDrawing = false;
        let tempLineData: lineData[] = [];

        canvas.addEventListener('click', startDrawing);
        canvas.addEventListener('mousemove', draw);
        // canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function startDrawing(event: any) {
            isDrawing = true;
            clickCount = clickCount + 1;
            const { offsetX, offsetY } = event;

            if (clickCount > 2) {
                clickCount = 0;
                tempLineData = [];
            }
            if (tempLineData.length > 1) {
                tempLineData[1] = {
                    x: scaleData.xScale.invert(offsetX),
                    y: scaleData.yScale.invert(offsetY),
                };
                isDrawing = false;
                setIsDrawActive(false);
                setLineDataHistory((item: lineData[][]) => {
                    if (tempLineData.length > 0) {
                        return [...item, tempLineData];
                    }
                    return item;
                });
            } else {
                tempLineData.push({
                    x: scaleData.xScale.invert(offsetX),
                    y: scaleData.yScale.invert(offsetY),
                });
            }

            setLineData(tempLineData);
            renderCanvasArray([d3DrawCanvas]);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function draw(event: any) {
            if (!isDrawing) return;
            const { offsetX, offsetY } = event;

            if (tempLineData.length === 1) {
                tempLineData.push({
                    x: scaleData.xScale.invert(offsetX),
                    y: scaleData.yScale.invert(offsetY),
                });
            } else {
                tempLineData[1] = {
                    x: scaleData.xScale.invert(offsetX),
                    y: scaleData.yScale.invert(offsetY),
                };
            }
            renderCanvasArray([d3DrawCanvas]);
        }

        function stopDrawing() {
            isDrawing = false;
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
                })
                .on('measure', (event: CustomEvent) => {
                    lineSeries.context(ctx);
                    scaleData?.yScale.range([event.detail.height, 0]);
                });
        }
    }, [diffHashSig(lineData), lineSeries]);

    return <d3fc-canvas ref={d3DrawCanvas} />;
}

export default DrawCanvas;
