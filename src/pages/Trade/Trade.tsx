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
import { useMemo, useState } from 'react';
import { ONE_HOUR_SECONDS, TimeWindow } from '../../constants/intervals';
import { useTokenData, useTokenPriceData } from '../../state/tokens/hooks';
import { currentTimestamp } from '../../utils';
import { PriceChartEntry } from '../../types';
import { usePoolChartData } from '../../state/pools/hooks';
import TradeCandleStickChart from './TradeCharts/TradeCandleStickChart';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import TradeTabs from '../../components/Trade/TradeTabs/TradeTabs';

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
}

const DEFAULT_TIME_WINDOW = TimeWindow.WEEK;

export default function Trade(props: ITradeProps) {
    const dispatch = useAppDispatch();

    const [timeWindow] = useState(DEFAULT_TIME_WINDOW);
    const chartData = usePoolChartData('0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8'); // ETH/USDC pool address
    const tokenData = useTokenData('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'); // ETH address
    const priceData = useTokenPriceData(
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // ETH address
        ONE_HOUR_SECONDS,
        timeWindow,
    );

    const adjustedToCurrent = useMemo(() => {
        if (priceData && tokenData && priceData.length > 0) {
            const adjusted = Object.assign([], priceData);
            adjusted.push({
                time: currentTimestamp() / 1000,
                open: priceData[priceData.length - 1].close,
                close: tokenData?.priceUSD,
                high: tokenData?.priceUSD,
                low: priceData[priceData.length - 1].close,
            });
            return adjusted.map((item: PriceChartEntry) => {
                return {
                    time: new Date(item.time * 1000),
                    high: item.high,
                    low: item.low,
                    open: item.open,
                    close: item.close,
                };
            });
        } else {
            return [];
        }
    }, [priceData, tokenData]);

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

            <div className={styles.settings_container}>
                <span>Liquidity Profile</span>
                <button>Total</button>
                <button>Cumulative</button>
            </div>
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
                <button
                    onClick={() => {
                        setActivePeriod(60);
                    }}
                >
                    1m
                </button>
                <button
                    onClick={() => {
                        setActivePeriod(300);
                    }}
                >
                    5m
                </button>
                <button
                    onClick={() => {
                        setActivePeriod(900);
                    }}
                >
                    15m
                </button>
                <button
                    onClick={() => {
                        setActivePeriod(3600);
                    }}
                >
                    1h
                </button>
                <button
                    onClick={() => {
                        setActivePeriod(14400);
                    }}
                >
                    4h
                </button>
                <button
                    onClick={() => {
                        setActivePeriod(86400);
                    }}
                >
                    1d
                </button>
            </div>
        </div>
    );

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

    return (
        // <motion.main
        //     initial={{ width: 0 }}
        //     animate={{ width: '100%' }}
        //     exit={{ x: window.innerWidth, transition: { duration: 0.4 } }}
        //     data-testid={'trade'}
        // >
        <main className={styles.main_layout}>
            <div className={`${styles.middle_col} ${styles.graph_container}`}>
                <div>
                    {tokenInfo}
                    {timeFrameContent}
                </div>

                <TradeCandleStickChart
                    tvlData={formattedTvlData}
                    volumeData={formattedVolumeData}
                    feeData={formattedFeesUSD}
                    priceData={adjustedToCurrent}
                />

                <TradeTabs
                    account={props.account}
                    isAuthenticated={props.isAuthenticated}
                    isWeb3Enabled={props.isWeb3Enabled}
                    lastBlockNumber={props.lastBlockNumber}
                    chainId={props.chainId}
                />
            </div>
            {mainContent}
        </main>
        // </motion.main>
    );
}

type ContextType = { tradeData: TradeDataIF; navigationMenu: JSX.Element };

export function useTradeData() {
    return useOutletContext<ContextType>();
}
