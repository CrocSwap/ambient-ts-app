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
    setIsUpdatingShape: React.Dispatch<React.SetStateAction<boolean>>;
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
        setIsUpdatingShape,
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

    function updateDrawRect(
        offsetX: number,
        offsetY: number,
        rectDragDirection: string,
    ) {
        const index = drawnShapeHistory.findIndex(
            (item) => item === selectedDrawnShape?.data,
        );

        const previosData = drawnShapeHistory[index].data;

        const newX = scaleData.xScale.invert(offsetX);
        const newY = scaleData.yScale.invert(offsetY);

        previosData[0].x = rectDragDirection.includes('Left')
            ? newX
            : previosData[0].x;
        previosData[0].y = rectDragDirection.includes('top')
            ? newY
            : previosData[0].y;

        previosData[1].x = rectDragDirection.includes('Right')
            ? newX
            : previosData[1].x;
        previosData[1].y = rectDragDirection.includes('bottom')
            ? newY
            : previosData[1].y;

        drawnShapeHistory[index].data = previosData;
        if (selectedDrawnShape) {
            selectedDrawnShape.selectedCircle = {
                x: newX,
                y: newY,
                ctx: undefined,
            };
        }
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

        let rectDragDirection = '';

        const dragDrawnShape = d3
            .drag<d3.DraggedElementBaseType, unknown, d3.SubjectPosition>()
            .on('start', () => {
                if (
                    selectedDrawnShape &&
                    selectedDrawnShape.data.type === 'Square'
                ) {
                    const index = drawnShapeHistory.findIndex(
                        (item) => item === selectedDrawnShape?.data,
                    );

                    const previosData = drawnShapeHistory[index].data;

                    const selectedCircle = selectedDrawnShape.selectedCircle;

                    if (selectedCircle) {
                        const direction =
                            previosData[0].y <= selectedCircle.y
                                ? 'top'
                                : 'bottom';

                        rectDragDirection =
                            previosData[0].x >= selectedCircle.x
                                ? direction + 'Left'
                                : direction + 'Right';
                    }
                }
            })
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
                        setIsUpdatingShape(true);
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
                        setIsUpdatingShape(true);
                        updateDrawRect(offsetX, offsetY, rectDragDirection);
                    }
                }
            })
            .on('end', () => {
                setIsUpdatingShape(false);
            });

        if (d3DragCanvas.current) {
            d3.select<d3.DraggedElementBaseType, unknown>(
                d3DragCanvas.current,
            ).call(dragDrawnShape);
        }
    }, [selectedDrawnShape]);

    return <d3fc-canvas ref={d3DragCanvas} />;
}
