import { MouseEvent, useContext, useEffect, useRef, useState } from 'react';
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
import {
    ChartThemeIF,
    LocalChartSettingsIF,
} from '../../../contexts/ChartContext';

import { SketchPicker } from 'react-color';
import { PoolContext } from '../../../contexts/PoolContext';
import { BrandContext } from '../../../contexts/BrandContext';
import Spinner from '../../../components/Global/Spinner/Spinner';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { LS_KEY_CHART_CONTEXT_SETTINGS } from '../../platformAmbient/Chart/ChartUtils/chartConstants';
import {
    chartItemStates,
    getCssVariable,
} from '../../platformAmbient/Chart/ChartUtils/chartUtils';
import {
    ColorPickerTab,
    DropDownList,
    DropDownListContainer,
    LabelSettingsArrow,
    ListItem,
} from '../../platformAmbient/Chart/Draw/FloatingToolbar/FloatingToolbarSettingsCss';

interface ContextMenuIF {
    contextMenuPlacement: { top: number; left: number; isReversed: boolean };
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
    isCondensedModeEnabled: boolean;
    closeOutherChartSetting: boolean;
    setIsCondensedModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    setCloseOutherChartSetting: React.Dispatch<React.SetStateAction<boolean>>;
    setShouldDisableChartSettings: React.Dispatch<
        React.SetStateAction<boolean>
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
        isCondensedModeEnabled,
        setIsCondensedModeEnabled,
        setShouldDisableChartSettings,
        closeOutherChartSetting,
        setCloseOutherChartSetting,
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

    const { skin, platformName } = useContext(BrandContext);

    const [isSaving, setIsSaving] = useState(false);
    const [applyDefault, setApplyDefault] = useState(false);
    const [reverseColorObj, setReverseColorObj] = useState(false);

    const {
        baseToken: { symbol: baseTokenSymbol },
        quoteToken: { symbol: quoteTokenSymbol },
        isDenomBase,
    } = useContext(TradeDataContext);

    useEffect(() => {
        d3.select(contextMenuRef.current).on(
            'contextmenu',
            (event: PointerEvent) => {
                event.preventDefault();
            },
        );
    }, []);

    useEffect(() => {
        const screenHeight = window.innerHeight;

        const diff = screenHeight - contextMenuPlacement.top;

        setReverseColorObj(
            (contextMenuPlacement.isReversed && diff < 260) ||
                (!contextMenuPlacement.isReversed && diff < 700),
        );
    }, [contextMenuPlacement]);

    useEffect(() => {
        if (closeOutherChartSetting) {
            setSelectedColorObj(undefined);
            setShouldDisableChartSettings(true);
            setCloseOutherChartSetting(false);
        }
    }, [closeOutherChartSetting]);

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
        setApplyDefault(true);

        setShowVolume(chartSettings.showVolume);
        setShowTvl(chartSettings.showTvl);
        setShowFeeRate(chartSettings.showFeeRate);

        setColorChangeTrigger(true);

        setIsTradeDollarizationEnabled(
            chartSettings.isTradeDollarizationEnabled,
        );

        const upCandleBodyColor = isDefault
            ? getCssVariable(skin, chartSettings.chartColors.upCandleBodyColor)
            : d3.color(chartSettings.chartColors.upCandleBodyColor);

        const downCandleBodyColor = isDefault
            ? getCssVariable(
                  skin,
                  chartSettings.chartColors.downCandleBodyColor,
              )
            : d3.color(chartSettings.chartColors.downCandleBodyColor);

        const selectedDateFillColor = isDefault
            ? getCssVariable(
                  skin,
                  chartSettings.chartColors.selectedDateFillColor,
              )
            : d3.color(chartSettings.chartColors.selectedDateFillColor);

        const downCandleBorderColor = isDefault
            ? getCssVariable(
                  skin,
                  chartSettings.chartColors.downCandleBorderColor,
              )
            : d3.color(chartSettings.chartColors.downCandleBorderColor);

        const upCandleBorderColor = isDefault
            ? getCssVariable(
                  skin,
                  chartSettings.chartColors.upCandleBorderColor,
              )
            : d3.color(chartSettings.chartColors.upCandleBorderColor);

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

        chartThemeColors.upCandleBodyColor = upCandleBodyColor;
        chartThemeColors.downCandleBodyColor = downCandleBodyColor;
        chartThemeColors.selectedDateFillColor = selectedDateFillColor;
        chartThemeColors.upCandleBorderColor = upCandleBorderColor;
        chartThemeColors.downCandleBorderColor = downCandleBorderColor;
        chartThemeColors.liqAskColor = liqAskColor;
        chartThemeColors.liqBidColor = liqBidColor;
        chartThemeColors.selectedDateStrokeColor = selectedDateStrokeColor;

