/* eslint-disable @typescript-eslint/no-explicit-any */
// START: Import React and Dongles
import { useEffect, useState, useContext, useCallback, memo } from 'react';
import {
    useParams,
    Outlet,
    Link,
    NavLink,
    useNavigate,
    useLocation,
} from 'react-router-dom';
import { VscClose } from 'react-icons/vsc';

// START: Import JSX Components
import TradeCharts from './TradeCharts/TradeCharts';
import TradeTabs2 from '../../components/Trade/TradeTabs/TradeTabs2';
// START: Import Local Files
import styles from './Trade.module.css';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { CandleData } from '../../utils/state/graphDataSlice';
import NoTokenIcon from '../../components/Global/NoTokenIcon/NoTokenIcon';
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import { IS_LOCAL_ENV } from '../../constants';
import { formSlugForPairParams } from '../../App/functions/urlSlugs';
import { CandleContext } from '../../contexts/CandleContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { PoolContext } from '../../contexts/PoolContext';
import { ChartContext } from '../../contexts/ChartContext';
import { TradeTableContext } from '../../contexts/TradeTableContext';
import { useUrlParams } from '../../utils/hooks/useUrlParams';
import { useProvider } from 'wagmi';
import { TokenContext } from '../../contexts/TokenContext';
import { TradeTokenContext } from '../../contexts/TradeTokenContext';
import { Drawer } from '@mui/material';
import { LayoutHandlerContext } from '../../contexts/LayoutContext';
import { AppStateContext } from '../../contexts/AppStateContext';

// React functional component
function Trade() {
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { candleData, setIsCandleSelected, isCandleDataNull } =
        useContext(CandleContext);
    const { isFullScreen: isChartFullScreen, chartSettings } =
        useContext(ChartContext);
    const { isPoolInitialized } = useContext(PoolContext);
    const { tokens } = useContext(TokenContext);
    const {
        expandTradeTable,
        setOutsideControl,
        setSelectedOutsideTab,
        setExpandTradeTable,
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
            path: '/range',
            name: 'Pool',
        },
    ];

    const navigate = useNavigate();
    const { pathname } = useLocation();

    const provider = useProvider();
    const { params } = useParams();
    useUrlParams(['chain', 'tokenA', 'tokenB'], tokens, chainId, provider);

    const isMarketOrLimitModule =
        pathname.includes('market') || pathname.includes('limit');

    const [transactionFilter, setTransactionFilter] = useState<CandleData>();
    const [isCandleArrived, setIsCandleDataArrived] = useState(false);
    const [selectedDate, setSelectedDate] = useState<number | undefined>();

    const { tradeData } = useAppSelector((state) => state);
    const { isDenomBase } = tradeData;
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

    const mainContent = (
        <div
            className={`${styles.right_col} 
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
    const expandGraphStyle = expandTradeTable ? styles.hide_graph : '';
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

    const unselectCandle = useCallback(() => {
        setSelectedDate(undefined);
        changeState(false, undefined);
        setIsCandleSelected(false);
    }, []);

    const activeCandleDuration = isMarketOrLimitModule
        ? chartSettings.candleTime.market.time
        : chartSettings.candleTime.range.time;

    useEffect(() => {
        unselectCandle();
    }, [
        activeCandleDuration,
        tradeData.baseToken.name,
        tradeData.quoteToken.name,
    ]);

    const initLinkPath =
        '/initpool/' +
        formSlugForPairParams(chainId, baseTokenAddress, quoteTokenAddress);

    const showPoolNotInitializedContent = isPoolInitialized === false;

    const poolNotInitializedContent = showPoolNotInitializedContent ? (
        <div className={styles.pool_not_initialialized_container}>
            <div className={styles.pool_not_initialialized_content}>
                <div className={styles.close_init} onClick={() => navigate(-1)}>
                    <VscClose size={25} />
                </div>
                <h2>This pool has not been initialized.</h2>
                <h3>Do you want to initialize it?</h3>
                <Link to={initLinkPath} className={styles.initialize_link}>
                    Initialize Pool
                    {baseTokenLogo ? (
                        <img src={baseTokenLogo} alt={baseTokenSymbol} />
                    ) : (
                        <NoTokenIcon
                            tokenInitial={baseTokenSymbol?.charAt(0)}
                            width='20px'
                        />
                    )}
                    {quoteTokenLogo ? (
                        <img src={quoteTokenLogo} alt={quoteTokenSymbol} />
                    ) : (
                        <NoTokenIcon
                            tokenInitial={quoteTokenSymbol?.charAt(0)}
                            width='20px'
                        />
                    )}
                </Link>
                <button
                    className={styles.no_thanks}
                    onClick={() => navigate(-1)}
                >
                    No, take me back.
                </button>
            </div>
        </div>
    ) : null;

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
        candleTime: isMarketOrLimitModule
            ? chartSettings.candleTime.market
            : chartSettings.candleTime.range,
        tokens,
        // showActiveMobileComponent: showActiveMobileComponent,
    };

    const bottomTabs = useMediaQuery('(max-width: 1020px)');

    const { isTableDrawerOpen, setIsTableDrawerOpen } =
        useContext(LayoutHandlerContext);

    const {
        tradeComponent: { showTradeComponent: showTradeComponent },
    } = useContext(AppStateContext);

    console.log({ showTradeComponent });

    const justTradeComponent = (
        <div
            style={{
                display: showTradeComponent ? 'inherit' : 'none',
                padding: '0 1rem',
            }}
        >
            {mainContent}
        </div>
    );

    return (
        <>
            {justTradeComponent}

            <section
                className={`${styles.main_layout}`}
                style={{ display: !showTradeComponent ? 'inherit' : 'none' }}
            >
                {poolNotInitializedContent}
                <div
                    className={`${styles.middle_col}
                ${expandTradeTable ? styles.flex_column : ''}`}
                >
                    <div
                        className={` ${expandGraphStyle} 
                    } ${fullScreenStyle}`}
                    >
                        <div className={styles.main__chart_container}>
                            {!isCandleDataNull && (
                                <TradeCharts {...tradeChartsProps} />
                            )}
                        </div>
                    </div>

                    <div
                        className={`${
                            expandTradeTable
                                ? styles.full_table_height
                                : styles.min_table_height
                        } ${styles.middle_col_table}`}
                    >
                        <div>
                            <TradeTabs2 {...tradeTabsProps} />
                        </div>
                    </div>
                </div>
                <Drawer
                    anchor='top'
                    open={isTableDrawerOpen}
                    onClose={() => {
                        setExpandTradeTable(false);
                        setIsTableDrawerOpen(false);
                    }}
                >
                    <div className={styles.full_table_height}>
                        <TradeTabs2 {...tradeTabsProps} />
                    </div>
                </Drawer>
                {!bottomTabs && mainContent}
            </section>
        </>
    );
}

export default memo(Trade);
