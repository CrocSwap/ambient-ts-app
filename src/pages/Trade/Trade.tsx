/* eslint-disable @typescript-eslint/no-explicit-any */
// START: Import React and Dongles
import { Resizable } from 're-resizable';
import {
    useEffect,
    useState,
    useContext,
    useCallback,
    memo,
    useRef,
} from 'react';
import {
    useParams,
    Outlet,
    Link,
    NavLink,
    useNavigate,
} from 'react-router-dom';
import { VscClose } from 'react-icons/vsc';
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
import { PoolContext } from '../../contexts/PoolContext';
import { ChartContext } from '../../contexts/ChartContext';
import {
    TRADE_TABLE_HEADER_HEIGHT,
    TradeTableContext,
} from '../../contexts/TradeTableContext';
import { useUrlParams } from '../../utils/hooks/useUrlParams';
import { useProvider } from 'wagmi';
import { TokenContext } from '../../contexts/TokenContext';
import { TradeTokenContext } from '../../contexts/TradeTokenContext';
import TokenIcon from '../../components/Global/TokenIcon/TokenIcon';
import { CandleData } from '../../App/functions/fetchCandleSeries';
import { linkGenMethodsIF, useLinkGen } from '../../utils/hooks/useLinkGen';
import uriToHttp from '../../utils/functions/uriToHttp';
import { TradeChartsHeader } from './TradeCharts/TradeChartsHeader/TradeChartsHeader';

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
    } = useContext(ChartContext);
    const { isPoolInitialized } = useContext(PoolContext);
    const { tokens } = useContext(TokenContext);
    const {
        tradeTableState,
        setTradeTableState,
        setOutsideControl,
        setSelectedOutsideTab,
    } = useContext(TradeTableContext);

    const {
        baseToken: { address: baseTokenAddress },
        quoteToken: { address: quoteTokenAddress },
    } = useContext(TradeTokenContext);

    const routes = [
        {
            path: '/market',
            name: 'Swap',
        },
        {
            path: '/limit',
            name: 'Limit',
        },
        {
            path: '/pool',
            name: 'Pool',
        },
    ];

    const navigate = useNavigate();
    const provider = useProvider();
    const { params } = useParams();
    useUrlParams(['chain', 'tokenA', 'tokenB'], tokens, chainId, provider);

    const [transactionFilter, setTransactionFilter] = useState<CandleData>();
    const [isCandleArrived, setIsCandleDataArrived] = useState(false);
    const [selectedDate, setSelectedDate] = useState<number | undefined>();

    const { tradeData } = useAppSelector((state) => state);
    const { isDenomBase, limitTick } = tradeData;
    const baseTokenLogo = isDenomBase
        ? tradeData.baseToken.logoURI
        : tradeData.quoteToken.logoURI;
    const quoteTokenLogo = isDenomBase
        ? tradeData.quoteToken.logoURI
        : tradeData.baseToken.logoURI;

    const baseTokenSymbol = isDenomBase
        ? tradeData.baseToken.symbol
        : tradeData.quoteToken.symbol;
    const quoteTokenSymbol = isDenomBase
        ? tradeData.quoteToken.symbol
        : tradeData.baseToken.symbol;

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
                    <NavLink to={`/trade${route.path}/${params}`}>
                        {route.name}
                    </NavLink>
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

    const linkGenInitPool: linkGenMethodsIF = useLinkGen('initpool');

    const showPoolNotInitializedContent = isPoolInitialized === false;

    const poolNotInitializedContent = showPoolNotInitializedContent ? (
        <div className={styles.pool_not_initialialized_container}>
            <div className={styles.pool_init_bg}>
                <div className={styles.pool_not_initialialized_content}>
                    <div
                        className={styles.close_init}
                        onClick={() => navigate(-1)}
                    >
                        <VscClose size={28} />
                    </div>
                    <div className={styles.pool_not_init_inner}>
                        <h2>This pool has not been initialized.</h2>
                        <h3>Do you want to initialize it?</h3>
                        <Link
                            to={linkGenInitPool.getFullURL({
                                chain: chainId,
                                tokenA: baseTokenAddress,
                                tokenB: quoteTokenAddress,
                            })}
                            className={styles.initialize_link}
                        >
                            Initialize Pool
                            <TokenIcon
                                src={uriToHttp(baseTokenLogo)}
                                alt={baseTokenSymbol}
                                size='m'
                            />
                            <TokenIcon
                                src={uriToHttp(quoteTokenLogo)}
                                alt={quoteTokenSymbol}
                                size='m'
                            />
                        </Link>
                        <button
                            className={styles.no_thanks}
                            onClick={() => navigate(-1)}
                        >
                            No, take me back.
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ) : null;

    const showActiveMobileComponent = useMediaQuery('(max-width: 1200px)');

    const tradeChartsProps = {
        changeState: changeState,
        selectedDate: selectedDate,
        setSelectedDate: setSelectedDate,
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
            {poolNotInitializedContent}
            {mobileTradeDropdown}
            {activeMobileComponent === 'chart' && (
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

    return (
        <section className={`${styles.main_layout}`}>
            {poolNotInitializedContent}
            <div
                className={`${styles.middle_col}
                ${tradeTableState === 'Expanded' ? styles.flex_column : ''}`}
            >
                <TradeChartsHeader tradePage />
                {/* This div acts as a parent to maintain a min/max for the resizable element below */}
                <div className={styles.resizableParent}>
                    <Resizable
                        className={styles.chartBox}
                        enable={{ bottom: true }}
                        size={{ width: '100%', height: chartHeights.current }}
                        minHeight={4}
                        onResizeStart={() => {
                            // may be useful later
                        }}
                        onResizeStop={(e, direction, ref, d) => {
                            // the resizable bar is 4px in height
                            if (chartHeights.current + d.height <= 4) {
                                setTradeTableState('Expanded');
                            }
                            if (
                                tradeTableRef?.current &&
                                tradeTableRef.current.offsetHeight ===
                                    TRADE_TABLE_HEADER_HEIGHT
                            ) {
                                setTradeTableState('Collapsed');
                            }
                            if (
                                chartHeights.current + d.height <
                                TRADE_CHART_MIN_HEIGHT
                            ) {
                                if (tradeTableState == 'Expanded') {
                                    setChartHeight(chartHeights.default);
                                    setTradeTableState(undefined);
                                } else {
                                    setChartHeight(4);
                                    setTradeTableState('Expanded');
                                }
                            } else {
                                setChartHeight(chartHeights.current + d.height);
                                setTradeTableState(undefined);
                            }
                        }}
                        handleClasses={
                            isChartFullScreen
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