        const applyTimeOut = setTimeout(() => {
            setApplyDefault(false);
        }, 1000);
        return () => {
            clearTimeout(applyTimeOut);
        };
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
        setContextmenu(false);
    };

    const handleSaveChanges = () => {
        setIsSaving(true);
        const localSettings = {
            chartColors: {
                upCandleBodyColor: chartThemeColors.upCandleBodyColor
                    ? chartThemeColors.upCandleBodyColor.toString()
                    : '--accent5',
                downCandleBodyColor: chartThemeColors.downCandleBodyColor
                    ? chartThemeColors.downCandleBodyColor.toString()
                    : '--dark2',
                selectedDateFillColor: chartThemeColors.selectedDateFillColor
                    ? chartThemeColors.selectedDateFillColor.toString()
                    : '--accent2',
                upCandleBorderColor: chartThemeColors.upCandleBorderColor
                    ? chartThemeColors.upCandleBorderColor.toString()
                    : '--accent5',
                downCandleBorderColor: chartThemeColors.downCandleBorderColor
                    ? chartThemeColors.downCandleBorderColor.toString()
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

        const savedTimeOut = setTimeout(() => {
            setIsSaving(false);
            setContextmenu(false);
        }, 1000);
        return () => {
            clearTimeout(savedTimeOut);
        };
    };

    const handlePriceInChange = (option: string) => {
        setIsTradeDollarizationEnabled(
            option !== quoteTokenSymbol && option !== baseTokenSymbol,
        );
        setPriceInOption(option);
    };

    const [selectedColorObj, setSelectedColorObj] = useState<
        ColorObjIF | undefined
    >(undefined);

    const [isSelecboxActive, setIsSelecboxActive] = useState(false);

    const [priceInOption, setPriceInOption] = useState<string>(
        !isTradeDollarizationEnabled
            ? isDenomBase
                ? quoteTokenSymbol
                : baseTokenSymbol
            : 'USD',
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
            checked: isCondensedModeEnabled,
            action: setIsCondensedModeEnabled,
            selection: 'Hide empty candles',
        },
    ];

    const selectionContent = [
        {
            selection: 'Show prices in',
            action: handlePriceInChange,
            options: [isDenomBase ? quoteTokenSymbol : baseTokenSymbol, 'USD'],
        },
    ];

    const colorPickerContent = [
        {
            selection: 'Candle Body',
            actionHandler: 'body',
            action: handleCandleColorPicker,
            upColor: 'upCandleBodyColor',
            downColor: 'downCandleBodyColor',
            exclude: [''],
        },
        {
            selection: 'Candle Borders',
            actionHandler: 'border',
            action: handleCandleColorPicker,
            upColor: 'upCandleBorderColor',
            downColor: 'downCandleBorderColor',
            exclude: [''],
        },
        {
            selection: 'Liquidity Area',
            actionHandler: 'liq',
            action: handleCandleColorPicker,
            upColor: 'liqAskColor',
            downColor: 'liqBidColor',
            exclude: ['futa'],
        },
    ];

    return (
        <ChartSettingsContainer
            ref={contextMenuRef}
            top={contextMenuPlacement.top}
            left={contextMenuPlacement.left}
            isReversed={contextMenuPlacement.isReversed}
            onClick={() => {
                setShouldDisableChartSettings(true);
                setSelectedColorObj(undefined);
                setIsSelecboxActive(false);
            }}
        >
            <ContextMenu>
                <ContextMenuHeader>
                    <ContextMenuHeaderText>
                        {['futa'].includes(platformName)
                            ? 'CHART SETTINGS'
                            : 'Chart Settings'}
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
                                {['futa'].includes(platformName)
                                    ? item.selection.toUpperCase()
                                    : item.selection}
                            </ContextMenuContextText>
                        </CheckList>
                    ))}
                </CheckListContainer>

                <SelectionContainer>
                    {selectionContent.map((item, index) => (
                        <CheckList key={index}>
                            <ContextMenuContextText>
                                {['futa'].includes(platformName)
                                    ? item.selection.toUpperCase()
                                    : item.selection}
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
                    {colorPickerContent.map(
                        (item, index) =>
                            !item.exclude.includes(platformName) && (
                                <ColorList key={index}>
                                    <ContextMenuContextText>
                                        {['futa'].includes(platformName)
                                            ? item.selection.toUpperCase()
                                            : item.selection}
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
                                                        replaceSelector:
                                                            item.upColor,
                                                        index: index,
                                                        placement: 'left',
                                                    };

                                                    const result =
                                                        prev === undefined ||
                                                        prev.index !== index ||
                                                        prev.placement !==
                                                            'left'
                                                            ? selectedObj
                                                            : undefined;

                                                    setShouldDisableChartSettings(
                                                        result === undefined,
                                                    );

                                                    return result;
                                                });
                                            }}
                                        ></OptionColor>
                                        {item.downColor !== '' && (
                                            <OptionColor
                                                backgroundColor={chartThemeColors[
                                                    item.downColor
                                                ]?.toString()}
                                                onClick={(
                                                    event: MouseEvent<HTMLElement>,
                                                ) => {
                                                    event.stopPropagation();
                                                    setSelectedColorObj(
                                                        (prev) => {
                                                            const selectedObj =
                                                                {
                                                                    selectedColor:
                                                                        chartThemeColors[
                                                                            item
                                                                                .downColor
                                                                        ]?.toString(),
                                                                    replaceSelector:
                                                                        item.downColor,
                                                                    index: index,
                                                                    placement:
                                                                        'right',
                                                                };

                                                            const result =
                                                                prev ===
                                                                    undefined ||
                                                                prev.index !==
                                                                    index ||
                                                                prev.placement !==
                                                                    'right'
                                                                    ? selectedObj
                                                                    : undefined;

                                                            setShouldDisableChartSettings(
                                                                result ===
                                                                    undefined,
                                                            );

                                                            return result;
                                                        },
                                                    );
                                                }}
                                            ></OptionColor>
                                        )}

                                        {selectedColorObj &&
                                            selectedColorObj.index ===
                                                index && (
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
                                                            'px, ' +
                                                            (reverseColorObj
                                                                ? '-325px)'
                                                                : '10px)'),
                                                    }}
                                                    onClick={(
                                                        event: MouseEvent<HTMLElement>,
                                                    ) =>
                                                        event.stopPropagation()
                                                    }
                                                >
                                                    <SketchPicker
                                                        color={
                                                            selectedColorObj.selectedColor
                                                        }
                                                        width={'170px'}
                                                        onChange={(
                                                            color,
                                                            event,
                                                        ) => {
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
                            ),
                    )}
                </ColorPickerContainer>

                <ContextMenuFooter>
                    <FooterButtons
                        backgroundColor={
                            ['futa'].includes(platformName)
                                ? 'var(--dark3)'
                                : 'transparent'
                        }
                        hoverColor={
                            ['futa'].includes(platformName)
                                ? 'var(--dark3)'
                                : applyDefault
                                  ? 'transparent'
                                  : 'var(--accent1)'
                        }
                        textColor={
                            ['futa'].includes(platformName)
                                ? 'var(--text2)'
                                : 'var(--accent1)'
                        }
                        hoverTextColor={
                            ['futa'].includes(platformName)
                                ? 'var(--accent1)'
                                : 'var(--text1)'
                        }
                        width={'98px'}
                        onClick={() =>
                            handleApplyDefaults(defaultChartSettings)
                        }
                        isFuta={['futa'].includes(platformName)}
                    >
                        {applyDefault ? (
                            <Spinner size={14} bg='transparent' centered />
                        ) : (
                            <FooterContextText>
                                {['futa'].includes(platformName)
                                    ? 'DEFAULTS'
                                    : 'Apply defaults'}
                            </FooterContextText>
                        )}
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
                                backgroundColor={
                                    ['futa'].includes(platformName)
                                        ? 'var(--dark3)'
                                        : 'transparent'
                                }
                                hoverColor={
                                    ['futa'].includes(platformName)
                                        ? 'var(--dark3)'
                                        : 'var(--accent1)'
                                }
                                textColor={
                                    ['futa'].includes(platformName)
                                        ? 'var(--text2)'
                                        : 'var(--accent1)'
                                }
                                hoverTextColor={
                                    ['futa'].includes(platformName)
                                        ? 'var(--accent1)'
                                        : 'var(--text1)'
                                }
                                width={'55px'}
                                onClick={() => handleCancelChanges()}
                                isFuta={['futa'].includes(platformName)}
                            >
                                <FooterContextText>
                                    {['futa'].includes(platformName)
                                        ? 'APPLY'
                                        : 'Cancel'}
                                </FooterContextText>
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
                                backgroundColor={
                                    ['futa'].includes(platformName)
                                        ? 'var(--dark3)'
                                        : isSaving
                                          ? 'transparent'
                                          : 'var(--accent1)'
                                }
                                hoverColor={
                                    ['futa'].includes(platformName)
                                        ? 'var(--dark3)'
                                        : 'transparent'
                                }
                                textColor={
                                    ['futa'].includes(platformName)
                                        ? 'var(--text2)'
                                        : 'var(--text1)'
                                }
                                hoverTextColor={'var(--accent1)'}
                                width={'45px'}
                                onClick={() => handleSaveChanges()}
                                isFuta={['futa'].includes(platformName)}
                            >
                                {isSaving ? (
                                    <Spinner
                                        size={14}
                                        bg='transparent'
                                        centered
                                    />
                                ) : (
                                    <FooterContextText>
                                        {['futa'].includes(platformName)
                                            ? 'OK'
                                            : 'Save'}
                                    </FooterContextText>
                                )}
                            </FooterButtons>
                        </div>
                    </ActionButtonContainer>
                </ContextMenuFooter>
            </ContextMenu>
        </ChartSettingsContainer>
    );
}
