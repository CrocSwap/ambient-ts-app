// START: Import React and Dongles
import { Dispatch, SetStateAction, useState, useEffect, useRef } from 'react';
import {
    AiOutlineCamera,
    AiOutlineFullscreen,
    AiOutlineDownload,
} from 'react-icons/ai';
import { VscClose } from 'react-icons/vsc';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

// START: Import JSX Components
import { DefaultTooltip } from '../../../components/Global/StyledTooltip/StyledTooltip';

// START: Import Local Files
import styles from './TradeCharts.module.css';
import printDomToImage from '../../../utils/functions/printDomToImage';

import {
    candleDomain,
    setActiveChartPeriod,
} from '../../../utils/state/tradeDataSlice';
import {
    CandleData,
    CandlesByPoolAndDuration,
    LiquidityData,
} from '../../../utils/state/graphDataSlice';
import {
    useAppSelector,
    useAppDispatch,
} from '../../../utils/hooks/reduxToolkit';
import TradeCandleStickChart from './TradeCandleStickChart';
import { get24hChange } from '../../../App/functions/getPoolStats';
import TradeChartsLoading from './TradeChartsLoading/TradeChartsLoading';
import { ChainSpec, CrocPoolView } from '@crocswap-libs/sdk';
import IconWithTooltip from '../../../components/Global/IconWithTooltip/IconWithTooltip';
// import { formatAmountOld } from '../../../utils/numbers';
import UseOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import TradeChartsTokenInfo from './TradeChartsComponents/TradeChartsTokenInfo';
import TimeFrame from './TradeChartsComponents/TimeFrame';
import VolumeTVLFee from './TradeChartsComponents/VolumeTVLFee';
import CurveDepth from './TradeChartsComponents/CurveDepth';
import CurrentDataInfo from './TradeChartsComponents/CurrentDataInfo';
import { useLocation } from 'react-router-dom';
import TutorialOverlay from '../../../components/Global/TutorialOverlay/TutorialOverlay';
import { tradeChartTutorialSteps } from '../../../utils/tutorial/TradeChart';
import { favePoolsMethodsIF } from '../../../App/hooks/useFavePools';
import { chartSettingsMethodsIF } from '../../../App/hooks/useChartSettings';

// interface for React functional component props
interface propsIF {
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
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    candleData: CandlesByPoolAndDuration | undefined;
    limitTick: number | undefined;
    favePools: favePoolsMethodsIF;
    liquidityData: LiquidityData;
    isAdvancedModeActive: boolean | undefined;
    simpleRangeWidth: number | undefined;
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

    poolPriceChangePercent: string | undefined;

    setPoolPriceChangePercent: Dispatch<SetStateAction<string | undefined>>;
    isPoolPriceChangePositive: boolean;

    setIsPoolPriceChangePositive: Dispatch<SetStateAction<boolean>>;
    handlePulseAnimation: (type: string) => void;
    fetchingCandle: boolean;
    setFetchingCandle: React.Dispatch<React.SetStateAction<boolean>>;
    minPrice: number;
    maxPrice: number;
    setMaxPrice: Dispatch<SetStateAction<number>>;
    setMinPrice: Dispatch<SetStateAction<number>>;
    rescaleRangeBoundariesWithSlider: boolean;
    setRescaleRangeBoundariesWithSlider: React.Dispatch<
        React.SetStateAction<boolean>
    >;
    showSidebar: boolean;

