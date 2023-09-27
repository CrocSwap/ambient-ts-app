import React, { useContext, useEffect, useRef, useState } from 'react';
import FloatingDiv, {
    FloatingButtonDiv,
    FloatingOptions,
} from './FloatingToolbarCss';
import dragButton from '../../../../assets/images/icons/draw/floating_button.svg';
import deleteButton from '../../../../assets/images/icons/draw/draw_delete.svg';
import {
    drawDataHistory,
    selectedDrawnData,
} from '../../ChartUtils/chartUtils';
import * as d3 from 'd3';
import { ChartContext } from '../../../../contexts/ChartContext';

interface FloatingToolbarProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mainCanvasBoundingClientRect: any;
    selectedDrawnShape: selectedDrawnData | undefined;
    setDrawnShapeHistory: React.Dispatch<
        React.SetStateAction<drawDataHistory[]>
    >;
    setSelectedDrawnShape: React.Dispatch<
        React.SetStateAction<selectedDrawnData | undefined>
    >;
    drawActionStack: any;
    actionKey: any;
    deleteItem: any;
}
function FloatingToolbar(props: FloatingToolbarProps) {
    const {
        mainCanvasBoundingClientRect,
        selectedDrawnShape,
        setDrawnShapeHistory,
        setSelectedDrawnShape,
        drawActionStack,
        actionKey,
        deleteItem,
    } = props;
    const floatingDivRef = useRef<HTMLDivElement>(null);
    const { isFullScreen: fullScreenChart } = useContext(ChartContext);
    const [isDragging, setIsDragging] = useState(false);
    const [divLeft, setDivLeft] = useState(0);
    const [divTop, setDivTop] = useState(0);

    useEffect(() => {
        const floatingDiv = d3
            .select(floatingDivRef.current)
            .node() as HTMLDivElement;

        let offsetX = 0;
        let offsetY = 0;
        if (floatingDiv) {
            const floatingDivDrag = d3
                .drag<d3.DraggedElementBaseType, unknown, d3.SubjectPosition>()
                .on('start', function (event) {
                    offsetX =
                        event.sourceEvent.clientX -
                        floatingDiv.getBoundingClientRect().left;
                    offsetY =
                        event.sourceEvent.clientY -
                        floatingDiv.getBoundingClientRect().top;
                })
                .on('drag', function (event) {
                    if (floatingDivRef.current) {
                        setIsDragging(true);
                        const divLeft = event.sourceEvent.pageX - offsetX;
                        const divTop = event.sourceEvent.pageY - offsetY;
                        setDivLeft(divLeft);
                        setDivTop(divTop);
                    }
                });

            if (floatingDivRef.current) {
                d3.select<d3.DraggedElementBaseType, unknown>(
                    floatingDivRef.current,
                ).call(floatingDivDrag);
            }
        }
    }, [floatingDivRef, selectedDrawnShape]);

    const deleteDrawnShape = () => {
        // setDrawnShapeHistory((item: drawDataHistory[]) => {
        //     return item.filter((i) => i.time !== selectedDrawnShape?.data.time);
        // });
        deleteItem(selectedDrawnShape?.data);
        // setSelectedDrawnShape(undefined);
    };

    useEffect(() => {
        if (floatingDivRef.current && !isDragging) {
            const floatingDiv = d3
                .select(floatingDivRef.current)
                .node() as HTMLDivElement;

            setDivLeft(mainCanvasBoundingClientRect?.width);
            setDivTop(
                mainCanvasBoundingClientRect?.top -
                    (floatingDiv.getBoundingClientRect().height + 10),
            );
        }
    }, [
        floatingDivRef.current === null,
        mainCanvasBoundingClientRect,
        fullScreenChart,
    ]);

    return (
        <FloatingDiv
            ref={floatingDivRef}
            style={{
                left: divLeft + 'px',
                top: divTop + 'px',
                visibility:
                    selectedDrawnShape !== undefined && divLeft && divTop
                        ? 'visible'
                        : 'hidden',
            }}
        >
            <FloatingButtonDiv>
                <img src={dragButton} alt='' />
            </FloatingButtonDiv>
            <FloatingOptions onClick={deleteDrawnShape}>
                <img src={deleteButton} alt='' />
            </FloatingOptions>
        </FloatingDiv>
    );
}

export default FloatingToolbar;
