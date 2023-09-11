/* eslint-disable @typescript-eslint/no-explicit-any */
// START: Import React and Dongles
import { Outlet, NavLink } from 'react-router-dom';
import { Resizable } from 're-resizable';
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
import styles from './Trade.module.css';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import { IS_LOCAL_ENV } from '../../constants';
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

const TRADE_CHART_MIN_HEIGHT = 175;

// React functional component
function Trade() {
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { candleData, setIsCandleSelected, isCandleDataNull } =
        useContext(CandleContext);

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
    const { setOutsideControl, setSelectedOutsideTab } =
        useContext(TradeTableContext);

    const { tradeData } = useAppSelector((state) => state);
    const {
        tokenA,
        tokenB,
        isDenomBase,
        limitTick,
        advancedLowTick,
        advancedHighTick,
    } = tradeData;
    const provider = useProvider();

    const { updateURL } = useUrlParams(tokens, chainId, provider);

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
        lowTick: advancedLowTick ?? 0,
        highTick: advancedHighTick ?? 0,
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
    const [isCandleArrived, setIsCandleDataArrived] = useState(false);
    const [selectedDate, setSelectedDate] = useState<number | undefined>();

    const tradeTableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (
            isCandleDataNull &&
            candleData !== undefined &&
            candleData.candles?.length > 0
        ) {
            IS_LOCAL_ENV && console.debug('Data arrived');
            setIsCandleDataArrived(false);
        }
    }, [candleData]);

    const navigationMenu = (
        <div className={styles.navigation_menu}>
            {routes.map((route, idx) => (
                <div
                    className={`${styles.nav_container} trade_route`}
                    key={idx}
                >
                    <NavLink to={route.path}>{route.name}</NavLink>
                </div>
            ))}
        </div>
    );

    const [activeMobileComponent, setActiveMobileComponent] = useState('trade');

    const mainContent = (
        <div
            className={`${styles.right_col} ${
                activeMobileComponent !== 'trade' ? styles.hide : ''
            }`}
        >
            <Outlet
                context={{
                    tradeData: tradeData,
                    navigationMenu: navigationMenu,
                    updateURL: updateURL,
                }}
            />
        </div>
    );
    const fullScreenStyle = isChartFullScreen
        ? styles.chart_full_screen
        : styles.main__chart;

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
        <section
            style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                padding: '0 2rem',
            }}
        >
            <div className={styles.mobile_trades_dropdown}>
                <button
                    className={styles.active_mobile_trade_dropdown}
                    style={{ textTransform: 'capitalize' }}
                    onClick={() => setMobileDropdown(!showMobileDropdown)}
                >
                    {activeMobileComponent}

                    <BsCaretDownFill />
                </button>
                {showMobileDropdown && (
                    <div
                        className={
                            showMobileDropdown
                                ? styles.active_mobile_trade_dropdown_items_containers
                                : styles.mobile_trade_dropdown_items_containers
                        }
                    >
                        {activeMobileComponent !== 'trade' && (
                            <button
                                onClick={() =>
                                    handleMobileDropdownClick('trade')
                                }
                            >
                                Trade
                            </button>
                        )}

                        {!isCandleDataNull &&
                            isPoolInitialized &&
                            activeMobileComponent !== 'chart' && (
                                <button
                                    onClick={() =>
                                        handleMobileDropdownClick('chart')
                                    }
                                >
                                    Chart
                                </button>
                            )}
                        {activeMobileComponent !== 'transactions' && (
                            <button
                                onClick={() =>
                                    handleMobileDropdownClick('transactions')
                                }
                            >
                                Transactions
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
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
        isCandleArrived: isCandleArrived,
        setIsCandleDataArrived: setIsCandleDataArrived,
        candleTime: chartSettings.candleTime.global,
        tokens,
    };

    const mobileTrade = (
        <section
            className={styles.main_layout_mobile}
            style={{
                height: 'calc(100vh - 56px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '0 8px',
            }}
        >
            {mobileTradeDropdown}
            {activeMobileComponent === 'chart' && isPoolInitialized && (
                <div
                    className={` ${fullScreenStyle}`}
                    style={{ marginLeft: '2rem' }}
                >
                    <TradeChartsHeader />
                    {!isCandleDataNull && <TradeCharts {...tradeChartsProps} />}
                </div>
            )}

            {activeMobileComponent === 'transactions' && (
                <div
                    className={styles.full_table_height}
                    style={{ marginLeft: '2rem', flex: 1 }}
                >
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
                    }}
                />
            )}
        </section>
    );

    if (showActiveMobileComponent) return mobileTrade;

    const poolNotInitContent = (
        <Resizable
            className={styles.chartBox}
            enable={{
                bottom: !isChartFullScreen,
            }}
            style={{ opacity: tradeTableState === 'Expanded' ? '0' : '1' }}
            size={{ width: '100%', height: chartHeights.current }}
            minHeight={4}
            onResizeStart={() => {
                // may be useful later
            }}
            onResizeStop={(e, direction, ref, d) => {
                // the resizable bar is 4px in height

                if (chartHeights.current + d.height < TRADE_CHART_MIN_HEIGHT) {
                    if (tradeTableState == 'Expanded') {
                        setChartHeight(chartHeights.default);
                    } else {
                        setChartHeight(chartHeights.min);
                    }
                } else {
                    setChartHeight(chartHeights.current + d.height);
                }
            }}
            handleClasses={
                isChartFullScreen ? undefined : { bottom: styles.resizableBox }
            }
            bounds={'parent'}
        >
            <NoChartData
                chainId={chainId}
                tokenA={
                    isDenomBase ? tradeData.baseToken : tradeData.quoteToken
                }
                tokenB={
                    isDenomBase ? tradeData.quoteToken : tradeData.baseToken
                }
                isCandleDataNull
            />
        </Resizable>
    );

    const showNoChartData = !isPoolInitialized || isCandleDataNull;

    return (
        <section className={`${styles.main_layout}`}>
            <div
                className={`${styles.middle_col}
                ${tradeTableState === 'Expanded' ? styles.flex_column : ''}`}
                ref={canvasRef}
            >
                <TradeChartsHeader tradePage />
                {/* This div acts as a parent to maintain a min/max for the resizable element below */}
                <div className={styles.resizableParent}>
                    {showNoChartData && poolNotInitContent}

                    {!showNoChartData && isPoolInitialized && (
                        <Resizable
                            className={styles.chartBox}
                            enable={{
                                bottom: !isChartFullScreen,
                            }}
                            size={{
                                width: '100%',
                                height: chartHeights.current,
                            }}
                            minHeight={4}
                            onResizeStart={() => {
                                // may be useful later
                            }}
                            onResizeStop={(e, direction, ref, d) => {
                                // the resizable bar is 4px in height

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
                            handleClasses={
                                isChartFullScreen || isCandleDataNull
                                    ? undefined
                                    : { bottom: styles.resizableBox }
                            }
                            bounds={'parent'}
                        >
                            <div
                                className={`${
                                    activeMobileComponent !== 'chart'
                                        ? styles.hide
                                        : ''
                                } ${fullScreenStyle}`}
                            >
                                <div className={styles.main__chart_container}>
                                    {!isCandleDataNull && (
                                        <TradeCharts {...tradeChartsProps} />
                                    )}
                                </div>
                            </div>
                        </Resizable>
                    )}
                    <div className={styles.tableBox} ref={tradeTableRef}>
                        <TradeTabs2 {...tradeTabsProps} />
                    </div>
                </div>
            </div>
            {mainContent}
        </section>
    );
}

export default memo(Trade);
