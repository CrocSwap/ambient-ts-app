/* eslint-disable @typescript-eslint/no-explicit-any */
// START: Import React and Dongles
import {
    Dispatch,
    SetStateAction,
    ReactNode,
    useEffect,
    useState,
} from 'react';
import {
    useParams,
    Outlet,
    useOutletContext,
    Link,
    NavLink,
    useNavigate,
    useLocation,
} from 'react-router-dom';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { ChainSpec, CrocEnv, CrocPoolView } from '@crocswap-libs/sdk';
import { VscClose } from 'react-icons/vsc';
import { BsCaretDownFill } from 'react-icons/bs';

// START: Import JSX Components
import TradeCharts from './TradeCharts/TradeCharts';
import TradeTabs2 from '../../components/Trade/TradeTabs/TradeTabs2';
// START: Import Local Files
import styles from './Trade.module.css';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import {
    tradeData as TradeDataIF,
    candleDomain,
} from '../../utils/state/tradeDataSlice';
import {
    CandleData,
    CandlesByPoolAndDuration,
} from '../../utils/state/graphDataSlice';
import { TokenIF, TokenPairIF } from '../../utils/interfaces/exports';
import NoTokenIcon from '../../components/Global/NoTokenIcon/NoTokenIcon';
import TradeSettingsColor from './TradeCharts/TradeSettings/TradeSettingsColor/TradeSettingsColor';
import { SpotPriceFn } from '../../App/functions/querySpotPrice';
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import { favePoolsMethodsIF } from '../../App/hooks/useFavePools';
import { chartSettingsMethodsIF } from '../../App/hooks/useChartSettings';
import { allDexBalanceMethodsIF } from '../../App/hooks/useExchangePrefs';
import { allSlippageMethodsIF } from '../../App/hooks/useSlippage';
import { IS_LOCAL_ENV } from '../../constants';
import { formSlugForPairParams } from '../../App/functions/urlSlugs';
import { PositionUpdateFn } from '../../App/functions/getPositionData';
// import { useCandleTime } from './useCandleTime';

// interface for React functional component props
interface propsIF {
    pool: CrocPoolView | undefined;
    isUserLoggedIn: boolean | undefined;
    crocEnv: CrocEnv | undefined;
    provider: ethers.providers.Provider | undefined;
    candleData: CandlesByPoolAndDuration | undefined;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    account: string;
    lastBlockNumber: number;
    isTokenABase: boolean;
    poolPriceDisplay?: number;
    tokenMap: Map<string, TokenIF>;
    tokenPair: TokenPairIF;
    chainId: string;
    chainData: ChainSpec;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    setLimitRate: Dispatch<SetStateAction<string>>;
    limitRate: string;
    favePools: favePoolsMethodsIF;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    openGlobalModal: (content: ReactNode) => void;
    closeGlobalModal: () => void;
    isInitialized: boolean;
    poolPriceNonDisplay: number | undefined;
    searchableTokens: TokenIF[];
    poolExists: boolean | undefined;
    isSidebarOpen: boolean;
    setTokenPairLocal: Dispatch<SetStateAction<string[] | null>>;
    handlePulseAnimation: (type: string) => void;
    isCandleSelected: boolean | undefined;
    setIsCandleSelected: Dispatch<SetStateAction<boolean | undefined>>;
    fullScreenChart: boolean;
    setFullScreenChart: Dispatch<SetStateAction<boolean>>;
    cachedQuerySpotPrice: SpotPriceFn;
    fetchingCandle: boolean;
    setFetchingCandle: Dispatch<SetStateAction<boolean>>;
    isCandleDataNull: boolean;
    setIsCandleDataNull: Dispatch<SetStateAction<boolean>>;
    minPrice: number;
    maxPrice: number;
    setMaxPrice: Dispatch<SetStateAction<number>>;
    setMinPrice: Dispatch<SetStateAction<number>>;
    rescaleRangeBoundariesWithSlider: boolean;
    setRescaleRangeBoundariesWithSlider: Dispatch<SetStateAction<boolean>>;
    isTutorialMode: boolean;
    setIsTutorialMode: Dispatch<SetStateAction<boolean>>;
    setCandleDomains: Dispatch<SetStateAction<candleDomain>>;
    tokenList: TokenIF[];
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
    simpleRangeWidth: number;
    setRepositionRangeWidth: Dispatch<SetStateAction<number>>;
    repositionRangeWidth: number;
    chartSettings: chartSettingsMethodsIF;
    dexBalancePrefs: allDexBalanceMethodsIF;
    setChartTriggeredBy: Dispatch<SetStateAction<string>>;
    chartTriggeredBy: string;
    slippage: allSlippageMethodsIF;
    gasPriceInGwei: number | undefined;
    ethMainnetUsdPrice: number | undefined;
    cachedPositionUpdateQuery: PositionUpdateFn;
}

