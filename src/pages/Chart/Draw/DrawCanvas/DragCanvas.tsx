import { MouseEvent, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
    drawDataHistory,
    lineData,
    scaleData,
    selectedDrawnData,
} from '../../ChartUtils/chartUtils';

interface DragCanvasProps {
    scaleData: scaleData;
    hoveredDrawnShape: selectedDrawnData | undefined;
    drawnShapeHistory: drawDataHistory[];
    canUserDragDrawnShape: boolean;
    setIsUpdatingShape: React.Dispatch<React.SetStateAction<boolean>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setCrossHairDataFunc: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mousemove: any;
    setSelectedDrawnShape: React.Dispatch<
        React.SetStateAction<selectedDrawnData | undefined>
    >;
    denomInBase: boolean;
    addDrawActionStack: (item: drawDataHistory, isNewShape: boolean) => void;
}

export default function DragCanvas(props: DragCanvasProps) {
    const d3DragCanvas = useRef<HTMLDivElement | null>(null);

    const {
        hoveredDrawnShape,
        drawnShapeHistory,
        render,
        setIsUpdatingShape,
        mousemove,
        scaleData,
        canUserDragDrawnShape,
        setCrossHairDataFunc,
        setSelectedDrawnShape,
        denomInBase,
        addDrawActionStack,
    } = props;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dragLine = (movemementX: number, movemementY: number) => {
        if (hoveredDrawnShape) {
            const index = drawnShapeHistory.findIndex(
                (item) => item === hoveredDrawnShape?.data,
            );

            const isPointInDenom =
                hoveredDrawnShape?.data?.data[0].denomInBase === denomInBase;

            const denomScale = scaleData.yScale.copy();
            denomScale.domain([
                1 / scaleData.yScale.domain()[0],
                1 / scaleData.yScale.domain()[1],
            ]);

            const scale = isPointInDenom ? scaleData.yScale : denomScale;

            const lastData = [
                {
                    x: scaleData.xScale.invert(
                        scaleData.xScale(hoveredDrawnShape?.data?.data[0].x) +
                            movemementX,
                    ),
                    y: scale.invert(
                        scale(hoveredDrawnShape.data.data[0].y) + movemementY,
                    ),
                    denomInBase: hoveredDrawnShape.data?.data[0].denomInBase,
                },
                {
                    x: scaleData.xScale.invert(
                        scaleData.xScale(hoveredDrawnShape.data.data[1].x) +
                            movemementX,
                    ),
                    y: scale.invert(
                        scale(hoveredDrawnShape.data.data[1].y) + movemementY,
                    ),
                    denomInBase: hoveredDrawnShape.data?.data[1].denomInBase,
                },
            ];

            drawnShapeHistory[index].data = lastData;
            hoveredDrawnShape.data.data = lastData;

            render();
        }
    };

    function updateDrawLine(
        offsetX: number,
        offsetY: number,
        denomInBase: boolean,
    ) {
        const index = drawnShapeHistory.findIndex(
            (item) => item.time === hoveredDrawnShape?.data.time,
        );

        const previosData = drawnShapeHistory[index].data;

        if (drawnShapeHistory[index].type === 'Ray') {
            previosData.forEach((data) => {
                data.x = scaleData.xScale.invert(offsetX);
                data.y =
                    data.denomInBase === denomInBase
                        ? scaleData.yScale.invert(offsetY)
                        : 1 / scaleData.yScale.invert(offsetY);
            });
        } else {
            const lastDataIndex = previosData.findIndex(
                (item) =>
                    hoveredDrawnShape?.selectedCircle &&
                    item.x === hoveredDrawnShape?.selectedCircle.x &&
                    item.y ===
                        (item.denomInBase === denomInBase
                            ? hoveredDrawnShape?.selectedCircle.y
                            : 1 / hoveredDrawnShape?.selectedCircle.y),
            );

            if (lastDataIndex !== -1) {
                if (hoveredDrawnShape && hoveredDrawnShape.selectedCircle) {
                    hoveredDrawnShape.selectedCircle.x =
                        scaleData.xScale.invert(offsetX);
                    hoveredDrawnShape.selectedCircle.y =
                        scaleData.yScale.invert(offsetY);
                }

                previosData[lastDataIndex].x = scaleData.xScale.invert(offsetX);
                previosData[lastDataIndex].y =
                    previosData[lastDataIndex].denomInBase === denomInBase
                        ? scaleData.yScale.invert(offsetY)
                        : 1 / scaleData.yScale.invert(offsetY);
            }
        }
        drawnShapeHistory[index].data = previosData;
    }

    function updateDrawRect(
        offsetX: number,
        offsetY: number,
        rectDragDirection: string,
        is0Left: boolean,
        is0Top: boolean,
        denomInBase: boolean,
    ) {
        const index = drawnShapeHistory.findIndex(
            (item) => item === hoveredDrawnShape?.data,
        );

        if (index !== -1) {
            const previosData = drawnShapeHistory[index].data;

            const newX = scaleData.xScale.invert(offsetX);
            const newY = scaleData.yScale.invert(offsetY);

            const should0xMove = is0Left
                ? rectDragDirection.includes('Left')
                : rectDragDirection.includes('Right');

            const should0yMove = is0Top
                ? rectDragDirection.includes('top')
                : rectDragDirection.includes('bottom');

            const should1xMove = is0Left
                ? rectDragDirection.includes('Right')
                : rectDragDirection.includes('Left');

            const should1yMove = is0Top
                ? rectDragDirection.includes('bottom')
                : rectDragDirection.includes('top');

            const newYWithDenom =
                previosData[0].denomInBase === denomInBase ? newY : 1 / newY;

            previosData[0].x = should0xMove ? newX : previosData[0].x;

            previosData[0].y = should0yMove ? newYWithDenom : previosData[0].y;

            previosData[1].x = should1xMove ? newX : previosData[1].x;

            previosData[1].y = should1yMove ? newYWithDenom : previosData[1].y;

            drawnShapeHistory[index].data = previosData;
            if (hoveredDrawnShape) {
                hoveredDrawnShape.selectedCircle = {
                    x: newX,
                    y: newYWithDenom,
                    denomInBase: denomInBase,
                };
            }
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
        let dragTimeout: number | undefined = undefined;
        let cancelDrag = false;

        let offsetY = 0;
        let offsetX = 0;
        let movemementX = 0;
        let movemementY = 0;

        let tempMovemementX = 0;
        let tempMovemementY = 0;
        let rectDragDirection = '';
        let isDragging = false;
        let previousData: lineData[] | undefined = undefined;
        let previousIndex = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cancelDragEvent = (event: any) => {
            if (event.key === 'Escape') {
                cancelDrag = true;
                event.preventDefault();
                event.stopPropagation();
                document.removeEventListener('keydown', cancelDragEvent);
            }
        };

        let is0Left = false;
        let is0Top = false;
        const dragDrawnShape = d3
            .drag<d3.DraggedElementBaseType, unknown, d3.SubjectPosition>()
            .on('start', (event) => {
                document.addEventListener('keydown', cancelDragEvent);
                if (event.sourceEvent instanceof TouchEvent) {
                    tempMovemementY =
                        event.sourceEvent.touches[0].clientY - canvasRect?.top;
                    tempMovemementX =
                        event.sourceEvent.touches[0].clientX - canvasRect?.left;
                }

                previousIndex = drawnShapeHistory.findIndex(
                    (item) => item === hoveredDrawnShape?.data,
                );

                if (previousIndex !== -1) {
                    const originalData = drawnShapeHistory[previousIndex].data;
                    previousData = originalData.map((item) => {
                        return { ...item };
                    });
                    dragTimeout = event.sourceEvent.timeStamp;

                    if (
                        hoveredDrawnShape &&
                        hoveredDrawnShape.data.type === 'Square'
                    ) {
                        const selectedCircle = hoveredDrawnShape.selectedCircle;

                        if (selectedCircle) {
                            const topLineY = Math.max(
                                previousData[0].y,
                                previousData[1].y,
                            );
                            const leftLineX = Math.min(
                                previousData[0].x,
                                previousData[1].x,
                            );

                            const direction =
                                topLineY ===
                                (previousData[0].denomInBase === denomInBase
                                    ? selectedCircle.y
                                    : 1 / selectedCircle.y)
                                    ? 'top'
                                    : 'bottom';

                            rectDragDirection =
                                leftLineX === selectedCircle.x
                                    ? direction + 'Left'
                                    : direction + 'Right';
                        }

                        is0Left = previousData[0].x < previousData[1].x;
                        is0Top = previousData[0].y > previousData[1].y;
                    }

                    setSelectedDrawnShape(hoveredDrawnShape);
                }
            })
            .on('drag', function (event) {
                if (!cancelDrag) {
                    (async () => {
                        if (event.sourceEvent instanceof TouchEvent) {
                            offsetY =
                                event.sourceEvent.touches[0].clientY -
                                canvasRect?.top;
                            offsetX =
                                event.sourceEvent.touches[0].clientX -
                                canvasRect?.left;
                            movemementX = offsetX - tempMovemementX;
                            movemementY = offsetY - tempMovemementY;
                        } else {
                            offsetY =
                                event.sourceEvent.clientY - canvasRect?.top;
                            offsetX =
                                event.sourceEvent.clientX - canvasRect?.left;

                            movemementX = event.sourceEvent.movementX;
                            movemementY = event.sourceEvent.movementY;
                        }
                        setCrossHairDataFunc(offsetX, offsetY);
                        if (
                            hoveredDrawnShape &&
                            (hoveredDrawnShape.data.type === 'Brush' ||
                                hoveredDrawnShape.data.type === 'Angle' ||
                                hoveredDrawnShape.data.type === 'Ray')
                        ) {
                            if (!hoveredDrawnShape.selectedCircle) {
                                dragLine(movemementX, movemementY);
                            } else {
                                setIsUpdatingShape(true);
                                updateDrawLine(offsetX, offsetY, denomInBase);
                            }
                        }

                        if (
                            hoveredDrawnShape &&
                            hoveredDrawnShape.data.type === 'Square'
                        ) {
                            if (!hoveredDrawnShape.selectedCircle) {
                                dragLine(movemementX, movemementY);
                            } else {
                                setIsUpdatingShape(true);
                                updateDrawRect(
                                    offsetX,
                                    offsetY,
                                    rectDragDirection,
                                    is0Left,
                                    is0Top,
                                    denomInBase,
                                );
                            }
                        }
                    })().then(() => {
                        if (event.sourceEvent instanceof TouchEvent) {
                            tempMovemementX =
                                event.sourceEvent.touches[0].clientX -
                                canvasRect?.left;
                            tempMovemementY =
                                event.sourceEvent.touches[0].clientY -
                                canvasRect?.top;
                        }

                        isDragging = true;
                    });
                } else {
                    if (previousData) {
                        drawnShapeHistory[previousIndex].data = previousData;
                        setIsUpdatingShape(false);
                    }
                }
            })
            .on('end', (event) => {
                tempMovemementX = 0;
                tempMovemementY = 0;
                setIsUpdatingShape(false);

                const tempLastData = drawnShapeHistory.find(
                    (item) => hoveredDrawnShape?.data.time === item.time,
                );

                if (!cancelDrag) {
                    if (
                        tempLastData &&
                        isDragging &&
                        dragTimeout &&
                        event.sourceEvent.timeStamp - dragTimeout > 200
                    ) {
                        addDrawActionStack(tempLastData, false);
                    }
                } else {
                    if (previousData) {
                        drawnShapeHistory[previousIndex].data = previousData;
                    }
                }

                isDragging = false;
            });

        if (d3DragCanvas.current) {
            d3.select<d3.DraggedElementBaseType, unknown>(
                d3DragCanvas.current,
            ).call(dragDrawnShape);
        }
    }, [hoveredDrawnShape, drawnShapeHistory]);

    return <d3fc-canvas ref={d3DragCanvas} />;
}
