import { MouseEvent, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { drawDataHistory, scaleData } from '../../ChartUtils/chartUtils';

interface DragCanvasProps {
    scaleData: scaleData;
    selectedDrawnShape: drawDataHistory;
    drawnShapeHistory: drawDataHistory[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: any;
    setIsDragActive: React.Dispatch<React.SetStateAction<boolean>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mousemove: any;
    canUserDragDrawnShape: boolean;
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
    } = props;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dragLine = (event: any) => {
        const movemementX = event.sourceEvent.movementX;
        const movemementY = event.sourceEvent.movementY;
        const index = drawnShapeHistory.findIndex(
            (item) => item === selectedDrawnShape,
        );

        const lastData = [
            {
                x: scaleData.xScale.invert(
                    scaleData.xScale(selectedDrawnShape.data[0].x) +
                        movemementX,
                ),
                y: scaleData.yScale.invert(
                    scaleData.yScale(selectedDrawnShape.data[0].y) +
                        movemementY,
                ),
            },
            {
                x: scaleData.xScale.invert(
                    scaleData.xScale(selectedDrawnShape.data[1].x) +
                        movemementX,
                ),
                y: scaleData.yScale.invert(
                    scaleData.yScale(selectedDrawnShape.data[1].y) +
                        movemementY,
                ),
            },
        ];
        drawnShapeHistory[index].data = lastData;
        selectedDrawnShape.data = lastData;

        render();
    };

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
        const dragDrawnShape = d3
            .drag<d3.DraggedElementBaseType, unknown, d3.SubjectPosition>()
            // .on('start', (event) => {
            //     console.log('start');
            // })
            .on('drag', function (event) {
                if (selectedDrawnShape && selectedDrawnShape.type === 'line') {
                    dragLine(event);
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
