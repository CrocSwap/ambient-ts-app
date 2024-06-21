import { MouseEvent, useContext, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
    ActionButtonContainer,
    ChartSettingsContainer,
    CheckList,
    CheckListContainer,
    CloseButton,
    ColorList,
    ColorOptions,
    ColorPickerContainer,
    ContextMenu,
    ContextMenuContextText,
    ContextMenuFooter,
    ContextMenuHeader,
    ContextMenuHeaderText,
    FooterButtons,
    FooterContextText,
    Icon,
    OptionColor,
    SelectionContainer,
    StyledCheckbox,
    StyledSelectbox,
} from './ChartSettingsCss';
import { VscClose } from 'react-icons/vsc';
import { chartItemStates, getCssVariable } from '../ChartUtils/chartUtils';
import {
    ChartThemeIF,
    LocalChartSettingsIF,
} from '../../../contexts/ChartContext';
import {
    ColorPickerTab,
    DropDownList,
    DropDownListContainer,
    LabelSettingsArrow,
    ListItem,
} from '../Draw/FloatingToolbar/FloatingToolbarSettingsCss';
import { SketchPicker } from 'react-color';
import { PoolContext } from '../../../contexts/PoolContext';
import { BrandContext } from '../../../contexts/BrandContext';
import { LS_KEY_CHART_CONTEXT_SETTINGS } from '../ChartUtils/chartConstants';

interface ContextMenuIF {
    contextMenuPlacement: { top: number; left: number };
    setContextmenu: React.Dispatch<React.SetStateAction<boolean>>;
    setColorChangeTrigger: React.Dispatch<React.SetStateAction<boolean>>;
    chartItemStates: chartItemStates;
    chartThemeColors: ChartThemeIF;
    setChartThemeColors: React.Dispatch<
        React.SetStateAction<ChartThemeIF | undefined>
    >;
    defaultChartSettings: LocalChartSettingsIF;
    localChartSettings: LocalChartSettingsIF | undefined;
    setLocalChartSettings: React.Dispatch<
        React.SetStateAction<LocalChartSettingsIF | undefined>
    >;
    render: () => void;
}

interface ColorObjIF {
    selectedColor: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    replaceSelector: string;
    index: number | undefined;
    placement: string;
}

