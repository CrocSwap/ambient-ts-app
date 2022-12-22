// START: Import React and Dongles
import {
    Dispatch,
    SetStateAction,
    useState,
    useEffect,
    //  useMemo,
    useRef,
} from 'react';
import { motion } from 'framer-motion';
import {
    AiOutlineCamera,
    AiOutlineFullscreen,
    AiOutlineDownload,
    AiOutlineCopy,
    AiOutlineLink,
    AiOutlineTwitter,
    AiOutlineSetting,
} from 'react-icons/ai';
import { VscClose } from 'react-icons/vsc';

import { HiOutlineExternalLink } from 'react-icons/hi';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

// START: Import JSX Components
import {
    DefaultTooltip,
    GreenTextTooltip,
    NoColorTooltip,
    RedTextTooltip,
} from '../../../components/Global/StyledTooltip/StyledTooltip';

// START: Import Local Files
import styles from './TradeCharts.module.css';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import printDomToImage from '../../../utils/functions/printDomToImage';
import getUnicodeCharacter from '../../../utils/functions/getUnicodeCharacter';
import {
    // tradeData as TradeDataIF,
    toggleDidUserFlipDenom,
    setActiveChartPeriod,
} from '../../../utils/state/tradeDataSlice';
import {
    CandleData,
    CandlesByPoolAndDuration,
    liquidityData,
} from '../../../utils/state/graphDataSlice';
// import { usePoolChartData } from '../../../state/pools/hooks';
import { useAppSelector, useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import TradeCandleStickChart from './TradeCandleStickChart';
import { PoolIF, TokenIF } from '../../../utils/interfaces/exports';
import {
    get24hChange,
    // getPoolTVL
} from '../../../App/functions/getPoolStats';
import TradeChartsLoading from './TradeChartsLoading/TradeChartsLoading';
import NoTokenIcon from '../../../components/Global/NoTokenIcon/NoTokenIcon';
import { ChainSpec, CrocPoolView } from '@crocswap-libs/sdk';
import { formatDollarAmountAxis } from '../../../utils/numbers';
import IconWithTooltip from '../../../components/Global/IconWithTooltip/IconWithTooltip';
// import { formatAmountOld } from '../../../utils/numbers';
import UseOnClickOutside from '../../../utils/hooks/useOnClickOutside';

// interface for React functional component props
interface TradeChartsPropsIF {
    isUserLoggedIn: boolean | undefined;
    pool: CrocPoolView | undefined;
    // poolPriceTick: number | undefined;
    chainData: ChainSpec;
    chainId: string;
    lastBlockNumber: number;
    poolPriceDisplay: number;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    isTokenABase: boolean;
    fullScreenChart: boolean;
    setFullScreenChart: Dispatch<SetStateAction<boolean>>;
    changeState: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    candleData: CandlesByPoolAndDuration | undefined;
    limitTick: number;
    favePools: PoolIF[];
    addPoolToFaves: (tokenA: TokenIF, tokenB: TokenIF, chainId: string, poolId: number) => void;
    removePoolFromFaves: (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ) => void;
    liquidityData: liquidityData;
    isAdvancedModeActive: boolean | undefined;
    simpleRangeWidth: number | undefined;
    pinnedMinPriceDisplayTruncated: number | undefined;
    pinnedMaxPriceDisplayTruncated: number | undefined;
    upBodyColor: string;
    upBorderColor: string;
    downBodyColor: string;
    downBorderColor: string;
    upVolumeColor: string;
    downVolumeColor: string;
    baseTokenAddress: string;
    poolPriceNonDisplay: number | undefined;
    selectedDate: Date | undefined;
    setSelectedDate: Dispatch<Date | undefined>;
    activeTimeFrame: string;
    setActiveTimeFrame: Dispatch<SetStateAction<string>>;
    TradeSettingsColor: JSX.Element;
}

export interface CandleChartData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    date: any;
    open: number;
    high: number;
    low: number;
    close: number;
    time: number;
    allSwaps: unknown;
    color: string;
    stroke: string;
}

