import { MouseEvent, useContext, useRef, useState } from 'react';
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
import { chartItemStates } from '../ChartUtils/chartUtils';
import { ChartThemeIF } from '../../../contexts/ChartContext';
import {
    ColorPickerTab,
    DropDownList,
    DropDownListContainer,
    LabelSettingsArrow,
    ListItem,
} from '../Draw/FloatingToolbar/FloatingToolbarSettingsCss';
import { SketchPicker } from 'react-color';
import { PoolContext } from '../../../contexts/PoolContext';

interface ContextMenuIF {
    contextMenuPlacement: { top: number; left: number };
    setContextmenu: React.Dispatch<React.SetStateAction<boolean>>;
    chartItemStates: chartItemStates;
    chartThemeColors: ChartThemeIF;
}

export default function ChartSettings(props: ContextMenuIF) {
    const { contextMenuPlacement, setContextmenu, chartThemeColors } = props;

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

    const handleCandleColorPicker = (
        type: string,
        direction: string,
        index: number,
    ) => {
        console.log(type, direction);
        setSelectedColor('red');
        setSelectedColorIndex(index);
    };

    const handleApplyDefaults = () => {
        console.log('handleApplyDefaults');
    };

    const handleCancelChanges = () => {
        console.log('handleCancelChanges');
    };

    const handleSaveChanges = () => {
        console.log('handleSaveChanges');
    };

    const handlePriceInChange = (option: string) => {
        setIsTradeDollarizationEnabled(option !== 'Token');
        setPriceInOption(option);
    };

    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedColorIndex, setSelectedColorIndex] = useState<
        number | undefined
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
        // {
        //     checked: showFeeRate,
        //     action: setShowFeeRate,
        //     selection: 'Show empty candles',
        // },
    ];

    const selectionContent = [
        {
            selection: 'Show prices in',
            action: setShowVolume,
            options: ['Token', 'Dolar'],
        },
    ];

    const colorPickerContent = [
        {
            selection: 'Candle Body',
            actionHandler: 'body',
            action: handleCandleColorPicker,
            upColor: chartThemeColors.lightFillColor?.toString(),
            downColor: chartThemeColors.darkFillColor?.toString(),
        },
        {
            selection: 'Candle Borders',
            actionHandler: 'border',
            action: handleCandleColorPicker,
            upColor: chartThemeColors.lightStrokeColor?.toString(),
            downColor: chartThemeColors.darkStrokeColor?.toString(),
        },
        {
            selection: 'Candle Wicks',
            actionHandler: 'wick',
            action: handleCandleColorPicker,
            upColor: chartThemeColors.lightStrokeColor?.toString(),
            downColor: chartThemeColors.darkStrokeColor?.toString(),
        },
    ];

    return (
        <ChartSettingsContainer
            ref={contextMenuRef}
            top={contextMenuPlacement.top}
            left={contextMenuPlacement.left}
            onClick={() => {
                setSelectedColorIndex(undefined);
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
                                                            handlePriceInChange(
                                                                option,
                                                            );
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
                                    backgroundColor={
                                        item.upColor
                                            ? item.upColor
                                            : 'transparent'
                                    }
                                    onClick={(
                                        event: MouseEvent<HTMLElement>,
                                    ) => {
                                        event.stopPropagation();
                                        item.action(
                                            item.actionHandler,
                                            'up',
                                            index,
                                        );
                                    }}
                                ></OptionColor>

                                <OptionColor
                                    backgroundColor={
                                        item.downColor
                                            ? item.downColor
                                            : 'transparent'
                                    }
                                    onClick={(
                                        event: MouseEvent<HTMLElement>,
                                    ) => {
                                        event.stopPropagation();
                                        item.action(
                                            item.actionHandler,
                                            'down',
                                            index,
                                        );
                                    }}
                                ></OptionColor>

                                {selectedColorIndex === index && (
                                    <ColorPickerTab
                                        style={{
                                            position: 'fixed',
                                            zIndex: 199,
                                            paddingTop: '15px',
                                            left:
                                                28 -
                                                (selectedColorIndex % 2) * 10 +
                                                '%',
                                        }}
                                    >
                                        <SketchPicker
                                            color={selectedColor}
                                            width={'170px'}
                                            onChange={(color, event) => {
                                                event.stopPropagation();
                                                console.log(color, event);
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
                        onClick={() => handleApplyDefaults()}
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
