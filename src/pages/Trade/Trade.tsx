import {
    Outlet,
    useOutletContext,
    NavLink,
    // useLocation
} from 'react-router-dom';
import styles from './Trade.module.css';
import chart from '../../assets/images/Temporary/chart.svg';
import Tabs from '../../components/Global/Tabs/Tabs';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { tradeData as TradeDataIF, toggleDidUserFlipDenom } from '../../utils/state/tradeDataSlice';
import truncateDecimals from '../../utils/data/truncateDecimals';

interface ITradeProps {
    account: string;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    lastBlockNumber: number;
    isTokenABase: boolean;
    poolPriceDisplay: number;
    setActivePeriod: React.Dispatch<React.SetStateAction<number>>;
}

export default function Trade(props: ITradeProps) {
    // const location = useLocation();
    // const currentLocation = location.pathname;
    const dispatch = useAppDispatch();

    // console.log(currentLocation);

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
    const setActivePeriod = props.setActivePeriod;
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

    const timeFrameContent = (
        <div className={styles.time_frame_container}>
            <div className={styles.left_side}>
                <span className={styles.amount}>${truncatedPoolPrice}</span>
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

    const chartImage = (
        <div className={styles.chart_image}>
            <img src={chart} alt='chart' />
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
        <motion.main
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 0.4 } }}
            data-testid={'trade'}
        >
            <main className={styles.main_layout}>
                <div className={`${styles.middle_col} ${styles.graph_container}`}>
                    {tokenInfo}
                    {timeFrameContent}
                    {chartImage}
                    <Tabs
                        account={props.account}
                        isAuthenticated={props.isAuthenticated}
                        isWeb3Enabled={props.isWeb3Enabled}
                        lastBlockNumber={props.lastBlockNumber}
                    />
                </div>
                {mainContent}
            </main>
        </motion.main>
    );
}

type ContextType = { tradeData: TradeDataIF; navigationMenu: JSX.Element };

export function useTradeData() {
    return useOutletContext<ContextType>();
}
