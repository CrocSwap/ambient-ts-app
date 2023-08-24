import React, { useEffect, useRef, useState, useContext } from 'react';
import * as d3 from 'd3';
import {
    bandLineData,
    drawDataHistory,
    lineData,
    renderCanvasArray,
    scaleData,
    setCanvasResolution,
} from '../../ChartUtils/chartUtils';
import { diffHashSig } from '../../../../utils/functions/diffHashSig';
import { ChartContext } from '../../../../contexts/ChartContext';
import { createCircle } from '../../ChartUtils/circle';
import { createBandArea, createPointsOfBandLine } from './BandArea';

interface DrawCanvasProps {
    scaleData: scaleData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lineSeries: any;
}

function DrawCanvas(props: DrawCanvasProps) {
    const d3DrawCanvas = useRef<HTMLCanvasElement | null>(null);
    const [lineData, setLineData] = useState<lineData[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    const { scaleData, lineSeries } = props;
    const circleSeries = createCircle(scaleData?.xScale, scaleData?.yScale);

    const { setIsDrawActive, setLineDataHistory } = useContext(ChartContext);

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

        let clickCount = 0;
        let isDrawing = false;
        let tempLineData: lineData[] = [];

        d3.select(d3DrawCanvas.current).on('click', (event: PointerEvent) => {
            startDrawing(event);
        });

        canvas.addEventListener('mousemove', draw);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function startDrawing(event: any) {
            isDrawing = true;
            clickCount = clickCount + 1;
            const { offsetX, offsetY } = event;

            if (clickCount > 2) {
                clickCount = 0;
                tempLineData = [];
            }
            if (clickCount === 2) {
                const newBandScale = createScaleForBandArea(
                    tempLineData[0].x,
                    scaleData.xScale.invert(offsetX),
                );

                const bandArea = createBandArea(
                    newBandScale,
                    scaleData?.yScale,
                );

                bandArea
                    .xScale()
                    .range([
                        scaleData?.xScale(tempLineData[0].x),
                        scaleData?.xScale(scaleData.xScale.invert(offsetX)),
                    ]);

                tempLineData[1] = {
                    x: scaleData.xScale.invert(offsetX),
                    y: scaleData.yScale.invert(offsetY),
                    ctx: bandArea,
                };

                isDrawing = false;
                setIsDrawActive(false);
                setLineDataHistory((prevData: drawDataHistory[]) => {
                    if (tempLineData.length > 0) {
                        return [
                            ...prevData,
                            {
                                data: tempLineData,
                                time: Date.now(),
                            },
                        ];
                    }
                    return prevData;
                });
            } else {
                tempLineData.push({
                    x: scaleData.xScale.invert(offsetX),
                    y: scaleData.yScale.invert(offsetY),
                    ctx: undefined,
                });
            }

            setLineData(tempLineData);
            renderCanvasArray([d3DrawCanvas]);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function draw(event: any) {
            if (!isDrawing) return;
            const { offsetX, offsetY } = event;

            const newBandScale = createScaleForBandArea(
                tempLineData[0].x,
                scaleData.xScale.invert(offsetX),
            );

            const bandArea = createBandArea(newBandScale, scaleData?.yScale);

            if (tempLineData.length === 1) {
                tempLineData.push({
                    x: scaleData.xScale.invert(offsetX),
                    y: scaleData.yScale.invert(offsetY),
                    ctx: bandArea,
                });
            } else {
                tempLineData[1] = {
                    x: scaleData.xScale.invert(offsetX),
                    y: scaleData.yScale.invert(offsetY),
                    ctx: bandArea,
                };
            }
            renderCanvasArray([d3DrawCanvas]);
        }
    }, []);

    // Draw
    // useEffect(() => {
    //     const canvas = d3
    //         .select(d3DrawCanvas.current)
    //         .select('canvas')
    //         .node() as HTMLCanvasElement;
    //     const ctx = canvas.getContext('2d');

    //     if (lineSeries && scaleData) {
    //         d3.select(d3DrawCanvas.current)
    //             .on('draw', () => {
    //                 setCanvasResolution(canvas);
    //                 lineSeries(lineData);
    //                 circleSeries(lineData);
    //             })
    //             .on('measure', (event: CustomEvent) => {
    //                 lineSeries.context(ctx);
    //                 circleSeries.context(ctx);
    //                 scaleData?.yScale.range([event.detail.height, 0]);
    //             });
    //     }
    // }, [diffHashSig(lineData), lineSeries]);

    useEffect(() => {
        const canvas = d3
            .select(d3DrawCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (scaleData && lineData.length > 1) {
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