// React functional component
export default function Trade(props: propsIF) {
    const {
        chartSettings,
        pool,
        tokenList,
        cachedQuerySpotPrice,
        cachedPositionUpdateQuery,
        isUserLoggedIn,
        crocEnv,
        candleData,
        chainId,
        chainData,
        tokenMap,
        poolPriceDisplay,
        provider,
        lastBlockNumber,
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        favePools,
        searchableTokens,
        expandTradeTable,
        setExpandTradeTable,
        isShowAllEnabled,
        setIsShowAllEnabled,
        isTokenABase,
        poolPriceNonDisplay,
        account,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        poolExists,
        isSidebarOpen,
        handlePulseAnimation,
        setOutsideControl,
        setSelectedOutsideTab,
        isCandleSelected,
        setIsCandleSelected,
        fullScreenChart,
        setFullScreenChart,
        fetchingCandle,
        setFetchingCandle,
        isCandleDataNull,
        minPrice,
        maxPrice,
        setMaxPrice,
        setMinPrice,
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
        setCandleDomains,
        setSimpleRangeWidth,
        simpleRangeWidth,
        setRepositionRangeWidth,
        repositionRangeWidth,
        dexBalancePrefs,
        setChartTriggeredBy,
        chartTriggeredBy,
        slippage,
        gasPriceInGwei,
        ethMainnetUsdPrice,
    } = props;

    const { params } = useParams();

    const [transactionFilter, setTransactionFilter] = useState<CandleData>();
    const [isCandleArrived, setIsCandleDataArrived] = useState(false);

    const navigate = useNavigate();

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

    const { pathname } = useLocation();

    const isMarketOrLimitModule =
        pathname.includes('market') || pathname.includes('limit');

    useEffect(() => {
        if (
            isCandleDataNull &&
            props.candleData !== undefined &&
            props.candleData.candles?.length > 0
        ) {
            IS_LOCAL_ENV && console.debug('Data arrived');
            setIsCandleDataArrived(false);
        }
    }, [props.candleData]);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>();

    const { tradeData, graphData } = useAppSelector((state) => state);
    const { isDenomBase, limitTick, advancedMode } = tradeData;
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

    const liquidityData = graphData?.liquidityData;

    const poolPriceDisplayWithDenom = poolPriceDisplay
        ? isDenomBase
            ? 1 / poolPriceDisplay
            : poolPriceDisplay
        : 0;

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
    const expandGraphStyle = expandTradeTable ? styles.hide_graph : '';
    const fullScreenStyle = fullScreenChart
        ? styles.chart_full_screen
        : styles.main__chart;

    const [hasInitialized, setHasInitialized] = useState(false);

    const changeState = (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => {
        setIsCandleSelected(isOpen);
        setHasInitialized(false);
        setTransactionFilter(candleData);
        if (isOpen) {
            setOutsideControl(true);
            setSelectedOutsideTab(0);
        }
    };
    const [chartBg, setChartBg] = useState('transparent');

    const [upBodyColorPicker, setUpBodyColorPicker] = useState<boolean>(false);
    const [upBorderColorPicker, setUpBorderColorPicker] =
        useState<boolean>(false);
    const [downBodyColorPicker, setDownBodyColorPicker] =
        useState<boolean>(false);
    const [downBorderColorPicker, setDownBorderColorPicker] =
        useState<boolean>(false);

    const [upBodyColor, setUpBodyColor] = useState<string>('#CDC1FF');
    const [upBorderColor, setUpBorderColor] = useState<string>('#CDC1FF');
    const [downBodyColor, setDownBodyColor] = useState<string>('#24243e');
    const [downBorderColor, setDownBorderColor] = useState<string>('#7371FC');
    const [upVolumeColor] = useState<string>('rgba(205,193,255, 0.5)');
    const [downVolumeColor] = useState<string>('rgba(115,113,252, 0.5)');

    const handleChartBgColorPickerChange = (color: any) => {
        setChartBg(color.hex);
    };
    const handleBodyColorPickerChange = (color: any) => {
        setUpBodyColor(color.hex);
    };
    const handleBorderColorPickerChange = (color: any) => {
        setUpBorderColor(color.hex);
    };
    const handleDownBodyColorPickerChange = (color: any) => {
        setDownBodyColor(color.hex);
    };
    const handleDownBorderColorPickerChange = (color: any) => {
        setDownBorderColor(color.hex);
    };
    const tradeSettingsColorProps = {
        upBodyColorPicker: upBodyColorPicker,
        setUpBodyColorPicker: setUpBodyColorPicker,
        upBodyColor: upBodyColor,
        handleBodyColorPickerChange: handleBodyColorPickerChange,
        handleBorderColorPickerChange: handleBorderColorPickerChange,
        handleDownBodyColorPickerChange: handleDownBodyColorPickerChange,
        handleDownBorderColorPickerChange: handleDownBorderColorPickerChange,
        setUpBorderColorPicker: setUpBorderColorPicker,
        setDownBodyColorPicker: setDownBodyColorPicker,
        setDownBorderColorPicker: setDownBorderColorPicker,
        upBorderColor: upBorderColor,
        upBorderColorPicker: upBorderColorPicker,
        downBodyColor: downBodyColor,
        downBodyColorPicker: downBodyColorPicker,
        downBorderColor: downBorderColor,
        downBorderColorPicker: downBorderColorPicker,
        chartBg: chartBg,
        setChartBg: setChartBg,
        handleChartBgColorPickerChange: handleChartBgColorPickerChange,
    };

    // const [showChartAndNotTab, setShowChartAndNotTab] = useState(false);

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

    const unselectCandle = () => {
        setSelectedDate(undefined);
        changeState(false, undefined);
        setIsCandleSelected(false);
    };

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

    const poolNotInitializedContent =
        poolExists === false ? (
            <div className={styles.pool_not_initialialized_container}>
                <div className={styles.pool_not_initialialized_content}>
                    <div
                        className={styles.close_init}
                        onClick={() => navigate(-1)}
                    >
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
                                tokenInitial={baseTokenSymbol.charAt(0)}
                                width='20px'
                            />
                        )}
                        {quoteTokenLogo ? (
                            <img src={quoteTokenLogo} alt={quoteTokenSymbol} />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={quoteTokenSymbol.charAt(0)}
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

    const [poolPriceChangePercent, setPoolPriceChangePercent] = useState<
        string | undefined
    >();
    const [isPoolPriceChangePositive, setIsPoolPriceChangePositive] =
        useState<boolean>(true);

    const showActiveMobileComponent = useMediaQuery('(max-width: 1200px)');

    const tradeChartsProps = {
        chartSettings: chartSettings,
        isUserLoggedIn: isUserLoggedIn,
        pool: pool,
        chainData: chainData,
        poolPriceDisplay: poolPriceDisplayWithDenom,
        expandTradeTable: expandTradeTable,
        setExpandTradeTable: setExpandTradeTable,
        isTokenABase: isTokenABase,
        fullScreenChart: fullScreenChart,
        setFullScreenChart: setFullScreenChart,
        changeState: changeState,
        candleData: candleData,
        liquidityData: liquidityData,
        lastBlockNumber: lastBlockNumber,
        chainId: chainId,
        limitTick: limitTick,
        favePools: favePools,
        isAdvancedModeActive: advancedMode,
        simpleRangeWidth: simpleRangeWidth,
        upBodyColor: upBodyColor,
        upBorderColor: upBorderColor,
        downBodyColor: downBodyColor,
        downBorderColor: downBorderColor,
        upVolumeColor: upVolumeColor,
        downVolumeColor: downVolumeColor,
        baseTokenAddress: baseTokenAddress,
        poolPriceNonDisplay: poolPriceNonDisplay,
        selectedDate: selectedDate,
        setSelectedDate: setSelectedDate,
        handlePulseAnimation: handlePulseAnimation,
        poolPriceChangePercent: poolPriceChangePercent,
        setPoolPriceChangePercent: setPoolPriceChangePercent,
        isPoolPriceChangePositive: isPoolPriceChangePositive,
        setIsPoolPriceChangePositive: setIsPoolPriceChangePositive,
        fetchingCandle: fetchingCandle,
        setFetchingCandle: setFetchingCandle,
        minPrice: minPrice,
        maxPrice: maxPrice,
        setMaxPrice: setMaxPrice,
        setMinPrice: setMinPrice,
        rescaleRangeBoundariesWithSlider: rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider:
            setRescaleRangeBoundariesWithSlider,
        isSidebarOpen: isSidebarOpen,
        TradeSettingsColor: <TradeSettingsColor {...tradeSettingsColorProps} />,
        isTutorialMode: props.isTutorialMode,
        setIsTutorialMode: props.setIsTutorialMode,
        setCandleDomains: setCandleDomains,
        setSimpleRangeWidth: setSimpleRangeWidth,
        setRepositionRangeWidth: setRepositionRangeWidth,
        repositionRangeWidth: repositionRangeWidth,
        setChartTriggeredBy: setChartTriggeredBy,
        chartTriggeredBy: chartTriggeredBy,
    };

    const tradeTabsProps = {
        tokenList: tokenList,
        cachedQuerySpotPrice: cachedQuerySpotPrice,
        cachedPositionUpdateQuery: cachedPositionUpdateQuery,
        isUserLoggedIn: isUserLoggedIn,
        isTokenABase: isTokenABase,
        crocEnv: crocEnv,
        provider: provider,
        account: account,
        lastBlockNumber: lastBlockNumber,
        chainId: chainId,
        chainData: chainData,
        currentTxActiveInTransactions: currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions: setCurrentTxActiveInTransactions,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
        isShowAllEnabled: isShowAllEnabled,
        setIsShowAllEnabled: setIsShowAllEnabled,
        expandTradeTable: expandTradeTable,
        setExpandTradeTable: setExpandTradeTable,
        tokenMap: tokenMap,
        isCandleSelected: isCandleSelected,
        setIsCandleSelected: setIsCandleSelected,
        filter: transactionFilter,
        setTransactionFilter: setTransactionFilter,
        selectedOutsideTab: props.selectedOutsideTab,
        setSelectedOutsideTab: props.setSelectedOutsideTab,
        outsideControl: props.outsideControl,
        setOutsideControl: props.setOutsideControl,
        currentPositionActive: props.currentPositionActive,
        setCurrentPositionActive: props.setCurrentPositionActive,
        openGlobalModal: props.openGlobalModal,
        closeGlobalModal: props.closeGlobalModal,
        searchableTokens: searchableTokens,
        isSidebarOpen: isSidebarOpen,
        handlePulseAnimation: handlePulseAnimation,
        changeState: changeState,
        selectedDate: selectedDate,
        setSelectedDate: setSelectedDate,
        hasInitialized: hasInitialized,
        setHasInitialized: setHasInitialized,
        unselectCandle: unselectCandle,
        favePools: favePools,
        poolPriceDisplay: poolPriceDisplayWithDenom,
        poolPriceChangePercent: poolPriceChangePercent,
        setPoolPriceChangePercent: setPoolPriceChangePercent,
        isPoolPriceChangePositive: isPoolPriceChangePositive,
        setIsPoolPriceChangePositive: setIsPoolPriceChangePositive,
        isCandleDataNull: isCandleDataNull,
        isCandleArrived: isCandleArrived,
        setIsCandleDataArrived: setIsCandleDataArrived,
        setSimpleRangeWidth: setSimpleRangeWidth,
        dexBalancePrefs: dexBalancePrefs,
        slippage: slippage,
        gasPriceInGwei: gasPriceInGwei,
        ethMainnetUsdPrice: ethMainnetUsdPrice,
        candleTime: isMarketOrLimitModule
            ? chartSettings.candleTime.market
            : chartSettings.candleTime.range,
    };

    const mobileTrade = (
        <section
            className={styles.main_layout_mobile}
            style={{
                height: 'calc(100vh - 8rem)',
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
                    {!isCandleDataNull && <TradeCharts {...tradeChartsProps} />}
                </div>
            )}

            {activeMobileComponent === 'transactions' && (
                <div
                    className={styles.full_table_height}
                    style={{ marginLeft: '2rem' }}
                >
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
        <section className={styles.main_layout}>
            <div
                className={`${styles.middle_col}
                ${expandTradeTable ? styles.flex_column : ''}`}
            >
                {poolNotInitializedContent}
                <div
                    className={` ${expandGraphStyle} ${
                        activeMobileComponent !== 'chart' ? styles.hide : ''
                    } ${fullScreenStyle}`}
                    style={{
                        background: chartBg,
                    }}
                >
                    <div className={styles.main__chart_container}>
                        {!isCandleDataNull && (
                            <TradeCharts {...tradeChartsProps} />
                        )}
                    </div>
                </div>

                <motion.div
                    className={
                        expandTradeTable
                            ? styles.full_table_height
                            : styles.min_table_height
                    }
                >
                    <div
                        className={
                            activeMobileComponent !== 'transactions'
                                ? styles.hide
                                : ''
                        }
                    >
                        <TradeTabs2 {...tradeTabsProps} />
                    </div>
                </motion.div>
            </div>
            {mainContent}
        </section>
    );
}

type ContextType = {
    tradeData: TradeDataIF;
    navigationMenu: JSX.Element;
    limitTickFromParams: number | null;
};

export function useTradeData() {
    return useOutletContext<ContextType>();
}