export default function ChartSettings(props: ContextMenuIF) {
    const {
        contextMenuPlacement,
        setContextmenu,
        chartThemeColors,
        // setChartThemeColors,
        defaultChartSettings,
        setLocalChartSettings,
        render,
        setColorChangeTrigger,
    } = props;

    const {
        showFeeRate,
        setShowFeeRate,
        showTvl,
        setShowTvl,
        showVolume,
        setShowVolume,
    } = props.chartItemStates;

    const contextMenuRef = useRef<HTMLInputElement | null>(null);

    const { isTradeDollarizationEnabled, setIsTradeDollarizationEnabled } =
        useContext(PoolContext);

    const { skin } = useContext(BrandContext);

    const handleCandleColorPicker = (
        replaceSelector: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newColor: any,
    ) => {
        const colorRgbaCode =
            'rgba(' +
            newColor.rgb.r +
            ',' +
            newColor.rgb.g +
            ',' +
            newColor.rgb.b +
            ',' +
            newColor.rgb.a +
            ')';

        const replaceColor = d3.color(colorRgbaCode);

        if (replaceSelector && replaceColor) {
            chartThemeColors[replaceSelector] = replaceColor;

            setColorChangeTrigger(true);

            setSelectedColorObj((prev: ColorObjIF | undefined) => {
                if (prev) {
                    const colorRep = {
                        selectedColor: replaceColor.toString(),
                        replaceSelector: prev.replaceSelector,
                        index: prev.index,
                        placement: prev.placement,
                    } as ColorObjIF;

                    return colorRep;
                }
            });

            render();
        }
    };

    const handleApplyDefaults = (
        chartSettings: LocalChartSettingsIF,
        isDefault = true,
    ) => {
        setShowVolume(chartSettings.showVolume);
        setShowTvl(chartSettings.showTvl);
        setShowFeeRate(chartSettings.showFeeRate);

        setColorChangeTrigger(true);

        setIsTradeDollarizationEnabled(
            chartSettings.isTradeDollarizationEnabled,
        );

        const lightFillColor = isDefault
            ? getCssVariable(skin, chartSettings.chartColors.lightFillColor)
            : d3.color(chartSettings.chartColors.lightFillColor);

        const darkFillColor = isDefault
            ? getCssVariable(skin, chartSettings.chartColors.darkFillColor)
            : d3.color(chartSettings.chartColors.darkFillColor);

        const selectedDateFillColor = isDefault
            ? getCssVariable(
                  skin,
                  chartSettings.chartColors.selectedDateFillColor,
              )
            : d3.color(chartSettings.chartColors.selectedDateFillColor);

        const darkStrokeColor = isDefault
            ? getCssVariable(skin, chartSettings.chartColors.darkStrokeColor)
            : d3.color(chartSettings.chartColors.darkStrokeColor);

        const lightStrokeColor = isDefault
            ? getCssVariable(skin, chartSettings.chartColors.lightStrokeColor)
            : d3.color(chartSettings.chartColors.lightStrokeColor);

        const liqAskColor = isDefault
            ? getCssVariable(skin, chartSettings.chartColors.liqAskColor)
            : d3.color(chartSettings.chartColors.liqAskColor);

        const liqBidColor = isDefault
            ? getCssVariable(skin, chartSettings.chartColors.liqBidColor)
            : d3.color(chartSettings.chartColors.liqBidColor);

        const selectedDateStrokeColor = isDefault
            ? getCssVariable(
                  skin,
                  chartSettings.chartColors.selectedDateStrokeColor,
              )
            : d3.color(chartSettings.chartColors.selectedDateStrokeColor);

        chartThemeColors.lightFillColor = lightFillColor;
        chartThemeColors.darkFillColor = darkFillColor;
        chartThemeColors.selectedDateFillColor = selectedDateFillColor;
        chartThemeColors.lightStrokeColor = lightStrokeColor;
        chartThemeColors.darkStrokeColor = darkStrokeColor;
        chartThemeColors.liqAskColor = liqAskColor;
        chartThemeColors.liqBidColor = liqBidColor;
        chartThemeColors.selectedDateStrokeColor = selectedDateStrokeColor;
    };

    const handleCancelChanges = () => {
        const CHART_CONTEXT_SETTINGS_LOCAL_STORAGE = localStorage.getItem(
            LS_KEY_CHART_CONTEXT_SETTINGS,
        );

        if (CHART_CONTEXT_SETTINGS_LOCAL_STORAGE) {
            const parsedContextData = JSON.parse(
                CHART_CONTEXT_SETTINGS_LOCAL_STORAGE,
            ) as LocalChartSettingsIF;
            handleApplyDefaults(parsedContextData, false);
        } else {
            handleApplyDefaults(defaultChartSettings);
        }

        setColorChangeTrigger(true);
    };

    const handleSaveChanges = () => {
        const localSettings = {
            chartColors: {
                lightFillColor: chartThemeColors.lightFillColor
                    ? chartThemeColors.lightFillColor.toString()
                    : '--accent5',
                darkFillColor: chartThemeColors.darkFillColor
                    ? chartThemeColors.darkFillColor.toString()
                    : '--dark2',
                selectedDateFillColor: chartThemeColors.selectedDateFillColor
                    ? chartThemeColors.selectedDateFillColor.toString()
                    : '--accent2',
                lightStrokeColor: chartThemeColors.lightStrokeColor
                    ? chartThemeColors.lightStrokeColor.toString()
                    : '--accent5',
                darkStrokeColor: chartThemeColors.darkStrokeColor
                    ? chartThemeColors.darkStrokeColor.toString()
                    : '--accent1',
                liqAskColor: chartThemeColors.liqAskColor
                    ? chartThemeColors.liqAskColor.toString()
                    : '--accent5',
                liqBidColor: chartThemeColors.liqBidColor
                    ? chartThemeColors.liqBidColor.toString()
                    : '--accent1',
                selectedDateStrokeColor:
                    chartThemeColors.selectedDateStrokeColor
                        ? chartThemeColors.selectedDateStrokeColor.toString()
                        : '--accent2',
                textColor: chartThemeColors.textColor
                    ? chartThemeColors.textColor.toString()
                    : '',
            },
            isTradeDollarizationEnabled: isTradeDollarizationEnabled,
            showVolume: showVolume,
            showTvl: showTvl,
            showFeeRate: showFeeRate,
        };

        setLocalChartSettings(localSettings);

        localStorage.setItem(
            LS_KEY_CHART_CONTEXT_SETTINGS,
            JSON.stringify(localSettings),
        );
    };

    const handlePriceInChange = (option: string) => {
        setIsTradeDollarizationEnabled(option !== 'Token');
        setPriceInOption(option);
    };

    const [selectedColorObj, setSelectedColorObj] = useState<
        ColorObjIF | undefined
    >(undefined);

    const [isSelecboxActive, setIsSelecboxActive] = useState(false);

    const [priceInOption, setPriceInOption] = useState<string>(
        !isTradeDollarizationEnabled ? 'Token' : 'Dolar',
    );

    const checkListContent = [
        {
            checked: showVolume,
            action: setShowVolume,
            selection: 'Show Volume',
        },
        {
            checked: showTvl,
            action: setShowTvl,
            selection: 'Show TVL',
        },
        {
            checked: showFeeRate,
            action: setShowFeeRate,
            selection: 'Show Fee Rate',
        },
        {
            checked: false,
            action: setShowFeeRate,
            selection: 'Show empty candles',
        },
    ];

    const selectionContent = [
        {
            selection: 'Show prices in',
            action: handlePriceInChange,
            options: ['Token', 'Dolar'],
        },
    ];

    const colorPickerContent = [
        {
            selection: 'Candle Body',
            actionHandler: 'body',
            action: handleCandleColorPicker,
            upColor: 'lightFillColor',
            downColor: 'darkFillColor',
        },
        {
            selection: 'Candle Borders',
            actionHandler: 'border',
            action: handleCandleColorPicker,
            upColor: 'lightStrokeColor',
            downColor: 'darkStrokeColor',
        },
        {
            selection: 'Liquidity Area',
            actionHandler: 'liq',
            action: handleCandleColorPicker,
            upColor: 'liqAskColor',
            downColor: 'liqBidColor',
        },
    ];

    return (
        <ChartSettingsContainer
            ref={contextMenuRef}
            top={contextMenuPlacement.top}
            left={contextMenuPlacement.left}
            onClick={() => {
                setSelectedColorObj(undefined);
                setIsSelecboxActive(false);
            }}
        >
            <ContextMenu>
                <ContextMenuHeader>
                    <ContextMenuHeaderText>
                        Chart Settings
                    </ContextMenuHeaderText>
                    <CloseButton onClick={() => setContextmenu(false)}>
                        <VscClose size={24} />
                    </CloseButton>
                </ContextMenuHeader>

                <CheckListContainer>
                    {checkListContent.map((item, index) => (
                        <CheckList key={index}>
                            <StyledCheckbox
                                checked={item.checked}
                                onClick={() => item.action(!item.checked)}
                            >
                                <Icon viewBox='0 0 24 24'>
                                    <polyline points='20 6 9 17 4 12' />
                                </Icon>
                            </StyledCheckbox>
                            <ContextMenuContextText>
                                {item.selection}
                            </ContextMenuContextText>
                        </CheckList>
                    ))}
                </CheckListContainer>

                <SelectionContainer>
                    {selectionContent.map((item, index) => (
                        <CheckList key={index}>
                            <ContextMenuContextText>
                                {item.selection}
                            </ContextMenuContextText>
                            <StyledSelectbox
                                onClick={(event: MouseEvent<HTMLElement>) => {
                                    event.stopPropagation();
                                    setIsSelecboxActive(!isSelecboxActive);
                                }}
                            >
                                <ContextMenuContextText>
                                    {priceInOption}
                                </ContextMenuContextText>
                                <LabelSettingsArrow
                                    isActive={isSelecboxActive}
                                    width={8}
                                    height={8}
                                ></LabelSettingsArrow>
                            </StyledSelectbox>

                            {isSelecboxActive && (
                                <div
                                    style={{
                                        position: 'relative',
                                        left: '-42.5%',
                                        top: '38%',
                                    }}
                                >
                                    <DropDownListContainer>
                                        <DropDownList width={90}>
                                            {item.options.map(
                                                (option, index) => (
                                                    <ListItem
                                                        style={{
                                                            padding:
                                                                '1px 10px 1px 10px',
                                                        }}
                                                        backgroundColor={
                                                            priceInOption ===
                                                            option
                                                                ? 'var(--accent1)'
                                                                : 'var(--dark1)'
                                                        }
                                                        key={index}
                                                        onClick={(
                                                            event: MouseEvent<HTMLElement>,
                                                        ) => {
                                                            event.stopPropagation();
                                                            item.action(option);
                                                        }}
                                                    >
                                                        {option}
                                                    </ListItem>
                                                ),
                                            )}
                                        </DropDownList>
                                    </DropDownListContainer>
                                </div>
                            )}
                        </CheckList>
                    ))}
                </SelectionContainer>

                <ColorPickerContainer>
                    {colorPickerContent.map((item, index) => (
                        <ColorList key={index}>
                            <ContextMenuContextText>
                                {item.selection}
                            </ContextMenuContextText>

                            <ColorOptions>
                                <OptionColor
                                    backgroundColor={chartThemeColors[
                                        item.upColor
                                    ]?.toString()}
                                    onClick={(
                                        event: MouseEvent<HTMLElement>,
                                    ) => {
                                        event.stopPropagation();
                                        setSelectedColorObj((prev) => {
                                            const selectedObj = {
                                                selectedColor:
                                                    chartThemeColors[
                                                        item.upColor
                                                    ]?.toString(),
                                                replaceSelector: item.upColor,
                                                index: index,
                                                placement: 'left',
                                            };

                                            return prev === undefined ||
                                                prev.index !== index ||
                                                prev.placement !== 'left'
                                                ? selectedObj
                                                : undefined;
                                        });
                                    }}
                                ></OptionColor>

                                <OptionColor
                                    backgroundColor={chartThemeColors[
                                        item.downColor
                                    ]?.toString()}
                                    onClick={(
                                        event: MouseEvent<HTMLElement>,
                                    ) => {
                                        event.stopPropagation();
                                        setSelectedColorObj((prev) => {
                                            const selectedObj = {
                                                selectedColor:
                                                    chartThemeColors[
                                                        item.downColor
                                                    ]?.toString(),
                                                replaceSelector: item.downColor,
                                                index: index,
                                                placement: 'right',
                                            };

                                            return prev === undefined ||
                                                prev.index !== index ||
                                                prev.placement !== 'right'
                                                ? selectedObj
                                                : undefined;
                                        });
                                    }}
                                ></OptionColor>

                                {selectedColorObj &&
                                    selectedColorObj.index === index && (
                                        <ColorPickerTab
                                            style={{
                                                position: 'fixed',
                                                zIndex: 199,
                                                transform:
                                                    'translate(' +
                                                    (selectedColorObj.placement ===
                                                    'left'
                                                        ? -90
                                                        : -60) +
                                                    'px, 10px)',
                                            }}
                                            onClick={(
                                                event: MouseEvent<HTMLElement>,
                                            ) => event.stopPropagation()}
                                        >
                                            <SketchPicker
                                                color={
                                                    selectedColorObj.selectedColor
                                                }
                                                width={'170px'}
                                                onChange={(color, event) => {
                                                    event.stopPropagation();
                                                    item.action(
                                                        selectedColorObj.replaceSelector,
                                                        color,
                                                    );
                                                }}
                                            />
                                        </ColorPickerTab>
                                    )}
                            </ColorOptions>
                        </ColorList>
                    ))}
                </ColorPickerContainer>

                <ContextMenuFooter>
                    <FooterButtons
                        backgroundColor={'transparent'}
                        hoverColor={'var(--accent1)'}
                        textColor={'var(--accent1)'}
                        hoverTextColor={'var(--text1)'}
                        style={{ width: '80%' }}
                        onClick={() =>
                            handleApplyDefaults(defaultChartSettings)
                        }
                    >
                        <FooterContextText>Apply defauls</FooterContextText>
                    </FooterButtons>
                    <ActionButtonContainer>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <FooterButtons
                                backgroundColor={'transparent'}
                                hoverColor={'var(--accent1)'}
                                textColor={'var(--accent1)'}
                                hoverTextColor={'var(--text1)'}
                                onClick={() => handleCancelChanges()}
                            >
                                <FooterContextText>Cancel</FooterContextText>
                            </FooterButtons>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <FooterButtons
                                backgroundColor={'var(--accent1)'}
                                hoverColor={'transparent'}
                                textColor={'var(--text1)'}
                                hoverTextColor={'var(--accent1)'}
                                onClick={() => handleSaveChanges()}
                            >
                                <FooterContextText>Ok</FooterContextText>
                            </FooterButtons>
                        </div>
                    </ActionButtonContainer>
                </ContextMenuFooter>
            </ContextMenu>
        </ChartSettingsContainer>
    );
}
