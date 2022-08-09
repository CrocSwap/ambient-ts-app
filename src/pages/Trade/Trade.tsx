import {
    Outlet,
    useOutletContext,
    NavLink,
    // useLocation
} from 'react-router-dom';
import styles from './Trade.module.css';
// import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../utils/hooks/reduxToolkit';
import {
    tradeData as TradeDataIF,
    toggleDidUserFlipDenom,
    setActiveChartPeriod,
} from '../../utils/state/tradeDataSlice';
import truncateDecimals from '../../utils/data/truncateDecimals';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { useMemo, useState, Dispatch, SetStateAction } from 'react';
import { usePoolChartData } from '../../state/pools/hooks';
import TradeCandleStickChart from './TradeCharts/TradeCandleStickChart';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
// import TradeTabs from '../../components/Trade/TradeTabs/TradeTabs';
// import TradeTabs from '../../components/Trade/TradeTabs/TradeTabs';
import TradeTabs2 from '../../components/Trade/TradeTabs/TradeTabs2';
import { motion, AnimateSharedLayout } from 'framer-motion';

interface ITradeProps {
    account: string;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    lastBlockNumber: number;
    isTokenABase: boolean;
    poolPriceDisplay: number;
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
    chainId: string;
    switchTabToTransactions: boolean;
    setSwitchTabToTransactions: Dispatch<SetStateAction<boolean>>;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;

    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}

interface TransactionFilter {
    time: number;
    poolHash: string;
}

