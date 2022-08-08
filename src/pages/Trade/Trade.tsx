import { Outlet, useOutletContext, NavLink } from 'react-router-dom';
import styles from './Trade.module.css';
import chart from '../../assets/images/Temporary/chart.svg';

// import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { AiOutlineCamera, AiOutlineFullscreen, AiOutlineSetting } from 'react-icons/ai';
import {
    tradeData as TradeDataIF,
    toggleDidUserFlipDenom,
    setActiveChartPeriod,
} from '../../utils/state/tradeDataSlice';
import truncateDecimals from '../../utils/data/truncateDecimals';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
// import TradeTabs from '../../components/Trade/TradeTabs/TradeTabs';
import TradeTabs2 from '../../components/Trade/TradeTabs/TradeTabs2';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { motion, AnimateSharedLayout } from 'framer-motion';
import { TokenIF } from '../../utils/interfaces/TokenIF';

interface ITradeProps {
    account: string;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    lastBlockNumber: number;
    isTokenABase: boolean;
    poolPriceDisplay: number;
    chainId: string;
    switchTabToTransactions: boolean;
    setSwitchTabToTransactions: Dispatch<SetStateAction<boolean>>;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;

    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    tokenMap: Map<string, TokenIF>;
}

export default function Trade(props: ITradeProps) {
    const { tokenMap } = props;
    const [fullScreenChart, setFullScreenChart] = useState(false);

    // const location = useLocation();
    // const currentLocation = location.pathname;
    const dispatch = useAppDispatch();

    // console.log(currentLocation);
    // const { pathname } = location;
    // console.log('I am pathname', pathname);

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

    console.log(fullScreenChart);
    // eslint-disable-next-line
    function closeOnEscapeKeyDown(e: any) {
        if ((e.charCode || e.keyCode) === 27) setFullScreenChart(false);
    }

    useEffect(() => {
        document.body.addEventListener('keydown', closeOnEscapeKeyDown);
        return function cleanUp() {
            document.body.removeEventListener('keydown', closeOnEscapeKeyDown);
        };
    });
    const graphSettingsContent = (
        <div className={styles.graph_settings_container}>
            <div>
                <AiOutlineSetting size={20} />
            </div>
            <div onClick={() => setFullScreenChart(true)}>
                <AiOutlineFullscreen size={20} />
            </div>
            <div>
                <AiOutlineCamera size={20} />
            </div>
        </div>
    );

    const fullScreenStyle = fullScreenChart ? styles.chart_full_screen : styles.chart_image;
    const chartImage = (
        <div className={fullScreenStyle}>
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
                <div className={styles.middle_col}>
                    <div className={`${styles.graph_style} ${expandGraphStyle}`}>
                        {graphSettingsContent}
                        {tokenInfo}
                        {timeFrameContent}
                        {chartImage}
                    </div>

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
                            tokenMap={tokenMap}
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
