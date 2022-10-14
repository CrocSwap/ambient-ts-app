/* eslint-disable @typescript-eslint/no-explicit-any */
// START: Import React and Dongles
import { Dispatch, SetStateAction, ReactNode, useEffect, useState } from 'react';
import { useParams, Outlet, useOutletContext, Link, NavLink, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { motion, AnimateSharedLayout } from 'framer-motion';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';

// START: Import JSX Components
import TradeCharts from './TradeCharts/TradeCharts';
import TradeTabs2 from '../../components/Trade/TradeTabs/TradeTabs2';

// START: Import Local Files
import styles from './Trade.module.css';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { tradeData as TradeDataIF } from '../../utils/state/tradeDataSlice';
import { CandleData, CandlesByPoolAndDuration } from '../../utils/state/graphDataSlice';
import { PoolIF, TokenIF, TokenPairIF } from '../../utils/interfaces/exports';
import { useUrlParams } from './useUrlParams';

// interface for React functional component props
interface TradePropsIF {
    isUserLoggedIn: boolean;
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
    setLimitRate: Dispatch<SetStateAction<string>>;

    limitRate: string;
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
    openGlobalModal: (content: ReactNode) => void;
    closeGlobalModal: () => void;
    isInitialized: boolean;
    poolPriceNonDisplay: number | undefined;
    importedTokens: TokenIF[];
    poolExists: boolean | null;
    showSidebar: boolean;
    setTokenPairLocal: Dispatch<SetStateAction<string[] | null>>;
}

// React functional component
export default function Trade(props: TradePropsIF) {
    const {
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
        addPoolToFaves,
        removePoolFromFaves,
        isInitialized,
        importedTokens,
        expandTradeTable,
        setExpandTradeTable,
        isShowAllEnabled,
        setIsShowAllEnabled,
        isTokenABase,
        poolPriceNonDisplay,
        account,
        isAuthenticated,
        isWeb3Enabled,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        poolExists,
        setTokenPairLocal,
        showSidebar,
    } = props;

    const tokenPairFromParams = useUrlParams(chainId, isInitialized);
    useEffect(() => {
        setTokenPairLocal && setTokenPairLocal(tokenPairFromParams);
    }, [tokenPairFromParams]);
    const { params } = useParams();

    const [isCandleSelected, setIsCandleSelected] = useState<boolean | undefined>();
    const [transactionFilter, setTransactionFilter] = useState<CandleData>();

    const navigate = useNavigate();

    const routes = [
        {
            path: '/market',
            name: 'Market',
        },
        {
            path: '/limit',
            name: 'Limit Order',
        },
        {
            path: '/range',
            name: 'Range',
        },
    ];
    const [fullScreenChart, setFullScreenChart] = useState(false);

    const { tradeData, graphData } = useAppSelector((state) => state);
    const {
        isDenomBase,
        limitPrice,
        advancedMode,
        simpleRangeWidth,

        pinnedMaxPriceDisplayTruncated,
        pinnedMinPriceDisplayTruncated,
    } = tradeData;
    const baseTokenLogo = isDenomBase ? tradeData.baseToken.logoURI : tradeData.quoteToken.logoURI;
    const quoteTokenLogo = isDenomBase ? tradeData.quoteToken.logoURI : tradeData.baseToken.logoURI;

    const indexOfPoolInLiqData = graphData?.liquidityForAllPools.pools.findIndex(
        (pool) =>
            pool.pool.baseAddress.toLowerCase() === tradeData.baseToken.address.toLowerCase() &&
            pool.pool.quoteAddress.toLowerCase() === tradeData.quoteToken.address.toLowerCase() &&
            pool.pool.poolIdx === chainData.poolIndex &&
            pool.pool.chainId === chainData.chainId,
    );

    const activePoolLiquidityData = graphData?.liquidityForAllPools?.pools[indexOfPoolInLiqData];
    const liquidityData = activePoolLiquidityData?.liquidityData;

    const poolPriceDisplayWithDenom = poolPriceDisplay
        ? isDenomBase
            ? 1 / poolPriceDisplay
            : poolPriceDisplay
        : 0;

    const navigationMenu = (
        <div className={styles.navigation_menu}>
            {routes.map((route, idx) => (
                <div className={`${styles.nav_container} trade_route`} key={idx}>
                    <NavLink to={`/trade${route.path}/${params}`}>{route.name}</NavLink>
                </div>
            ))}
        </div>
    );

    const mainContent = (
        <div className={styles.right_col}>
            <Outlet context={{ tradeData: tradeData, navigationMenu: navigationMenu }} />
        </div>
    );
    const expandGraphStyle = expandTradeTable ? styles.hide_graph : '';
    const fullScreenStyle = fullScreenChart ? styles.chart_full_screen : styles.main__chart;

    const changeState = (isOpen: boolean | undefined, candleData: CandleData | undefined) => {
        setIsCandleSelected(isOpen);
        setIsShowAllEnabled(!isOpen);
        setTransactionFilter(candleData);
    };

    // const [upBodyColorPicker, setUpBodyColorPicker] = useState<boolean>(false);
    // const [upBorderColorPicker, setUpBorderColorPicker] = useState<boolean>(false);
    // const [downBodyColorPicker, setDownBodyColorPicker] = useState<boolean>(false);
    // const [downBorderColorPicker, setDownBorderColorPicker] = useState<boolean>(false);

    const [upBodyColor] = useState<string>('#CDC1FF');
    const [upBorderColor] = useState<string>('#CDC1FF');
    const [downBodyColor] = useState<string>('#171D27');
    // const [downBodyColor] = useState<string>('#24243e');
    const [downBorderColor] = useState<string>('#7371FC');
    // const [upBodyColor, setUpBodyColor] = useState<string>('#CDC1FF');
    // const [upBorderColor, setUpBorderColor] = useState<string>('#CDC1FF');
    // const [downBodyColor, setDownBodyColor] = useState<string>('#24243e');
    // const [downBorderColor, setDownBorderColor] = useState<string>('#7371FC');

    // console.log({ upBodyColor });
    // console.log({ upBorderColor });
    // console.log({ downBodyColor });
    // console.log({ downBorderColor });

    // const handleBodyColorPickerChange = (color: any) => {
    //     setUpBodyColor(color.hex);
    // };
    // const handleBorderColorPickerChange = (color: any) => {
    //     setUpBorderColor(color.hex);
    // };
    // const handleDownBodyColorPickerChange = (color: any) => {
    //     setDownBodyColor(color.hex);
    // };
    // const handleDownBorderColorPickerChange = (color: any) => {
    //     setDownBorderColor(color.hex);
    // };

    const [showChartAndNotTab, setShowChartAndNotTab] = useState(false);

    const mobileDataToggle = (
        <div className={styles.mobile_toggle_container}>
            <button
                onClick={() => setShowChartAndNotTab(!showChartAndNotTab)}
                className={
                    showChartAndNotTab
                        ? styles.non_active_button_mobile_toggle
                        : styles.active_button_mobile_toggle
                }
            >
                Chart
            </button>
            <button
                onClick={() => setShowChartAndNotTab(!showChartAndNotTab)}
                className={
                    showChartAndNotTab
                        ? styles.active_button_mobile_toggle
                        : styles.non_active_button_mobile_toggle
                }
            >
                Tabs
            </button>
        </div>
    );

    const initLinkPath =
        '/initpool/chain=0x5&tokenA=' + baseTokenAddress + '&tokenB=' + quoteTokenAddress;

    const poolNotInitializedContent =
        poolExists === false ? (
            <div className={styles.pool_not_initialialized_container}>
                <div className={styles.pool_not_initialialized_content}>
                    <div onClick={() => navigate(-1)}>X</div>
                    <h2>This pool has not been initialized.</h2>
                    <h3>Do you want to initialize it?</h3>
                    <Link to={initLinkPath} className={styles.initialize_link}>
                        <img src={baseTokenLogo} alt='base token' />
                        Initialize Pool
                        <img src={quoteTokenLogo} alt=' quote token' />
                    </Link>
                    <button onClick={() => navigate(-1)}>No Thank You</button>
                </div>
            </div>
        ) : null;

    return (
        <AnimateSharedLayout>
            <main className={styles.main_layout}>
                <div className={styles.middle_col}>
                    {poolNotInitializedContent}
                    {mobileDataToggle}
                    <div className={` ${expandGraphStyle} ${fullScreenStyle}`}>
                        {/* <div style={{ textAlign: 'center', display: 'flex' }}>
                            <label style={{ padding: '0px' }}>Up</label>
                            <div style={{ marginLeft: '4px' }}>
                                <div
                                    style={{
                                        padding: '2px',
                                        borderRadius: '1px',
                                        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                                        display: 'inline-block',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setUpBodyColorPicker(true)}
                                >
                                    <div
                                        style={{
                                            width: '36px',
                                            height: '14px',
                                            borderRadius: '2px',
                                            background: upBodyColor,
                                        }}
                                    />
                                    <label style={{ padding: '0px' }}>Body</label>
                                </div>
                                {upBodyColorPicker ? (
                                    <div style={{ position: 'absolute', zIndex: '2' }}>
                                        <div
                                            style={{
                                                position: 'fixed',
                                                top: '0px',
                                                right: '0px',
                                                bottom: '0px',
                                                left: '0px',
                                            }}
                                            onClick={() => setUpBodyColorPicker(false)}
                                        />
                                        <SketchPicker
                                            color={upBodyColor}
                                            onChangeComplete={handleBodyColorPickerChange}
                                        />
                                    </div>
                                ) : null}
                                <div
                                    style={{
                                        padding: '2px',
                                        borderRadius: '1px',
                                        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                                        display: 'inline-block',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setUpBorderColorPicker(true)}
                                >
                                    <div
                                        style={{
                                            width: '36px',
                                            height: '14px',
                                            borderRadius: '2px',
                                            background: upBorderColor,
                                        }}
                                    />
                                    <label style={{ padding: '0px' }}>Border</label>
                                </div>
                                {upBorderColorPicker ? (
                                    <div style={{ position: 'absolute', zIndex: '2' }}>
                                        <div
                                            style={{
                                                position: 'fixed',
                                                top: '0px',
                                                right: '0px',
                                                bottom: '0px',
                                                left: '0px',
                                            }}
                                            onClick={() => setUpBorderColorPicker(false)}
                                        />
                                        <SketchPicker
                                            color={upBorderColor}
                                            onChangeComplete={handleBorderColorPickerChange}
                                        />
                                    </div>
                                ) : null}
                            </div>
                            <label style={{ padding: '0px' }}>Down</label>
                            <div style={{ marginLeft: '4px' }}>
                                <div
                                    style={{
                                        padding: '2px',
                                        borderRadius: '1px',
                                        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                                        display: 'inline-block',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setDownBodyColorPicker(true)}
                                >
                                    <div
                                        style={{
                                            width: '36px',
                                            height: '14px',
                                            borderRadius: '2px',
                                            background: downBodyColor,
                                        }}
                                    />
                                    <label style={{ padding: '0px' }}>Body</label>
                                </div>
                                {downBodyColorPicker ? (
                                    <div style={{ position: 'absolute', zIndex: '2' }}>
                                        <div
                                            style={{
                                                position: 'fixed',
                                                top: '0px',
                                                right: '0px',
                                                bottom: '0px',
                                                left: '0px',
                                            }}
                                            onClick={() => setDownBodyColorPicker(false)}
                                        />
                                        <SketchPicker
                                            color={downBodyColor}
                                            onChangeComplete={handleDownBodyColorPickerChange}
                                        />
                                    </div>
                                ) : null}
                                <div
                                    style={{
                                        padding: '2px',
                                        borderRadius: '1px',
                                        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                                        display: 'inline-block',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setDownBorderColorPicker(true)}
                                >
                                    <div
                                        style={{
                                            width: '36px',
                                            height: '14px',
                                            borderRadius: '2px',
                                            background: downBorderColor,
                                        }}
                                    />
                                    <label style={{ padding: '0px' }}>Border</label>
                                </div>
                                {downBorderColorPicker ? (
                                    <div style={{ position: 'absolute', zIndex: '2' }}>
                                        <div
                                            style={{
                                                position: 'fixed',
                                                top: '0px',
                                                right: '0px',
                                                bottom: '0px',
                                                left: '0px',
                                            }}
                                            onClick={() => setDownBorderColorPicker(false)}
                                        />
                                        <SketchPicker
                                            color={downBorderColor}
                                            onChangeComplete={handleDownBorderColorPickerChange}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        </div> */}

                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.8,
                                delay: 0.5,
                                ease: [0, 0.71, 0.2, 1.01],
                            }}
                            className={`${styles.main__chart_container} ${
                                showChartAndNotTab && styles.hide
                            }`}
                        >
                            <TradeCharts
                                poolPriceDisplay={poolPriceDisplayWithDenom}
                                expandTradeTable={expandTradeTable}
                                setExpandTradeTable={setExpandTradeTable}
                                isTokenABase={isTokenABase}
                                fullScreenChart={fullScreenChart}
                                setFullScreenChart={setFullScreenChart}
                                changeState={changeState}
                                candleData={candleData}
                                liquidityData={liquidityData}
                                lastBlockNumber={lastBlockNumber}
                                chainId={chainId}
                                limitPrice={limitPrice}
                                favePools={favePools}
                                addPoolToFaves={addPoolToFaves}
                                removePoolFromFaves={removePoolFromFaves}
                                isAdvancedModeActive={advancedMode}
                                simpleRangeWidth={simpleRangeWidth}
                                pinnedMinPriceDisplayTruncated={pinnedMinPriceDisplayTruncated}
                                pinnedMaxPriceDisplayTruncated={pinnedMaxPriceDisplayTruncated}
                                upBodyColor={upBodyColor}
                                upBorderColor={upBorderColor}
                                downBodyColor={downBodyColor}
                                downBorderColor={downBorderColor}
                                baseTokenAddress={baseTokenAddress}
                                poolPriceNonDisplay={poolPriceNonDisplay}
                                isCandleSelected={isCandleSelected}
                            />
                        </motion.div>
                    </div>

                    <motion.div
                        animate={{
                            height: expandTradeTable ? '100%' : '30%',
                            transition: {
                                duration: 0.5,
                                type: 'spring',
                                damping: 10,
                            },
                        }}
                    >
                        <div className={!showChartAndNotTab ? styles.hide : ''}>
                            <TradeTabs2
                                isUserLoggedIn={isUserLoggedIn}
                                crocEnv={crocEnv}
                                provider={provider}
                                account={account}
                                isAuthenticated={isAuthenticated}
                                isWeb3Enabled={isWeb3Enabled}
                                lastBlockNumber={lastBlockNumber}
                                chainId={chainId}
                                chainData={chainData}
                                currentTxActiveInTransactions={currentTxActiveInTransactions}
                                setCurrentTxActiveInTransactions={setCurrentTxActiveInTransactions}
                                baseTokenBalance={baseTokenBalance}
                                quoteTokenBalance={quoteTokenBalance}
                                baseTokenDexBalance={baseTokenDexBalance}
                                quoteTokenDexBalance={quoteTokenDexBalance}
                                isShowAllEnabled={isShowAllEnabled}
                                setIsShowAllEnabled={setIsShowAllEnabled}
                                expandTradeTable={expandTradeTable}
                                setExpandTradeTable={setExpandTradeTable}
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
                                importedTokens={importedTokens}
                                showSidebar={showSidebar}
                            />
                        </div>
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