    isTutorialMode: boolean;
    setIsTutorialMode: Dispatch<SetStateAction<boolean>>;
    setCandleDomains: React.Dispatch<React.SetStateAction<candleDomain>>;
    chartSettings: chartSettingsMethodsIF;
    setSimpleRangeWidth: React.Dispatch<React.SetStateAction<number>>;
    setRepositionRangeWidth: React.Dispatch<React.SetStateAction<number>>;
    repositionRangeWidth: number;
    setChartTriggeredBy: React.Dispatch<React.SetStateAction<string>>;
    chartTriggeredBy: string;
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
export interface LiquidityDataLocal {
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
export default function TradeCharts(props: propsIF) {
    const {
        isUserLoggedIn,
        pool,
        chainData,
        isTokenABase,
        poolPriceDisplay,
        fullScreenChart,
        setFullScreenChart,
        lastBlockNumber,
        chainId,
        favePools,
        expandTradeTable,
        selectedDate,
        setSelectedDate,
        activeTimeFrame,
        setActiveTimeFrame,
        TradeSettingsColor,
        poolPriceChangePercent,
        setPoolPriceChangePercent,
        isPoolPriceChangePositive,
        setIsPoolPriceChangePositive,
        handlePulseAnimation,
        fetchingCandle,
        setFetchingCandle,
        minPrice,
        maxPrice,
        setMaxPrice,
        setMinPrice,
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
        showSidebar,
        setCandleDomains,
        setSimpleRangeWidth,
        chartSettings,
        setChartTriggeredBy,
        chartTriggeredBy,
    } = props;

    // console.log('rendering TradeCharts.tsx');

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
            <div
                className={styles.save_image_content}
                onClick={downloadAsImage}
            >
                <AiOutlineDownload />
                Save Chart Image
            </div>
            {/* <div className={styles.save_image_content}>
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
            </div> */}
        </div>
    );
    // CHART SETTINGS------------------------------------------------------------
    // const [openSettingsTooltip, setOpenSettingsTooltip] = useState(false);
    const [showTvl, setShowTvl] = useState(chartSettings.tvlSubchart.isEnabled);
    const [showFeeRate, setShowFeeRate] = useState(
        chartSettings.feeRateSubchart.isEnabled,
    );
    const [showVolume, setShowVolume] = useState(
        chartSettings.volumeSubchart.isEnabled,
    );

    const [liqMode, setLiqMode] = useState('Curve'); // TODO: switch default back to depth once depth mode is fixed

    const path = useLocation().pathname;

    const isMarketOrLimitModule =
        path.includes('market') || path.includes('limit');

    useEffect(() => {
        if (isMarketOrLimitModule) {
            // setLiqMode('Depth'); // TODO: the following code will be uncommented once depth mode is fixed
        } else {
            setLiqMode('Curve');
        }
    }, [isMarketOrLimitModule]);

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
        <div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Perferendis, doloremque.
        </div>
    );
    const chartSettingsData = [
        { icon: '🍅', label: 'Tomato', content: exDataContent },
        { icon: '🥬', label: 'Lettuce', content: exDataContent },
        { icon: '🥕', label: 'Carrot', content: exDataContent },
        { icon: '🫐', label: 'Blueberries', content: exDataContent },
        { icon: '🥂 ', label: 'Colors', content: TradeSettingsColor },
    ];

