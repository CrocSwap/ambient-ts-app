import React, { useContext, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { createLineSeries } from '../../Liquidity/LiquiditySeries/LineSeries';
import {
    renderCanvasArray,
    scaleData,
    setCanvasResolution,
} from '../../ChartUtils/chartUtils';
import { ChartContext } from '../../../../contexts/ChartContext';
import { diffHashSig } from '../../../../utils/functions/diffHashSig';

interface DrawCanvasProps {
    scaleData: scaleData;
}
type lineData = { x: number; y: number };
function DrawCanvas(props: DrawCanvasProps) {
    const d3DrawCanvas = useRef<HTMLCanvasElement | null>(null);
    const [lineData, setLineData] = useState<lineData[]>([]);
    const [lineSeries, setLineSeries] = useState<any>();
    const { isDrawActive } = useContext(ChartContext);

    const { scaleData } = props;
    useEffect(() => {
        const lineSeries = d3fc
            .seriesCanvasLine()
            .mainValue((d: lineData) => d.y)
            .crossValue((d: lineData) => d.x)
            .curve(d3.curveBundle)
            .xScale(scaleData?.xScale)
            .yScale(scaleData?.yScale)
            .decorate((context: CanvasRenderingContext2D) => {
                context.strokeStyle = 'blue';
            });

        setLineSeries(() => lineSeries);
    }, [scaleData]);

    useEffect(() => {
        const canvas = d3
            .select(d3DrawCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        let isDrawing = false;

        const rectCanvas = canvas.getBoundingClientRect();

        const tempLineData: lineData[] = [];
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        function startDrawing(event: any) {
            isDrawing = true;
            // setLineData([]);
            // const { offsetX, offsetY } = event;
            // ctx.strokeStyle = 'blue';
            // ctx.lineWidth = 2;
            // ctx.beginPath();
            // ctx.moveTo(offsetX, offsetY);
        }

        function draw(event: any) {
            if (!isDrawing) return;
            const { offsetX, offsetY } = event;
            console.log('draw');

            lineData.push({
                x: scaleData.xScale.invert(offsetX),
                y: scaleData.yScale.invert(offsetY),
            });

            // lin(tempLineData);
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
        if (lineSeries && scaleData && lineData) {
            d3.select(d3DrawCanvas.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);

                    console.log(lineData);

                    lineSeries(lineData);
                })
                .on('measure', (event: CustomEvent) => {
                    lineSeries.context(ctx);
                    scaleData?.yScale.range([event.detail.height, 0]);
                });
        }
    }, [diffHashSig(lineData), lineSeries]);

    useEffect(() => {
        renderCanvasArray([d3DrawCanvas]);
    }, [diffHashSig(lineData)]);

    return <d3fc-canvas ref={d3DrawCanvas} />;
}

export default DrawCanvas;
