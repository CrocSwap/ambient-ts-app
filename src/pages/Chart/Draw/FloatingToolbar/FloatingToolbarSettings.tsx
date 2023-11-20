import React, { useState } from 'react';
import {
    drawDataHistory,
    selectedDrawnData,
} from '../../ChartUtils/chartUtils';
import {
    ColorPickerTab,
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
    handleEditColor: (color: any, type: string) => void;
    handleEditSize: (value: number) => void;
    handleEditStyle: (array: number[]) => void;
    handleEditLines: (value: boolean, type: string) => void;
    borderColorPicker: string;
    backgroundColorPicker: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sizeOptions: Array<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    styleOptions: Array<any>;
    setIsShapeEdited: React.Dispatch<boolean>;
    setDrawnShapeHistory: React.Dispatch<
        React.SetStateAction<drawDataHistory[]>
    >;
    addDrawActionStack: (item: drawDataHistory, isNewShape: boolean) => void;
}

function FloatingToolbarSettings(props: FloatingToolbarSettingsProps) {
    const {
        selectedDrawnShape,
        handleEditColor,
        borderColorPicker,
        handleEditSize,
        sizeOptions,
        styleOptions,
        handleEditStyle,
        handleEditLines,
        backgroundColorPicker,
        setIsShapeEdited,
        setDrawnShapeHistory,
        addDrawActionStack,
    } = props;

    const lineOptions = ['Brush', 'Ray', 'FibRetracement'];
    const lineOptionDisabled = ['Brush'];
    const backgroundOptions = ['Rect', 'DPRange'];

    const [isStyleOptionTabActive, setIsStyleOptionTabActive] = useState(false);
    const [isSizeOptionTabActive, setIsSizeOptionTabActive] = useState(false);
    const [isColorPickerTabActive, setIsColorPickerTabActive] = useState(false);
    const [isBackgroundTabActive, setIsBackgroundTabActive] = useState(false);
    const [isFibBackgroundTabActive, setIsFibBackgroundTabActive] =
        useState(false);

    const [selectedFibLevel, setSelectedFibLevel] = useState(Number);

    const closeAllOptions = (
        exclude: string,
        value: number | undefined = undefined,
    ) => {
        setIsStyleOptionTabActive((prev) => !prev && exclude === 'style');
        setIsSizeOptionTabActive((prev) => !prev && exclude === 'size');
        setIsColorPickerTabActive((prev) => !prev && exclude === 'color');
        setIsBackgroundTabActive((prev) => !prev && exclude === 'background');
        setIsFibBackgroundTabActive((prev) => !prev && exclude === 'fib');

        if (value && exclude === 'fib') {
            setSelectedFibLevel(() => value);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEditFibColor = (color: any, type: string) => {
        console.log(color);
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

            setDrawnShapeHistory((item: drawDataHistory[]) => {
                const changedItemIndex = item.findIndex(
                    (i) => i.time === selectedDrawnShape?.data.time,
                );

                item[changedItemIndex].extraData[selectedFibLevel].color =
                    colorRgbaCode;

                addDrawActionStack(item[changedItemIndex], false);

                return item;
            });

            setIsShapeEdited(true);
        }
    };

    return (
        <>
            <FloatingToolbarSettingsContainer>
                {selectedDrawnShape && (
                    <LineContainer>
                        <LineSettings>
                            <LineSettingsLeft>
                                <Toggle
                                    key={'toggle'}
                                    isOn={
                                        lineOptions.includes(
                                            selectedDrawnShape?.data.type,
                                        )
                                            ? selectedDrawnShape.data
                                                  .showGuideLine
                                            : selectedDrawnShape.data.showBorder
                                    }
                                    disabled={lineOptionDisabled.includes(
                                        selectedDrawnShape?.data.type,
                                    )}
                                    handleToggle={() => {
                                        handleEditLines(
                                            lineOptions.includes(
                                                selectedDrawnShape?.data.type,
                                            )
                                                ? !selectedDrawnShape.data
                                                      .showGuideLine
                                                : !selectedDrawnShape.data
                                                      .showBorder,
                                            lineOptions.includes(
                                                selectedDrawnShape?.data.type,
                                            )
                                                ? 'guideLine'
                                                : 'border',
                                        );
                                    }}
                                    id='is_guide_line_visible'
                                    aria-label={'aria-label'}
                                />
                                <label>
                                    {lineOptions.includes(
                                        selectedDrawnShape?.data.type,
                                    )
                                        ? 'Line'
                                        : 'Border'}
                                </label>
                            </LineSettingsLeft>

                            <LineSettingsRight>
                                <OptionColorContainer>
                                    <OptionColor
                                        backgroundColor={selectedDrawnShape?.data.color.toString()}
                                        onClick={() => closeAllOptions('color')}
                                    ></OptionColor>
                                </OptionColorContainer>

                                <OptionStyleContainer
                                    onClick={() => closeAllOptions('size')}
                                >
                                    <AiOutlineMinus color='white' />
                                </OptionStyleContainer>

                                <OptionStyleContainer
                                    onClick={() => closeAllOptions('style')}
                                >
                                    <AiOutlineDash color='white' />
                                </OptionStyleContainer>
                            </LineSettingsRight>
                        </LineSettings>

                        {backgroundOptions.includes(
                            selectedDrawnShape.data.type,
                        ) && (
                            <LineSettings>
                                <LineSettingsLeft>
                                    <Toggle
                                        key={'toggle'}
                                        isOn={
                                            selectedDrawnShape.data
                                                .showBackground
                                        }
                                        disabled={false}
                                        handleToggle={() => {
                                            handleEditLines(
                                                !selectedDrawnShape.data
                                                    .showBackground,
                                                'background',
                                            );
                                        }}
                                        id='is_background_visible'
                                        aria-label={'aria-label'}
                                    />
                                    <label>Background</label>
                                </LineSettingsLeft>
                                <LineSettingsRight>
                                    <OptionColorContainer>
                                        <OptionColor
                                            backgroundColor={selectedDrawnShape?.data.background.toString()}
                                            onClick={() =>
                                                closeAllOptions('background')
                                            }
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
                                                onClick={() =>
                                                    closeAllOptions(
                                                        'fib',
                                                        index,
                                                    )
                                                }
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
                                                                    : backgroundColorPicker
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
            </FloatingToolbarSettingsContainer>

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
        </>
    );
}
export default FloatingToolbarSettings;
