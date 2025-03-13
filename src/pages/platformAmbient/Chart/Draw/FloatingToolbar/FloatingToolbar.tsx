import * as d3 from 'd3';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { SketchPicker } from 'react-color';
import { AiOutlineDelete } from 'react-icons/ai';
import { BsGear } from 'react-icons/bs';
import { CgColorBucket } from 'react-icons/cg';
import { IoMdColorFilter } from 'react-icons/io';
import { IoCloseOutline } from 'react-icons/io5';
import { TbLayoutGridAdd } from 'react-icons/tb';
import { useDrawSettings } from '../../../../../App/hooks/useDrawSettings';
import useKeyPress from '../../../../../App/hooks/useKeyPress';
import dragButton from '../../../../../assets/images/icons/draw/floating_button.svg';
import dashOptionSvg from '../../../../../assets/images/icons/draw/lineOptions/dash.svg';
import dottedOptionSvg from '../../../../../assets/images/icons/draw/lineOptions/dotted.svg';
import lineOptionSvg from '../../../../../assets/images/icons/draw/lineOptions/line.svg';
import {
    ChartContext,
    ChartThemeIF,
} from '../../../../../contexts/ChartContext';
import {
    drawDataHistory,
    saveShapeAttiributesToLocalStorage,
    selectedDrawnData,
} from '../../ChartUtils/chartUtils';
import {
    ColorPickerTab,
    Divider,
    FloatingButtonDiv,
    FloatingDiv,
    FloatingDivContainer,
    FloatingDropdownOptions,
    FloatingOptions,
    OptionsTab,
    OptionsTabSize,
    OptionsTabStyle,
} from './FloatingToolbarCss';
import FloatingToolbarSettings from './FloatingToolbarSettings';
import { LineWidthOptions } from './FloatingToolbarSettingsCss';

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
    setHoveredDrawnShape: React.Dispatch<selectedDrawnData | undefined>;
    deleteItem: (item: drawDataHistory) => void;
    addDrawActionStack: (
        item: drawDataHistory,
        isNewShape: boolean,
        type: string,
        updatedData: drawDataHistory | undefined,
    ) => void;
    drawnShapeHistory: drawDataHistory[];
    chartThemeColors: ChartThemeIF | undefined;
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
        drawnShapeHistory,
        chartThemeColors,
        setHoveredDrawnShape,
    } = props;

    const drawSettings = useDrawSettings(chartThemeColors);

    const floatingDivRef = useRef<HTMLDivElement>(null);
    const floatingMenuDivRef = useRef<HTMLDivElement>(null);
    const floatingDivContainerRef = useRef<HTMLDivElement>(null);
    const { isFullScreen: fullScreenChart } = useContext(ChartContext);
    const [isDragging, setIsDragging] = useState(false);
    const [isDragged, setIsDragged] = useState(false);

    const [divLeft, setDivLeft] = useState<number | undefined>(undefined);
    const [divTop, setDivTop] = useState<number | undefined>(undefined);

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
    const [isLayoutTabActive, setIsLayoutTabActive] = useState(false);

    const [isSettingsTabActive, setIsSettingsTabActive] = useState(false);

    const [isNearestWindow, setIsNearestWindow] = useState(false);
    const [settingsDivHeight, setSettingsDivHeight] = useState(0);
    const isDeletePressed = useKeyPress('Delete');
    const floatingToolbarHeight = 32;

    const [isDropdownHeightCalculated, setIsDropdownHeightCalculated] =
        useState(false);
    useEffect(() => {
        if (isDeletePressed && selectedDrawnShape) {
            deleteDrawnShape();
        }
    }, [isDeletePressed]);

    useEffect(() => {
        setIsDropdownHeightCalculated(false);
        setIsStyleOptionTabActive(false);
        setIsLineColorPickerTabActive(false);
        setIsSizeOptionTabActive(false);
        setIsBorderColorPickerTabActive(false);
        setIsBackgroundColorPickerTabActive(false);
        setIsSettingsTabActive(false);
        setIsLayoutTabActive(false);
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

                const oldData = structuredClone(item[changedItemIndex]);

                const oldLineColor = item[changedItemIndex].line.color;
                const oldBorderColor = item[changedItemIndex].border.color;
                const oldBackgroundColor =
                    item[changedItemIndex].background.color;

                if (
                    (line && oldLineColor !== colorRgbaCode) ||
                    (border && oldBorderColor !== colorRgbaCode) ||
                    (background && oldBackgroundColor !== colorRgbaCode)
                ) {
                    line && (item[changedItemIndex].line.color = colorRgbaCode);
                    border &&
                        (item[changedItemIndex].border.color = colorRgbaCode);
                    background &&
                        (item[changedItemIndex].background.color =
                            colorRgbaCode);

                    saveShapeAttiributesToLocalStorage(item[changedItemIndex]);
                    selectedDrawnShape.data = item[changedItemIndex];
                    addDrawActionStack(
                        oldData,
                        false,
                        'update',
                        item[changedItemIndex],
                    );
                }

                return item;
            });
            setIsShapeEdited(true);
        }
    };

    useEffect(() => {
        if (divTop) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const canvasDiv = d3.select(floatingMenuDivRef.current) as any;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const resizeObserver = new ResizeObserver(async (result: any) => {
                const height = result[0].contentRect.height;
                const screenHeight = window.innerHeight;
                const diffBottom = Math.abs(divTop - screenHeight);

                if (!isDragging) {
                    if (
                        diffBottom < 100 ||
                        diffBottom + 60 < height + floatingToolbarHeight
                    ) {
                        setIsNearestWindow(true);
                    } else {
                        setIsNearestWindow(false);
                    }
                }

                setSettingsDivHeight(height);

                requestAnimationFrame(() => {
                    setIsDropdownHeightCalculated(true);
                });
            });

            resizeObserver.observe(canvasDiv.node());

            return () => resizeObserver.unobserve(canvasDiv.node());
        }
    }, [divTop, isDragging]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const canvasDiv = d3.select(floatingDivRef.current) as any;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resizeObserver = new ResizeObserver((result: any) => {
            const width = result[0].contentRect.width;
            const screenWidth = window.innerWidth;

            if (divLeft && !isDragging) {
                const divLeftLocal = Math.max(
                    1,
                    Math.min(screenWidth - width, divLeft),
                );

                setDivLeft(divLeftLocal);
            }
        });

        resizeObserver.observe(canvasDiv.node());

        return () => resizeObserver.unobserve(canvasDiv.node());
    }, [divLeft, isDragging]);

    const handleEditSize = (value: number, line: boolean, border = false) => {
        if (selectedDrawnShape?.data) {
            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                const oldData = structuredClone(item[changedItemIndex]);

                const oldLineSize = item[changedItemIndex].line.lineWidth;
                const oldBorderSize = item[changedItemIndex].border.lineWidth;

                if (
                    (line && oldLineSize !== value) ||
                    (border && oldBorderSize !== value)
                ) {
                    line && (item[changedItemIndex].line.lineWidth = value);
                    border && (item[changedItemIndex].border.lineWidth = value);

                    saveShapeAttiributesToLocalStorage(item[changedItemIndex]);
                    selectedDrawnShape.data = item[changedItemIndex];
                    addDrawActionStack(
                        oldData,
                        false,
                        'update',
                        item[changedItemIndex],
                    );
                }

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

                const oldData = structuredClone(item[changedItemIndex]);

                type === 'line' && (item[changedItemIndex].line.active = value);
                type === 'border' &&
                    (item[changedItemIndex].border.active = value);
                type === 'background' &&
                    (item[changedItemIndex].background.active = value);
                type === 'extendLeft' &&
                    (item[changedItemIndex].extendLeft = value);
                type === 'extendRight' &&
                    (item[changedItemIndex].extendRight = value);
                type === 'reverse' && (item[changedItemIndex].reverse = value);

                saveShapeAttiributesToLocalStorage(item[changedItemIndex]);
                selectedDrawnShape.data = item[changedItemIndex];
                addDrawActionStack(
                    oldData,
                    false,
                    'update',
                    item[changedItemIndex],
                );
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

                const oldData = structuredClone(item[changedItemIndex]);

                const oldLineDashArray = item[changedItemIndex].line.dash;
                const oldBorderDashArray = item[changedItemIndex].border.dash;

                if (
                    (line && oldLineDashArray !== array) ||
                    (border && oldBorderDashArray !== array)
                ) {
                    line && (item[changedItemIndex].line.dash = array);
                    border && (item[changedItemIndex].border.dash = array);

                    saveShapeAttiributesToLocalStorage(item[changedItemIndex]);
                    selectedDrawnShape.data = item[changedItemIndex];
                    addDrawActionStack(
                        oldData,
                        false,
                        'update',
                        item[changedItemIndex],
                    );
                }

                return item;
            });
            setIsShapeEdited(true);
        }
    };

    const handleEditLabel = (
        value: string,
        placement: boolean,
        alignment: boolean,
    ) => {
        if (selectedDrawnShape?.data) {
            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                const oldData = structuredClone(item[changedItemIndex]);

                const oldPlacement = item[changedItemIndex].labelPlacement;
                const oldAlignment = item[changedItemIndex].labelAlignment;

                if (
                    (placement && oldPlacement !== value) ||
                    (alignment && oldAlignment !== value)
                ) {
                    placement &&
                        (item[changedItemIndex].labelPlacement = value);
                    alignment &&
                        (item[changedItemIndex].labelAlignment = value);
                    saveShapeAttiributesToLocalStorage(item[changedItemIndex]);
                    selectedDrawnShape.data = item[changedItemIndex];
                    addDrawActionStack(
                        oldData,
                        false,
                        'update',
                        item[changedItemIndex],
                    );
                }

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
        setIsDropdownHeightCalculated(false);

        exclude !== 'style' && setIsStyleOptionTabActive(false);
        exclude !== 'size' && setIsSizeOptionTabActive(false);
        exclude !== 'line' && setIsLineColorPickerTabActive(false);
        exclude !== 'border' && setIsBorderColorPickerTabActive(false);
        exclude !== 'background' && setIsBackgroundColorPickerTabActive(false);
        exclude !== 'settings' && setIsSettingsTabActive(false);
        exclude !== 'layouts' && setIsLayoutTabActive(false);
    };

    const editShapeOptions = [
        {
            name: 'layouts',
            type: 'default',
            operation: () => {
                closeAllOptions('layouts');
                setIsLayoutTabActive(!isLayoutTabActive);
            },
            icon: <TbLayoutGridAdd />,
            hover: '#434c58',
            exclude: [''],
            include: [''],
        },

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
            icon: (
                <LineWidthOptions
                    backgroundColor={'#8b98a5'}
                    style={{
                        borderTopWidth:
                            selectedDrawnShape &&
                            (!['Rect'].includes(selectedDrawnShape?.data.type)
                                ? selectedDrawnShape.data.line.lineWidth
                                : selectedDrawnShape.data.border.lineWidth) +
                                'px',
                    }}
                ></LineWidthOptions>
            ),
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
            icon: (
                <img
                    src={
                        selectedDrawnShape &&
                        (0 ===
                        (!['Rect'].includes(selectedDrawnShape?.data.type)
                            ? selectedDrawnShape.data.line.dash[0]
                            : selectedDrawnShape.data.border.dash[0])
                            ? lineOptionSvg
                            : 5 ===
                                (!['Rect'].includes(
                                    selectedDrawnShape?.data.type,
                                )
                                    ? selectedDrawnShape.data.line.dash[0]
                                    : selectedDrawnShape.data.border.dash[0])
                              ? dashOptionSvg
                              : dottedOptionSvg)
                    }
                    alt=''
                />
            ),
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
            operation: () => {
                setSelectedDrawnShape(undefined);
                setHoveredDrawnShape(undefined);
            },
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
                <LineWidthOptions
                    backgroundColor={'#cfd7e3'}
                    style={{
                        borderTopWidth: '1px',
                    }}
                ></LineWidthOptions>
            ),
        },
        {
            name: '2px',
            value: 2,
            icon: (
                <LineWidthOptions
                    backgroundColor={'#cfd7e3'}
                    style={{
                        borderTopWidth: '2px',
                    }}
                ></LineWidthOptions>
            ),
        },
        {
            name: '3px',
            value: 3,
            icon: (
                <LineWidthOptions
                    backgroundColor={'#cfd7e3'}
                    style={{
                        borderTopWidth: '3px',
                    }}
                ></LineWidthOptions>
            ),
        },
        {
            name: '4px',
            value: 4,
            icon: (
                <LineWidthOptions
                    backgroundColor={'#cfd7e3'}
                    style={{
                        borderTopWidth: '4px',
                    }}
                ></LineWidthOptions>
            ),
        },
    ];

    const styleOptions = [
        {
            name: 'Line',
            value: [0, 0],
            icon: lineOptionSvg,
        },
        {
            name: 'Dashed',
            value: [5, 5],
            icon: dashOptionSvg,
        },
        {
            name: 'Dotted',
            value: [3, 6],
            icon: dottedOptionSvg,
        },
    ];

    function checkIsDefault(
        item: drawDataHistory,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        defaultValues: any,
    ) {
        let isLineDefault = false;
        let isBorderDefault = false;
        let isBackgroundDefault = false;

        if (
            item.line.active === defaultValues.line.active &&
            item.line.color === defaultValues.line.color &&
            item.line.dash.every((value) =>
                defaultValues.line.dash.includes(value),
            ) &&
            item.line.lineWidth === defaultValues.line.lineWidth
        ) {
            isLineDefault = true;
        }

        if (
            item.border.active === defaultValues.border.active &&
            item.border.color === defaultValues.border.color &&
            item.border.dash.every((value) =>
                defaultValues.border.dash.includes(value),
            ) &&
            item.border.lineWidth === defaultValues.border.lineWidth
        ) {
            isBorderDefault = true;
        }

        if (
            item.background.active === defaultValues.background.active &&
            item.background.color === defaultValues.background.color &&
            item.background.dash.every((value) =>
                defaultValues.background.dash.includes(value),
            ) &&
            item.background.lineWidth === defaultValues.background.lineWidth
        ) {
            isBackgroundDefault = true;
        }

        if (item.type === 'FibRetracement') {
            const isFibStylesDefault =
                JSON.stringify(item.extraData) ===
                    JSON.stringify(defaultValues.extraData) &&
                item.extendLeft === defaultValues.extendLeft &&
                item.extendRight === defaultValues.extendRight &&
                item.labelPlacement === defaultValues.labelPlacement &&
                item.labelAlignment === defaultValues.labelAlignment &&
                item.reverse === defaultValues.reverse;

            return (
                isLineDefault &&
                isBorderDefault &&
                isBackgroundDefault &&
                isFibStylesDefault
            );
        }

        return isLineDefault && isBorderDefault && isBackgroundDefault;
    }

    function setDefaultOptions() {
        setDrawnShapeHistory((item: drawDataHistory[]) => {
            const changedItemIndex = item.findIndex(
                (i) => i.time === selectedDrawnShape?.data.time,
            );

            const oldData = structuredClone(item[changedItemIndex]);

            let isDefault = true;

            setColorPicker(() => {
                return {
                    lineColor: '#7371fc',
                    borderColor: '#7371fc',
                    background: '#7371fc',
                };
            });

            if (
                item[changedItemIndex].type === 'Brush' ||
                item[changedItemIndex].type === 'Ray'
            ) {
                if (
                    !checkIsDefault(
                        item[changedItemIndex],
                        drawSettings['defaultBrush'],
                    )
                ) {
                    item[changedItemIndex] = {
                        ...item[changedItemIndex],
                        line: structuredClone(
                            drawSettings['defaultBrush'].line,
                        ),
                        border: structuredClone(
                            drawSettings['defaultBrush'].border,
                        ),
                        background: structuredClone(
                            drawSettings['defaultBrush'].background,
                        ),
                    };

                    isDefault = false;
                }
            }

            if (item[changedItemIndex].type === 'Rect') {
                if (
                    !checkIsDefault(
                        item[changedItemIndex],
                        drawSettings['defaultRect'],
                    )
                ) {
                    item[changedItemIndex] = {
                        ...item[changedItemIndex],
                        line: structuredClone(drawSettings['defaultRect'].line),
                        border: structuredClone(
                            drawSettings['defaultRect'].border,
                        ),
                        background: structuredClone(
                            drawSettings['defaultRect'].background,
                        ),
                    };

                    isDefault = false;
                }
            }

            if (item[changedItemIndex].type === 'DPRange') {
                if (
                    !checkIsDefault(
                        item[changedItemIndex],
                        drawSettings['defaultDPRange'],
                    )
                ) {
                    item[changedItemIndex] = {
                        ...item[changedItemIndex],
                        line: structuredClone(
                            drawSettings['defaultDPRange'].line,
                        ),
                        border: structuredClone(
                            drawSettings['defaultDPRange'].border,
                        ),
                        background: structuredClone(
                            drawSettings['defaultDPRange'].background,
                        ),
                    };

                    isDefault = false;
                }
            }

            if (item[changedItemIndex].type === 'FibRetracement') {
                if (
                    !checkIsDefault(
                        item[changedItemIndex],
                        drawSettings['defaultFibRetracement'],
                    )
                ) {
                    item[changedItemIndex] = {
                        ...item[changedItemIndex],
                        line: structuredClone(
                            drawSettings['defaultFibRetracement'].line,
                        ),
                        border: structuredClone(
                            drawSettings['defaultFibRetracement'].border,
                        ),
                        background: structuredClone(
                            drawSettings['defaultFibRetracement'].background,
                        ),
                        extraData: structuredClone(
                            drawSettings['defaultFibRetracement'].extraData,
                        ),
                        extendLeft: structuredClone(
                            drawSettings['defaultFibRetracement'].extendLeft,
                        ),
                        extendRight: structuredClone(
                            drawSettings['defaultFibRetracement'].extendRight,
                        ),
                        labelPlacement: structuredClone(
                            drawSettings['defaultFibRetracement']
                                .labelPlacement,
                        ),
                        labelAlignment: structuredClone(
                            drawSettings['defaultFibRetracement']
                                .labelAlignment,
                        ),
                        reverse: structuredClone(
                            drawSettings['defaultFibRetracement'].reverse,
                        ),
                    };

                    isDefault = false;
                }
            }

            if (!isDefault) {
                saveShapeAttiributesToLocalStorage(item[changedItemIndex]);
                if (selectedDrawnShape) {
                    selectedDrawnShape.data = item[changedItemIndex];
                }
                addDrawActionStack(
                    oldData,
                    false,
                    'update',
                    item[changedItemIndex],
                );
            }

            return item;
        });
    }
    const layoutTab = (
        <OptionsTab
            style={{
                width: '250px',
                visibility: isDropdownHeightCalculated ? 'visible' : 'hidden',
            }}
        >
            <OptionsTabSize
                backgroundColor={undefined}
                style={{ justifyContent: 'start', width: '250px' }}
                onClick={() => setDefaultOptions()}
            >
                Apply Default Drawing Template
            </OptionsTabSize>
        </OptionsTab>
    );

    useEffect(() => {
        const floatingDivContainer = d3
            .select(floatingDivContainerRef.current)
            .node() as HTMLDivElement;

        const floatingDiv = d3
            .select(floatingDivRef.current)
            .node() as HTMLDivElement;

        const floatingMenuDiv = d3
            .select(floatingMenuDivRef.current)
            .node() as HTMLDivElement;
        let offsetX = 0;
        let offsetY = 0;

        if (floatingDiv && floatingMenuDiv && floatingDivContainer) {
            const floatingDivDrag = d3
                .drag<d3.DraggedElementBaseType, unknown, d3.SubjectPosition>()
                .on('start', function (event) {
                    setIsDragging(true);
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

                        setIsDragged(true);
                        const screenWidth = window.innerWidth;
                        const screenHeight = window.innerHeight;

                        const divWidth =
                            floatingDiv.getBoundingClientRect().width;
                        const divHeight =
                            floatingDiv.getBoundingClientRect().height;

                        const floatingMenuDivHeight =
                            floatingMenuDiv.getBoundingClientRect().height;

                        const floatingMenuDivWidth =
                            floatingMenuDiv.getBoundingClientRect().width;

                        let divLeft = clientX - offsetX;
                        let divTop = clientY - offsetY;

                        if (floatingMenuDivHeight === 0 || isNearestWindow) {
                            divLeft = Math.max(
                                1,
                                Math.min(
                                    screenWidth -
                                        Math.max(
                                            divWidth,
                                            floatingMenuDivWidth,
                                        ),
                                    divLeft,
                                ),
                            );
                            divTop = Math.max(
                                floatingMenuDivHeight,
                                Math.min(screenHeight - divHeight, divTop),
                            );
                        } else {
                            if (!isNearestWindow) {
                                divLeft = Math.max(
                                    1,
                                    Math.min(
                                        screenWidth -
                                            Math.max(
                                                divWidth,
                                                floatingMenuDivWidth,
                                            ),
                                        divLeft,
                                    ),
                                );

                                divTop = Math.max(
                                    1,
                                    Math.min(
                                        screenHeight -
                                            (divHeight + floatingMenuDivHeight),
                                        divTop,
                                    ),
                                );
                            }
                        }

                        setDivLeft(divLeft);
                        setDivTop(divTop);
                    }
                })
                .on('end', () => {
                    setIsDragging(false);
                });

            if (floatingDivRef.current) {
                d3.select<d3.DraggedElementBaseType, unknown>(
                    floatingDivRef.current,
                ).call(floatingDivDrag);
            }
        }
    }, [
        floatingDivRef,
        selectedDrawnShape,
        isSettingsTabActive,
        isNearestWindow,
        divTop === undefined,
    ]);

    useEffect(() => {
        if (
            floatingDivRef.current &&
            !isDragged &&
            mainCanvasBoundingClientRect
        ) {
            const floatingDiv = d3
                .select(floatingDivRef.current)
                .node() as HTMLDivElement;

            const yAxis = d3.select('#y-axis-canvas').node() as HTMLDivElement;

            const divTopLocal = mainCanvasBoundingClientRect?.top;

            const floatingDivContainer = d3
                .select(floatingDivContainerRef.current)
                .node() as HTMLDivElement;

            const containerDivSize =
                floatingDivContainer.getBoundingClientRect();

            const containerDivHeight = containerDivSize.height;

            containerDivHeight &&
                setDivLeft(
                    mainCanvasBoundingClientRect.x +
                        mainCanvasBoundingClientRect.width / 2 -
                        floatingDiv.getBoundingClientRect().width / 2 +
                        yAxis.getBoundingClientRect().width / 2,
                );

            setDivTop(divTopLocal - 40);
        }
    }, [
        floatingDivRef.current === null,
        mainCanvasBoundingClientRect,
        fullScreenChart,
    ]);

    return (
        <FloatingDivContainer
            id='floatingDivContainer'
            style={{
                left: divLeft + 'px',
                top: divTop + 'px',
                visibility:
                    selectedDrawnShape !== undefined &&
                    divLeft !== undefined &&
                    divTop !== undefined
                        ? 'visible'
                        : 'hidden',
            }}
            ref={floatingDivContainerRef}
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
            {divTop !== undefined && (
                <FloatingDropdownOptions
                    ref={floatingMenuDivRef}
                    style={{
                        position: 'fixed',
                        top:
                            (isNearestWindow
                                ? divTop - settingsDivHeight
                                : divTop + floatingToolbarHeight) + 'px',
                    }}
                >
                    {isLayoutTabActive && layoutTab}

                    {(isLineColorPickerTabActive ||
                        isBorderColorPickerTabActive ||
                        isBackgroundColorPickerTabActive) && (
                        <ColorPickerTab
                            style={{
                                visibility: isDropdownHeightCalculated
                                    ? 'visible'
                                    : 'hidden',
                            }}
                        >
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
                                width: '150px',
                                visibility: isDropdownHeightCalculated
                                    ? 'visible'
                                    : 'hidden',
                            }}
                        >
                            {sizeOptions.map((item, index) => (
                                <OptionsTabSize
                                    backgroundColor={
                                        item.value ===
                                        (!['Rect'].includes(
                                            selectedDrawnShape?.data.type,
                                        )
                                            ? selectedDrawnShape.data.line
                                                  .lineWidth
                                            : selectedDrawnShape.data.border
                                                  .lineWidth)
                                            ? '#434c58'
                                            : undefined
                                    }
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
                                marginLeft: '80px',
                                width: '150px',
                                visibility: isDropdownHeightCalculated
                                    ? 'visible'
                                    : 'hidden',
                            }}
                        >
                            {styleOptions.map((item, index) => (
                                <OptionsTabStyle
                                    backgroundColor={
                                        item.value[0] ===
                                        (!['Rect'].includes(
                                            selectedDrawnShape?.data.type,
                                        )
                                            ? selectedDrawnShape.data.line
                                                  .dash[0]
                                            : selectedDrawnShape.data.border
                                                  .dash[0])
                                            ? '#434c58'
                                            : undefined
                                    }
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
                                    <img src={item.icon} alt='' /> {item.name}
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
                            handleEditLabel={handleEditLabel}
                            sizeOptions={sizeOptions}
                            styleOptions={styleOptions}
                            handleEditLines={handleEditLines}
                            setIsShapeEdited={setIsShapeEdited}
                            setDrawnShapeHistory={setDrawnShapeHistory}
                            addDrawActionStack={addDrawActionStack}
                            colorPicker={colorPicker}
                            isNearestWindow={isNearestWindow}
                            floatingToolbarHeight={floatingToolbarHeight}
                            settingsDivHeight={settingsDivHeight}
                            drawnShapeHistory={drawnShapeHistory}
                            isDropdownHeightCalculated={
                                isDropdownHeightCalculated
                            }
                            divTop={divTop}
                        />
                    )}
                </FloatingDropdownOptions>
            )}
        </FloatingDivContainer>
    );
}

export default FloatingToolbar;
