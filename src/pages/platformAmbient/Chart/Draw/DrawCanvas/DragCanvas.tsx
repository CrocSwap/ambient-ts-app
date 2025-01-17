import * as d3 from 'd3';
import { MouseEvent, useContext, useEffect, useRef } from 'react';
import { diffHashSigScaleData } from '../../../../../ambient-utils/dataLayer';
import { CandleDataIF } from '../../../../../ambient-utils/types';
import { ChartContext } from '../../../../../contexts/ChartContext';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import {
    CandleDataChart,
    drawDataHistory,
    findSnapTime,
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
    addDrawActionStack: (
        item: drawDataHistory,
        isNewShape: boolean,
        type: string,
        updatedData: drawDataHistory | undefined,
    ) => void;
    snapForCandle: (
        point: number,
        filtered: Array<CandleDataIF>,
    ) => CandleDataIF;
    visibleCandleData: CandleDataChart[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    zoomBase: any;
    setIsChartZoom: React.Dispatch<React.SetStateAction<boolean>>;
    isChartZoom: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    firstCandleData: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lastCandleData: any;
    setIsDragActive: React.Dispatch<boolean>;
    period: number;
    setContextmenu: React.Dispatch<React.SetStateAction<boolean>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setContextMenuPlacement: any;
    setIsShowFloatingToolbar: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DragCanvas(props: DragCanvasProps) {
    const d3DragCanvas = useRef<HTMLDivElement | null>(null);
    const { isMagnetActive } = useContext(ChartContext);

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
        snapForCandle,
        visibleCandleData,
        zoomBase,
        setIsChartZoom,
        isChartZoom,
        firstCandleData,
        lastCandleData,
        setIsDragActive,
        period,
        setContextmenu,
        setContextMenuPlacement,
        setIsShowFloatingToolbar,
    } = props;

    const mobileView = useMediaQuery('(max-width: 768px)');
    const tabletView = useMediaQuery(
        '(min-width: 768px) and (max-width: 1200px)',
    );

    useEffect(() => {
        if (scaleData !== undefined && !isChartZoom) {
            let scrollTimeout: NodeJS.Timeout | null = null; // Declare scrollTimeout
            const lastCandleDate = lastCandleData?.time * 1000;
            const firstCandleDate = firstCandleData?.time * 1000;
            d3.select(d3DragCanvas.current).on(
                'wheel',
                function (event) {
                    if (scrollTimeout === null) {
                        setIsChartZoom(true);
                    }

                    zoomBase.zoomWithWheel(
                        event,
                        scaleData,
                        firstCandleDate,
                        lastCandleDate,
                    );
                    render();

                    if (scrollTimeout) {
                        clearTimeout(scrollTimeout);
                    }
                    // check wheel end
                    scrollTimeout = setTimeout(() => {
                        setIsChartZoom(false);
                    }, 200);
                },
                { passive: true },
            );
        }
    }, [diffHashSigScaleData(scaleData, 'x'), isChartZoom]);

    function getXandYvalueOfDrawnShape(
        offsetX: number,
        offsetY: number,
        includeY = true,
    ) {
        let valueY = scaleData?.yScale.invert(offsetY);
        const nearest = snapForCandle(offsetX, visibleCandleData);

        if (nearest && includeY) {
            const high = denomInBase
                ? nearest?.invMinPriceExclMEVDecimalCorrected
                : nearest?.minPriceExclMEVDecimalCorrected;

            const low = denomInBase
                ? nearest?.invMaxPriceExclMEVDecimalCorrected
                : nearest?.maxPriceExclMEVDecimalCorrected;

            const open = denomInBase
                ? nearest.invPriceOpenExclMEVDecimalCorrected
                : nearest.priceOpenExclMEVDecimalCorrected;

            const close = denomInBase
                ? nearest.invPriceCloseExclMEVDecimalCorrected
                : nearest.priceCloseExclMEVDecimalCorrected;

            const highToCoordinat = scaleData.yScale(high);
            const lowToCoordinat = scaleData.yScale(low);
            const openToCoordinat = scaleData.yScale(open);
            const closeToCoordinat = scaleData.yScale(close);

            const highDiff = Math.abs(offsetY - highToCoordinat);
            const lowDiff = Math.abs(offsetY - lowToCoordinat);
            const openDiff = Math.abs(offsetY - openToCoordinat);
            const closeDiff = Math.abs(offsetY - closeToCoordinat);

            if (
                isMagnetActive.value &&
                (highDiff <= 100 ||
                    lowDiff <= 100 ||
                    openDiff <= 100 ||
                    closeDiff <= 100)
            ) {
                const minDiffForYValue = Math.min(
                    openDiff,
                    closeDiff,
                    lowDiff,
                    highDiff,
                );

                switch (minDiffForYValue) {
                    case highDiff:
                        valueY = high;
                        break;

                    case lowDiff:
                        valueY = low;
                        break;
                    case openDiff:
                        valueY = open;
                        break;

                    case closeDiff:
                        valueY = close;
                        break;
                }
            }
        }

        const snappedTime = findSnapTime(
            scaleData?.xScale.invert(offsetX),
            period,
        );

        let valueX = snappedTime;

        const checkVisibleCandle = visibleCandleData.length === 0;

        if (!checkVisibleCandle && nearest) {
            const lastDateLocation = scaleData.xScale(
                visibleCandleData[0].time * 1000,
            );

            const firstDateLocation = scaleData.xScale(
                visibleCandleData[visibleCandleData.length - 1].time * 1000,
            );

            if (offsetX < lastDateLocation && offsetX > firstDateLocation) {
                valueX = nearest.time * 1000;
            }
        }

        return { valueX: valueX, valueY: valueY };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dragLine = (movementX: number, movemementY: number) => {
        if (hoveredDrawnShape) {
            let isSnapped = true;
            const index = drawnShapeHistory.findIndex(
                (item) => item === hoveredDrawnShape?.data,
            );

            const isPointInDenom =
                hoveredDrawnShape?.data?.data[0].denomInBase === denomInBase;

            const firstPoint = isPointInDenom
                ? hoveredDrawnShape.data.data[0].y
                : 1 / hoveredDrawnShape.data.data[0].y;

            const secondPoint = isPointInDenom
                ? hoveredDrawnShape.data.data[1].y
                : 1 / hoveredDrawnShape.data.data[1].y;

            const reversedFirstPoint = scaleData.yScale.invert(
                scaleData.yScale(firstPoint) + movemementY,
            );
            const reversedSecondPoint = scaleData.yScale.invert(
                scaleData.yScale(secondPoint) + movemementY,
            );

            if (firstPoint > 0 && secondPoint > 0) {
                const calPoint0 =
                    scaleData.xScale(hoveredDrawnShape?.data?.data[0].x) +
                    movementX;

                const calPoint1 =
                    scaleData.xScale(hoveredDrawnShape.data.data[1].x) +
                    movementX;

                const snap0 = getXandYvalueOfDrawnShape(calPoint0, 1, false);
                const snap1 = getXandYvalueOfDrawnShape(calPoint1, 1, false);

                isSnapped =
                    snap0.valueX !== hoveredDrawnShape?.data?.data[0].x &&
                    snap1.valueX !== hoveredDrawnShape?.data?.data[1].x;

                const lastData = [
                    {
                        x: snap0.valueX,
                        y: isPointInDenom
                            ? reversedFirstPoint
                            : 1 / reversedFirstPoint,
                        denomInBase:
                            hoveredDrawnShape.data?.data[0].denomInBase,
                    },
                    {
                        x: snap1.valueX,
                        y: isPointInDenom
                            ? reversedSecondPoint
                            : 1 / reversedSecondPoint,
                        denomInBase:
                            hoveredDrawnShape.data?.data[1].denomInBase,
                    },
                ];

                drawnShapeHistory[index].data = lastData;
                hoveredDrawnShape.data.data = lastData;
            }

            render();
            return isSnapped;
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

        const { valueX, valueY } = getXandYvalueOfDrawnShape(offsetX, offsetY);

        const previosData = drawnShapeHistory[index].data;

        if (drawnShapeHistory[index].type === 'Ray') {
            previosData.forEach((data) => {
                data.x = valueX;
                data.y = data.denomInBase === denomInBase ? valueY : 1 / valueY;
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
                    hoveredDrawnShape.selectedCircle.x = valueX;
                    hoveredDrawnShape.selectedCircle.y = valueY;
                }

                const newYData =
                    previosData[lastDataIndex].denomInBase === denomInBase
                        ? valueY
                        : 1 / valueY;

                if (newYData > 0) {
                    previosData[lastDataIndex].x = valueX;
                    previosData[lastDataIndex].y = newYData;
                }
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

            const { valueX: newX, valueY: newY } = getXandYvalueOfDrawnShape(
                offsetX,
                offsetY,
            );
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

    useEffect(() => {
        const canvas = d3
            .select(d3DragCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        canvas.addEventListener('pointerup', (event: PointerEvent) => {
            if (event.pointerType === 'touch') {
                setIsDragActive(false);
            }
        });
    }, []);

    // mousemove
    useEffect(() => {
        d3.select(d3DragCanvas.current).on(
            'mousemove',
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            function (event: MouseEvent<HTMLDivElement>) {
                mousemove(event);
            },
        );

        d3.select(d3DragCanvas.current).on(
            'contextmenu',
            (event: PointerEvent) => {
                if (!event.shiftKey) {
                    if (tabletView) {
                        event.preventDefault();

                        const screenHeight = window.innerHeight;

                        const diff = screenHeight - event.clientY;

                        setContextMenuPlacement({
                            top: event.clientY,
                            left: event.clientX,
                            isReversed: diff < 350,
                        });

                        setContextmenu(true);
                    } else {
                        setSelectedDrawnShape(undefined);
                        setIsShowFloatingToolbar(false);
                    }
                } else {
                    setContextmenu(false);
                }
            },
        );
    }, []);

    useEffect(() => {
        if (mobileView) {
            setSelectedDrawnShape(hoveredDrawnShape);
        }
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
        let movementX = 0;
        let stackedMovementX = 0;
        let movemementY = 0;

        let tempmovementX = 0;
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
                if (
                    typeof TouchEvent !== 'undefined' &&
                    event.sourceEvent instanceof TouchEvent
                ) {
                    tempMovemementY =
                        event.sourceEvent.touches[0].clientY - canvasRect?.top;
                    tempmovementX =
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
                        (hoveredDrawnShape.data.type === 'Rect' ||
                            hoveredDrawnShape.data.type === 'DPRange')
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
                        if (
                            typeof TouchEvent !== 'undefined' &&
                            event.sourceEvent instanceof TouchEvent
                        ) {
                            offsetY =
                                event.sourceEvent.touches[0].clientY -
                                canvasRect?.top;
                            offsetX =
                                event.sourceEvent.touches[0].clientX -
                                canvasRect?.left;
                            movementX = offsetX - tempmovementX;
                            movemementY = offsetY - tempMovemementY;
                        } else {
                            offsetY =
                                event.sourceEvent.clientY - canvasRect?.top;
                            offsetX =
                                event.sourceEvent.clientX - canvasRect?.left;

                            movementX =
                                stackedMovementX + event.sourceEvent.movementX;
                            movemementY = event.sourceEvent.movementY;
                        }

                        const { valueX } = getXandYvalueOfDrawnShape(
                            offsetX,
                            offsetY,
                            false,
                        );

                        const shouldSnap =
                            movementX < 0
                                ? valueX > scaleData.xScale.invert(offsetX)
                                : valueX < scaleData.xScale.invert(offsetX);

                        setCrossHairDataFunc(valueX, offsetX, offsetY);

                        if (
                            hoveredDrawnShape &&
                            (hoveredDrawnShape.data.type === 'Brush' ||
                                hoveredDrawnShape.data.type === 'Angle' ||
                                hoveredDrawnShape.data.type ===
                                    'FibRetracement' ||
                                hoveredDrawnShape.data.type === 'Ray')
                        ) {
                            if (!hoveredDrawnShape.selectedCircle) {
                                setIsUpdatingShape(true);
                                const isSnapped = dragLine(
                                    movementX,
                                    movemementY,
                                );
                                if (!isSnapped && shouldSnap) {
                                    stackedMovementX = movementX;
                                } else {
                                    stackedMovementX = 0;
                                }
                            } else {
                                setIsUpdatingShape(true);
                                updateDrawLine(offsetX, offsetY, denomInBase);
                            }
                        }

                        if (
                            hoveredDrawnShape &&
                            (hoveredDrawnShape.data.type === 'Rect' ||
                                hoveredDrawnShape.data.type === 'DPRange')
                        ) {
                            if (!hoveredDrawnShape.selectedCircle) {
                                setIsUpdatingShape(true);
                                const isSnapped = dragLine(
                                    movementX,
                                    movemementY,
                                );
                                if (!isSnapped && shouldSnap) {
                                    stackedMovementX = movementX;
                                } else {
                                    stackedMovementX = 0;
                                }
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
                        if (
                            typeof TouchEvent !== 'undefined' &&
                            event.sourceEvent instanceof TouchEvent
                        ) {
                            tempmovementX =
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
                tempmovementX = 0;
                tempMovemementY = 0;
                setIsUpdatingShape(false);

                const tempLastData = drawnShapeHistory.find(
                    (item) => hoveredDrawnShape?.data.time === item.time,
                );

                if (!cancelDrag) {
                    if (
                        previousData &&
                        tempLastData &&
                        isDragging &&
                        dragTimeout &&
                        event.sourceEvent.timeStamp - dragTimeout > 200
                    ) {
                        const updatedStackData = structuredClone(tempLastData);
                        updatedStackData.data = previousData;

                        addDrawActionStack(
                            updatedStackData,
                            false,
                            'update',
                            tempLastData,
                        );
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
    }, [hoveredDrawnShape, drawnShapeHistory, visibleCandleData]);

    return <d3fc-canvas ref={d3DragCanvas} />;
}
