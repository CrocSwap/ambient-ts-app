// START: Import React and Dongles
import { Dispatch, useState, useEffect, useRef, useContext, memo } from 'react';
import {
    AiOutlineCamera,
    AiOutlineFullscreen,
    AiOutlineDownload,
} from 'react-icons/ai';

// START: Import JSX Components
import { DefaultTooltip } from '../../../components/Global/StyledTooltip/StyledTooltip';

// START: Import Local Files
import styles from './TradeCharts.module.css';
import printDomToImage from '../../../utils/functions/printDomToImage';

import { CandleData, LiquidityData } from '../../../utils/state/graphDataSlice';
import TradeCandleStickChart from './TradeCandleStickChart';
import TradeChartsLoading from './TradeChartsLoading/TradeChartsLoading';
import TradeChartsTokenInfo from './TradeChartsComponents/TradeChartsTokenInfo';
import TimeFrame from './TradeChartsComponents/TimeFrame';
import VolumeTVLFee from './TradeChartsComponents/VolumeTVLFee';
import CurveDepth from './TradeChartsComponents/CurveDepth';
import CurrentDataInfo from './TradeChartsComponents/CurrentDataInfo';
import { useLocation } from 'react-router-dom';
import TutorialOverlay from '../../../components/Global/TutorialOverlay/TutorialOverlay';
import { tradeChartTutorialSteps } from '../../../utils/tutorial/TradeChart';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { ChartContext } from '../../../contexts/ChartContext';
import { TradeTableContext } from '../../../contexts/TradeTableContext';

