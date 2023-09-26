/* eslint-disable @typescript-eslint/no-explicit-any */
// START: Import React and Dongles
import { Outlet, NavLink } from 'react-router-dom';
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
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import { CandleContext } from '../../contexts/CandleContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { ChartContext } from '../../contexts/ChartContext';
import { TradeTableContext } from '../../contexts/TradeTableContext';
import { useUrlParams } from '../../utils/hooks/useUrlParams';
import { useProvider } from 'wagmi';
import { TokenContext } from '../../contexts/TokenContext';
import { CandleData } from '../../App/functions/fetchCandleSeries';
import { NoChartData } from '../../components/NoChartData/NoChartData';
import { TradeChartsHeader } from './TradeCharts/TradeChartsHeader/TradeChartsHeader';
import { useSimulatedIsPoolInitialized } from '../../App/hooks/useSimulatedIsPoolInitialized';
import {
    limitParamsIF,
    linkGenMethodsIF,
    marketParamsIF,
    poolParamsIF,
    useLinkGen,
} from '../../utils/hooks/useLinkGen';
import { FlexContainer } from '../../styled/Common';
import {
    ChartContainer,
    MainSection,
    ResizableContainer,
    TradeDropdown,
    TradeDropdownButton,
} from '../../styled/Components/Trade';
import { Direction } from 're-resizable/lib/resizer';
import {
    SelectorWrapper,
    SelectorContainer,
} from '../../styled/Components/TradeModules';

const TRADE_CHART_MIN_HEIGHT = 175;

// React functional component
function Trade() {
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { setIsCandleSelected, isCandleDataNull } = useContext(CandleContext);

    const {
        isFullScreen: isChartFullScreen,
        chartSettings,
        chartHeights,
        setChartHeight,
        canvasRef,
        tradeTableState,
    } = useContext(ChartContext);

    const isPoolInitialized = useSimulatedIsPoolInitialized();

    const { tokens } = useContext(TokenContext);
    const {
        setOutsideControl,
        setSelectedOutsideTab,
        activeMobileComponent,
        setActiveMobileComponent,
    } = useContext(TradeTableContext);

    const { tradeData } = useAppSelector((state) => state);
    const { tokenA, tokenB, isDenomBase, limitTick } = tradeData;
    const provider = useProvider();

    const { urlParamMap, updateURL } = useUrlParams(tokens, chainId, provider);

    // hooks to generate default URL paths
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    const marketParams: marketParamsIF = {
        chain: chainId,
        tokenA: tokenA.address,
        tokenB: tokenB.address,
    };

    const limitParams: limitParamsIF = {
        ...marketParams,
        limitTick: limitTick ?? 0,
    };

    const poolParams: poolParamsIF = {
        ...marketParams,
    };

    interface routeIF {
        path: string;
        name: string;
    }

    const routes: routeIF[] = [
        {
            path: linkGenMarket.getFullURL(marketParams),
            name: 'Swap',
        },
        {
            path: linkGenLimit.getFullURL(limitParams),
            name: 'Limit',
        },
        {
            path: linkGenPool.getFullURL(poolParams),
            name: 'Pool',
        },
    ];

    const [transactionFilter, setTransactionFilter] = useState<CandleData>();
    const [selectedDate, setSelectedDate] = useState<number | undefined>();

    const tradeTableRef = useRef<HTMLDivElement>(null);

    const navigationMenu = (
        <SelectorContainer justifyContent='center' alignItems='center' gap={8}>
            {routes.map((route, idx) => (
                <SelectorWrapper key={idx}>
                    <NavLink to={route.path}>{route.name}</NavLink>
                </SelectorWrapper>
            ))}
        </SelectorContainer>
    );

    const [hasInitialized, setHasInitialized] = useState(false);

    const changeState = useCallback(
        (isOpen: boolean | undefined, candleData: CandleData | undefined) => {
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
    }, [
        chartSettings.candleTime.global.time,
        tradeData.baseToken.name,
        tradeData.quoteToken.name,
    ]);

    const showActiveMobileComponent = useMediaQuery('(max-width: 1200px)');

    const [isChartLoading, setIsChartLoading] = useState<boolean>(true);

    const tradeChartsProps = {
        changeState: changeState,
        selectedDate: selectedDate,
        setSelectedDate: setSelectedDate,
        isChartLoading,
        setIsChartLoading,
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

    const mobileTrade = (
        <MainSection>
            {mobileTradeDropdown}
            {activeMobileComponent === 'chart' && isPoolInitialized && (
                <div style={{ marginLeft: '2rem', flex: 1 }}>
                    <TradeChartsHeader />
                    {!isCandleDataNull && <TradeCharts {...tradeChartsProps} />}
                </div>
            )}

            {activeMobileComponent === 'transactions' && (
                <div style={{ marginLeft: '2rem', flex: 1 }}>
                    <TradeChartsHeader />
                    <TradeTabs2 {...tradeTabsProps} />
                </div>
            )}

            {activeMobileComponent === 'trade' && (
                <Outlet
                    context={{
                        tradeData: tradeData,
                        navigationMenu: navigationMenu,
                        limitTick: limitTick,
                        updateURL: updateURL,
                    }}
                />
            )}
        </MainSection>
    );

    if (showActiveMobileComponent) return mobileTrade;

    const showNoChartData = !isPoolInitialized || isCandleDataNull;

    return (
        <MainSection>
            <FlexContainer
                flexDirection='column'
                fullWidth
                background='dark2'
                gap={8}
                style={{ height: 'calc(100vh - 56px)' }}
                ref={canvasRef}
            >
                <TradeChartsHeader tradePage />
                {/* This div acts as a parent to maintain a min/max for the resizable element below */}
                <FlexContainer
                    flexDirection='column'
                    fullHeight
                    overflow='hidden'
                >
                    <ResizableContainer
                        showResizeable={!isCandleDataNull && !isChartFullScreen}
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
                                setChartHeight(chartHeights.current + d.height);
                            }
                        }}
                        bounds={'parent'}
                    >
                        {showNoChartData && (
                            <NoChartData
                                chainId={chainId}
                                tokenA={
                                    isDenomBase
                                        ? tradeData.baseToken
                                        : tradeData.quoteToken
                                }
                                tokenB={
                                    isDenomBase
                                        ? tradeData.quoteToken
                                        : tradeData.baseToken
                                }
                                isCandleDataNull
                                isTableExpanded={tradeTableState == 'Expanded'}
                            />
                        )}
                        {!showNoChartData && isPoolInitialized && (
                            <ChartContainer fullScreen={isChartFullScreen}>
                                {!isCandleDataNull && (
                                    <TradeCharts {...tradeChartsProps} />
                                )}
                            </ChartContainer>
                        )}
                    </ResizableContainer>
                    <FlexContainer
                        ref={tradeTableRef}
                        style={{ flex: 1 }}
                        overflow='hidden'
                    >
                        <TradeTabs2 {...tradeTabsProps} />
                    </FlexContainer>
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
                        tradeData: tradeData,
                        urlParamMap: urlParamMap,
                        navigationMenu: navigationMenu,
                        limitTick: limitTick,
                        updateURL: updateURL,
                    }}
                />
            </FlexContainer>
        </MainSection>
    );
}

export default memo(Trade);
