import { MouseEvent, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
    drawDataHistory,
    scaleData,
    selectedDrawnData,
} from '../../ChartUtils/chartUtils';

interface DragCanvasProps {
    scaleData: scaleData;
    selectedDrawnShape: selectedDrawnData | undefined;
    drawnShapeHistory: drawDataHistory[];
    canUserDragDrawnShape: boolean;
    setIsDragActive: React.Dispatch<React.SetStateAction<boolean>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setCrossHairDataFunc: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mousemove: any;
}

export default function DragCanvas(props: DragCanvasProps) {
    const d3DragCanvas = useRef<HTMLDivElement | null>(null);

    const {
        selectedDrawnShape,
        drawnShapeHistory,
        render,
        setIsDragActive,
        mousemove,
        scaleData,
        canUserDragDrawnShape,
        setCrossHairDataFunc,
    } = props;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dragLine = (event: any) => {
        if (selectedDrawnShape) {
            const movemementX = event.sourceEvent.movementX;
            const movemementY = event.sourceEvent.movementY;
            const index = drawnShapeHistory.findIndex(
                (item) => item === selectedDrawnShape?.data,
            );

            const lastData = [
                {
                    x: scaleData.xScale.invert(
                        scaleData.xScale(selectedDrawnShape?.data?.data[0].x) +
                            movemementX,
                    ),
                    y: scaleData.yScale.invert(
                        scaleData.yScale(selectedDrawnShape.data?.data[0].y) +
                            movemementY,
                    ),
                    ctx: selectedDrawnShape.data?.data[0].ctx,
                    isSelected: false,
                },
                {
                    x: scaleData.xScale.invert(
                        scaleData.xScale(selectedDrawnShape.data.data[1].x) +
                            movemementX,
                    ),
                    y: scaleData.yScale.invert(
                        scaleData.yScale(selectedDrawnShape.data.data[1].y) +
                            movemementY,
                    ),
                    ctx: selectedDrawnShape.data?.data[1].ctx,
                    isSelected: false,
                },
            ];
            drawnShapeHistory[index].data = lastData;
            selectedDrawnShape.data.data = lastData;

            render();
        }
    };

    function updateDrawLine(offsetX: number, offsetY: number) {
        const index = drawnShapeHistory.findIndex(
            (item) => item === selectedDrawnShape?.data,
        );

        const previosData = drawnShapeHistory[index].data;

        const lastDataIndex = previosData.findIndex(
            (item) => item === selectedDrawnShape?.selectedCircle,
        );
        previosData[lastDataIndex].x = scaleData.xScale.invert(offsetX);
        previosData[lastDataIndex].y = scaleData.yScale.invert(offsetY);

        drawnShapeHistory[index].data = previosData;
    }

    // mousemove
    useEffect(() => {
        d3.select(d3DragCanvas.current).on(
            'mousemove',
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            function (event: MouseEvent<HTMLDivElement>) {
                mousemove(event);
            },
        );
    }, []);

    useEffect(() => {
        d3.select(d3DragCanvas.current).style(
            'cursor',
            canUserDragDrawnShape ? 'pointer' : 'default',
        );
    }, [canUserDragDrawnShape]);

    useEffect(() => {
        const canvas = d3
            .select(d3DragCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const canvasRect = canvas.getBoundingClientRect();

        const dragDrawnShape = d3
            .drag<d3.DraggedElementBaseType, unknown, d3.SubjectPosition>()
            // .on('start', (event) => {
            //     console.log('start');
            // })
            .on('drag', function (event) {
                const offsetY = event.sourceEvent.clientY - canvasRect?.top;
                const offsetX = event.sourceEvent.clientX - canvasRect?.left;
                setCrossHairDataFunc(offsetX, offsetY);
                if (
                    selectedDrawnShape &&
                    selectedDrawnShape.data.type === 'Brush'
                ) {
                    if (!selectedDrawnShape.selectedCircle) {
                        dragLine(event);
                    } else {
                        updateDrawLine(offsetX, offsetY);
                    }
                }

                if (
                    selectedDrawnShape &&
                    selectedDrawnShape.data.type === 'Square'
                ) {
                    if (!selectedDrawnShape.selectedCircle) {
                        dragLine(event);
                    } else {
                        updateDrawLine(offsetX, offsetY);
                    }
                }
            })
            .on('end', () => {
                setIsDragActive(false);
            });

        if (d3DragCanvas.current) {
            d3.select<d3.DraggedElementBaseType, unknown>(
                d3DragCanvas.current,
            ).call(dragDrawnShape);
        }
    }, [selectedDrawnShape]);

    return <d3fc-canvas ref={d3DragCanvas} />;
}
