import { MouseEvent, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
    drawDataHistory,
    lineData,
    scaleData,
} from '../../ChartUtils/chartUtils';
import { distanceToLine } from './LinearLineSeries';

interface DragCanvasProps {
    scaleData: scaleData;
    selectedDrawnShape: drawDataHistory;
    drawnShapeHistory: drawDataHistory[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: any;
    setIsDragActive: React.Dispatch<React.SetStateAction<boolean>>;
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
    } = props;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dragLine = (event: any) => {
        const movemementX = event.sourceEvent.movementX;
        const movemementY = event.sourceEvent.movementY;
        const index = drawnShapeHistory.findIndex(
            (item) => item === selectedDrawnShape,
        );
        drawnShapeHistory[index].data = [
            {
                x: selectedDrawnShape.data[0].x + movemementX,
                y: selectedDrawnShape.data[0].y + movemementY,
            },
            {
                x: selectedDrawnShape.data[1].x + movemementX,
                y: selectedDrawnShape.data[1].y + movemementY,
            },
        ];

        render();
    };

    function checkLineLocation(
        element: lineData[],
        mouseX: number,
        mouseY: number,
    ) {
        const threshold = 10;
        const distance = distanceToLine(
            mouseX,
            mouseY,
            element[0].x,
            element[0].y,
            element[1].x,
            element[1].y,
        );

        return distance < threshold;

        return false;
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
        const dragDrawnShape = d3
            .drag<d3.DraggedElementBaseType, unknown, d3.SubjectPosition>()
            // .on('start', (event) => {
            //     console.log('start');
            // })
            .on('drag', function (event) {
                if (selectedDrawnShape.type === 'line') {
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
