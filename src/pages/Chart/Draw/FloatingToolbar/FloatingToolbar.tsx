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
        deleteItem,
        setIsShapeEdited,
        addDrawActionStack,
    } = props;
    const floatingDivRef = useRef<HTMLDivElement>(null);
    const { isFullScreen: fullScreenChart } = useContext(ChartContext);
    const [isDragging, setIsDragging] = useState(false);
    const [divLeft, setDivLeft] = useState(0);
    const [divTop, setDivTop] = useState(0);
    const [borderColorPicker, setBorderColorPicker] = useState('#7371fc');
    const [backgroundColorPicker, setBackgroundColorPicker] =
        useState('#7371fc');

    const [isStyleOptionTabActive, setIsStyleOptionTabActive] = useState(false);
    const [isSizeOptionTabActive, setIsSizeOptionTabActive] = useState(false);
    const [isColorPickerTabActive, setIsColorPickerTabActive] = useState(false);
    const [isBackgroundTabActive, setIsBackgroundTabActive] = useState(false);
    // const [isSettingsTabActive, setIsSettingsTabActive] = useState(false);

    const isDeletePressed = useKeyPress('Delete');

    useEffect(() => {
        if (isDeletePressed && selectedDrawnShape) {
            deleteDrawnShape();
        }
    }, [isDeletePressed]);

    useEffect(() => {
        if (selectedDrawnShape === undefined) {
            setIsStyleOptionTabActive(false);
            setIsColorPickerTabActive(false);
            setIsSizeOptionTabActive(false);
            setIsBackgroundTabActive(false);
            setBackgroundColorPicker(() => 'rgba(115, 113, 252, 0.15)');
            setBorderColorPicker(() => '#7371fc');
        } else {
            setBackgroundColorPicker(() => selectedDrawnShape?.data.background);
            setBorderColorPicker(() => selectedDrawnShape?.data.color);
        }
    }, [selectedDrawnShape]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEditColor = (color: any, type: string) => {
        if (selectedDrawnShape?.data) {
            const rgbaValues = backgroundColorPicker.match(/\d+(\.\d+)?/g);

            const alfaValue =
                type === 'background' && color.source === 'hex' && rgbaValues
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

            type === 'color' && setBorderColorPicker(colorRgbaCode);
            type === 'background' && setBackgroundColorPicker(colorRgbaCode);

            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                type === 'color' &&
                    (item[changedItemIndex].color = colorRgbaCode);
                type === 'background' &&
                    (item[changedItemIndex].background = colorRgbaCode);

                addDrawActionStack(item[changedItemIndex], false);

                return item;
            });
            setIsShapeEdited(true);
        }
    };

    const handleEditSize = (value: number) => {
        if (selectedDrawnShape?.data) {
            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                item[changedItemIndex].lineWidth = value;
                addDrawActionStack(item[changedItemIndex], false);
                return item;
            });
            setIsShapeEdited(true);
        }
    };

    const handleEditStyle = (array: number[]) => {
        if (selectedDrawnShape?.data) {
            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                item[changedItemIndex].style = array;
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
            setSelectedDrawnShape(undefined);
        }
    };

    const closeAllOptions = (exclude: string) => {
        exclude !== 'style' && setIsStyleOptionTabActive(false);
        exclude !== 'size' && setIsSizeOptionTabActive(false);
        exclude !== 'color' && setIsColorPickerTabActive(false);
        exclude !== 'background' && setIsBackgroundTabActive(false);
    };

    const editShapeOptions = [
        {
            name: 'Color',
            type: 'color',
            operation: () => {
                closeAllOptions('color');
                setIsColorPickerTabActive((prev) => !prev);
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
                setIsBackgroundTabActive((prev) => !prev);
            },
            icon: <CgColorBucket />,
            hover: '#434c58',
            exclude: [''],
            include: ['Square', 'DPRange'],
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
        // {
        //     name: 'Settings',
        //     type: 'settings',
        //     operation: () => {
        //         closeAllOptions('settings');
        //         setIsSettingsTabActive((prev) => !prev);
        //     },
        //     icon: <BsGear />,
        //     hover: '#434c58',
        //     exclude: [''],
        //     include: ['FibRetracement'],
        // },
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
                        const screenWidth = window.innerWidth;
                        const screenHeight = window.innerHeight;

                        const divWidth =
                            floatingDiv.getBoundingClientRect().width;
                        const divHeight =
                            floatingDiv.getBoundingClientRect().height;

                        let divLeft = event.sourceEvent.clientX - offsetX;
                        let divTop = event.sourceEvent.clientY - offsetY;

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

            setDivLeft(mainCanvasBoundingClientRect?.width / 1.3);
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

            {isColorPickerTabActive && (
                <ColorPickerTab>
                    <SketchPicker
                        color={borderColorPicker}
                        width={'170px'}
                        onChange={(item) => handleEditColor(item, 'color')}
                    />
                </ColorPickerTab>
            )}

            {isBackgroundTabActive && (
                <ColorPickerTab>
                    <SketchPicker
                        color={backgroundColorPicker}
                        width={'170px'}
                        onChange={(item) => handleEditColor(item, 'background')}
                    />
                </ColorPickerTab>
            )}

            {isSizeOptionTabActive && (
                <OptionsTab
                    style={{
                        marginLeft: '70px',
                    }}
                >
                    {sizeOptions.map((item, index) => (
                        <OptionsTabSize
                            key={index}
                            onClick={() => handleEditSize(item.value)}
                        >
                            {item.icon} {item.name}
                        </OptionsTabSize>
                    ))}
                </OptionsTab>
            )}

            {isStyleOptionTabActive && (
                <OptionsTab
                    style={{
                        marginLeft: '70px',
                    }}
                >
                    {styleOptions.map((item, index) => (
                        <OptionsTabStyle
                            key={index}
                            onClick={() => handleEditStyle(item.value)}
                        >
                            {item.icon} {item.name}
                        </OptionsTabStyle>
                    ))}
                </OptionsTab>
            )}
        </FloatingDivContainer>
    );
}

export default FloatingToolbar;
