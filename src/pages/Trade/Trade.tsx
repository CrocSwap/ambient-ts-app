/* eslint-disable @typescript-eslint/no-explicit-any */
// START: Import React and Dongles
import { Outlet } from 'react-router-dom';
import { NumberSize } from 're-resizable';
import {
    useEffect,
    useState,
    useContext,
    useCallback,
    memo,
    useRef,
} from 'react';
import { BsCaretDownFill } from 'react-icons/bs';

// START: Import JSX Components
import TradeCharts from './TradeCharts/TradeCharts';
import TradeTabs2 from '../../components/Trade/TradeTabs/TradeTabs2';
// START: Import Local Files
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import { CandleContext } from '../../contexts/CandleContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { ChartContext } from '../../contexts/ChartContext';
import { TradeTableContext } from '../../contexts/TradeTableContext';
import { useUrlParams } from '../../utils/hooks/useUrlParams';
import { TokenContext } from '../../contexts/TokenContext';
import { CandleDataIF } from '../../ambient-utils/types';
import { getFormattedNumber } from '../../ambient-utils/dataLayer';
import { NoChartData } from '../../components/NoChartData/NoChartData';
import { TradeChartsHeader } from './TradeCharts/TradeChartsHeader/TradeChartsHeader';
import { useSimulatedIsPoolInitialized } from '../../App/hooks/useSimulatedIsPoolInitialized';
import { FlexContainer, Text } from '../../styled/Common';
import {
    ChartContainer,
    MainSection,
    ResizableContainer,
    TradeDropdown,
    TradeDropdownButton,
} from '../../styled/Components/Trade';
import { Direction } from 're-resizable/lib/resizer';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import { PoolContext } from '../../contexts/PoolContext';
import { MdAutoGraph } from 'react-icons/md';
import ChartToolbar from '../Chart/Draw/Toolbar/Toolbar';
import PointsBanner from './PointsBanner';

import { AppStateContext } from '../../contexts/AppStateContext';

const TRADE_CHART_MIN_HEIGHT = 175;

