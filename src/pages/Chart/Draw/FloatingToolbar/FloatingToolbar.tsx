import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    FloatingButtonDiv,
    FloatingOptions,
    Divider,
    FloatingDivContainer,
    FloatingDiv,
    OptionsTab,
} from './FloatingToolbarCss';
import dragButton from '../../../../assets/images/icons/draw/floating_button.svg';
import {
    drawDataHistory,
    selectedDrawnData,
} from '../../ChartUtils/chartUtils';
import * as d3 from 'd3';
import { ChartContext } from '../../../../contexts/ChartContext';
import { AiOutlineDash, AiOutlineDelete, AiOutlineMinus } from 'react-icons/ai';
import { TbBrush } from 'react-icons/tb';

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
    deleteItem: (item: drawDataHistory) => void;
}
function FloatingToolbar(props: FloatingToolbarProps) {
    const {
        mainCanvasBoundingClientRect,
        selectedDrawnShape,
        setDrawnShapeHistory,
        setSelectedDrawnShape,
        deleteItem,
    } = props;
    const floatingDivRef = useRef<HTMLDivElement>(null);
    const { isFullScreen: fullScreenChart } = useContext(ChartContext);
    const [isDragging, setIsDragging] = useState(false);
    const [divLeft, setDivLeft] = useState(0);
    const [divTop, setDivTop] = useState(0);

    const [isOptionTabActive, setIsOptionTabActive] = useState(false);

    const handleEditColor = () => {
        if (selectedDrawnShape?.data) {
            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                item[changedItemIndex].color = 'red';

                return item;
            });
        }
    };

    const handleEditSize = () => {
        if (selectedDrawnShape?.data) {
            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                item[changedItemIndex].lineWidth = 5;

                return item;
            });
        }
    };

    const handleEditBorder = () => {
        if (selectedDrawnShape?.data) {
            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                item[changedItemIndex].style = [3, 5];

                return item;
            });
        }
    };

    const deleteDrawnShape = () => {
        if (selectedDrawnShape?.data) {
            deleteItem(selectedDrawnShape?.data);
            setDrawnShapeHistory((item: drawDataHistory[]) => {
                return item.filter(
                    (i) => i.time !== selectedDrawnShape?.data.time,
                );
            });
            setSelectedDrawnShape(undefined);
        }
    };

    const editShapeOptions = [
        {
            name: 'Color',
            type: 'color',
            operation: handleEditColor,
            icon: <TbBrush />,
        },
        {
            name: 'Size',
            type: 'size',
            operation: () => setIsOptionTabActive((prev) => !prev),
            icon: <AiOutlineMinus color='white' />,
        },
        {
            name: 'Style',
            type: 'style',
            operation: () => setIsOptionTabActive((prev) => !prev),
            icon: <AiOutlineDash color='white' />,
        },
        {
            name: 'Delete',
            type: 'delete',
            operation: deleteDrawnShape,
            icon: <AiOutlineDelete />,
        },
    ];

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
        <FloatingDivContainer
            ref={floatingDivRef}
            style={{
                left: divLeft + 'px',
                top: divTop + 'px',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                visibility:
                    selectedDrawnShape !== undefined && divLeft && divTop
                        ? 'visible'
                        : 'hidden',
            }}
        >
            <FloatingDiv>
                <FloatingButtonDiv>
                    <img src={dragButton} alt='' />
                    <Divider></Divider>
                </FloatingButtonDiv>

                {editShapeOptions.map((item, index) => (
                    <FloatingOptions key={index} onClick={item.operation}>
                        {item.icon}
                    </FloatingOptions>
                ))}
            </FloatingDiv>

            {isOptionTabActive && (
                <OptionsTab
                    style={{
                        marginLeft: '35px',
                    }}
                ></OptionsTab>
            )}
        </FloatingDivContainer>
    );
}

export default FloatingToolbar;
