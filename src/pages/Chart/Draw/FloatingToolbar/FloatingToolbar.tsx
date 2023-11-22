import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    FloatingButtonDiv,
    FloatingOptions,
    Divider,
    FloatingDivContainer,
    FloatingDiv,
    OptionsTab,
    OptionsTabSize,
    OptionsTabStyle,
    ColorPickerTab,
} from './FloatingToolbarCss';
import dragButton from '../../../../assets/images/icons/draw/floating_button.svg';
import {
    drawDataHistory,
    selectedDrawnData,
} from '../../ChartUtils/chartUtils';
import * as d3 from 'd3';
import { ChartContext } from '../../../../contexts/ChartContext';
import {
    AiOutlineDash,
    AiOutlineDelete,
    AiOutlineMinus,
    AiOutlineSmallDash,
} from 'react-icons/ai';
import { SketchPicker } from 'react-color';
import { IoCloseOutline } from 'react-icons/io5';
import useKeyPress from '../../../../App/hooks/useKeyPress';
import { IoMdColorFilter } from 'react-icons/io';
import { CgColorBucket } from 'react-icons/cg';
import { BsGear } from 'react-icons/bs';
import FloatingToolbarSettings from './FloatingToolbarSettings';

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
    setIsDragActive: React.Dispatch<boolean>;
    setIsShapeEdited: React.Dispatch<boolean>;
    deleteItem: (item: drawDataHistory) => void;
    addDrawActionStack: (item: drawDataHistory, isNewShape: boolean) => void;
}