export interface TvlChartData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    time: any;
    value: number;
}

export interface VolumeChartData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    time: any;
    value: number;
    color: string;
}
export interface FeeChartData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    time: any;
    value: number;
}
export interface LiquidityData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeLiq: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    liqPrices: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deltaAverageUSD: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cumAverageUSD: any;
}

export interface LiqSnap {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeLiq: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pinnedMaxPriceDisplayTruncated: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pinnedMinPriceDisplayTruncated: any;
}

// React functional component
export default function TradeCharts(props: TradeChartsPropsIF) {
    const {
        isUserLoggedIn,
        pool,
        // liquidityData,
        chainData,
        isTokenABase,
        poolPriceDisplay,
        fullScreenChart,
        setFullScreenChart,
        lastBlockNumber,
        chainId,
        addPoolToFaves,
        removePoolFromFaves,
        favePools,
        expandTradeTable,
        selectedDate,
        setSelectedDate,
        activeTimeFrame,
        setActiveTimeFrame,
        TradeSettingsColor,
    } = props;

    const dispatch = useAppDispatch();

    // allow a local environment variable to be defined in [app_repo]/.env.local to turn off connections to the cache server
    const isServerEnabled =
        process.env.REACT_APP_CACHE_SERVER_IS_ENABLED !== undefined
            ? process.env.REACT_APP_CACHE_SERVER_IS_ENABLED === 'true'
            : true;

    // ---------------------TRADE DATA CALCULATIONS------------------------

    const { tradeData } = useAppSelector((state) => state);
    const { poolIndex } = lookupChain(chainId);

    const [rescale, setRescale] = useState(true);
    const [latest, setLatest] = useState(false);
    const [showLatest, setShowLatest] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [reset, setReset] = useState(false);

    const setActivePeriod = (period: number) => {
        dispatch(setActiveChartPeriod(period));
    };
    const denomInBase = tradeData.isDenomBase;
    // const denomInTokenA = (denomInBase && isTokenABase) || (!denomInBase && !isTokenABase);
    // const tokenASymbol = tradeData.tokenA.symbol;
    // const tokenBSymbol = tradeData.tokenB.symbol;
    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    const truncatedPoolPrice =
        poolPriceDisplay === Infinity || poolPriceDisplay === 0
            ? '…'
            : poolPriceDisplay < 2
            ? poolPriceDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : poolPriceDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    // ---------------------END OF TRADE DATA CALCULATIONS------------------------

    // GRAPH SETTINGS CONTENT------------------------------------------------------
    const canvasRef = useRef(null);
    const downloadAsImage = () => {
        if (canvasRef.current) {
            printDomToImage(canvasRef.current);
        }
    };
    const saveImageContent = (
        <div className={styles.save_image_container}>
            <div className={styles.save_image_content} onClick={downloadAsImage}>
                <AiOutlineDownload />
                Save Chart Image
            </div>
            <div className={styles.save_image_content}>
                <AiOutlineCopy />
                Copy Chart Image
            </div>
            <div className={styles.save_image_content}>
                <AiOutlineLink />
                Copy link to the chart image
            </div>
            <div className={styles.save_image_content}>
                <HiOutlineExternalLink />
                Open image in new tab
            </div>
            <div className={styles.save_image_content}>
                <AiOutlineTwitter />
                Tweet chart image
            </div>
        </div>
    );
    // CHART SETTINGS------------------------------------------------------------
    // const [openSettingsTooltip, setOpenSettingsTooltip] = useState(false);
    const [showTvl, setShowTvl] = useState(false);
    const [showFeeRate, setShowFeeRate] = useState(false);
    const [showVolume, setShowVolume] = useState(true);

    const [liqMode, setLiqMode] = useState('Curve');

    const chartItemStates = { showFeeRate, showTvl, showVolume, liqMode };

    // END OF CHART SETTINGS------------------------------------------------------------

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
    const chartSettingsRef = useRef<HTMLDivElement>(null);

    const chartSettingsOutsideClickHandler = () => {
        setShowChartSettings(false);
    };
    UseOnClickOutside(chartSettingsRef, chartSettingsOutsideClickHandler);

    const exDataContent = (
        <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis, doloremque.</div>
    );
    const chartSettingsData = [
        { icon: '🍅', label: 'Tomato', content: exDataContent },
        { icon: '🥬', label: 'Lettuce', content: exDataContent },
        { icon: '🥕', label: 'Carrot', content: exDataContent },
        { icon: '🫐', label: 'Blueberries', content: exDataContent },
        { icon: '🥂 ', label: 'Colors', content: TradeSettingsColor },
    ];

    const [showChartSettings, setShowChartSettings] = useState(false);
    const [selectedChartSetting, setSelectedChartSetting] = useState(chartSettingsData[0]);
    const chartSettingNavs = (
        <ul className={styles.chart_settings_nav}>
            {chartSettingsData.map((item, idx) => (
                <li
                    key={idx}
                    className={
                        item.label === selectedChartSetting.label
                            ? styles.setting_active
                            : styles.setting
                    }
                    onClick={() => setSelectedChartSetting(item)}
                >
                    <IconWithTooltip title={item.label} placement='left'>
                        {item.icon}
                    </IconWithTooltip>
                </li>
            ))}
        </ul>
    );
    // useEffect(() => {
    //     const currentTabData = chartSettingsData.find(
    //         (item) => item.label === selectedChartSetting.label,
    //     );
    //     if (currentTabData) setSelectedChartSetting(currentTabData);
    // }, [chartSettingsData]);
    const mainChartSettingsContent = (
        <div
            // ref={chartSettingsRef}
            className={`${styles.main_settings_container} ${
                showChartSettings && styles.main_settings_container_active
            }`}
        >
            <header>
                <p />
                <h2>Chart Settings</h2>
                <div onClick={() => setShowChartSettings(false)}>
                    <VscClose size={24} />
                </div>
            </header>
            <div className={styles.chart_settings_inner}>
                {chartSettingNavs}
                <section className={styles.main_chart_settings_content}>
                    <h1>{selectedChartSetting.label}</h1>
                    {selectedChartSetting.content}
                </section>
            </div>
        </div>
    );
    const graphSettingsContent = (
        <div className={styles.graph_settings_container}>
            <div onClick={() => setFullScreenChart(!fullScreenChart)}>
                <AiOutlineFullscreen size={20} />
            </div>
            <DefaultTooltip interactive title={saveImageContent}>
                <div>
                    <AiOutlineCamera size={20} />
                </div>
            </DefaultTooltip>
            <div onClick={() => setShowChartSettings(!showChartSettings)}>
                <AiOutlineSetting size={20} />
            </div>
        </div>
    );

    // END OF GRAPH SETTINGS CONTENT------------------------------------------------------

    const [poolPriceChangePercent, setPoolPriceChangePercent] = useState<string | undefined>();
    const [isPoolPriceChangePositive, setIsPoolPriceChangePositive] = useState<boolean>(true);

    // const [poolTvl, setPoolTvl] = useState<string | undefined>();
    // const [tvlAtTick, setTvlAtTick] = useState<string | undefined>();

    const baseTokenAddress = isTokenABase ? tokenAAddress : tokenBAddress;
    const quoteTokenAddress = isTokenABase ? tokenBAddress : tokenAAddress;

    useEffect(() => {
        (async () => {
            if (isServerEnabled && tokenAAddress && tokenBAddress) {
                try {
                    const priceChangeResult = await get24hChange(
                        chainId,
                        baseTokenAddress,
                        quoteTokenAddress,
                        poolIndex,
                        denomInBase,
                    );

                    if (priceChangeResult > -0.01 && priceChangeResult < 0.01) {
                        setPoolPriceChangePercent('No Change');
                    } else if (priceChangeResult) {
                        priceChangeResult > 0
                            ? setIsPoolPriceChangePositive(true)
                            : setIsPoolPriceChangePositive(false);

                        const priceChangeString =
                            priceChangeResult > 0
                                ? '+' +
                                  priceChangeResult.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }) +
                                  '%'
                                : priceChangeResult.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }) + '%';
                        setPoolPriceChangePercent(priceChangeString);
                    } else {
                        setPoolPriceChangePercent(undefined);
                    }
                } catch (error) {
                    setPoolPriceChangePercent(undefined);
                }
            }
        })();
    }, [isServerEnabled, denomInBase, baseTokenAddress, quoteTokenAddress, lastBlockNumber]);

    // useEffect(() => {
    //     (async () => {
    //         if (isServerEnabled && tokenAAddress && tokenBAddress) {
    //             try {
    //                 const poolTvlResult = await getPoolTVL(
    //                     baseTokenAddress,
    //                     quoteTokenAddress,
    //                     poolIndex,
    //                     chainId,
    //                 );

    //                 if (poolTvlResult) {
    //                     const tvlString = poolTvlResult
    //                         ? '$' + formatAmountOld(poolTvlResult)
    //                         : undefined;

    //                     setPoolTvl(tvlString);
    //                 } else {
    //                     setPoolTvl(undefined);
    //                 }
    //             } catch (error) {
    //                 setPoolTvl(undefined);
    //             }
    //         }
    //     })();
    // }, [isServerEnabled, baseTokenAddress, quoteTokenAddress, Math.floor(lastBlockNumber / 4)]);

    // useEffect(() => {
    //     if (liquidityData) {
    //         const currentTick = liquidityData?.currentTick;
    //         const currentRangeData = liquidityData.ranges.filter(
    //             (range) => range.lowerBound === currentTick,
    //         );
    //         const currentTickAverageUSD = currentRangeData[0]?.deltaAverageUSD;
    //         const currentTickAverageUSDString = currentTickAverageUSD
    //             ? '$' + formatAmountOld(currentTickAverageUSD)
    //             : undefined;
    //         setTvlAtTick(currentTickAverageUSDString);
    //     }
    // }, [liquidityData?.currentTick]);

    // ---------------------------ACTIVE OVERLAY BUTTON FUNCTIONALITY-------------------------------

    // this could be simplify into 1 reusable function but I figured we might have to do some other calculations for each of these so I am sepearing it for now. -Jr
    const handleVolumeToggle = () => setShowVolume(!showVolume);

    const handleTvlToggle = () => setShowTvl(!showTvl);
    const handleFeeRateToggle = () => setShowFeeRate(!showFeeRate);

    const handleLiqToggle = (mode: string) =>
        setLiqMode(() => {
            return mode;
        });

    // const exampleAction = () => console.log('example');

    const chartOverlayButtonData1 = [
        { name: 'Volume', selected: showVolume, action: handleVolumeToggle },
        { name: 'TVL', selected: showTvl, action: handleTvlToggle },
        { name: 'Fee Rate', selected: showFeeRate, action: handleFeeRateToggle },
    ];

    const chartOverlayButtonData2 = [
        { name: 'Off', action: () => handleLiqToggle('Off') },
        { name: 'Curve', action: () => handleLiqToggle('Curve') },
        { name: 'Depth', action: () => handleLiqToggle('Depth') },
    ];

    const chartOverlayButtons1 = chartOverlayButtonData1.map((button, idx) => (
        <div className={styles.settings_container} key={idx}>
            <button
                onClick={button.action}
                className={
                    button.selected
                        ? styles.active_selected_button
                        : styles.non_active_selected_button
                }
            >
                {button.name}
            </button>
        </div>
    ));

    const chartOverlayButtons2 = chartOverlayButtonData2.map((button, idx) => (
        <div className={styles.settings_container} key={idx}>
            <button
                onClick={button.action}
                className={
                    button.name.toLowerCase() === liqMode.toLowerCase()
                        ? styles.active_selected_button
                        : styles.non_active_selected_button
                }
            >
                {button.name}
            </button>
        </div>
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
                        transition={spring}
                    />
                )}
            </button>
        </motion.div>
    ));

    // --------------------------- END OF TIME FRAME BUTTON FUNCTIONALITY-------------------------------

    // --------------------------- LIQUIDITY TYPE BUTTON FUNCTIONALITY-------------------------------
    // const liquidityTypeData = [{ label: 'Depth' }, { label: 'Curve' }];
    // const [liquidityType, setLiquidityType] = useState('depth');

    // function handleLiquidityTypeButtonClick(label: string) {
    //     setLiquidityType(label.toLowerCase());
    // }

    // const liquidityTypeDisplay = liquidityTypeData.map((type, idx) => (
    //     <motion.div
    //         initial={{ y: 10, opacity: 0 }}
    //         animate={{ y: 0, opacity: 1 }}
    //         exit={{ y: -10, opacity: 0 }}
    //         transition={{ duration: 0.2 }}
    //         className={`${styles.settings_container} `}
    //         key={idx}
    //     >
    //         <button
    //             onClick={() => handleLiquidityTypeButtonClick(type.label)}
    //             className={
    //                 type.label.toLowerCase() === liquidityType
    //                     ? styles.active_button2
    //                     : styles.non_active_button2
    //             }
    //         >
    //             {type.label}

    //             {type.label.toLowerCase() === liquidityType && (
    //                 <motion.div
    //                     layoutId='outline'
    //                     className={styles.outline}
    //                     initial={false}
    //                     transition={spring}
    //                 />
    //             )}
    //         </button>
    //     </motion.div>
    // ));
    // eslint-disable-next-line
    // const liquidityTypeContent = (
    //     <div className={styles.liquidity_type_container}>
    //         <div />
    //         <div className={styles.liquidity_type_content}>
    //             <span>Liquidity Type</span>

    //             {liquidityTypeDisplay}
    //         </div>
    //     </div>
    // );
    // --------------------------- END OF LIQUIDITY TYPE BUTTON FUNCTIONALITY-------------------------------
    // TOKEN INFO----------------------------------------------------------------

    // console.log({ favePools });
    const currentPoolData = {
        base: tradeData.baseToken,
        quote: tradeData.quoteToken,
        chainId: chainId,
        poolId: 36000,
    };

    const isButtonFavorited = favePools?.some(
        (pool: PoolIF) =>
            pool.base.address === currentPoolData.base.address &&
            pool.quote.address === currentPoolData.quote.address &&
            pool.poolId === currentPoolData.poolId &&
            pool.chainId.toString() === currentPoolData.chainId.toString(),
    );

    const handleFavButton = () =>
        isButtonFavorited
            ? removePoolFromFaves(tradeData.baseToken, tradeData.quoteToken, chainId, 36000)
            : addPoolToFaves(tradeData.quoteToken, tradeData.baseToken, chainId, 36000);

    const favButton = (
        <button className={styles.favorite_button} onClick={handleFavButton}>
            {isButtonFavorited ? <BsHeartFill color='#cdc1ff' size={22} /> : <BsHeart size={22} />}
        </button>
    );

    const topTokenLogo = denomInBase ? tradeData.baseToken.logoURI : tradeData.quoteToken.logoURI;
    const bottomTokenLogo = denomInBase
        ? tradeData.quoteToken.logoURI
        : tradeData.baseToken.logoURI;

    const topTokenSymbol = denomInBase ? tradeData.baseToken.symbol : tradeData.quoteToken.symbol;
    const bottomTokenSymbol = denomInBase
        ? tradeData.quoteToken.symbol
        : tradeData.baseToken.symbol;

    // TIME FRAME CONTENT--------------------------------------------------------------

    const currencyCharacter = denomInBase
        ? // denom in a, return token b character
          getUnicodeCharacter(tradeData.quoteToken.symbol)
        : // denom in b, return token a character
          getUnicodeCharacter(tradeData.baseToken.symbol);

    // ------------MIDDLE TOP HEADER OF TRADE CHARTS
    const currentAmountDisplay = (
        <span className={styles.amount}>
            {poolPriceDisplay === Infinity || poolPriceDisplay === 0
                ? '…'
                : `${currencyCharacter}${truncatedPoolPrice}`}
        </span>
    );

    const poolPriceChange = (
        <NoColorTooltip
            title={'24 hour price change'}
            interactive
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <span
            // className={
            //     isPoolPriceChangePositive ? styles.change_positive : styles.change_negative
            // }
            >
                {poolPriceChangePercent === undefined ? '…' : poolPriceChangePercent}
                {/* {poolPriceChangePercent === undefined ? '…' : poolPriceChangePercent + ' | 24h'} */}
            </span>
        </NoColorTooltip>
    );

    const tvlDisplay = <p className={styles.tvl_display}></p>;
    // const tvlDisplay = <p className={styles.tvl_display}>Total Liquidity: {poolTvl || '...'}</p>;
    // const tvlTickDisplay = <p className={styles.tvl_display}></p>;
    // const tvlTickDisplay = (
    //     <p className={styles.tvl_display}>Liquidity at Tick: {tvlAtTick || '...'}</p>
    // );

    // ------------  END OF MIDDLE TOP HEADER OF TRADE CHARTS

    const amountWithTooltipGreen = (
        <GreenTextTooltip
            interactive
            title={poolPriceChange}
            placement={'right'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            {currentAmountDisplay}
        </GreenTextTooltip>
    );

    const amountWithTooltipRed = (
        <RedTextTooltip
            interactive
            title={poolPriceChange}
            placement={'right'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            {currentAmountDisplay}
        </RedTextTooltip>
    );

    const tokenInfo = (
        <div className={styles.token_info_container}>
            <div className={styles.tokens_info}>
                {favButton}

                <DefaultTooltip
                    interactive
                    title={`${
                        tradeData.baseToken.symbol !== 'ETH' ? tradeData.baseToken.symbol + ':' : ''
                    } ${tradeData.baseToken.symbol !== 'ETH' ? tradeData.baseToken.address : ''} ${
                        tradeData.quoteToken.symbol
                    }: ${tradeData.quoteToken.address}`}
                    placement={'top'}
                >
                    <div
                        className={styles.tokens_images}
                        onClick={() => dispatch(toggleDidUserFlipDenom())}
                    >
                        {topTokenLogo ? (
                            <img src={topTokenLogo} alt={topTokenSymbol} />
                        ) : (
                            <NoTokenIcon tokenInitial={topTokenSymbol.charAt(0)} width='25px' />
                        )}
                        {bottomTokenLogo ? (
                            <img src={bottomTokenLogo} alt={bottomTokenSymbol} />
                        ) : (
                            <NoTokenIcon tokenInitial={bottomTokenSymbol.charAt(0)} width='25px' />
                        )}
                    </div>
                </DefaultTooltip>
                <DefaultTooltip
                    interactive
                    title={`${
                        tradeData.baseToken.symbol !== 'ETH' ? tradeData.baseToken.symbol + ':' : ''
                    } ${tradeData.baseToken.symbol !== 'ETH' ? tradeData.baseToken.address : ''} ${
                        tradeData.quoteToken.symbol
                    }: ${tradeData.quoteToken.address}`}
                    placement={'top'}
                >
                    <div
                        className={styles.tokens_name}
                        onClick={() => dispatch(toggleDidUserFlipDenom())}
                    >
                        {topTokenSymbol} / {bottomTokenSymbol}
                        {/* {denomInBase ? tradeData.baseToken.symbol : tradeData.quoteToken.symbol} /{' '} */}
                        {/* {denomInBase ? tradeData.quoteToken.symbol : tradeData.baseToken.symbol} */}
                    </div>
                </DefaultTooltip>

                {isPoolPriceChangePositive ? amountWithTooltipGreen : amountWithTooltipRed}
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',

                    gap: '8px',
                }}
            >
                <div>{tvlDisplay}</div>
            </div>
            <div>{graphSettingsContent}</div>

            {/* {tvlTickDisplay} */}
            {/* <div className={styles.chart_overlay_container}>{chartOverlayButtons1}</div>
            <div className={styles.chart_overlay_container}>{chartOverlayButtons2}</div> */}
        </div>
    );
    // END OF TOKEN INFO----------------------------------------------------------------

    // console.log({ poolPriceChangePercent });
    const timeFrameContent = (
        <div className={styles.time_frame_container}>
            <div className={styles.chart_overlay_container}>{activeTimeFrameDisplay}</div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                className={styles.chart_overlay_container}
            >
                {chartOverlayButtons1}
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'end',
                    alignItems: 'end',
                }}
                className={styles.chart_overlay_container}
            >
                {chartOverlayButtons2}
            </div>
        </div>
    );

    // END OF TIME FRAME CONTENT--------------------------------------------------------------

    // CURRENT DATA INFO----------------------------------------------------------------
    const [currentData, setCurrentData] = useState<CandleChartData | undefined>();
    const [currentVolumeData, setCurrentVolumeData] = useState<number | undefined>();

    function formattedCurrentData(data: number | undefined): string {
        if (data) {
            if (data > 2) {
                return data.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
            } else {
                return data.toPrecision(3);
            }
        }

        return '-';
    }

    const currentDataInfo = (
        <div className={styles.chart_tooltips}>
            {showTooltip ? (
                <div className={styles.current_data_info}>
                    {/* {denomInBase ? tradeData.baseToken.symbol : tradeData.quoteToken.symbol} /{' '}
            {denomInBase ? tradeData.quoteToken.symbol : tradeData.baseToken.symbol}·{' '}
            {activeTimeFrame} ·{' '} */}
                    {'O: ' +
                        formattedCurrentData(currentData?.open) +
                        ' H: ' +
                        formattedCurrentData(currentData?.high) +
                        ' L: ' +
                        formattedCurrentData(currentData?.low) +
                        ' C: ' +
                        formattedCurrentData(currentData?.close) +
                        ' V: ' +
                        formatDollarAmountAxis(currentVolumeData)}
                </div>
            ) : (
                <div className={styles.current_data_info}></div>
            )}

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'end',
                    alignItems: 'end',
                }}
                className={styles.chart_overlay_container}
            >
                {showLatest && (
                    <div className={styles.settings_container}>
                        <button
                            onClick={() => {
                                setLatest(true);
                            }}
                            style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                            }}
                            className={styles.non_active_selected_button}
                        >
                            LATEST
                        </button>
                    </div>
                )}

                <div className={styles.settings_container}>
                    <button
                        onClick={() => {
                            setReset(true);
                            setRescale(true);
                        }}
                        style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                        }}
                        className={styles.non_active_selected_button}
                    >
                        RESET
                    </button>
                </div>

                <div className={styles.settings_container}>
                    <button
                        onClick={() => {
                            setRescale((prevState) => {
                                return !prevState;
                            });
                        }}
                        style={{
                            color: rescale ? 'rgb(97, 100, 189)' : 'rgba(237, 231, 225, 0.2)',
                            fontSize: '12px',
                            fontWeight: 'bold',
                        }}
                        className={
                            rescale
                                ? styles.active_selected_button
                                : styles.non_active_selected_button
                        }
                    >
                        AUTO
                    </button>
                </div>
            </div>
        </div>
    );

    // END OF CURRENT DATA INFO--------------------------------------------------------------

    // CANDLE STICK DATA---------------------------------------------------
    // const chartData = usePoolChartData('0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8'); // ETH/USDC pool address

    // const formattedTvlData = useMemo(() => {
    //     if (chartData) {
    //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //         return chartData.map((day: any) => {
    //             return {
    //                 time: new Date(day.date * 1000),
    //                 value: day.totalValueLockedUSD,
    //             };
    //         });
    //     } else {
    //         return [];
    //     }
    // }, [chartData]);

    // const formattedVolumeData = useMemo(() => {
    //     if (chartData) {
    //         return chartData.map((day) => {
    //             return {
    //                 time: new Date(day.date * 1000),
    //                 value: day.volumeUSD,
    //             };
    //         });
    //     } else {
    //         return [];
    //     }
    // }, [chartData]);

    // const formattedFeesUSD = useMemo(() => {
    //     if (chartData) {
    //         return chartData.map((day) => {
    //             return {
    //                 time: new Date(day.date * 1000),
    //                 value: day.feesUSD,
    //             };
    //         });
    //     } else {
    //         return [];
    //     }
    // }, [chartData]);
    // END OF CANDLE STICK DATA---------------------------------------------------
    // This is a simple loading that last for 1 sec before displaying the graph. The graph is already in the dom by then. We will just positon this in front of it and then remove it after 1 sec.

    const expandGraphStyle = props.expandTradeTable ? styles.hide_graph : '';

    const [graphIsLoading, setGraphIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setGraphIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={styles.main_container_chart}
            style={{ padding: fullScreenChart ? '1rem' : '0' }}
            ref={canvasRef}
        >
            {mainChartSettingsContent}
            <div className={`${styles.graph_style} ${expandGraphStyle}  `}>
                {/* {graphSettingsContent} */}
                {tokenInfo}
                {timeFrameContent}
                {currentDataInfo}
                {/* {liquidityTypeContent} */}
            </div>
            {graphIsLoading ? (
                <TradeChartsLoading />
            ) : (
                <div style={{ width: '100%', height: '100%', zIndex: '2' }}>
                    <TradeCandleStickChart
                        isUserLoggedIn={isUserLoggedIn}
                        pool={pool}
                        chainData={chainData}
                        // tvlData={formattedTvlData}
                        expandTradeTable={expandTradeTable}
                        // volumeData={formattedVolumeData}
                        // feeData={formattedFeesUSD}
                        candleData={props.candleData}
                        changeState={props.changeState}
                        chartItemStates={chartItemStates}
                        limitTick={props.limitTick}
                        liquidityData={props.liquidityData}
                        isAdvancedModeActive={props.isAdvancedModeActive}
                        simpleRangeWidth={props.simpleRangeWidth}
                        pinnedMinPriceDisplayTruncated={props.pinnedMinPriceDisplayTruncated}
                        pinnedMaxPriceDisplayTruncated={props.pinnedMaxPriceDisplayTruncated}
                        poolPriceDisplay={poolPriceDisplay}
                        truncatedPoolPrice={parseFloat(truncatedPoolPrice)}
                        setCurrentData={setCurrentData}
                        setCurrentVolumeData={setCurrentVolumeData}
                        upBodyColor={props.upBodyColor}
                        upBorderColor={props.upBorderColor}
                        downBodyColor={props.downBodyColor}
                        downBorderColor={props.downBorderColor}
                        upVolumeColor={props.upVolumeColor}
                        downVolumeColor={props.downVolumeColor}
                        baseTokenAddress={props.baseTokenAddress}
                        chainId={chainId}
                        poolPriceNonDisplay={props.poolPriceNonDisplay}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        rescale={rescale}
                        setRescale={setRescale}
                        latest={latest}
                        setLatest={setLatest}
                        reset={reset}
                        setReset={setReset}
                        showLatest={showLatest}
                        setShowLatest={setShowLatest}
                        activeTimeFrame={activeTimeFrame}
                        setShowTooltip={setShowTooltip}
                    />
                </div>
            )}
        </div>
    );
}

const spring = {
    type: 'spring',
    stiffness: 500,
    damping: 30,
};
