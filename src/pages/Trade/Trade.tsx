// START: Import React and Dongles
import { Dispatch, SetStateAction, useState } from 'react';
import { Outlet, useOutletContext, NavLink } from 'react-router-dom';
import { ethers } from 'ethers';
import { motion, AnimateSharedLayout } from 'framer-motion';

// START: Import JSX Components
import TradeCharts from './TradeCharts/TradeCharts';
import TradeTabs2 from '../../components/Trade/TradeTabs/TradeTabs2';

// START: Import Local Files
import styles from './Trade.module.css';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { tradeData as TradeDataIF } from '../../utils/state/tradeDataSlice';
import { CandleData } from '../../utils/state/graphDataSlice';
import { PoolIF, TokenIF, TokenPairIF } from '../../utils/interfaces/exports';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';

// interface for React functional component props
interface TradePropsIF {
    crocEnv: CrocEnv | undefined;
    provider: ethers.providers.Provider | undefined;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    account: string;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
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
    favePools: PoolIF[];
    addPoolToFaves: (tokenA: TokenIF, tokenB: TokenIF, chainId: string, poolId: number) => void;
    removePoolFromFaves: (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ) => void;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;

    openGlobalModal: (content: React.ReactNode) => void;

    closeGlobalModal: () => void;
}

// React functional component
export default function Trade(props: TradePropsIF) {
    const {
        crocEnv,
        chainId,
        chainData,
        tokenMap,
        poolPriceDisplay,
        provider,
        lastBlockNumber,
        baseTokenAddress,
        quoteTokenAddress,
        favePools,
        addPoolToFaves,
        removePoolFromFaves,
    } = props;

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

    const activePoolDefinition = JSON.stringify({
        baseAddress: baseTokenAddress,
        quoteAddress: quoteTokenAddress,
        poolIdx: 36000,
        network: chainId,
    }).toLowerCase();

    const indexOfActivePool = graphData.candlesForAllPools.pools
        .map((item) => JSON.stringify(item.pool).toLowerCase())
        .findIndex((pool) => pool === activePoolDefinition);

    const activePoolCandleData = graphData?.candlesForAllPools?.pools[indexOfActivePool];
    const candleData = activePoolCandleData?.candlesByPoolAndDuration.find((data) => {
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
            <Outlet context={{ tradeData: tradeData, navigationMenu: navigationMenu }} />
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
                                lastBlockNumber={lastBlockNumber}
                                chainId={chainId}
                                favePools={favePools}
                                addPoolToFaves={addPoolToFaves}
                                removePoolFromFaves={removePoolFromFaves}
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
                            crocEnv={crocEnv}
                            provider={provider}
                            account={props.account}
                            isAuthenticated={props.isAuthenticated}
                            isWeb3Enabled={props.isWeb3Enabled}
                            lastBlockNumber={props.lastBlockNumber}
                            chainId={chainId}
                            chainData={chainData}
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
                            selectedOutsideTab={props.selectedOutsideTab}
                            setSelectedOutsideTab={props.setSelectedOutsideTab}
                            outsideControl={props.outsideControl}
                            setOutsideControl={props.setOutsideControl}
                            currentPositionActive={props.currentPositionActive}
                            setCurrentPositionActive={props.setCurrentPositionActive}
                            openGlobalModal={props.openGlobalModal}
                            closeGlobalModal={props.closeGlobalModal}
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
