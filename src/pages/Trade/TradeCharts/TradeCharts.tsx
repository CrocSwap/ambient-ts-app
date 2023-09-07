// START: Import React and Dongles
import {
    Dispatch,
    useState,
    useEffect,
    useContext,
    memo,
    useMemo,
} from 'react';

// START: Import Local Files
import styles from './TradeCharts.module.css';
import TradeCandleStickChart from './TradeCandleStickChart';
import TimeFrame from './TradeChartsComponents/TimeFrame';
import VolumeTVLFee from './TradeChartsComponents/VolumeTVLFee';
import CurveDepth from './TradeChartsComponents/CurveDepth';
import CurrentDataInfo from './TradeChartsComponents/CurrentDataInfo';
import { useLocation } from 'react-router-dom';
import TutorialOverlay from '../../../components/Global/TutorialOverlay/TutorialOverlay';
import { tradeChartTutorialSteps } from '../../../utils/tutorial/TradeChart';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { ChartContext } from '../../../contexts/ChartContext';
import { LS_KEY_SUBCHART_SETTINGS } from '../../../constants';
import { getLocalStorageItem } from '../../../utils/functions/getLocalStorageItem';
import { CandleData } from '../../../App/functions/fetchCandleSeries';
import { TradeChartsHeader } from './TradeChartsHeader/TradeChartsHeader';

// interface for React functional component props
interface propsIF {
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    selectedDate: number | undefined;
    setSelectedDate: Dispatch<number | undefined>;
    setIsChartLoading: Dispatch<React.SetStateAction<boolean>>;
    isChartLoading: boolean;
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
        chartCanvasRef,
    } = useContext(ChartContext);

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

    function closeOnEscapeKeyDown(e: KeyboardEvent) {
        if (e.code === 'Escape') setIsChartFullScreen(false);
    }

    useEffect(() => {
        document.body.addEventListener('keydown', closeOnEscapeKeyDown);
        return function cleanUp() {
            document.body.removeEventListener('keydown', closeOnEscapeKeyDown);
        };
    });

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
    // END OF CURRENT DATA INFO----------------------------------------------------------------

    const [isTutorialEnabled, setIsTutorialEnabled] = useState(false);

    return (
        <div
            className={styles.main_container_chart}
            style={{
                padding: isChartFullScreen ? '1rem' : '0',
                background: isChartFullScreen ? 'var(--dark2)' : '',
            }}
            ref={chartCanvasRef}
        >
            <div className={`${styles.graph_style}`}>
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
                {isChartFullScreen && <TradeChartsHeader />}
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
                    isLoading={props.isChartLoading}
                    setIsLoading={props.setIsChartLoading}
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
