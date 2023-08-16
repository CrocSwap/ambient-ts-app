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
import { createLinearLineSeries } from './LinearLineSeries';

interface DrawCanvasProps {
    scaleData: scaleData;
}
export type lineData = { x: number; y: number };

type lines = { lineSeries: any; data: lineData };
function DrawCanvas(props: DrawCanvasProps) {
    const d3DrawCanvas = useRef<HTMLCanvasElement | null>(null);
    const [lineData, setLineData] = useState<lineData[]>([]);
    const [lineDataHistory, setLineDataHistory] = useState<lineData[][]>([]);

    const [lineSeries, setLineSeries] = useState<any>();
    const { isDrawActive } = useContext(ChartContext);

    const { scaleData } = props;
    useEffect(() => {
        const lineSeries = createLinearLineSeries(
            scaleData?.xScale,
            scaleData?.yScale,
        );

        setLineSeries(() => lineSeries);
    }, [scaleData]);

    useEffect(() => {
        const canvas = d3
            .select(d3DrawCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        let isDrawing = false;

        console.log({ lineData });

        const rectCanvas = canvas.getBoundingClientRect();

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        function startDrawing(event: any) {
            isDrawing = true;
            const { offsetX, offsetY } = event;

            setLineData([
                {
                    x: scaleData.xScale.invert(offsetX),
                    y: scaleData.yScale.invert(offsetY),
                },
            ]);
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

            if (lineData.length === 1) {
                lineData.push({
                    x: scaleData.xScale.invert(offsetX),
                    y: scaleData.yScale.invert(offsetY),
                });
            } else {
                lineData[1] = {
                    x: scaleData.xScale.invert(offsetX),
                    y: scaleData.yScale.invert(offsetY),
                };
            }

            renderCanvasArray([d3DrawCanvas]);
        }

        function stopDrawing() {
            isDrawing = false;
        }
    }, [lineData]);

    useEffect(() => {
        //      if (lineData && lineData.length>0){
        console.log({ lineData });
        if (lineData.length > 0) {
            (async () => {
                setLineDataHistory((item: any) => {
                    if (item) {
                        return [...item, lineData];
                    } else if (lineData.length > 1) {
                        item[item.length - 1] = lineData;
                        return item;
                    } else {
                        return lineData;
                    }
                });
            })().then(() => {
                setLineData([]);
            });
        }

        renderCanvasArray([d3DrawCanvas]);

        //   }
    }, [diffHashSig(lineData)]);

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
                    console.log(lineDataHistory);

                    lineDataHistory.forEach((item) => {
                        lineSeries(item);
                    });
                })
                .on('measure', (event: CustomEvent) => {
                    lineSeries.context(ctx);
                    scaleData?.yScale.range([event.detail.height, 0]);
                });
        }
    }, [diffHashSig(lineDataHistory), lineSeries]);

    useEffect(() => {
        renderCanvasArray([d3DrawCanvas]);
    }, [diffHashSig(lineData)]);

    return <d3fc-canvas ref={d3DrawCanvas} />;
}

export default DrawCanvas;
