import * as d3 from 'd3';
import { SketchPicker } from 'react-color';
import { ColorPickerTab } from '../../platformAmbient/Chart/Draw/FloatingToolbar/FloatingToolbarCss';
import {
    LabelSettingsArrow,
    DropDownListContainer,
    DropDownList,
    ListItem,
} from '../../platformAmbient/Chart/Draw/FloatingToolbar/FloatingToolbarSettingsCss';
import {
    CheckList,
    CheckListContainer,
    ColorList,
    ColorOptions,
    ColorPickerContainer,
    ContextMenuContextText,
    Icon,
    OptionColor,
    SelectionContainer,
    StyledCheckbox,
    StyledSelectbox,
} from './ChartSettingsCss';
import { ChartThemeIF } from '../../../contexts/ChartContext';
import { chartItemStates } from '../../platformAmbient/Chart/ChartUtils/chartUtils';
import { MouseEvent, useContext, useState } from 'react';
import { PoolContext } from '../../../contexts/PoolContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { ColorObjIF } from './ChartSettings';
import { BrandContext } from '../../../contexts/BrandContext';

interface ContextMenuContentIF {
    chartThemeColors: ChartThemeIF;
    isCondensedModeEnabled: boolean;
    setIsCondensedModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    setShouldDisableChartSettings: React.Dispatch<
        React.SetStateAction<boolean>
    >;
    chartItemStates: chartItemStates;
    setColorChangeTrigger: React.Dispatch<React.SetStateAction<boolean>>;
    isSelecboxActive: boolean;
    setIsSelecboxActive: React.Dispatch<React.SetStateAction<boolean>>;
    selectedColorObj: ColorObjIF | undefined;
    setSelectedColorObj: React.Dispatch<
        React.SetStateAction<ColorObjIF | undefined>
    >;
    reverseColorObj: boolean;
    // render: () => void;
}

export default function ChartSettingsContent(props: ContextMenuContentIF) {
    const {
        chartThemeColors,
        isCondensedModeEnabled,
        setIsCondensedModeEnabled,
        setShouldDisableChartSettings,
        setColorChangeTrigger,
        isSelecboxActive,
        setIsSelecboxActive,
        selectedColorObj,
        setSelectedColorObj,
        reverseColorObj,
        // render,
    } = props;

    const {
        showFeeRate,
        setShowFeeRate,
        showTvl,
        setShowTvl,
        showVolume,
        setShowVolume,
    } = props.chartItemStates;

    const { isTradeDollarizationEnabled, setIsTradeDollarizationEnabled } =
        useContext(PoolContext);

    const { platformName } = useContext(BrandContext);

    const {
        baseToken: { symbol: baseTokenSymbol },
        quoteToken: { symbol: quoteTokenSymbol },
        isDenomBase,
    } = useContext(TradeDataContext);

    const [priceInOption, setPriceInOption] = useState<string>(
        !isTradeDollarizationEnabled
            ? isDenomBase
                ? quoteTokenSymbol
                : baseTokenSymbol
            : 'USD',
    );

    const handlePriceInChange = (option: string) => {
        setIsTradeDollarizationEnabled(
            option !== quoteTokenSymbol && option !== baseTokenSymbol,
        );
        setPriceInOption(option);
    };

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

            // render();
        }
    };

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
        <>
            <CheckListContainer>
                {checkListContent.map((item, index) => (
                    <CheckList key={index}>
                        <StyledCheckbox
                            checked={item.checked}
                            onClick={() => item.action(!item.checked)}
                        >
                            <Icon
                                viewBox='0 0 24 24'
                                style={{ width: '24px', height: '24px' }}
                            >
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
                            style={{ position: 'relative' }}
                            onClick={(event: MouseEvent<HTMLElement>) => {
                                event.stopPropagation();
                                setIsSelecboxActive(!isSelecboxActive);
                            }}
                        >
                            <ContextMenuContextText style={{ padding: '4px' }}>
                                {priceInOption}
                            </ContextMenuContextText>
                            <LabelSettingsArrow
                                style={{ margin: '4px' }}
                                isActive={isSelecboxActive}
                                width={8}
                                height={8}
                            ></LabelSettingsArrow>

                            {isSelecboxActive && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: '-1px',
                                        top: '80%',
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
                        </StyledSelectbox>
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
                                                    prev.placement !== 'left'
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
                                                setSelectedColorObj((prev) => {
                                                    const selectedObj = {
                                                        selectedColor:
                                                            chartThemeColors[
                                                                item.downColor
                                                            ]?.toString(),
                                                        replaceSelector:
                                                            item.downColor,
                                                        index: index,
                                                        placement: 'right',
                                                    };

                                                    const result =
                                                        prev === undefined ||
                                                        prev.index !== index ||
                                                        prev.placement !==
                                                            'right'
                                                            ? selectedObj
                                                            : undefined;

                                                    setShouldDisableChartSettings(
                                                        result === undefined,
                                                    );

                                                    return result;
                                                });
                                            }}
                                        ></OptionColor>
                                    )}

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
                                                        'px, ' +
                                                        (reverseColorObj
                                                            ? '-325px)'
                                                            : '10px)'),
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
        </>
    );
}