// interface for React functional component props
interface propsIF {
    isTokenABase: boolean;
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    limitTick: number | undefined;
    liquidityData?: LiquidityData;
    isAdvancedModeActive: boolean | undefined;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    poolPriceNonDisplay: number | undefined;
    selectedDate: Date | undefined;
    setSelectedDate: Dispatch<Date | undefined>;
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
    volume: number;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upperBound: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lowerBound: any;
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
function TradeCharts(props: propsIF) {
    const { selectedDate, setSelectedDate } = props;

    const {
        tutorial: { isActive: isTutorialActive },
    } = useContext(AppStateContext);
    const {
        chartSettings,
        isFullScreen: isChartFullScreen,
        setIsFullScreen: setIsChartFullScreen,
    } = useContext(ChartContext);
    const { expandTradeTable } = useContext(TradeTableContext);

    const { pathname } = useLocation();

    const isMarketOrLimitModule =
        pathname.includes('market') || pathname.includes('limit');

    // allow a local environment variable to be defined in [app_repo]/.env.local to turn off connections to the cache server

    // ---------------------TRADE DATA CALCULATIONS------------------------

    const [rescale, setRescale] = useState(true);
    const [latest, setLatest] = useState(false);
    const [showLatest, setShowLatest] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [reset, setReset] = useState(false);

    // ---------------------END OF TRADE DATA CALCULATIONS------------------------

    // GRAPH SETTINGS CONTENT------------------------------------------------------
    const canvasRef = useRef(null);
    const downloadAsImage = () => {
        if (canvasRef.current) {
            printDomToImage(canvasRef.current);
        }
    };

    // CHART SETTINGS------------------------------------------------------------
    // const [openSettingsTooltip, setOpenSettingsTooltip] = useState(false);
    const [showTvl, setShowTvl] = useState(chartSettings.tvlSubchart.isEnabled);
    const [showFeeRate, setShowFeeRate] = useState(
        chartSettings.feeRateSubchart.isEnabled,
    );
    const [showVolume, setShowVolume] = useState(
        chartSettings.volumeSubchart.isEnabled,
    );

    const chartItemStates = {
        showFeeRate,
        showTvl,
        showVolume,
        liqMode: isMarketOrLimitModule
            ? chartSettings.marketOverlay.overlay
            : chartSettings.rangeOverlay.overlay,
    };

    // END OF CHART SETTINGS------------------------------------------------------------

    // eslint-disable-next-line
    function closeOnEscapeKeyDown(e: any) {
        if ((e.charCode || e.keyCode) === 27) setIsChartFullScreen(false);
    }

    useEffect(() => {
        document.body.addEventListener('keydown', closeOnEscapeKeyDown);
        return function cleanUp() {
            document.body.removeEventListener('keydown', closeOnEscapeKeyDown);
        };
    });

    const saveImageContent = (
        <div
            className={styles.save_image_content}
            onClick={downloadAsImage}
            role='button'
            tabIndex={0}
            aria-label='Download chart image button'
        >
            Save Chart Image
            <AiOutlineDownload />
        </div>
    );

    const graphSettingsContent = (
        <div className={styles.graph_settings_container}>
            <DefaultTooltip
                interactive
                title={
                    <div
                        className={styles.save_image_content}
                        onClick={() => setIsChartFullScreen(!isChartFullScreen)}
                    >
                        Toggle Full Screen Chart
                    </div>
                }
                enterDelay={500}
            >
                <button
                    onClick={() => setIsChartFullScreen(!isChartFullScreen)}
                    className={styles.fullscreen_button}
                >
                    <AiOutlineFullscreen
                        size={20}
                        id='trade_chart_full_screen_button'
                        role='button'
                        tabIndex={0}
                        aria-label='Full screen chart button'
                    />
                </button>
            </DefaultTooltip>
            <DefaultTooltip
                interactive
                title={saveImageContent}
                enterDelay={500}
            >
                <button
                    onClick={downloadAsImage}
                    className={styles.fullscreen_button}
                >
                    <AiOutlineCamera
                        size={20}
                        id='trade_chart_save_image'
                        role='button'
                        tabIndex={0}
                        aria-label='Save chart image button'
                    />
                </button>
            </DefaultTooltip>
        </div>
    );

    // END OF GRAPH SETTINGS CONTENT------------------------------------------------------

    // console.log({ poolPriceChangePercent });
    const timeFrameContent = (
        <div className={styles.time_frame_container}>
            <div
                className={styles.chart_overlay_container}
                id='trade_charts_time_frame'
            >
                <TimeFrame
                    candleTime={
                        isMarketOrLimitModule
                            ? chartSettings.candleTime.market
                            : chartSettings.candleTime.range
                    }
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
                <CurveDepth
                    overlayMethods={
                        isMarketOrLimitModule
                            ? chartSettings.marketOverlay
                            : chartSettings.rangeOverlay
                    }
                />
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
            <TradeChartsTokenInfo />
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

    const expandGraphStyle = expandTradeTable ? styles.hide_graph : '';

    const [graphIsLoading, setGraphIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setGraphIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const [isTutorialEnabled, setIsTutorialEnabled] = useState(false);

    return (
        // <FocusTrap
        //     focusTrapOptions={{
        //         clickOutsideDeactivates: true,
        //     }}
        // >
        <div
            className={styles.main_container_chart}
            style={{
                padding: isChartFullScreen ? '1rem' : '0',
                background: isChartFullScreen ? 'var(--dark2)' : '',
            }}
            ref={canvasRef}
        >
            <div className={`${styles.graph_style} ${expandGraphStyle}  `}>
                {isTutorialActive && (
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
                        changeState={props.changeState}
                        chartItemStates={chartItemStates}
                        limitTick={props.limitTick}
                        liquidityData={props.liquidityData}
                        isAdvancedModeActive={props.isAdvancedModeActive}
                        setCurrentData={setCurrentData}
                        setCurrentVolumeData={setCurrentVolumeData}
                        baseTokenAddress={props.baseTokenAddress}
                        quoteTokenAddress={props.quoteTokenAddress}
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
                        setShowTooltip={setShowTooltip}
                        isMarketOrLimitModule={isMarketOrLimitModule}
                    />
                </div>
            )}
            <TutorialOverlay
                isTutorialEnabled={isTutorialEnabled}
                setIsTutorialEnabled={setIsTutorialEnabled}
                steps={tradeChartTutorialSteps}
            />
        </div>
        // </FocusTrap>
    );
}

export default memo(TradeCharts);
