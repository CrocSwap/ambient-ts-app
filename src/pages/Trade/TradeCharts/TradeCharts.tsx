// START: Import React and Dongles
import {
    Dispatch,
    useState,
    useEffect,
    useRef,
    useContext,
    memo,
    useMemo,
} from 'react';
import { AiOutlineFullscreen } from 'react-icons/ai';
import { FiCopy } from 'react-icons/fi';

// START: Import JSX Components
import { DefaultTooltip } from '../../../components/Global/StyledTooltip/StyledTooltip';

// START: Import Local Files
import styles from './TradeCharts.module.css';
import printDomToImage from '../../../utils/functions/printDomToImage';

import TradeCandleStickChart from './TradeCandleStickChart';
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
import { LS_KEY_SUBCHART_SETTINGS } from '../../../constants';
import { getLocalStorageItem } from '../../../utils/functions/getLocalStorageItem';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { CandleData } from '../../../App/functions/fetchCandleSeries';

// interface for React functional component props
interface propsIF {
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    selectedDate: number | undefined;
    setSelectedDate: Dispatch<number | undefined>;
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
    const [, copy] = useCopyToClipboard();
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const copyChartToClipboard = async () => {
        if (canvasRef.current) {
            const blob = await printDomToImage(canvasRef.current, '#171d27');
            if (blob) {
                copy(blob);
                openSnackbar('Chart image copied to clipboard', 'info');
            }
        }
    };

    // CHART SETTINGS------------------------------------------------------------
    const subchartState: {
        isVolumeSubchartEnabled: boolean;
        isTvlSubchartEnabled: boolean;
        isFeeRateSubchartEnabled: boolean;
    } | null = JSON.parse(
        getLocalStorageItem(LS_KEY_SUBCHART_SETTINGS) ?? '{}',
    );

    const [showTvl, setShowTvl] = useState(
        subchartState?.isTvlSubchartEnabled ?? false,
    );
    const [showFeeRate, setShowFeeRate] = useState(
        subchartState?.isFeeRateSubchartEnabled ?? false,
    );
    const [showVolume, setShowVolume] = useState(
        subchartState?.isVolumeSubchartEnabled ?? true,
    );

    const chartItemStates = useMemo(() => {
        return {
            showFeeRate,
            showTvl,
            showVolume,
            liqMode: chartSettings.poolOverlay.overlay,
        };
    }, [
        isMarketOrLimitModule,
        chartSettings.poolOverlay,
        showTvl,
        showVolume,
        showFeeRate,
    ]);

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

    const graphSettingsContent = (
        <div className={styles.graph_settings_container}>
            <DefaultTooltip
                interactive
                title={'Toggle Full Screen Chart'}
                enterDelay={500}
            >
                <button
                    onClick={() => setIsChartFullScreen(!isChartFullScreen)}
                    className={styles.fullscreen_button}
                >
                    <AiOutlineFullscreen
                        size={20}
                        id='trade_chart_full_screen_button'
                        aria-label='Full screen chart button'
                    />
                </button>
            </DefaultTooltip>
            <DefaultTooltip
                interactive
                title={'Copy to Clipboard'}
                enterDelay={500}
            >
                <button
                    onClick={copyChartToClipboard}
                    className={styles.fullscreen_button}
                >
                    <FiCopy
                        size={20}
                        id='trade_chart_save_image'
                        aria-label='Copy chart image button'
                    />
                </button>
            </DefaultTooltip>
        </div>
    );

    // END OF GRAPH SETTINGS CONTENT------------------------------------------------------

    const timeFrameContent = (
        <div className={styles.time_frame_container}>
            <div
                className={styles.chart_overlay_container}
                id='trade_charts_time_frame'
            >
                <TimeFrame candleTime={chartSettings.candleTime.global} />
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
                <CurveDepth overlayMethods={chartSettings.poolOverlay} />
            </div>
        </div>
    );

    // END OF TIME FRAME CONTENT--------------------------------------------------------------

    // CURRENT DATA INFO----------------------------------------------------------------
    const [currentData, setCurrentData] = useState<CandleData | undefined>();
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

    const [isTutorialEnabled, setIsTutorialEnabled] = useState(false);

    return (
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
            <div style={{ width: '100%', height: '100%', zIndex: '2' }}>
                <TradeCandleStickChart
                    changeState={props.changeState}
                    chartItemStates={chartItemStates}
                    setCurrentData={setCurrentData}
                    setCurrentVolumeData={setCurrentVolumeData}
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
                />
            </div>
            <TutorialOverlay
                isTutorialEnabled={isTutorialEnabled}
                setIsTutorialEnabled={setIsTutorialEnabled}
                steps={tradeChartTutorialSteps}
            />
        </div>
    );
}

export default memo(TradeCharts);
