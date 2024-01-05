import React, { MouseEvent, useEffect, useState } from 'react';
import {
    drawDataHistory,
    saveShapeAttiributesToLocalStorage,
    selectedDrawnData,
} from '../../ChartUtils/chartUtils';
import {
    ColorPickerTab,
    DropDownContainer,
    DropDownHeader,
    DropDownList,
    DropDownListContainer,
    ExtendSettings,
    FibLineOptions,
    FibLineSettings,
    FloatingToolbarSettingsContainer,
    InfoLabel,
    LevelTitle,
    LineContainer,
    LineSettings,
    LineSettingsLeft,
    LineSettingsRight,
    OptionColor,
    OptionColorContainer,
    OptionStyleContainer,
    StyledLabel,
    ListItem,
    CheckboxContainer,
    StyledCheckbox,
    Icon,
    LineWidthOptions,
    LabelSettingsContainer,
    LabelSettingsArrow,
    SliderContainer,
} from './FloatingToolbarSettingsCss';
import { AlphaPicker, SketchPicker } from 'react-color';
import {
    OptionsTab,
    OptionsTabSize,
    OptionsTabStyle,
} from './FloatingToolbarCss';
import Divider from '../../../../components/Global/Divider/Divider';
import lineOptionSvg from '../../../../assets/images/icons/draw/lineOptions/line.svg';
import dashOptionSvg from '../../../../assets/images/icons/draw/lineOptions/dash.svg';
import dottedOptionSvg from '../../../../assets/images/icons/draw/lineOptions/dotted.svg';
import * as d3 from 'd3';

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
    const [fibBackgroundAlfaValue, setFibBackgroundAlfaValue] = useState<any>(
        'rgba(47, 90, 181, 0.3)',
    );

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
        if (Math.abs(floatingToolbarHeight - settingsDivHeight) < 90) {
            setCheckNearestWindow(true);
        } else {
            setCheckNearestWindow(false);
        }
    }, [
        isLabelPlacementOptionTabActive,
        isLabelAlignmentOptionTabActive,
        floatingToolbarHeight,
        settingsDivHeight,
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEditFibColor = (color: any, type: string) => {
        if (selectedDrawnShape?.data) {
            const rgbaValues = colorPicker.background.match(/\d+(\.\d+)?/g);

            const alfaValue =
                type === 'background' && color.source === 'hex' && rgbaValues
                    ? rgbaValues[3].toString()
                    : color.rgb.a;

            const colorRgbaCode =
                alfaValue === 0
                    ? 'transparent'
                    : 'rgba(' +
                      color.rgb.r +
                      ',' +
                      color.rgb.g +
                      ',' +
                      color.rgb.b +
                      ',' +
                      alfaValue +
                      ')';

            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                const oldData = structuredClone(item[changedItemIndex]);

                const oldColor =
                    item[changedItemIndex].extraData[selectedFibLevel].color;

                if (oldColor !== colorRgbaCode) {
                    item[changedItemIndex].extraData[selectedFibLevel].color =
                        colorRgbaCode;

                    saveShapeAttiributesToLocalStorage(item[changedItemIndex]);

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

    const handleEditFibBackgroundColor = (color: any) => {
        const alfaValue = color.rgb.a;

        const colorRgbaCode =
            alfaValue === 0
                ? 'transparent'
                : 'rgba(' +
                  color.rgb.r +
                  ',' +
                  color.rgb.g +
                  ',' +
                  color.rgb.b +
                  ',' +
                  alfaValue +
                  ')';

        setFibBackgroundAlfaValue(colorRgbaCode);

        setDrawnShapeHistory((item: drawDataHistory[]) => {
            const changedItemIndex = item.findIndex(
                (i) => i.time === selectedDrawnShape?.data.time,
            );

            const oldData = structuredClone(item[changedItemIndex]);

            item[changedItemIndex].extraData.forEach((data) => {
                const levelColor = d3.color(data.color);

                if (levelColor) {
                    levelColor.opacity = alfaValue;

                    data.color = levelColor?.toString();
                }
            });

            // saveShapeAttiributesToLocalStorage(item[changedItemIndex]);

            // addDrawActionStack(
            //     oldData,
            //     false,
            //     'update',
            //     item[changedItemIndex],
            // );

            return item;
        });

        setIsShapeEdited(true);
    };

    const inputStyles = {
        picker: {
            width: '10px',
            height: '10px',
        },
        alpha: {},
    };

    return (
        <>
            <FloatingToolbarSettingsContainer
                onClick={() => closeAllOptions('none')}
                style={
                    isNearestWindow
                        ? {
                              position: 'fixed',
                              width: 'auto',
                              minWidth: '280px',
                              bottom: floatingToolbarHeight + 4 + 'px',
                          }
                        : {}
                }
            >
                {selectedDrawnShape && (
                    <LineContainer>
                        {!excludeLineOptions.includes(
                            selectedDrawnShape?.data.type,
                        ) && (
                            <LineSettings>
                                <LineSettingsLeft>
                                    <CheckboxContainer
                                        onClick={() => {
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
                                        <LineWidthOptions
                                            backgroundColor={'#cfd7e3'}
                                            style={{
                                                borderTopWidth:
                                                    selectedDrawnShape?.data
                                                        .line.lineWidth + 'px',
                                            }}
                                        ></LineWidthOptions>
                                    </OptionStyleContainer>

                                    <OptionStyleContainer
                                        disabled={
                                            !selectedDrawnShape?.data.line
                                                .active
                                        }
                                        style={{
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
                                        onClick={() => {
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
                                        <LineWidthOptions
                                            backgroundColor={'#cfd7e3'}
                                            style={{
                                                borderTopWidth:
                                                    selectedDrawnShape?.data
                                                        .border.lineWidth +
                                                    'px',
                                            }}
                                        ></LineWidthOptions>
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
                                        onClick={() => {
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
                                            onClick={() => {
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
                                                backgroundColor={item.color}
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
                                                        index,
                                                    );
                                                }}
                                            ></OptionColor>

                                            {isFibBackgroundTabActive &&
                                                index === selectedFibLevel && (
                                                    <ColorPickerTab
                                                        style={{
                                                            position:
                                                                'absolute',
                                                            zIndex: 99,
                                                            top:
                                                                70 +
                                                                Number(
                                                                    Math.floor(
                                                                        (selectedFibLevel +
                                                                            2) /
                                                                            2,
                                                                    ).toFixed(
                                                                        0,
                                                                    ),
                                                                ) *
                                                                    32 +
                                                                'px',
                                                        }}
                                                    >
                                                        <SketchPicker
                                                            color={
                                                                selectedFibLevel
                                                                    ? selectedDrawnShape
                                                                          ?.data
                                                                          .extraData[
                                                                          selectedFibLevel
                                                                      ].color
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
                                    onClick={() => {
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
                                    onClick={() => {
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
                                    onClick={() => {
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
                                    paddingLeft: '8px',
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
                                    ></LabelSettingsArrow>
                                </DropDownHeader>

                                {isLabelPlacementOptionTabActive && (
                                    <DropDownListContainer
                                        style={{
                                            bottom:
                                                isNearestWindow ||
                                                checkNearestWindow
                                                    ? '30px'
                                                    : '',
                                        }}
                                    >
                                        <DropDownList>
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
                                        <DropDownList>
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
                                    paddingLeft: '8px',
                                    // justifyContent: 'center',
                                }}
                            >
                                <StyledLabel>Background</StyledLabel>
                            </div>

                            <SliderContainer>
                                <AlphaPicker
                                    color={fibBackgroundAlfaValue}
                                    onChange={(item, event) => {
                                        event.stopPropagation();
                                        handleEditFibBackgroundColor(item);
                                    }}
                                    width={'110px'}
                                    height={'12px'}
                                    styles={{ inputStyles }}
                                ></AlphaPicker>
                            </SliderContainer>
                        </LabelSettingsContainer>
                    )}
            </FloatingToolbarSettingsContainer>

            {(isLineColorPickerTabActive ||
                isBorderColorPickerTabActive ||
                isBackgroundColorPickerTabActive) && (
                <ColorPickerTab
                    style={
                        isNearestWindow
                            ? {
                                  bottom: '70px',
                                  position: 'absolute',
                                  zIndex: 99,
                              }
                            : {
                                  position: 'absolute',
                                  top:
                                      (isLineColorPickerTabActive
                                          ? 60
                                          : isBorderColorPickerTabActive
                                          ? 90
                                          : 120) + 'px',
                                  left: '85px',
                              }
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

            {selectedDrawnShape &&
                (isLineSizeOptionTabActive || isBorderSizeOptionTabActive) && (
                    <OptionsTab
                        style={
                            isNearestWindow
                                ? {
                                      bottom: '70px',
                                      position: 'absolute',
                                      left: '100px',
                                  }
                                : {
                                      marginLeft: '70px',
                                      position: 'absolute',
                                      top:
                                          (isLineSizeOptionTabActive
                                              ? 65
                                              : 95) + 'px',
                                      left: '80px',
                                  }
                        }
                    >
                        {sizeOptions.map((item, index) => (
                            <OptionsTabSize
                                backgroundColor={
                                    item.value ===
                                    (isLineSizeOptionTabActive
                                        ? selectedDrawnShape.data.line.lineWidth
                                        : selectedDrawnShape.data.border
                                              .lineWidth)
                                        ? '#434c58'
                                        : undefined
                                }
                                key={index}
                                onClick={() =>
                                    handleEditSize(
                                        item.value,
                                        isLineSizeOptionTabActive,
                                        isBorderSizeOptionTabActive,
                                    )
                                }
                            >
                                {item.icon} {item.name}
                            </OptionsTabSize>
                        ))}
                    </OptionsTab>
                )}

            {selectedDrawnShape &&
                (isLineStyleOptionTabActive ||
                    isBorderStyleOptionTabActive) && (
                    <OptionsTab
                        style={
                            isNearestWindow
                                ? {
                                      bottom: '70px',
                                      position: 'absolute',
                                      left: '140px',
                                  }
                                : {
                                      marginLeft: '70px',
                                      position: 'absolute',
                                      top:
                                          (isLineStyleOptionTabActive
                                              ? 65
                                              : 95) + 'px',
                                      left: '130px',
                                  }
                        }
                    >
                        {styleOptions.map((item, index) => (
                            <OptionsTabStyle
                                backgroundColor={
                                    item.value[0] ===
                                    (isLineStyleOptionTabActive
                                        ? selectedDrawnShape.data.line.dash[0]
                                        : selectedDrawnShape.data.border
                                              .dash[0])
                                        ? '#434c58'
                                        : undefined
                                }
                                key={index}
                                onClick={() =>
                                    handleEditStyle(
                                        item.value,
                                        isLineStyleOptionTabActive,
                                        isBorderStyleOptionTabActive,
                                    )
                                }
                            >
                                <img src={item.icon} alt='' /> {item.name}
                            </OptionsTabStyle>
                        ))}
                    </OptionsTab>
                )}
        </>
    );
}
export default FloatingToolbarSettings;