    const [showChartSettings, setShowChartSettings] = useState(false);
    const [selectedChartSetting, setSelectedChartSetting] = useState(
        chartSettingsData[0],
    );
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
            <div
                onClick={() => setFullScreenChart(!fullScreenChart)}
                id='trade_chart_full_screen_button'
            >
                <AiOutlineFullscreen size={20} />
            </div>
            <DefaultTooltip interactive title={saveImageContent}>
                <div id='trade_chart_save_image'>
                    <AiOutlineCamera size={20} />
                </div>
            </DefaultTooltip>
        </div>
    );

    // END OF GRAPH SETTINGS CONTENT------------------------------------------------------

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
    }, [
        isServerEnabled,
        denomInBase,
        baseTokenAddress,
        quoteTokenAddress,
        lastBlockNumber,
    ]);

    // console.log({ poolPriceChangePercent });
    const timeFrameContent = (
        <div className={styles.time_frame_container}>
            <div
                className={styles.chart_overlay_container}
                id='trade_charts_time_frame'
            >
                <TimeFrame
                    activeTimeFrame={activeTimeFrame}
                    setActiveTimeFrame={setActiveTimeFrame}
                    setActivePeriod={setActivePeriod}
                />
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                id='trade_charts_volume_tvl'
            >
                <VolumeTVLFee
                    setShowVolume={setShowVolume}
                    setShowTvl={setShowTvl}
                    setShowFeeRate={setShowFeeRate}
                    showVolume={showVolume}
                    showTvl={showTvl}
                    showFeeRate={showFeeRate}
                    chartSettings={chartSettings}
                />
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'end',
                    alignItems: 'end',
                }}
                id='trade_charts_curve_depth'
            >
                <CurveDepth setLiqMode={setLiqMode} liqMode={liqMode} />
            </div>
        </div>
    );

    // END OF TIME FRAME CONTENT--------------------------------------------------------------

    // CURRENT DATA INFO----------------------------------------------------------------
    const [currentData, setCurrentData] = useState<
        CandleChartData | undefined
    >();
    const [currentVolumeData, setCurrentVolumeData] = useState<
        number | undefined
    >();

    const tvlDisplay = <p className={styles.tvl_display}></p>;

    const tokenInfo = (
        <div className={styles.token_info_container}>
            <TradeChartsTokenInfo
                isPoolPriceChangePositive={isPoolPriceChangePositive}
                poolPriceDisplay={poolPriceDisplay}
                poolPriceChangePercent={poolPriceChangePercent}
                setPoolPriceChangePercent={setPoolPriceChangePercent}
                favePools={favePools}
                chainId={chainId}
            />
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
        </div>
    );
    // END OF TOKEN INFO----------------------------------------------------------------

    const expandGraphStyle = props.expandTradeTable ? styles.hide_graph : '';

    const [graphIsLoading, setGraphIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setGraphIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const [isTutorialEnabled, setIsTutorialEnabled] = useState(false);

    return (
        <div
            className={styles.main_container_chart}
            style={{
                padding: fullScreenChart ? '1rem' : '0',
                background: fullScreenChart ? 'var(--dark2)' : '',
            }}
            ref={canvasRef}
        >
            {mainChartSettingsContent}
            <div className={`${styles.graph_style} ${expandGraphStyle}  `}>
                {props.isTutorialMode && (
                    <div className={styles.tutorial_button_container}>
                        <button
                            className={styles.tutorial_button}
                            onClick={() => setIsTutorialEnabled(true)}
                        >
                            Tutorial Mode
                        </button>
                    </div>
                )}
                {tokenInfo}
                {timeFrameContent}

                <CurrentDataInfo
                    showTooltip={showTooltip}
                    currentData={currentData}
                    currentVolumeData={currentVolumeData}
                    showLatest={showLatest}
                    setLatest={setLatest}
                    setReset={setReset}
                    setRescale={setRescale}
                    rescale={rescale}
                    reset={reset}
                />
            </div>
            {graphIsLoading ? (
                <TradeChartsLoading />
            ) : (
                <div style={{ width: '100%', height: '100%', zIndex: '2' }}>
                    <TradeCandleStickChart
                        isUserLoggedIn={isUserLoggedIn}
                        pool={pool}
                        chainData={chainData}
                        expandTradeTable={expandTradeTable}
                        candleData={props.candleData}
                        changeState={props.changeState}
                        chartItemStates={chartItemStates}
                        limitTick={props.limitTick}
                        liquidityData={props.liquidityData}
                        isAdvancedModeActive={props.isAdvancedModeActive}
                        simpleRangeWidth={props.simpleRangeWidth}
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
                        handlePulseAnimation={handlePulseAnimation}
                        fetchingCandle={fetchingCandle}
                        setFetchingCandle={setFetchingCandle}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        setMaxPrice={setMaxPrice}
                        setMinPrice={setMinPrice}
                        rescaleRangeBoundariesWithSlider={
                            rescaleRangeBoundariesWithSlider
                        }
                        setRescaleRangeBoundariesWithSlider={
                            setRescaleRangeBoundariesWithSlider
                        }
                        showSidebar={showSidebar}
                        setCandleDomains={setCandleDomains}
                        setSimpleRangeWidth={setSimpleRangeWidth}
                        setRepositionRangeWidth={props.setRepositionRangeWidth}
                        repositionRangeWidth={props.repositionRangeWidth}
                        setChartTriggeredBy={setChartTriggeredBy}
                        chartTriggeredBy={chartTriggeredBy}
                    />
                </div>
            )}
            <TutorialOverlay
                isTutorialEnabled={isTutorialEnabled}
                setIsTutorialEnabled={setIsTutorialEnabled}
                steps={tradeChartTutorialSteps}
            />
        </div>
    );
}