function FloatingToolbar(props: FloatingToolbarProps) {
    const {
        mainCanvasBoundingClientRect,
        selectedDrawnShape,
        setDrawnShapeHistory,
        setSelectedDrawnShape,
        setIsDragActive,
        deleteItem,
        setIsShapeEdited,
        addDrawActionStack,
    } = props;
    const floatingDivRef = useRef<HTMLDivElement>(null);
    const { isFullScreen: fullScreenChart } = useContext(ChartContext);
    const [isDragging, setIsDragging] = useState(false);
    const [divLeft, setDivLeft] = useState(0);
    const [divTop, setDivTop] = useState(0);

    const [colorPicker, setColorPicker] = useState({
        lineColor: '#7371fc',
        borderColor: '#7371fc',
        background: '#7371fc',
    });

    const [isStyleOptionTabActive, setIsStyleOptionTabActive] = useState(false);
    const [isSizeOptionTabActive, setIsSizeOptionTabActive] = useState(false);

    const [isLineColorPickerTabActive, setIsLineColorPickerTabActive] =
        useState(false);
    const [isBorderColorPickerTabActive, setIsBorderColorPickerTabActive] =
        useState(false);
    const [
        isBackgroundColorPickerTabActive,
        setIsBackgroundColorPickerTabActive,
    ] = useState(false);

    const [isSettingsTabActive, setIsSettingsTabActive] = useState(false);

    const isDeletePressed = useKeyPress('Delete');

    useEffect(() => {
        if (isDeletePressed && selectedDrawnShape) {
            deleteDrawnShape();
        }
    }, [isDeletePressed]);

    useEffect(() => {
        setIsStyleOptionTabActive(false);
        setIsLineColorPickerTabActive(false);
        setIsSizeOptionTabActive(false);
        setIsBorderColorPickerTabActive(false);
        setIsBackgroundColorPickerTabActive(false);
        setIsSettingsTabActive(false);
        if (selectedDrawnShape === undefined) {
            const colorCodes = {
                lineColor: '#7371fc',
                borderColor: '#7371fc',
                background: 'rgba(115, 113, 252, 0.15)',
            };

            setColorPicker(() => colorCodes);
        } else {
            const colorCodes = {
                lineColor: selectedDrawnShape?.data.line.color,
                borderColor: selectedDrawnShape?.data.border.color,
                background: selectedDrawnShape?.data.background.color,
            };

            setColorPicker(() => colorCodes);
        }
    }, [selectedDrawnShape]);

    const handleEditColor = (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        color: any,
        line: boolean,
        border: boolean,
        background: boolean,
    ) => {
        if (selectedDrawnShape?.data) {
            const rgbaValues = colorPicker.background.match(/\d+(\.\d+)?/g);

            const alfaValue =
                background && color.source === 'hex' && rgbaValues
                    ? rgbaValues[3].toString()
                    : color.rgb.a;

            const colorRgbaCode =
                'rgba(' +
                color.rgb.r +
                ',' +
                color.rgb.g +
                ',' +
                color.rgb.b +
                ',' +
                alfaValue +
                ')';

            colorPicker;

            line && (colorPicker.lineColor = colorRgbaCode);
            border && (colorPicker.borderColor = colorRgbaCode);
            background && (colorPicker.background = colorRgbaCode);

            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                line && (item[changedItemIndex].line.color = colorRgbaCode);
                border && (item[changedItemIndex].border.color = colorRgbaCode);
                background &&
                    (item[changedItemIndex].background.color = colorRgbaCode);

                addDrawActionStack(item[changedItemIndex], false);

                return item;
            });
            setIsShapeEdited(true);
        }
    };

    const handleEditSize = (value: number, line: boolean, border = false) => {
        if (selectedDrawnShape?.data) {
            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                line && (item[changedItemIndex].line.lineWidth = value);
                border && (item[changedItemIndex].border.lineWidth = value);

                addDrawActionStack(item[changedItemIndex], false);
                return item;
            });
            setIsShapeEdited(true);
        }
    };

    const handleEditLines = (value: boolean, type: string) => {
        if (selectedDrawnShape?.data) {
            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                type === 'line' && (item[changedItemIndex].line.active = value);
                type === 'border' &&
                    (item[changedItemIndex].border.active = value);
                type === 'background' &&
                    (item[changedItemIndex].background.active = value);

                addDrawActionStack(item[changedItemIndex], false);
                return item;
            });
            setIsShapeEdited(true);
        }
    };

    const handleEditStyle = (
        array: number[],
        line: boolean,
        border = false,
    ) => {
        if (selectedDrawnShape?.data) {
            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                line && (item[changedItemIndex].line.dash = array);
                border && (item[changedItemIndex].border.dash = array);
                addDrawActionStack(item[changedItemIndex], false);
                return item;
            });
            setIsShapeEdited(true);
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
            setIsDragActive(false);
            setSelectedDrawnShape(undefined);
        }
    };

    const closeAllOptions = (exclude: string) => {
        exclude !== 'style' && setIsStyleOptionTabActive(false);
        exclude !== 'size' && setIsSizeOptionTabActive(false);
        exclude !== 'line' && setIsLineColorPickerTabActive(false);
        exclude !== 'border' && setIsBorderColorPickerTabActive(false);
        exclude !== 'background' && setIsBackgroundColorPickerTabActive(false);
        exclude !== 'settings' && setIsSettingsTabActive(false);
    };

    const editShapeOptions = [
        {
            name: 'Color',
            type: 'line',
            operation: () => {
                closeAllOptions(
                    selectedDrawnShape &&
                        ['Rect'].includes(selectedDrawnShape?.data.type)
                        ? 'border'
                        : 'line',
                );
                if (
                    selectedDrawnShape &&
                    ['Rect'].includes(selectedDrawnShape?.data.type)
                ) {
                    setIsBorderColorPickerTabActive((prev) => !prev);
                } else {
                    setIsLineColorPickerTabActive((prev) => !prev);
                }
            },
            icon: <IoMdColorFilter />,
            hover: '#434c58',
            exclude: [''],
            include: [''],
        },
        {
            name: 'Background',
            type: 'background',
            operation: () => {
                closeAllOptions('background');
                setIsBackgroundColorPickerTabActive((prev) => !prev);
            },
            icon: <CgColorBucket />,
            hover: '#434c58',
            exclude: [''],
            include: ['Rect', 'DPRange'],
        },
        {
            name: 'Size',
            type: 'size',
            operation: () => {
                closeAllOptions('size');
                setIsSizeOptionTabActive((prev) => !prev);
            },
            icon: <AiOutlineMinus color='white' />,
            hover: '#434c58',
            exclude: [''],
            include: [''],
        },
        {
            name: 'Style',
            type: 'style',
            operation: () => {
                closeAllOptions('style');
                setIsStyleOptionTabActive((prev) => !prev);
            },
            icon: <AiOutlineDash color='white' />,
            hover: '#434c58',
            exclude: ['FibRetracement'],
            include: [''],
        },
        {
            name: 'Settings',
            type: 'settings',
            operation: () => {
                closeAllOptions('settings');
                setIsSettingsTabActive((prev) => !prev);
            },
            icon: <BsGear />,
            hover: '#434c58',
            exclude: [''],
            include: [''],
        },
        {
            name: 'Delete',
            type: 'delete',
            operation: deleteDrawnShape,
            icon: <AiOutlineDelete />,
            hover: '#434c58',
            exclude: [''],
            include: [''],
        },
        {
            name: 'Close',
            type: 'close',
            operation: () => setSelectedDrawnShape(undefined),
            icon: <IoCloseOutline />,
            hover: '#c21937',
            exclude: [''],
            include: [''],
        },
    ];

    const sizeOptions = [
        {
            name: '1px',
            value: 1,
            icon: (
                <AiOutlineMinus color='white' width={'1px'} height={'15px'} />
            ),
        },
        {
            name: '2px',
            value: 2,
            icon: <AiOutlineMinus color='white' />,
        },
        {
            name: '3px',
            value: 3,
            icon: <AiOutlineMinus color='white' />,
        },
        {
            name: '4px',
            value: 4,
            icon: <AiOutlineMinus color='white' />,
        },
    ];

    const styleOptions = [
        {
            name: 'Line',
            value: [0, 0],
            icon: <AiOutlineMinus color='white' />,
        },
        {
            name: 'Dashed',
            value: [5, 5],
            icon: <AiOutlineDash color='white' />,
        },
        {
            name: 'Dotted',
            value: [3, 6],
            icon: <AiOutlineSmallDash color='white' />,
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
                    const clientX =
                        event.sourceEvent.type === 'touchstart'
                            ? event.sourceEvent.changedTouches[0].clientX
                            : event.sourceEvent.clientX;
                    const clientY =
                        event.sourceEvent.type === 'touchstart'
                            ? event.sourceEvent.changedTouches[0].clientY
                            : event.sourceEvent.clientY;

                    offsetX =
                        clientX - floatingDiv.getBoundingClientRect().left;
                    offsetY = clientY - floatingDiv.getBoundingClientRect().top;
                })
                .on('drag', function (event) {
                    if (floatingDivRef.current) {
                        const clientX =
                            event.sourceEvent.type === 'touchmove'
                                ? event.sourceEvent.changedTouches[0].clientX
                                : event.sourceEvent.clientX;
                        const clientY =
                            event.sourceEvent.type === 'touchmove'
                                ? event.sourceEvent.changedTouches[0].clientY
                                : event.sourceEvent.clientY;

                        setIsDragging(true);
                        const screenWidth = window.innerWidth;
                        const screenHeight = window.innerHeight;

                        const divWidth =
                            floatingDiv.getBoundingClientRect().width;
                        const divHeight =
                            floatingDiv.getBoundingClientRect().height;

                        let divLeft = clientX - offsetX;
                        let divTop = clientY - offsetY;

                        divLeft = Math.max(
                            1,
                            Math.min(screenWidth - divWidth, divLeft),
                        );
                        divTop = Math.max(
                            1,
                            Math.min(screenHeight - divHeight, divTop),
                        );

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

            const yAxis = d3.select('#y-axis-canvas').node() as HTMLDivElement;

            setDivLeft(
                mainCanvasBoundingClientRect.x +
                    mainCanvasBoundingClientRect.width / 2 -
                    floatingDiv.getBoundingClientRect().width / 2 +
                    yAxis.getBoundingClientRect().width / 2,
            );
            setDivTop(
                mainCanvasBoundingClientRect?.top -
                    floatingDiv.getBoundingClientRect().height,
            );
        }
    }, [
        floatingDivRef.current === null,
        mainCanvasBoundingClientRect,
        fullScreenChart,
    ]);

    return (
        <FloatingDivContainer
            style={{
                left: divLeft + 'px',
                top: divTop + 'px',
                visibility:
                    selectedDrawnShape !== undefined && divLeft && divTop
                        ? 'visible'
                        : 'hidden',
            }}
        >
            <FloatingDiv ref={floatingDivRef}>
                <FloatingButtonDiv>
                    <img src={dragButton} alt='' />
                    <Divider></Divider>
                </FloatingButtonDiv>

                {editShapeOptions.map(
                    (item, index) =>
                        selectedDrawnShape?.data.type &&
                        ((!item.exclude.includes(
                            selectedDrawnShape?.data.type,
                        ) &&
                            item.include.includes('')) ||
                            (item.exclude.includes('') &&
                                item.include.includes(
                                    selectedDrawnShape?.data.type,
                                ))) && (
                            <FloatingOptions
                                key={index}
                                onClick={item.operation}
                                hoverColor={item.hover}
                            >
                                {item.icon}
                            </FloatingOptions>
                        ),
                )}
            </FloatingDiv>

            {(isLineColorPickerTabActive ||
                isBorderColorPickerTabActive ||
                isBackgroundColorPickerTabActive) && (
                <ColorPickerTab>
                    <SketchPicker
                        color={
                            isLineColorPickerTabActive
                                ? colorPicker.lineColor
                                : isBorderColorPickerTabActive
                                ? colorPicker.borderColor
                                : colorPicker.background
                        }
                        width={'170px'}
                        onChange={(item) =>
                            handleEditColor(
                                item,
                                isLineColorPickerTabActive,
                                isBorderColorPickerTabActive,
                                isBackgroundColorPickerTabActive,
                            )
                        }
                    />
                </ColorPickerTab>
            )}

            {isSizeOptionTabActive && selectedDrawnShape && (
                <OptionsTab
                    style={{
                        marginLeft: '70px',
                    }}
                >
                    {sizeOptions.map((item, index) => (
                        <OptionsTabSize
                            key={index}
                            onClick={() =>
                                handleEditSize(
                                    item.value,
                                    !['Rect'].includes(
                                        selectedDrawnShape?.data.type,
                                    ),
                                    ['Rect'].includes(
                                        selectedDrawnShape?.data.type,
                                    ),
                                )
                            }
                        >
                            {item.icon} {item.name}
                        </OptionsTabSize>
                    ))}
                </OptionsTab>
            )}

            {isStyleOptionTabActive && selectedDrawnShape && (
                <OptionsTab
                    style={{
                        marginLeft: '70px',
                    }}
                >
                    {styleOptions.map((item, index) => (
                        <OptionsTabStyle
                            key={index}
                            onClick={() =>
                                handleEditStyle(
                                    item.value,
                                    !['Rect'].includes(
                                        selectedDrawnShape?.data.type,
                                    ),
                                    ['Rect'].includes(
                                        selectedDrawnShape?.data.type,
                                    ),
                                )
                            }
                        >
                            {item.icon} {item.name}
                        </OptionsTabStyle>
                    ))}
                </OptionsTab>
            )}

            {isSettingsTabActive && (
                <FloatingToolbarSettings
                    selectedDrawnShape={selectedDrawnShape}
                    handleEditColor={handleEditColor}
                    handleEditSize={handleEditSize}
                    handleEditStyle={handleEditStyle}
                    sizeOptions={sizeOptions}
                    styleOptions={styleOptions}
                    handleEditLines={handleEditLines}
                    setIsShapeEdited={setIsShapeEdited}
                    setDrawnShapeHistory={setDrawnShapeHistory}
                    addDrawActionStack={addDrawActionStack}
                    colorPicker={colorPicker}
                />
            )}
        </FloatingDivContainer>
    );
}

export default FloatingToolbar;
