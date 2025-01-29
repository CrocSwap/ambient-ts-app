import * as d3 from 'd3';
import React, { MouseEvent, useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';
import dashOptionSvg from '../../../../../assets/images/icons/draw/lineOptions/dash.svg';
import dottedOptionSvg from '../../../../../assets/images/icons/draw/lineOptions/dotted.svg';
import lineOptionSvg from '../../../../../assets/images/icons/draw/lineOptions/line.svg';
import Divider from '../../../../../components/Global/Divider/Divider';
import {
    drawDataHistory,
    renderChart,
    saveShapeAttiributesToLocalStorage,
    selectedDrawnData,
} from '../../ChartUtils/chartUtils';
import { fibDefaultLevels } from '../../ChartUtils/drawConstants';
import {
    OptionsTab,
    OptionsTabSize,
    OptionsTabStyle,
} from './FloatingToolbarCss';
import {
    AlphaSlider,
    CheckboxContainer,
    ColorPickerTab,
    DropDownContainer,
    DropDownHeader,
    DropDownList,
    DropDownListContainer,
    ExtendSettings,
    FibLineOptions,
    FibLineSettings,
    FloatingToolbarSettingsContainer,
    Icon,
    InfoLabel,
    LabelSettingsArrow,
    LabelSettingsContainer,
    LevelTitle,
    LineContainer,
    LineSettings,
    LineSettingsLeft,
    LineSettingsRight,
    LineWidthOptions,
    LineWidthOptionsCont,
    ListItem,
    OptionColor,
    OptionColorContainer,
    OptionStyleContainer,
    SliderContainer,
    StyledCheckbox,
    StyledLabel,
} from './FloatingToolbarSettingsCss';

interface FloatingToolbarSettingsProps {
    selectedDrawnShape: selectedDrawnData | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleEditColor: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        color: any,
        line: boolean,
        border: boolean,
        background: boolean,
    ) => void;
    handleEditSize: (value: number, line: boolean, border: boolean) => void;
    handleEditStyle: (array: number[], line: boolean, border: boolean) => void;
    handleEditLabel: (
        value: string,
        placement: boolean,
        alignment: boolean,
    ) => void;
    handleEditLines: (value: boolean, type: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sizeOptions: Array<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    styleOptions: Array<any>;
    setIsShapeEdited: React.Dispatch<boolean>;
    setDrawnShapeHistory: React.Dispatch<
        React.SetStateAction<drawDataHistory[]>
    >;
    addDrawActionStack: (
        item: drawDataHistory,
        isNewShape: boolean,
        type: string,
        updatedData: drawDataHistory | undefined,
    ) => void;
    colorPicker: { lineColor: string; borderColor: string; background: string };
    isNearestWindow: boolean;
    floatingToolbarHeight: number;
    settingsDivHeight: number;
    drawnShapeHistory: drawDataHistory[];
    isDropdownHeightCalculated: boolean;
    divTop: number;
}

function FloatingToolbarSettings(props: FloatingToolbarSettingsProps) {
    const {
        selectedDrawnShape,
        handleEditColor,
        handleEditSize,
        sizeOptions,
        styleOptions,
        handleEditStyle,
        handleEditLines,
        setIsShapeEdited,
        setDrawnShapeHistory,
        addDrawActionStack,
        handleEditLabel,
        colorPicker,
        isNearestWindow,
        floatingToolbarHeight,
        settingsDivHeight,
        drawnShapeHistory,
        isDropdownHeightCalculated,
        divTop,
    } = props;

    // disabled options
    const lineOptionDisabled = ['Brush', 'DPRange', 'Ray'];
    const borderOptionDisabled = ['Rect'];

    // special options
    const borderOptions = ['Rect', 'DPRange'];
    const excludeLineOptions = ['Rect'];
    const backgroundOptions = ['Rect', 'DPRange'];

    const [isLineStyleOptionTabActive, setIsLineStyleOptionTabActive] =
        useState(false);
    const [isBorderStyleOptionTabActive, setIsBorderStyleOptionTabActive] =
        useState(false);

    const [isLineSizeOptionTabActive, setLineIsSizeOptionTabActive] =
        useState(false);
    const [isBorderSizeOptionTabActive, setBorderIsSizeOptionTabActive] =
        useState(false);

    const [isLineColorPickerTabActive, setIsLineColorPickerTabActive] =
        useState(false);
    const [isBorderColorPickerTabActive, setIsBorderColorPickerTabActive] =
        useState(false);
    const [
        isBackgroundColorPickerTabActive,
        setIsBackgroundColorPickerTabActive,
    ] = useState(false);

    const [isFibBackgroundTabActive, setIsFibBackgroundTabActive] =
        useState(false);

    const [
        isLabelPlacementOptionTabActive,
        setisLabelPlacementOptionTabActive,
    ] = useState(false);
    const [
        isLabelAlignmentOptionTabActive,
        setisLabelAlignmentOptionTabActive,
    ] = useState(false);

    const [selectedFibLevel, setSelectedFibLevel] = useState(Number);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [fibBackgroundAlphaValue, setFibBackgroundAlphaValue] = useState<any>(
        selectedDrawnShape && selectedDrawnShape?.data.type === 'FibRetracement'
            ? d3.color(selectedDrawnShape?.data.extraData[0].areaColor)?.opacity
            : d3.color(fibDefaultLevels[0].areaColor)?.opacity,
    );

    const [fibDataToUpdate, setFibDataToUpdate] = useState<drawDataHistory>();
    const [shouldUpdateFibData, setShouldUpdateFibData] =
        useState<boolean>(false);

    const [checkNearestWindow, setCheckNearestWindow] = useState(false);
    const closeAllOptions = (
        exclude: string,
        value: number | undefined = undefined,
    ) => {
        setIsLineStyleOptionTabActive(
            (prev) => !prev && exclude === 'lineStyle',
        );
        setIsBorderStyleOptionTabActive(
            (prev) => !prev && exclude === 'borderStyle',
        );

        setLineIsSizeOptionTabActive((prev) => !prev && exclude === 'lineSize');
        setBorderIsSizeOptionTabActive(
            (prev) => !prev && exclude === 'borderSize',
        );

        setIsLineColorPickerTabActive((prev) => !prev && exclude === 'line');
        setIsBorderColorPickerTabActive(
            (prev) => !prev && exclude === 'border',
        );
        setIsBackgroundColorPickerTabActive(
            (prev) => !prev && exclude === 'background',
        );

        setIsFibBackgroundTabActive((prev) => !prev && exclude === 'fib');

        setisLabelPlacementOptionTabActive(
            (prev) => !prev && exclude === 'labelPlacement',
        );
        setisLabelAlignmentOptionTabActive(
            (prev) => !prev && exclude === 'labelAlignment',
        );
        if (value && exclude === 'fib') {
            setSelectedFibLevel(() => value);
        }
    };

    useEffect(() => {
        const screenHeight = window.innerHeight;
        const myFloatingDivHeight = settingsDivHeight + floatingToolbarHeight;
        const diffBottom = screenHeight - (divTop + myFloatingDivHeight);
        if (diffBottom < 100) {
            setCheckNearestWindow(true);
        } else {
            setCheckNearestWindow(false);
        }
    }, [
        divTop,
        isLabelPlacementOptionTabActive,
        isLabelAlignmentOptionTabActive,
        floatingToolbarHeight,
        settingsDivHeight,
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEditFibColor = (color: any, type: string) => {
        if (selectedDrawnShape?.data) {
            const rgbaValues = colorPicker.background.match(/\d+(\.\d+)?/g);

            const alphaValue =
                type === 'background' && color.source === 'hex' && rgbaValues
                    ? rgbaValues[3].toString()
                    : color.rgb.a;

            const colorCodeLine =
                'rgba(' +
                color.rgb.r +
                ',' +
                color.rgb.g +
                ',' +
                color.rgb.b +
                ',' +
                alphaValue +
                ')';

            const rgbaAreaValues =
                selectedDrawnShape.data.extraData[0].areaColor.match(
                    /\d+(\.\d+)?/g,
                );

            const colorCodeArea =
                'rgba(' +
                color.rgb.r +
                ',' +
                color.rgb.g +
                ',' +
                color.rgb.b +
                ',' +
                rgbaAreaValues[3].toString() +
                ')';

            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                const oldData = structuredClone(item[changedItemIndex]);

                const oldColor =
                    item[changedItemIndex].extraData[selectedFibLevel - 1]
                        .lineColor;

                if (oldColor !== colorCodeLine) {
                    item[changedItemIndex].extraData[
                        selectedFibLevel - 1
                    ].lineColor = colorCodeLine;
                    item[changedItemIndex].extraData[
                        selectedFibLevel - 1
                    ].areaColor = colorCodeArea;

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

    const placementOptions = [
        {
            name: 'Left',
            value: 'Left',
        },
        {
            name: 'Center',
            value: 'Center',
        },
        {
            name: 'Right',
            value: 'Right',
        },
    ];

    const alignmentOptions = [
        {
            name: 'Top',
            value: 'Top',
        },
        {
            name: 'Middle',
            value: 'Middle',
        },
        {
            name: 'Bottom',
            value: 'Bottom',
        },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEditFibBackgroundColor = (alphaValue: string) => {
        const alphaColorValue = Number(alphaValue) / 100;

        setFibBackgroundAlphaValue(alphaColorValue);

        setDrawnShapeHistory((item: drawDataHistory[]) => {
            const changedItemIndex = item.findIndex(
                (i) => i.time === selectedDrawnShape?.data.time,
            );

            const oldData = structuredClone(item[changedItemIndex]);

            if (fibDataToUpdate === undefined) {
                setFibDataToUpdate(() => oldData);
            }

            item[changedItemIndex].extraData.forEach((data) => {
                const rgbaAreaValues = data.areaColor.match(/\d+(\.\d+)?/g);

                const areaRgbaCode =
                    'rgba(' +
                    rgbaAreaValues[0] +
                    ',' +
                    rgbaAreaValues[1] +
                    ',' +
                    rgbaAreaValues[2] +
                    ',' +
                    alphaColorValue +
                    ')';

                data.areaColor = areaRgbaCode?.toString();
            });

            return item;
        });

        setIsShapeEdited(true);

        renderChart();
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (fibDataToUpdate) {
                setShouldUpdateFibData(true);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [fibBackgroundAlphaValue]);

    useEffect(() => {
        if (fibDataToUpdate && shouldUpdateFibData) {
            const changedItemIndex = drawnShapeHistory.findIndex(
                (i) => i.time === selectedDrawnShape?.data.time,
            );

            saveShapeAttiributesToLocalStorage(
                drawnShapeHistory[changedItemIndex],
            );

            addDrawActionStack(
                fibDataToUpdate,
                false,
                'update',
                drawnShapeHistory[changedItemIndex],
            );

            setShouldUpdateFibData(false);
        }
    }, [fibBackgroundAlphaValue, fibDataToUpdate, shouldUpdateFibData]);

    return (
        <>
            <FloatingToolbarSettingsContainer
                onClick={() => closeAllOptions('none')}
                style={{
                    visibility: isDropdownHeightCalculated
                        ? 'visible'
                        : 'hidden',
                    minWidth: '280px',
                }}
            >
                {selectedDrawnShape && (
                    <LineContainer>
                        {!excludeLineOptions.includes(
                            selectedDrawnShape?.data.type,
                        ) && (
                            <LineSettings>
                                <LineSettingsLeft>
                                    <CheckboxContainer
                                        onClick={(
                                            e: MouseEvent<HTMLElement>,
                                        ) => {
                                            e.stopPropagation();
                                            !lineOptionDisabled.includes(
                                                selectedDrawnShape?.data.type,
                                            ) &&
                                                handleEditLines(
                                                    !selectedDrawnShape.data
                                                        .line.active,
                                                    'line',
                                                );
                                        }}
                                    >
                                        <StyledCheckbox
                                            checked={
                                                selectedDrawnShape.data.line
                                                    .active
                                            }
                                            disabled={lineOptionDisabled.includes(
                                                selectedDrawnShape?.data.type,
                                            )}
                                        >
                                            <Icon viewBox='0 0 24 24'>
                                                <polyline points='20 6 9 17 4 12' />
                                            </Icon>
                                        </StyledCheckbox>
                                    </CheckboxContainer>

                                    <StyledLabel>Line</StyledLabel>
                                </LineSettingsLeft>

                                <LineSettingsRight>
                                    <OptionColorContainer>
                                        <OptionColor
                                            backgroundColor={selectedDrawnShape?.data.line.color.toString()}
                                            disabled={
                                                !selectedDrawnShape?.data.line
                                                    .active
                                            }
                                            style={{
                                                pointerEvents:
                                                    selectedDrawnShape?.data
                                                        .line.active
                                                        ? 'auto'
                                                        : 'none',
                                            }}
                                            onClick={(
                                                event: MouseEvent<HTMLElement>,
                                            ) => {
                                                event.stopPropagation();
                                                closeAllOptions('line');
                                            }}
                                        ></OptionColor>
                                    </OptionColorContainer>

                                    <OptionStyleContainer
                                        disabled={
                                            !selectedDrawnShape?.data.line
                                                .active
                                        }
                                        style={{
                                            position: 'relative',
                                            pointerEvents: selectedDrawnShape
                                                ?.data.line.active
                                                ? 'auto'
                                                : 'none',
                                        }}
                                        onClick={(
                                            event: MouseEvent<HTMLDivElement>,
                                        ) => {
                                            event.stopPropagation();
                                            closeAllOptions('lineSize');
                                        }}
                                    >
                                        <LineWidthOptionsCont
                                            disabled={
                                                !selectedDrawnShape?.data.line
                                                    .active
                                            }
                                        >
                                            <LineWidthOptions
                                                backgroundColor={'#cfd7e3'}
                                                style={{
                                                    borderTopWidth:
                                                        selectedDrawnShape?.data
                                                            .line.lineWidth +
                                                        'px',
                                                }}
                                            ></LineWidthOptions>
                                        </LineWidthOptionsCont>

                                        {selectedDrawnShape &&
                                            isLineSizeOptionTabActive && (
                                                <OptionsTab
                                                    style={{
                                                        transform:
                                                            'translateY(62%)',
                                                        position: 'absolute',
                                                        width: '130px',
                                                    }}
                                                >
                                                    {sizeOptions.map(
                                                        (item, index) => (
                                                            <OptionsTabSize
                                                                backgroundColor={
                                                                    item.value ===
                                                                    selectedDrawnShape
                                                                        .data
                                                                        .line
                                                                        .lineWidth
                                                                        ? '#434c58'
                                                                        : undefined
                                                                }
                                                                key={index}
                                                                onClick={(
                                                                    e: MouseEvent<HTMLElement>,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleEditSize(
                                                                        item.value,
                                                                        isLineSizeOptionTabActive,
                                                                        isBorderSizeOptionTabActive,
                                                                    );
                                                                }}
                                                            >
                                                                {item.icon}{' '}
                                                                {item.name}
                                                            </OptionsTabSize>
                                                        ),
                                                    )}
                                                </OptionsTab>
                                            )}
                                    </OptionStyleContainer>

                                    <OptionStyleContainer
                                        disabled={
                                            !selectedDrawnShape?.data.line
                                                .active
                                        }
                                        style={{
                                            position: 'relative',
                                            pointerEvents: selectedDrawnShape
                                                ?.data.line.active
                                                ? 'auto'
                                                : 'none',
                                        }}
                                        onClick={(
                                            event: MouseEvent<HTMLDivElement>,
                                        ) => {
                                            event.stopPropagation();
                                            closeAllOptions('lineStyle');
                                        }}
                                    >
                                        <img
                                            src={
                                                selectedDrawnShape &&
                                                (0 ===
                                                selectedDrawnShape.data.line
                                                    .dash[0]
                                                    ? lineOptionSvg
                                                    : 5 ===
                                                        selectedDrawnShape.data
                                                            .line.dash[0]
                                                      ? dashOptionSvg
                                                      : dottedOptionSvg)
                                            }
                                            alt=''
                                        />
                                        {selectedDrawnShape &&
                                            isLineStyleOptionTabActive && (
                                                <OptionsTab
                                                    style={{
                                                        transform:
                                                            'translateY(60%)',
                                                        position: 'absolute',
                                                        width: '130px',
                                                    }}
                                                >
                                                    {styleOptions.map(
                                                        (item, index) => (
                                                            <OptionsTabStyle
                                                                backgroundColor={
                                                                    item
                                                                        .value[0] ===
                                                                    selectedDrawnShape
                                                                        .data
                                                                        .line
                                                                        .dash[0]
                                                                        ? '#434c58'
                                                                        : undefined
                                                                }
                                                                key={index}
                                                                onClick={(
                                                                    e: MouseEvent<HTMLElement>,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleEditStyle(
                                                                        item.value,
                                                                        isLineStyleOptionTabActive,
                                                                        isBorderStyleOptionTabActive,
                                                                    );
                                                                }}
                                                            >
                                                                <img
                                                                    src={
                                                                        item.icon
                                                                    }
                                                                    alt=''
                                                                />{' '}
                                                                {item.name}
                                                            </OptionsTabStyle>
                                                        ),
                                                    )}
                                                </OptionsTab>
                                            )}
                                    </OptionStyleContainer>
                                </LineSettingsRight>
                            </LineSettings>
                        )}

                        {borderOptions.includes(
                            selectedDrawnShape?.data.type,
                        ) && (
                            <LineSettings>
                                <LineSettingsLeft>
                                    <CheckboxContainer
                                        onClick={(
                                            e: MouseEvent<HTMLElement>,
                                        ) => {
                                            e.stopPropagation();
                                            !borderOptionDisabled.includes(
                                                selectedDrawnShape?.data.type,
                                            ) &&
                                                handleEditLines(
                                                    !selectedDrawnShape?.data
                                                        .border.active,
                                                    'border',
                                                );
                                        }}
                                    >
                                        <StyledCheckbox
                                            checked={
                                                selectedDrawnShape?.data.border
                                                    .active
                                            }
                                            disabled={borderOptionDisabled.includes(
                                                selectedDrawnShape?.data.type,
                                            )}
                                        >
                                            <Icon viewBox='0 0 24 24'>
                                                <polyline points='20 6 9 17 4 12' />
                                            </Icon>
                                        </StyledCheckbox>
                                    </CheckboxContainer>
                                    <StyledLabel>Border</StyledLabel>
                                </LineSettingsLeft>

                                <LineSettingsRight>
                                    <OptionColorContainer>
                                        <OptionColor
                                            backgroundColor={selectedDrawnShape?.data.border.color.toString()}
                                            disabled={
                                                !selectedDrawnShape?.data.border
                                                    .active
                                            }
                                            style={{
                                                pointerEvents:
                                                    selectedDrawnShape?.data
                                                        .border.active
                                                        ? 'auto'
                                                        : 'none',
                                            }}
                                            onClick={(
                                                event: MouseEvent<HTMLDivElement>,
                                            ) => {
                                                event.stopPropagation();
                                                closeAllOptions('border');
                                            }}
                                        ></OptionColor>
                                    </OptionColorContainer>

                                    <OptionStyleContainer
                                        disabled={
                                            !selectedDrawnShape?.data.border
                                                .active
                                        }
                                        style={{
                                            pointerEvents: selectedDrawnShape
                                                ?.data.border.active
                                                ? 'auto'
                                                : 'none',
                                        }}
                                        onClick={(
                                            event: MouseEvent<HTMLDivElement>,
                                        ) => {
                                            event.stopPropagation();
                                            closeAllOptions('borderSize');
                                        }}
                                    >
                                        <LineWidthOptionsCont
                                            disabled={
                                                !selectedDrawnShape?.data.line
                                                    .active
                                            }
                                        >
                                            <LineWidthOptions
                                                backgroundColor={'#cfd7e3'}
                                                style={{
                                                    borderTopWidth:
                                                        selectedDrawnShape?.data
                                                            .border.lineWidth +
                                                        'px',
                                                }}
                                            ></LineWidthOptions>
                                        </LineWidthOptionsCont>

                                        {selectedDrawnShape &&
                                            isBorderSizeOptionTabActive && (
                                                <OptionsTab
                                                    style={{
                                                        transform:
                                                            'translateY(62%)',
                                                        position: 'absolute',
                                                        width: '130px',
                                                    }}
                                                >
                                                    {sizeOptions.map(
                                                        (item, index) => (
                                                            <OptionsTabSize
                                                                backgroundColor={
                                                                    item.value ===
                                                                    selectedDrawnShape
                                                                        .data
                                                                        .border
                                                                        .lineWidth
                                                                        ? '#434c58'
                                                                        : undefined
                                                                }
                                                                key={index}
                                                                onClick={(
                                                                    e: MouseEvent<HTMLElement>,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleEditSize(
                                                                        item.value,
                                                                        isLineSizeOptionTabActive,
                                                                        isBorderSizeOptionTabActive,
                                                                    );
                                                                }}
                                                            >
                                                                {item.icon}{' '}
                                                                {item.name}
                                                            </OptionsTabSize>
                                                        ),
                                                    )}
                                                </OptionsTab>
                                            )}
                                    </OptionStyleContainer>

                                    <OptionStyleContainer
                                        disabled={
                                            !selectedDrawnShape?.data.border
                                                .active
                                        }
                                        style={{
                                            pointerEvents: selectedDrawnShape
                                                ?.data.border.active
                                                ? 'auto'
                                                : 'none',
                                        }}
                                        onClick={(
                                            event: MouseEvent<HTMLDivElement>,
                                        ) => {
                                            event.stopPropagation();
                                            closeAllOptions('borderStyle');
                                        }}
                                    >
                                        <img
                                            src={
                                                selectedDrawnShape &&
                                                (0 ===
                                                selectedDrawnShape.data.border
                                                    .dash[0]
                                                    ? lineOptionSvg
                                                    : 5 ===
                                                        selectedDrawnShape.data
                                                            .border.dash[0]
                                                      ? dashOptionSvg
                                                      : dottedOptionSvg)
                                            }
                                            alt=''
                                        />
                                        {selectedDrawnShape &&
                                            isBorderStyleOptionTabActive && (
                                                <OptionsTab
                                                    style={{
                                                        transform:
                                                            'translateY(60%)',
                                                        position: 'absolute',
                                                        width: '130px',
                                                    }}
                                                >
                                                    {styleOptions.map(
                                                        (item, index) => (
                                                            <OptionsTabStyle
                                                                backgroundColor={
                                                                    item
                                                                        .value[0] ===
                                                                    selectedDrawnShape
                                                                        .data
                                                                        .border
                                                                        .dash[0]
                                                                        ? '#434c58'
                                                                        : undefined
                                                                }
                                                                key={index}
                                                                onClick={(
                                                                    e: MouseEvent<HTMLElement>,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleEditStyle(
                                                                        item.value,
                                                                        isLineStyleOptionTabActive,
                                                                        isBorderStyleOptionTabActive,
                                                                    );
                                                                }}
                                                            >
                                                                <img
                                                                    src={
                                                                        item.icon
                                                                    }
                                                                    alt=''
                                                                />{' '}
                                                                {item.name}
                                                            </OptionsTabStyle>
                                                        ),
                                                    )}
                                                </OptionsTab>
                                            )}
                                    </OptionStyleContainer>
                                </LineSettingsRight>
                            </LineSettings>
                        )}

                        {backgroundOptions.includes(
                            selectedDrawnShape?.data.type,
                        ) && (
                            <LineSettings>
                                <LineSettingsLeft>
                                    <CheckboxContainer
                                        onClick={(
                                            e: MouseEvent<HTMLElement>,
                                        ) => {
                                            e.stopPropagation();
                                            handleEditLines(
                                                !selectedDrawnShape?.data
                                                    .background.active,
                                                'background',
                                            );
                                        }}
                                    >
                                        <StyledCheckbox
                                            checked={
                                                selectedDrawnShape?.data
                                                    .background.active
                                            }
                                            disabled={false}
                                        >
                                            <Icon viewBox='0 0 24 24'>
                                                <polyline points='20 6 9 17 4 12' />
                                            </Icon>
                                        </StyledCheckbox>
                                    </CheckboxContainer>
                                    <StyledLabel>Background</StyledLabel>
                                </LineSettingsLeft>
                                <LineSettingsRight>
                                    <OptionColorContainer>
                                        <OptionColor
                                            backgroundColor={selectedDrawnShape?.data.background.color.toString()}
                                            disabled={
                                                !selectedDrawnShape?.data
                                                    .background.active
                                            }
                                            style={{
                                                pointerEvents:
                                                    selectedDrawnShape?.data
                                                        .background.active
                                                        ? 'auto'
                                                        : 'none',
                                            }}
                                            onClick={(
                                                event: MouseEvent<HTMLDivElement>,
                                            ) => {
                                                event.stopPropagation();
                                                closeAllOptions('background');
                                            }}
                                        ></OptionColor>
                                    </OptionColorContainer>
                                </LineSettingsRight>
                            </LineSettings>
                        )}
                    </LineContainer>
                )}

                {selectedDrawnShape &&
                    selectedDrawnShape.data.type === 'FibRetracement' && (
                        <Divider></Divider>
                    )}

                {selectedDrawnShape &&
                    selectedDrawnShape.data.type === 'FibRetracement' && (
                        <FibLineSettings>
                            {selectedDrawnShape.data.extraData.map(
                                (item, index) => (
                                    <FibLineOptions key={index}>
                                        <CheckboxContainer
                                            onClick={(
                                                e: MouseEvent<HTMLElement>,
                                            ) => {
                                                e.stopPropagation();
                                                item.active = !item.active;
                                                setIsShapeEdited(true);
                                                saveShapeAttiributesToLocalStorage(
                                                    selectedDrawnShape.data,
                                                );
                                            }}
                                        >
                                            <StyledCheckbox
                                                checked={item.active}
                                                disabled={false}
                                            >
                                                <Icon viewBox='0 0 24 24'>
                                                    <polyline points='20 6 9 17 4 12' />
                                                </Icon>
                                            </StyledCheckbox>
                                        </CheckboxContainer>
                                        <InfoLabel>
                                            <LevelTitle>
                                                {item.level}
                                            </LevelTitle>
                                        </InfoLabel>

                                        <OptionColorContainer>
                                            <OptionColor
                                                backgroundColor={item.lineColor}
                                                disabled={!item.active}
                                                isFibColor={true}
                                                style={{
                                                    pointerEvents: item.active
                                                        ? 'auto'
                                                        : 'none',
                                                }}
                                                onClick={(
                                                    event: MouseEvent<HTMLDivElement>,
                                                ) => {
                                                    event.stopPropagation();
                                                    closeAllOptions(
                                                        'fib',
                                                        index + 1,
                                                    );
                                                }}
                                            ></OptionColor>

                                            {isFibBackgroundTabActive &&
                                                index + 1 ===
                                                    selectedFibLevel && (
                                                    <ColorPickerTab
                                                        style={{
                                                            position:
                                                                'absolute',
                                                            zIndex: 199,
                                                            top: '15px',
                                                        }}
                                                        onClick={(
                                                            event: MouseEvent<HTMLElement>,
                                                        ) =>
                                                            event.stopPropagation()
                                                        }
                                                    >
                                                        <SketchPicker
                                                            color={
                                                                selectedFibLevel
                                                                    ? selectedDrawnShape
                                                                          ?.data
                                                                          .extraData[
                                                                          selectedFibLevel -
                                                                              1
                                                                      ]
                                                                          .lineColor
                                                                    : colorPicker.background
                                                            }
                                                            width={'170px'}
                                                            onChange={(
                                                                item,
                                                                event,
                                                            ) => {
                                                                event.stopPropagation();
                                                                handleEditFibColor(
                                                                    item,
                                                                    'fib',
                                                                );
                                                            }}
                                                        />
                                                    </ColorPickerTab>
                                                )}
                                        </OptionColorContainer>
                                    </FibLineOptions>
                                ),
                            )}
                        </FibLineSettings>
                    )}

                {selectedDrawnShape &&
                    selectedDrawnShape.data.type === 'FibRetracement' && (
                        <Divider></Divider>
                    )}

                {selectedDrawnShape &&
                    selectedDrawnShape.data.type === 'FibRetracement' && (
                        <FibLineSettings style={{ paddingBottom: '10px' }}>
                            <ExtendSettings>
                                <CheckboxContainer
                                    onClick={(e: MouseEvent<HTMLElement>) => {
                                        e.stopPropagation();
                                        handleEditLines(
                                            !selectedDrawnShape.data.extendLeft,
                                            'extendLeft',
                                        );
                                    }}
                                >
                                    <StyledCheckbox
                                        checked={
                                            selectedDrawnShape.data.extendLeft
                                        }
                                        disabled={false}
                                    >
                                        <Icon viewBox='0 0 24 24'>
                                            <polyline points='20 6 9 17 4 12' />
                                        </Icon>
                                    </StyledCheckbox>
                                </CheckboxContainer>
                                <StyledLabel>Extend Left</StyledLabel>
                            </ExtendSettings>
                            <ExtendSettings>
                                <CheckboxContainer
                                    onClick={(e: MouseEvent<HTMLElement>) => {
                                        e.stopPropagation();
                                        handleEditLines(
                                            !selectedDrawnShape.data
                                                .extendRight,
                                            'extendRight',
                                        );
                                    }}
                                >
                                    <StyledCheckbox
                                        checked={
                                            selectedDrawnShape.data.extendRight
                                        }
                                        disabled={false}
                                    >
                                        <Icon viewBox='0 0 24 24'>
                                            <polyline points='20 6 9 17 4 12' />
                                        </Icon>
                                    </StyledCheckbox>
                                </CheckboxContainer>
                                <StyledLabel>Extend Right</StyledLabel>
                            </ExtendSettings>
                        </FibLineSettings>
                    )}

                {selectedDrawnShape &&
                    selectedDrawnShape.data.type === 'FibRetracement' && (
                        <FibLineSettings style={{ paddingBottom: '10px' }}>
                            <ExtendSettings>
                                <CheckboxContainer
                                    onClick={(e: MouseEvent<HTMLElement>) => {
                                        e.stopPropagation();
                                        handleEditLines(
                                            !selectedDrawnShape.data.reverse,
                                            'reverse',
                                        );
                                    }}
                                >
                                    <StyledCheckbox
                                        checked={
                                            selectedDrawnShape.data.reverse
                                        }
                                        disabled={false}
                                    >
                                        <Icon viewBox='0 0 24 24'>
                                            <polyline points='20 6 9 17 4 12' />
                                        </Icon>
                                    </StyledCheckbox>
                                </CheckboxContainer>
                                <StyledLabel>Reverse</StyledLabel>
                            </ExtendSettings>
                        </FibLineSettings>
                    )}

                {selectedDrawnShape &&
                    selectedDrawnShape.data.type === 'FibRetracement' && (
                        <LabelSettingsContainer
                            style={{ paddingBottom: '5px' }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    paddingLeft: '18px',
                                    // justifyContent: 'center',
                                }}
                            >
                                <StyledLabel>Labels</StyledLabel>
                            </div>

                            <DropDownContainer>
                                <DropDownHeader
                                    onClick={(
                                        event: MouseEvent<HTMLElement>,
                                    ) => {
                                        event.stopPropagation();
                                        setisLabelAlignmentOptionTabActive(
                                            false,
                                        );
                                        setisLabelPlacementOptionTabActive(
                                            (prev) => !prev,
                                        );
                                    }}
                                >
                                    <div>
                                        {selectedDrawnShape.data.labelPlacement}
                                    </div>
                                    <LabelSettingsArrow
                                        isActive={
                                            isLabelPlacementOptionTabActive
                                        }
                                        width={5}
                                        height={6}
                                    ></LabelSettingsArrow>
                                </DropDownHeader>

                                {isLabelPlacementOptionTabActive && (
                                    <DropDownListContainer
                                        style={{
                                            bottom: checkNearestWindow
                                                ? '30px'
                                                : '',
                                        }}
                                    >
                                        <DropDownList width={75}>
                                            {placementOptions.map(
                                                (item, index) => (
                                                    <ListItem
                                                        backgroundColor={
                                                            item.value ===
                                                            selectedDrawnShape
                                                                .data
                                                                .labelPlacement
                                                                ? '#434c58'
                                                                : undefined
                                                        }
                                                        key={index}
                                                        onClick={(
                                                            event: MouseEvent<HTMLElement>,
                                                        ) => {
                                                            event.stopPropagation();
                                                            handleEditLabel(
                                                                item.value,
                                                                isLabelPlacementOptionTabActive,
                                                                isLabelAlignmentOptionTabActive,
                                                            );
                                                        }}
                                                    >
                                                        {item.name}
                                                    </ListItem>
                                                ),
                                            )}
                                        </DropDownList>
                                    </DropDownListContainer>
                                )}
                            </DropDownContainer>

                            <DropDownContainer>
                                <DropDownHeader
                                    onClick={(
                                        event: MouseEvent<HTMLElement>,
                                    ) => {
                                        event.stopPropagation();
                                        setisLabelPlacementOptionTabActive(
                                            false,
                                        );
                                        setisLabelAlignmentOptionTabActive(
                                            (prev) => !prev,
                                        );
                                    }}
                                >
                                    <div>
                                        {selectedDrawnShape.data.labelAlignment}
                                    </div>
                                    <LabelSettingsArrow
                                        isActive={
                                            isLabelAlignmentOptionTabActive
                                        }
                                        width={5}
                                        height={6}
                                    ></LabelSettingsArrow>
                                </DropDownHeader>
                                {isLabelAlignmentOptionTabActive && (
                                    <DropDownListContainer
                                        style={{
                                            bottom:
                                                isNearestWindow ||
                                                checkNearestWindow
                                                    ? '30px'
                                                    : '',
                                        }}
                                    >
                                        <DropDownList width={75}>
                                            {alignmentOptions.map(
                                                (item, index) => (
                                                    <ListItem
                                                        backgroundColor={
                                                            item.value ===
                                                            selectedDrawnShape
                                                                .data
                                                                .labelAlignment
                                                                ? '#434c58'
                                                                : undefined
                                                        }
                                                        key={index}
                                                        onClick={(
                                                            event: MouseEvent<HTMLElement>,
                                                        ) => {
                                                            event.stopPropagation();
                                                            handleEditLabel(
                                                                item.value,
                                                                isLabelPlacementOptionTabActive,
                                                                isLabelAlignmentOptionTabActive,
                                                            );
                                                        }}
                                                    >
                                                        {item.name}
                                                    </ListItem>
                                                ),
                                            )}
                                        </DropDownList>
                                    </DropDownListContainer>
                                )}
                            </DropDownContainer>
                        </LabelSettingsContainer>
                    )}

                {selectedDrawnShape &&
                    selectedDrawnShape.data.type === 'FibRetracement' && (
                        <LabelSettingsContainer
                            style={{ padding: '5px 0 5px 0' }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    paddingLeft: '18px',
                                    // justifyContent: 'center',
                                }}
                            >
                                <StyledLabel>Background</StyledLabel>
                            </div>

                            <SliderContainer>
                                <AlphaSlider
                                    type='range'
                                    min='0'
                                    max='100'
                                    onChange={(
                                        event: React.ChangeEvent<HTMLInputElement>,
                                    ) => {
                                        event.stopPropagation();
                                        handleEditFibBackgroundColor(
                                            event.target.value,
                                        );
                                    }}
                                    value={fibBackgroundAlphaValue * 100}
                                />
                            </SliderContainer>
                        </LabelSettingsContainer>
                    )}
            </FloatingToolbarSettingsContainer>

            {selectedDrawnShape &&
                (isLineColorPickerTabActive ||
                    isBorderColorPickerTabActive ||
                    isBackgroundColorPickerTabActive) && (
                    <ColorPickerTab
                        style={
                            isNearestWindow
                                ? {
                                      bottom: '70px',
                                      position: 'absolute',
                                      zIndex: 199,
                                  }
                                : {
                                      position: 'absolute',
                                      top:
                                          (isLineColorPickerTabActive
                                              ? 30
                                              : isBorderColorPickerTabActive
                                                ? 30 +
                                                  (!excludeLineOptions.includes(
                                                      selectedDrawnShape?.data
                                                          .type,
                                                  )
                                                      ? 30
                                                      : 0)
                                                : 60 +
                                                  (!excludeLineOptions.includes(
                                                      selectedDrawnShape?.data
                                                          .type,
                                                  )
                                                      ? 30
                                                      : 0)) + 'px',
                                      left: '85px',
                                  }
                        }
                        onClick={(event: MouseEvent<HTMLElement>) =>
                            event.stopPropagation()
                        }
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
                            onChange={(item, event) => {
                                event.stopPropagation();
                                {
                                    handleEditColor(
                                        item,
                                        isLineColorPickerTabActive,
                                        isBorderColorPickerTabActive,
                                        isBackgroundColorPickerTabActive,
                                    );
                                }
                            }}
                        />
                    </ColorPickerTab>
                )}
        </>
    );
}
export default FloatingToolbarSettings;