export default function Trade(props: ITradeProps) {
    const dispatch = useAppDispatch();

    const [isCandleSelected, setIsCandleSelected] = useState(false);
    const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>();

    const chartData = usePoolChartData('0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8'); // ETH/USDC pool address

    const formattedTvlData = useMemo(() => {
        if (chartData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return chartData.map((day: any) => {
                return {
                    time: new Date(day.date * 1000),
                    value: day.totalValueLockedUSD,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    const formattedVolumeData = useMemo(() => {
        if (chartData) {
            return chartData.map((day) => {
                return {
                    time: new Date(day.date * 1000),
                    value: day.volumeUSD,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    const formattedFeesUSD = useMemo(() => {
        if (chartData) {
            return chartData.map((day) => {
                return {
                    time: new Date(day.date * 1000),
                    value: day.feesUSD,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    const routes = [
        {
            path: '/market',
            name: 'Market',
        },
        {
            path: '/limit',
            name: 'Limit',
        },
        {
            path: '/range',
            name: 'Range',
        },
    ];

    const tradeData = useAppSelector((state) => state.tradeData);

    const graphData = useAppSelector((state) => state.graphData);

    const mainnetCandlePoolDefinition = JSON.stringify({
        baseAddress: '0x0000000000000000000000000000000000000000',
        quoteAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
        poolIdx: 36000,
        network: '0x1',
    }).toLowerCase();

    const indexOfMainnetCandlePool = graphData.candlesForAllPools.pools
        .map((item) => JSON.stringify(item.pool).toLowerCase())
        .findIndex((pool) => pool === mainnetCandlePoolDefinition);

    const mainnetCandleData = graphData.candlesForAllPools.pools[indexOfMainnetCandlePool];
    const candleData = mainnetCandleData.candlesByPoolAndDuration.find((data) => {
        return data.duration === tradeData.activeChartPeriod;
    });

    const isTokenABase = props.isTokenABase;
    const setActivePeriod = (period: number) => {
        dispatch(setActiveChartPeriod(period));
    };
    const denomInBase = tradeData.isDenomBase;
    const denomInTokenA = (denomInBase && isTokenABase) || (!denomInBase && !isTokenABase);
    const tokenASymbol = tradeData.tokenA.symbol;
    const tokenBSymbol = tradeData.tokenB.symbol;
    const poolPriceDisplay = denomInBase ? 1 / props.poolPriceDisplay : props.poolPriceDisplay;
    const truncatedPoolPrice =
        poolPriceDisplay < 2
            ? truncateDecimals(poolPriceDisplay, 4)
            : truncateDecimals(poolPriceDisplay, 2);

    // These would be move to their own components, presumably the graph component

    // ---------------------------ACTIVE OVERLAY BUTTON FUNCTIONALITY-------------------------------
    const [activerOverlayButton, setActiveOverlayButton] = useState('Curve');
    const chartOverlayButtonData = [
        { name: 'Volume' },
        { name: 'TVL' },
        { name: 'Fee Rate' },
        { name: 'Heatmap' },
        { name: 'Liquidity Profile' },
        { name: 'Curve' },
        { name: 'Depth' },
    ];

    function handleOverlayButtonClick(name: string) {
        setActiveOverlayButton(name);
    }

    const chartOverlayButtons = chartOverlayButtonData.map((button, idx) => (
        <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.settings_container}
            key={idx}
        >
            <button
                onClick={() => handleOverlayButtonClick(button.name)}
                className={
                    button.name === activerOverlayButton
                        ? styles.active_button
                        : styles.non_active_button
                }
            >
                {button.name}

                {button.name === activerOverlayButton && (
                    <motion.div
                        layoutId='outline'
                        className={styles.outline}
                        initial={false}
                        // animate={{ borderColor: 'red' }}
                        transition={spring}
                    />
                )}
            </button>
        </motion.div>
    ));
    // --------------------------- END OF ACTIVE OVERLAY BUTTON FUNCTIONALITY-------------------------------

    // --------------------------- TIME FRAME BUTTON FUNCTIONALITY-------------------------------

    const activeTimeFrameData = [
        { label: '1m', activePeriod: 60 },
        { label: '5m', activePeriod: 300 },
        { label: '15m', activePeriod: 900 },
        { label: '1h', activePeriod: 3600 },
        { label: '4h', activePeriod: 14400 },
        { label: '1d', activePeriod: 86400 },
    ];
    const [activeTimeFrame, setActiveTimeFrame] = useState('1m');

    function handleTimeFrameButtonClick(label: string, time: number) {
        setActiveTimeFrame(label);
        setActivePeriod(time);
    }

    const activeTimeFrameDisplay = activeTimeFrameData.map((time, idx) => (
        <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.settings_container}
            key={idx}
        >
            <button
                onClick={() => handleTimeFrameButtonClick(time.label, time.activePeriod)}
                className={
                    time.label === activeTimeFrame
                        ? styles.active_button2
                        : styles.non_active_button2
                }
            >
                {time.label}

                {time.label === activeTimeFrame && (
                    <motion.div
                        layoutId='outline2'
                        className={styles.outline2}
                        initial={false}
                        // animate={{ borderColor: 'red' }}
                        transition={spring}
                    />
                )}
            </button>
        </motion.div>
    ));

    // --------------------------- END OF TIME FRAME BUTTON FUNCTIONALITY-------------------------------
    const tokenInfo = (
        <div className={styles.token_info_container}>
            <div className={styles.tokens_info} onClick={() => dispatch(toggleDidUserFlipDenom())}>
                <div className={styles.tokens_images}>
                    <img
                        src={denomInTokenA ? tradeData.tokenA.logoURI : tradeData.tokenB.logoURI}
                        // src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                        alt='token'
                        width='30px'
                    />
                    <img
                        src={denomInTokenA ? tradeData.tokenB.logoURI : tradeData.tokenA.logoURI}
                        // src='https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
                        alt='token'
                        width='30px'
                    />
                </div>
                <span className={styles.tokens_name}>
                    {denomInTokenA ? tokenASymbol : tokenBSymbol} /{' '}
                    {denomInTokenA ? tokenBSymbol : tokenASymbol}
                </span>
            </div>
            <div className={styles.chart_overlay_container}>{chartOverlayButtons}</div>
        </div>
    );

    const currencyCharacter = denomInTokenA
        ? // denom in a, return token b character
          getUnicodeCharacter(tradeData.tokenB.symbol)
        : // denom in b, return token a character
          getUnicodeCharacter(tradeData.tokenA.symbol);

    const timeFrameContent = (
        <div className={styles.time_frame_container}>
            <div className={styles.left_side}>
                <span className={styles.amount} onClick={() => dispatch(toggleDidUserFlipDenom())}>
                    {currencyCharacter}
                    {truncatedPoolPrice}
                </span>
                <span className={styles.change}>+8.57% | 24h</span>
            </div>
            <div className={styles.right_side}>
                <span>Timeframe</span>
                {activeTimeFrameDisplay}
            </div>
        </div>
    );

    // const chartImage = (
    //     <div className={styles.chart_image}>
    //         <img src={chart} alt='chart' />
    //     </div>
    // );

    const navigationMenu = (
        <div className={styles.navigation_menu}>
            {routes.map((route, idx) => (
                <div className={`${styles.nav_container} trade_route`} key={idx}>
                    <NavLink to={`/trade${route.path}`}>{route.name}</NavLink>
                </div>
            ))}
        </div>
    );

    const mainContent = (
        <div className={styles.right_col}>
            {/* {currentLocation.slice(0, 11) !== '/trade/edit' && navigationMenu} */}
            <Outlet context={{ tradeData: tradeData, navigationMenu: navigationMenu }} />
            {/* <PageFooter lastBlockNumber={props.lastBlockNumber} /> */}
        </div>
    );

    const expandGraphStyle = props.expandTradeTable ? styles.hide_graph : '';
    // const expandTradeTableStyle = props.expandTradeTable ? styles.expand_table : styles.trade_style;

    return (
        // <motion.main
        //     initial={{ width: 0 }}
        //     animate={{ width: '100%' }}
        //     exit={{ x: window.innerWidth, transition: { duration: 0.4 } }}
        //     data-testid={'trade'}
        // >
        <AnimateSharedLayout>
            <main className={styles.main_layout}>
                <div className={`${styles.middle_col} ${expandGraphStyle}`}>
                    <div>
                        {tokenInfo}
                        {timeFrameContent}
                    </div>

                    <TradeCandleStickChart
                        tvlData={formattedTvlData}
                        volumeData={formattedVolumeData}
                        feeData={formattedFeesUSD}
                        priceData={candleData}
                        setIsCandleSelected={setIsCandleSelected}
                        setTransactionFilter={setTransactionFilter}
                        setIsShowAllEnabled={props.setIsShowAllEnabled}
                        isCandleSelected={isCandleSelected}
                    />

                    <motion.div
                        animate={{
                            height: props.expandTradeTable ? '100%' : '30%',
                            transition: {
                                duration: 0.5,
                                type: 'spring',
                                damping: 10,
                            },
                        }}

                        // className={` ${expandTradeTableStyle}`}
                    >
                        <TradeTabs2
                            account={props.account}
                            isAuthenticated={props.isAuthenticated}
                            isWeb3Enabled={props.isWeb3Enabled}
                            lastBlockNumber={props.lastBlockNumber}
                            chainId={props.chainId}
                            switchTabToTransactions={props.switchTabToTransactions}
                            setSwitchTabToTransactions={props.setSwitchTabToTransactions}
                            currentTxActiveInTransactions={props.currentTxActiveInTransactions}
                            setCurrentTxActiveInTransactions={
                                props.setCurrentTxActiveInTransactions
                            }
                            isShowAllEnabled={props.isShowAllEnabled}
                            setIsShowAllEnabled={props.setIsShowAllEnabled}
                            expandTradeTable={props.expandTradeTable}
                            setExpandTradeTable={props.setExpandTradeTable}
                            isCandleSelected={isCandleSelected}
                            setIsCandleSelected={setIsCandleSelected}
                            filter={transactionFilter}
                            setTransactionFilter={setTransactionFilter}
                        />
                    </motion.div>
                </div>
                {mainContent}
            </main>
        </AnimateSharedLayout>

        // </motion.main>
    );
}

type ContextType = { tradeData: TradeDataIF; navigationMenu: JSX.Element };

export function useTradeData() {
    return useOutletContext<ContextType>();
}

const spring = {
    type: 'spring',
    stiffness: 500,
    damping: 30,
};
