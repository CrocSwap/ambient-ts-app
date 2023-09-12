import { MouseEvent, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
    drawDataHistory,
    scaleData,
    selectedDrawnData,
} from '../../ChartUtils/chartUtils';

interface DragCanvasProps {
    scaleData: scaleData;
    hoveredDrawnShape: selectedDrawnData | undefined;
    drawnShapeHistory: drawDataHistory[];
    canUserDragDrawnShape: boolean;
    setIsDragActive: React.Dispatch<React.SetStateAction<boolean>>;
    setIsShapeSelected: React.Dispatch<React.SetStateAction<boolean>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setCrossHairDataFunc: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mousemove: any;
    setSelectedDrawnShape: any;
}

export default function DragCanvas(props: DragCanvasProps) {
    const d3DragCanvas = useRef<HTMLDivElement | null>(null);

    const {
        hoveredDrawnShape,
        drawnShapeHistory,
        render,
        setIsDragActive,
        setIsShapeSelected,
        mousemove,
        scaleData,
        canUserDragDrawnShape,
        setCrossHairDataFunc,
        setSelectedDrawnShape,
    } = props;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dragLine = (event: any) => {
        if (hoveredDrawnShape) {
            const movemementX = event.sourceEvent.movementX;
            const movemementY = event.sourceEvent.movementY;
            const index = drawnShapeHistory.findIndex(
                (item) => item === hoveredDrawnShape?.data,
            );

            const lastData = [
                {
                    x: scaleData.xScale.invert(
                        scaleData.xScale(hoveredDrawnShape?.data?.data[0].x) +
                            movemementX,
                    ),
                    y: scaleData.yScale.invert(
                        scaleData.yScale(hoveredDrawnShape.data?.data[0].y) +
                            movemementY,
                    ),
                    ctx: hoveredDrawnShape.data?.data[0].ctx,
                },
                {
                    x: scaleData.xScale.invert(
                        scaleData.xScale(hoveredDrawnShape.data.data[1].x) +
                            movemementX,
                    ),
                    y: scaleData.yScale.invert(
                        scaleData.yScale(hoveredDrawnShape.data.data[1].y) +
                            movemementY,
                    ),
                    ctx: hoveredDrawnShape.data?.data[1].ctx,
                },
            ];
            drawnShapeHistory[index].data = lastData;
            hoveredDrawnShape.data.data = lastData;

            render();
        }
    };

    function updateDrawLine(offsetX: number, offsetY: number) {
        const index = drawnShapeHistory.findIndex(
            (item) => item === hoveredDrawnShape?.data,
        );

        const previosData = drawnShapeHistory[index].data;

        const lastDataIndex = previosData.findIndex(
            (item) => item === hoveredDrawnShape?.selectedCircle,
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
            (item) => item === hoveredDrawnShape?.data,
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
                    hoveredDrawnShape &&
                    hoveredDrawnShape.data.type === 'Square'
                ) {
                    const index = drawnShapeHistory.findIndex(
                        (item) => item === hoveredDrawnShape?.data,
                    );

                    const previosData = drawnShapeHistory[index].data;

                    const selectedCircle = hoveredDrawnShape.selectedCircle;

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

                setIsShapeSelected(true);
                setSelectedDrawnShape(hoveredDrawnShape);
            })
            .on('drag', function (event) {
                const offsetY = event.sourceEvent.clientY - canvasRect?.top;
                const offsetX = event.sourceEvent.clientX - canvasRect?.left;
                setCrossHairDataFunc(offsetX, offsetY);
                if (
                    hoveredDrawnShape &&
                    hoveredDrawnShape.data.type === 'Brush'
                ) {
                    if (!hoveredDrawnShape.selectedCircle) {
                        dragLine(event);
                    } else {
                        updateDrawLine(offsetX, offsetY);
                    }
                }

                if (
                    hoveredDrawnShape &&
                    hoveredDrawnShape.data.type === 'Square'
                ) {
                    if (!hoveredDrawnShape.selectedCircle) {
                        dragLine(event);
                    } else {
                        updateDrawRect(offsetX, offsetY, rectDragDirection);
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
    }, [hoveredDrawnShape]);

    return <d3fc-canvas ref={d3DragCanvas} />;
}