// React functional component
function Trade() {
    const {
        chainData: { chainId },
        provider,
    } = useContext(CrocEnvContext);
    const { setIsCandleSelected } = useContext(CandleContext);

    const {
        isFullScreen: isChartFullScreen,
        chartSettings,
        chartHeights,
        setChartHeight,
        canvasRef,
        tradeTableState,
        isChartHeightMinimum,
        isCandleDataNull,
        setIsChartHeightMinimum,
    } = useContext(ChartContext);

    const isPoolInitialized = useSimulatedIsPoolInitialized();

    const { tokens } = useContext(TokenContext);

    const { showTopPtsBanner, dismissTopBannerPopup } =
        useContext(AppStateContext);
    const {
        setOutsideControl,
        setSelectedOutsideTab,
        activeMobileComponent,
        setActiveMobileComponent,
    } = useContext(TradeTableContext);

    const { baseToken, quoteToken, isDenomBase, limitTick } =
        useContext(TradeDataContext);

    const { urlParamMap, updateURL } = useUrlParams(tokens, chainId, provider);

    const [transactionFilter, setTransactionFilter] = useState<CandleDataIF>();
    const [selectedDate, setSelectedDate] = useState<number | undefined>();

    const tradeTableRef = useRef<HTMLDivElement>(null);

    const [hasInitialized, setHasInitialized] = useState(false);

    const changeState = useCallback(
        (isOpen: boolean | undefined, candleData: CandleDataIF | undefined) => {
            setIsCandleSelected(isOpen);
            setHasInitialized(false);
            setTransactionFilter(candleData);
            if (isOpen) {
                setOutsideControl(true);
                setSelectedOutsideTab(0);
            }
        },
        [],
    );

    const [showMobileDropdown, setMobileDropdown] = useState(false);

    const handleMobileDropdownClick = (component: string) => {
        setActiveMobileComponent(component);
        setMobileDropdown(false);
    };

    const mobileTradeDropdown = (
        <TradeDropdown>
            <TradeDropdownButton
                onClick={() => setMobileDropdown(!showMobileDropdown)}
                activeText
            >
                {activeMobileComponent}

                <BsCaretDownFill />
            </TradeDropdownButton>

            {showMobileDropdown && (
                <div
                    style={{
                        position: 'absolute',
                        marginTop: '8px',
                        width: '100%',
                        background: 'var(--dark2)',
                    }}
                >
                    {activeMobileComponent !== 'trade' && (
                        <TradeDropdownButton
                            onClick={() => handleMobileDropdownClick('trade')}
                        >
                            Trade
                        </TradeDropdownButton>
                    )}

                    {!isCandleDataNull &&
                        isPoolInitialized &&
                        activeMobileComponent !== 'chart' && (
                            <TradeDropdownButton
                                onClick={() =>
                                    handleMobileDropdownClick('chart')
                                }
                            >
                                Chart
                            </TradeDropdownButton>
                        )}
                    {activeMobileComponent !== 'transactions' && (
                        <TradeDropdownButton
                            onClick={() =>
                                handleMobileDropdownClick('transactions')
                            }
                        >
                            Transactions
                        </TradeDropdownButton>
                    )}
                </div>
            )}
        </TradeDropdown>
    );

    const unselectCandle = useCallback(() => {
        setSelectedDate(undefined);
        changeState(false, undefined);
        setIsCandleSelected(false);
    }, []);

    useEffect(() => {
        unselectCandle();
    }, [chartSettings.candleTime.global.time, baseToken.name, quoteToken.name]);

    const showActiveMobileComponent = useMediaQuery('(max-width: 1200px)');
    const smallScreen = useMediaQuery('(max-width: 500px)');

    const tradeChartsProps = {
        changeState: changeState,
        selectedDate: selectedDate,
        setSelectedDate: setSelectedDate,
        updateURL,
    };

    const tradeTabsProps = {
        filter: transactionFilter,
        setTransactionFilter: setTransactionFilter,
        changeState: changeState,
        selectedDate: selectedDate,
        setSelectedDate: setSelectedDate,
        hasInitialized: hasInitialized,
        setHasInitialized: setHasInitialized,
        unselectCandle: unselectCandle,
        candleTime: chartSettings.candleTime.global,
        tokens,
    };
    const { poolPriceDisplay } = useContext(PoolContext);
    const baseTokenSymbol = baseToken.symbol;
    const quoteTokenSymbol = quoteToken.symbol;
    const displayPriceWithDenom =
        isDenomBase && poolPriceDisplay
            ? 1 / poolPriceDisplay
            : poolPriceDisplay ?? 0;

    const displayPriceString = getFormattedNumber({
        value: displayPriceWithDenom,
    });
    const conversionRate = isDenomBase
        ? `1 ${baseTokenSymbol} ≈ ${displayPriceString} ${quoteTokenSymbol}`
        : `1 ${quoteTokenSymbol} ≈ ${displayPriceString} ${baseTokenSymbol}`;

    const mobileTrade = (
        <MainSection isDropdown isSmallScreen={smallScreen}>
            {mobileTradeDropdown}

            <Text
                fontWeight='500'
                fontSize='body'
                color='accent5'
                style={{
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}
            >
                <MdAutoGraph size={22} color='var(--accent5)' />
                {conversionRate}
            </Text>
            {activeMobileComponent === 'chart' && isPoolInitialized && (
                <div style={{ marginLeft: smallScreen ? '' : '2rem', flex: 1 }}>
                    <TradeChartsHeader />
                    {!isCandleDataNull && <TradeCharts {...tradeChartsProps} />}
                </div>
            )}

            {activeMobileComponent === 'transactions' && (
                <div style={{ marginLeft: smallScreen ? '' : '2rem', flex: 1 }}>
                    <TradeChartsHeader />
                    <TradeTabs2 {...tradeTabsProps} />
                </div>
            )}

            {activeMobileComponent === 'trade' && (
                <ContentContainer noPadding noStyle={smallScreen}>
                    <Outlet
                        context={{
                            urlParamMap: urlParamMap,
                            limitTick: limitTick,
                            updateURL: updateURL,
                        }}
                    />
                </ContentContainer>
            )}

            {!isChartHeightMinimum && activeMobileComponent === 'chart' && (
                <ChartToolbar />
            )}
        </MainSection>
    );

    if (showActiveMobileComponent) return mobileTrade;

    return (
        <>
            <MainSection>
                <FlexContainer
                    flexDirection='column'
                    fullWidth
                    background='dark2'
                    gap={8}
                    style={{ height: 'calc(100vh - 56px)' }}
                    ref={canvasRef}
                >
                    {showTopPtsBanner && (
                        <div style={{ padding: '0 8px' }}>
                            <PointsBanner dismissElem={dismissTopBannerPopup} />
                        </div>
                    )}

                    <TradeChartsHeader tradePage />
                    {/* This div acts as a parent to maintain a min/max for the resizable element below */}
                    <FlexContainer
                        flexDirection='column'
                        fullHeight
                        overflow='hidden'
                    >
                        <ResizableContainer
                            showResizeable={
                                !isCandleDataNull && !isChartFullScreen
                            }
                            enable={{
                                bottom: !isChartFullScreen,
                                top: false,
                                left: false,
                                topLeft: false,
                                bottomLeft: false,
                                right: false,
                                topRight: false,
                                bottomRight: false,
                            }}
                            size={{
                                width: '100%',
                                height: chartHeights.current,
                            }}
                            minHeight={4}
                            onResize={(
                                evt: MouseEvent | TouchEvent,
                                dir: Direction,
                                ref: HTMLElement,
                                d: NumberSize,
                            ) => {
                                if (
                                    chartHeights.current + d.height <
                                    TRADE_CHART_MIN_HEIGHT
                                ) {
                                    setIsChartHeightMinimum(true);
                                } else {
                                    setIsChartHeightMinimum(false);
                                }
                            }}
                            onResizeStart={() => {
                                // may be useful later
                            }}
                            onResizeStop={(
                                evt: MouseEvent | TouchEvent,
                                dir: Direction,
                                ref: HTMLElement,
                                d: NumberSize,
                            ) => {
                                if (
                                    chartHeights.current + d.height <
                                    TRADE_CHART_MIN_HEIGHT
                                ) {
                                    if (tradeTableState == 'Expanded') {
                                        setChartHeight(chartHeights.default);
                                    } else {
                                        setChartHeight(chartHeights.min);
                                    }
                                } else {
                                    setChartHeight(
                                        chartHeights.current + d.height,
                                    );
                                }
                            }}
                            bounds={'parent'}
                        >
                            {(isCandleDataNull || !isPoolInitialized) && (
                                <NoChartData
                                    chainId={chainId}
                                    tokenA={
                                        isDenomBase ? baseToken : quoteToken
                                    }
                                    tokenB={
                                        isDenomBase ? quoteToken : baseToken
                                    }
                                    isCandleDataNull
                                    isTableExpanded={
                                        tradeTableState == 'Expanded'
                                    }
                                    isPoolInitialized={isPoolInitialized}
                                />
                            )}
                            {!isCandleDataNull && isPoolInitialized && (
                                <ChartContainer fullScreen={isChartFullScreen}>
                                    {!isCandleDataNull && (
                                        <TradeCharts {...tradeChartsProps} />
                                    )}
                                </ChartContainer>
                            )}
                        </ResizableContainer>
                        {!isChartFullScreen && (
                            <FlexContainer
                                ref={tradeTableRef}
                                style={{ flex: 1 }}
                                overflow='hidden'
                            >
                                <TradeTabs2 {...tradeTabsProps} />
                            </FlexContainer>
                        )}
                    </FlexContainer>
                </FlexContainer>
                <FlexContainer
                    flexDirection='column'
                    fullHeight
                    fullWidth
                    background='dark1'
                    overflow='auto'
                >
                    <Outlet
                        context={{
                            urlParamMap: urlParamMap,
                            limitTick: limitTick,
                            updateURL: updateURL,
                        }}
                    />
                </FlexContainer>
                {!isChartHeightMinimum && <ChartToolbar />}
            </MainSection>
        </>
    );
}

export default memo(Trade);
