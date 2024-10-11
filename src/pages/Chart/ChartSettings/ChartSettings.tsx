import { useContext, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
    ActionButtonContainer,
    ChartSettingsContainer,
    CloseButton,
    ContextMenu,
    ContextMenuFooter,
    ContextMenuHeader,
    ContextMenuHeaderText,
    FooterButtons,
    FooterContextText,
} from './ChartSettingsCss';
import { VscClose } from 'react-icons/vsc';
import {
    ChartThemeIF,
    LocalChartSettingsIF,
} from '../../../contexts/ChartContext';

import { PoolContext } from '../../../contexts/PoolContext';
import { BrandContext } from '../../../contexts/BrandContext';
import Spinner from '../../../components/Global/Spinner/Spinner';
import { LS_KEY_CHART_CONTEXT_SETTINGS } from '../../platformAmbient/Chart/ChartUtils/chartConstants';
import {
    chartItemStates,
    getCssVariable,
} from '../../platformAmbient/Chart/ChartUtils/chartUtils';
import ChartSettingsContent from './ChartSettingsContent';

interface ContextMenuIF {
    contextMenuPlacement?: { top: number; left: number; isReversed: boolean };
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
    isMobile: boolean;
}

export interface ColorObjIF {
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
        // render,
        setColorChangeTrigger,
        isCondensedModeEnabled,
        setIsCondensedModeEnabled,
        setShouldDisableChartSettings,
        closeOutherChartSetting,
        setCloseOutherChartSetting,
        isMobile,
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

        if (!isMobile && contextMenuPlacement) {
            const diff = screenHeight - contextMenuPlacement.top;

            setReverseColorObj(
                (contextMenuPlacement.isReversed && diff < 260) ||
                    (!contextMenuPlacement.isReversed && diff < 700),
            );
        }
    }, [contextMenuPlacement, isMobile]);

    useEffect(() => {
        if (closeOutherChartSetting) {
            setSelectedColorObj(undefined);
            setShouldDisableChartSettings(true);
            setCloseOutherChartSetting(false);
        }
    }, [closeOutherChartSetting]);

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
            ? getCssVariable(
                  skin.active,
                  chartSettings.chartColors.upCandleBodyColor,
              )
            : d3.color(chartSettings.chartColors.upCandleBodyColor);

        const downCandleBodyColor = isDefault
            ? getCssVariable(
                  skin.active,
                  chartSettings.chartColors.downCandleBodyColor,
              )
            : d3.color(chartSettings.chartColors.downCandleBodyColor);

        const selectedDateFillColor = isDefault
            ? getCssVariable(
                  skin.active,
                  chartSettings.chartColors.selectedDateFillColor,
              )
            : d3.color(chartSettings.chartColors.selectedDateFillColor);

        const downCandleBorderColor = isDefault
            ? getCssVariable(
                  skin.active,
                  chartSettings.chartColors.downCandleBorderColor,
              )
            : d3.color(chartSettings.chartColors.downCandleBorderColor);

        const upCandleBorderColor = isDefault
            ? getCssVariable(
                  skin.active,
                  chartSettings.chartColors.upCandleBorderColor,
              )
            : d3.color(chartSettings.chartColors.upCandleBorderColor);

        const liqAskColor = isDefault
            ? getCssVariable(skin.active, chartSettings.chartColors.liqAskColor)
            : d3.color(chartSettings.chartColors.liqAskColor);

        const liqBidColor = isDefault
            ? getCssVariable(skin.active, chartSettings.chartColors.liqBidColor)
            : d3.color(chartSettings.chartColors.liqBidColor);

        const selectedDateStrokeColor = isDefault
            ? getCssVariable(
                  skin.active,
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

    const [selectedColorObj, setSelectedColorObj] = useState<
        ColorObjIF | undefined
    >(undefined);

    const [isSelecboxActive, setIsSelecboxActive] = useState(false);

    return (
        <ChartSettingsContainer
            ref={contextMenuRef}
            top={contextMenuPlacement ? contextMenuPlacement.top : 0}
            left={contextMenuPlacement ? contextMenuPlacement.left : 0}
            isReversed={
                contextMenuPlacement ? contextMenuPlacement.isReversed : false
            }
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

                <ChartSettingsContent
                    chartThemeColors={chartThemeColors}
                    isCondensedModeEnabled={isCondensedModeEnabled}
                    setIsCondensedModeEnabled={setIsCondensedModeEnabled}
                    setShouldDisableChartSettings={
                        setShouldDisableChartSettings
                    }
                    chartItemStates={props.chartItemStates}
                    setColorChangeTrigger={setColorChangeTrigger}
                    isSelecboxActive={isSelecboxActive}
                    setIsSelecboxActive={setIsSelecboxActive}
                    selectedColorObj={selectedColorObj}
                    setSelectedColorObj={setSelectedColorObj}
                    reverseColorObj={reverseColorObj}
                    // render={render}
                />

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
                        width={'auto'}
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
