import React, { MouseEvent, useState } from 'react';
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
    LabelStyleContainer,
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
} from './FloatingToolbarSettingsCss';
import Toggle from '../../../../components/Form/Toggle';
import { AiOutlineMinus, AiOutlineDash } from 'react-icons/ai';
import { SketchPicker } from 'react-color';
import {
    OptionsTab,
    OptionsTabSize,
    OptionsTabStyle,
} from './FloatingToolbarCss';
import Divider from '../../../../components/Global/Divider/Divider';

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
    addDrawActionStack: (item: drawDataHistory, isNewShape: boolean) => void;
    colorPicker: { lineColor: string; borderColor: string; background: string };
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
    } = props;

    // disabled options
    const lineOptionDisabled = ['Brush', 'DPRange', 'Ray'];
    const borderOptionDisabled = ['Rect'];

    // special options
    const borderOptions = ['Rect', 'DPRange'];
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEditFibColor = (color: any, type: string) => {
        if (selectedDrawnShape?.data) {
            const rgbaValues = colorPicker.background.match(/\d+(\.\d+)?/g);

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

            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                item[changedItemIndex].extraData[selectedFibLevel].color =
                    colorRgbaCode;

                saveShapeAttiributesToLocalStorage(item[changedItemIndex]);

                addDrawActionStack(item[changedItemIndex], false);

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

    return (
        <>
            <FloatingToolbarSettingsContainer
            // onClick={() => closeAllOptions('none')}
            >
                {selectedDrawnShape && (
                    <LineContainer>
                        <LineSettings>
                            <LineSettingsLeft>
                                <Toggle
                                    key={'toggle'}
                                    isOn={selectedDrawnShape.data.line.active}
                                    disabled={lineOptionDisabled.includes(
                                        selectedDrawnShape?.data.type,
                                    )}
                                    handleToggle={() => {
                                        handleEditLines(
                                            !selectedDrawnShape.data.line
                                                .active,
                                            'line',
                                        );
                                    }}
                                    id='is_guide_line_visible'
                                    aria-label={'aria-label'}
                                />
                                <StyledLabel>Line</StyledLabel>
                            </LineSettingsLeft>

                            <LineSettingsRight>
                                <OptionColorContainer>
                                    <OptionColor
                                        backgroundColor={selectedDrawnShape?.data.line.color.toString()}
                                        onClick={(
                                            event: MouseEvent<HTMLElement>,
                                        ) => {
                                            event.stopPropagation();
                                            closeAllOptions('line');
                                        }}
                                    ></OptionColor>
                                </OptionColorContainer>

                                <OptionStyleContainer
                                    onClick={(
                                        event: MouseEvent<HTMLDivElement>,
                                    ) => {
                                        event.stopPropagation();
                                        closeAllOptions('lineSize');
                                    }}
                                >
                                    <AiOutlineMinus color='white' />
                                </OptionStyleContainer>

                                <OptionStyleContainer
                                    onClick={(
                                        event: MouseEvent<HTMLDivElement>,
                                    ) => {
                                        event.stopPropagation();
                                        closeAllOptions('lineStyle');
                                    }}
                                >
                                    <AiOutlineDash color='white' />
                                </OptionStyleContainer>
                            </LineSettingsRight>
                        </LineSettings>

                        {borderOptions.includes(
                            selectedDrawnShape.data.type,
                        ) && (
                            <LineSettings>
                                <LineSettingsLeft>
                                    <Toggle
                                        key={'toggle'}
                                        isOn={
                                            selectedDrawnShape.data.border
                                                .active
                                        }
                                        disabled={borderOptionDisabled.includes(
                                            selectedDrawnShape?.data.type,
                                        )}
                                        handleToggle={() => {
                                            handleEditLines(
                                                !selectedDrawnShape.data.border
                                                    .active,
                                                'border',
                                            );
                                        }}
                                        id='is_background_visible'
                                        aria-label={'aria-label'}
                                    />
                                    <StyledLabel>Border</StyledLabel>
                                </LineSettingsLeft>

                                <LineSettingsRight>
                                    <OptionColorContainer>
                                        <OptionColor
                                            backgroundColor={selectedDrawnShape?.data.border.color.toString()}
                                            onClick={(
                                                event: MouseEvent<HTMLDivElement>,
                                            ) => {
                                                event.stopPropagation();
                                                closeAllOptions('border');
                                            }}
                                        ></OptionColor>
                                    </OptionColorContainer>

                                    <OptionStyleContainer
                                        onClick={(
                                            event: MouseEvent<HTMLDivElement>,
                                        ) => {
                                            event.stopPropagation();
                                            closeAllOptions('borderSize');
                                        }}
                                    >
                                        <AiOutlineMinus color='white' />
                                    </OptionStyleContainer>

                                    <OptionStyleContainer
                                        onClick={(
                                            event: MouseEvent<HTMLDivElement>,
                                        ) => {
                                            event.stopPropagation();
                                            closeAllOptions('borderStyle');
                                        }}
                                    >
                                        <AiOutlineDash color='white' />
                                    </OptionStyleContainer>
                                </LineSettingsRight>
                            </LineSettings>
                        )}

                        {backgroundOptions.includes(
                            selectedDrawnShape.data.type,
                        ) && (
                            <LineSettings>
                                <LineSettingsLeft>
                                    <Toggle
                                        key={'toggle'}
                                        isOn={
                                            selectedDrawnShape.data.background
                                                .active
                                        }
                                        disabled={false}
                                        handleToggle={() => {
                                            handleEditLines(
                                                !selectedDrawnShape.data
                                                    .background.active,
                                                'background',
                                            );
                                        }}
                                        id='is_background_visible'
                                        aria-label={'aria-label'}
                                    />
                                    <StyledLabel>Background</StyledLabel>
                                </LineSettingsLeft>
                                <LineSettingsRight>
                                    <OptionColorContainer>
                                        <OptionColor
                                            backgroundColor={selectedDrawnShape?.data.background.color.toString()}
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

                <Divider></Divider>

                {selectedDrawnShape &&
                    selectedDrawnShape.data.type === 'FibRetracement' && (
                        <FibLineSettings>
                            {selectedDrawnShape.data.extraData.map(
                                (item, index) => (
                                    <FibLineOptions key={index}>
                                        <Toggle
                                            key={'toggle'}
                                            isOn={item.active}
                                            disabled={false}
                                            handleToggle={() => {
                                                item.active = !item.active;
                                                setIsShapeEdited(true);
                                                saveShapeAttiributesToLocalStorage(
                                                    selectedDrawnShape.data,
                                                );
                                            }}
                                            id='fib_lines'
                                            aria-label={'aria-label'}
                                        />
                                        <InfoLabel>
                                            <LevelTitle>
                                                {item.level}
                                            </LevelTitle>
                                        </InfoLabel>

                                        <OptionColorContainer>
                                            <OptionColor
                                                backgroundColor={item.color}
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
                                                            onChange={(item) =>
                                                                handleEditFibColor(
                                                                    item,
                                                                    'fib',
                                                                )
                                                            }
                                                        />
                                                    </ColorPickerTab>
                                                )}
                                        </OptionColorContainer>
                                    </FibLineOptions>
                                ),
                            )}
                        </FibLineSettings>
                    )}

                <Divider></Divider>

                {selectedDrawnShape &&
                    selectedDrawnShape.data.type === 'FibRetracement' && (
                        <FibLineSettings style={{ paddingBottom: '10px' }}>
                            <ExtendSettings>
                                <Toggle
                                    key={'toggle'}
                                    isOn={selectedDrawnShape.data.extendLeft}
                                    disabled={false}
                                    handleToggle={() => {
                                        handleEditLines(
                                            !selectedDrawnShape.data.extendLeft,
                                            'extendLeft',
                                        );
                                    }}
                                    id='is_extendLeft_visible'
                                    aria-label={'aria-label'}
                                />
                                <StyledLabel>Extend Left</StyledLabel>
                            </ExtendSettings>
                            <ExtendSettings>
                                <Toggle
                                    key={'toggle'}
                                    isOn={selectedDrawnShape.data.extendRight}
                                    disabled={false}
                                    handleToggle={() => {
                                        handleEditLines(
                                            !selectedDrawnShape.data
                                                .extendRight,
                                            'extendRight',
                                        );
                                    }}
                                    id='is_extendRight_visible'
                                    aria-label={'aria-label'}
                                />
                                <StyledLabel>Extend Right</StyledLabel>
                            </ExtendSettings>
                        </FibLineSettings>
                    )}

                {selectedDrawnShape &&
                    selectedDrawnShape.data.type === 'FibRetracement' && (
                        <FibLineSettings style={{ paddingBottom: '10px' }}>
                            <ExtendSettings>
                                <Toggle
                                    key={'toggle'}
                                    isOn={selectedDrawnShape.data.reverse}
                                    disabled={false}
                                    handleToggle={() => {
                                        handleEditLines(
                                            !selectedDrawnShape.data.reverse,
                                            'reverse',
                                        );
                                    }}
                                    id='is_reverse_visible'
                                    aria-label={'aria-label'}
                                />
                                <StyledLabel>Reverse</StyledLabel>
                            </ExtendSettings>
                        </FibLineSettings>
                    )}

                {selectedDrawnShape &&
                    selectedDrawnShape.data.type === 'FibRetracement' && (
                        <FibLineSettings style={{ paddingBottom: '5px' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <StyledLabel>Labels</StyledLabel>
                            </div>

                            <LineSettingsLeft>
                                <DropDownContainer>
                                    <DropDownHeader
                                        onClick={() =>
                                            setisLabelPlacementOptionTabActive(
                                                (prev) => !prev,
                                            )
                                        }
                                    >
                                        {selectedDrawnShape.data.labelPlacement}
                                    </DropDownHeader>
                                    {isLabelPlacementOptionTabActive && (
                                        <DropDownListContainer>
                                            <DropDownList>
                                                {placementOptions.map(
                                                    (item, index) => (
                                                        <ListItem
                                                            key={index}
                                                            onClick={() =>
                                                                handleEditLabel(
                                                                    item.value,
                                                                    isLabelPlacementOptionTabActive,
                                                                    isLabelAlignmentOptionTabActive,
                                                                )
                                                            }
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
                                        onClick={() =>
                                            setisLabelAlignmentOptionTabActive(
                                                (prev) => !prev,
                                            )
                                        }
                                    >
                                        {selectedDrawnShape.data.labelAlignment}
                                    </DropDownHeader>
                                    {isLabelAlignmentOptionTabActive && (
                                        <DropDownListContainer>
                                            <DropDownList>
                                                {alignmentOptions.map(
                                                    (item, index) => (
                                                        <ListItem
                                                            key={index}
                                                            onClick={() =>
                                                                handleEditLabel(
                                                                    item.value,
                                                                    isLabelPlacementOptionTabActive,
                                                                    isLabelAlignmentOptionTabActive,
                                                                )
                                                            }
                                                        >
                                                            {item.name}
                                                        </ListItem>
                                                    ),
                                                )}
                                            </DropDownList>
                                        </DropDownListContainer>
                                    )}
                                </DropDownContainer>
                            </LineSettingsLeft>
                        </FibLineSettings>
                    )}
            </FloatingToolbarSettingsContainer>

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

            {(isLineSizeOptionTabActive || isBorderSizeOptionTabActive) && (
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

            {(isLineStyleOptionTabActive || isBorderStyleOptionTabActive) && (
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
                                    isLineStyleOptionTabActive,
                                    isBorderStyleOptionTabActive,
                                )
                            }
                        >
                            {item.icon} {item.name}
                        </OptionsTabStyle>
                    ))}
                </OptionsTab>
            )}
        </>
    );
}
export default FloatingToolbarSettings;
