import { Outlet, useOutletContext, NavLink } from 'react-router-dom';
import styles from './Trade.module.css';

import { useAppSelector } from '../../utils/hooks/reduxToolkit';

import { tradeData as TradeDataIF } from '../../utils/state/tradeDataSlice';
import { Dispatch, SetStateAction, useState } from 'react';
import { TokenIF } from '../../utils/interfaces/TokenIF';

import TradeTabs2 from '../../components/Trade/TradeTabs/TradeTabs2';
import { motion, AnimateSharedLayout } from 'framer-motion';
import TradeCharts from './TradeCharts/TradeCharts';
import { CandleData } from '../../utils/state/graphDataSlice';
import { ethers } from 'ethers';

interface ITradeProps {
    provider: ethers.providers.Provider | undefined;
    account: string;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    lastBlockNumber: number;
    isTokenABase: boolean;
    poolPriceDisplay?: number;

    tokenMap: Map<string, TokenIF>;
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

export default function Trade(props: ITradeProps) {
    const { chainId, tokenMap, poolPriceDisplay, provider } = props;

    const [isCandleSelected, setIsCandleSelected] = useState<boolean | undefined>();
    const [transactionFilter, setTransactionFilter] = useState<CandleData>();

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
    const [fullScreenChart, setFullScreenChart] = useState(false);

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

    const mainnetCandleData = graphData?.candlesForAllPools?.pools[indexOfMainnetCandlePool];
    const candleData = mainnetCandleData?.candlesByPoolAndDuration.find((data) => {
        return data.duration === tradeData.activeChartPeriod;
    });

    const denomInBase = tradeData.isDenomBase;

    const poolPriceDisplayWithDenom = poolPriceDisplay
        ? denomInBase
            ? 1 / poolPriceDisplay
            : poolPriceDisplay
        : 0;

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
    const fullScreenStyle = fullScreenChart ? styles.chart_full_screen : styles.main__chart;

    const changeState = (isOpen: boolean | undefined, candleData: CandleData | undefined) => {
        setIsCandleSelected(isOpen);
        props.setIsShowAllEnabled(!isOpen);
        setTransactionFilter(candleData);
    };

    return (
        <AnimateSharedLayout>
            <main className={styles.main_layout}>
                <div className={styles.middle_col}>
                    <div className={` ${expandGraphStyle} ${fullScreenStyle}`}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.8,
                                delay: 0.5,
                                ease: [0, 0.71, 0.2, 1.01],
                            }}
                            className={styles.main__chart_container}
                        >
                            <TradeCharts
                                poolPriceDisplay={poolPriceDisplayWithDenom}
                                expandTradeTable={props.expandTradeTable}
                                setExpandTradeTable={props.setExpandTradeTable}
                                isTokenABase={props.isTokenABase}
                                fullScreenChart={fullScreenChart}
                                setFullScreenChart={setFullScreenChart}
                                changeState={changeState}
                                candleData={candleData}
                            />
                        </motion.div>
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
                    >
                        <TradeTabs2
                            provider={provider}
                            account={props.account}
                            isAuthenticated={props.isAuthenticated}
                            isWeb3Enabled={props.isWeb3Enabled}
                            lastBlockNumber={props.lastBlockNumber}
                            chainId={chainId}
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
    );
}

type ContextType = { tradeData: TradeDataIF; navigationMenu: JSX.Element };

export function useTradeData() {
    return useOutletContext<ContextType>();
}
