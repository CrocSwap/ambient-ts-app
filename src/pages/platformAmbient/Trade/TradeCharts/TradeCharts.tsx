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
import { useLocation } from 'react-router-dom';
import TutorialOverlay from '../../../../components/Global/TutorialOverlay/TutorialOverlay';
import { tradeChartTutorialSteps } from '../../../../utils/tutorial/TradeChart';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { ChartContext } from '../../../../contexts/ChartContext';
import {
    LS_KEY_ORDER_HISTORY_SETTINGS,
    LS_KEY_SUBCHART_SETTINGS,
} from '../../../../ambient-utils/constants';
import { getLocalStorageItem } from '../../../../ambient-utils/dataLayer';
import { CandleDataIF } from '../../../../ambient-utils/types';
import { TradeChartsHeader } from './TradeChartsHeader/TradeChartsHeader';
import { updatesIF } from '../../../../utils/hooks/useUrlParams';
import { FlexContainer } from '../../../../styled/Common';
import { MainContainer } from '../../../../styled/Components/Chart';
import { TutorialButton } from '../../../../styled/Components/Tutorial';
import OrderHistoryDisplay from './TradeChartsComponents/OrderHistoryDisplay';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import styles from './TradeCharts.module.css';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { BrandContext } from '../../../../contexts/BrandContext';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import TradeCandleStickChart from './TradeCandleStickChart';
import CurveDepth from './TradeChartsComponents/CurveDepth';
import TimeFrame from './TradeChartsComponents/TimeFrame';
import VolumeTVLFee from './TradeChartsComponents/VolumeTVLFee';
import Modal from '../../../../components/Global/Modal/Modal';
// interface for React functional component props
interface propsIF {
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleDataIF | undefined,
    ) => void;
    selectedDate: number | undefined;
    setSelectedDate: Dispatch<number | undefined>;
    updateURL: (changes: updatesIF) => void;
    isMobileSettingsModalOpen: boolean;
    openMobileSettingsModal: () => void;
    closeMobileSettingsModal: () => void;
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
    const {
        selectedDate,
        setSelectedDate,
        updateURL,
        isMobileSettingsModalOpen,
        closeMobileSettingsModal,
    } = props;

    const { isPoolDropdownOpen, setIsPoolDropdownOpen } =
        useContext(SidebarContext);

    const {
        tutorial: { isActive: isTutorialActive },
    } = useContext(AppStateContext);
    const {
        chartSettings,
        isFullScreen: isChartFullScreen,
        setIsFullScreen: setIsChartFullScreen,
        chartCanvasRef,
    } = useContext(ChartContext);

    const { isUserConnected } = useContext(UserDataContext);

    const { platformName } = useContext(BrandContext);

    const { pathname } = useLocation();
    const smallScreen = useMediaQuery('(max-width: 768px)');

    const isFuta = ['futa'].includes(platformName);

    const isMarketOrLimitModule =
        pathname.includes('market') || pathname.includes('limit');

    // allow a local environment variable to be defined in [app_repo]/.env.local to turn off connections to the cache server

    // ---------------------TRADE DATA CALCULATIONS------------------------

    const [rescale, setRescale] = useState(true);
    const [latest, setLatest] = useState(false);
    const [showLatest, setShowLatest] = useState(false);
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

    const orderHistoryState: {
        isSwapOrderHistoryEnabled: boolean;
        isLiquidityOrderHistoryEnabled: boolean;
        isHistoricalOrderHistoryEnabled: boolean;
    } | null = JSON.parse(
        getLocalStorageItem(LS_KEY_ORDER_HISTORY_SETTINGS) ?? '{}',
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
    const [showSwap, setShowSwap] = useState(
        orderHistoryState?.isSwapOrderHistoryEnabled ?? true,
    );
    const [showLiquidity, setShowLiquidity] = useState(
        false, // orderHistoryState?.isLiquidityOrderHistoryEnabled ?? false,
    );
    const [showHistorical, setShowHistorical] = useState(
        false, // orderHistoryState?.isHistoricalOrderHistoryEnabled ?? false,
    );

    const chartItemStates = useMemo(() => {
        return {
            showFeeRate,
            setShowFeeRate,
            showTvl,
            setShowTvl,
            showVolume,
            setShowVolume,
            liqMode: chartSettings.poolOverlay.overlay,
            showSwap,
            showLiquidity,
            showHistorical,
        };
    }, [
        isMarketOrLimitModule,
        chartSettings.poolOverlay,
        showTvl,
        setShowTvl,
        showVolume,
        setShowVolume,
        showFeeRate,
        setShowFeeRate,
        showSwap,
        showLiquidity,
        showHistorical,
    ]);

    useEffect(() => {
        if (!isUserConnected) {
            setShowSwap(false);
            setShowLiquidity(false);
            setShowHistorical(false);
        } else {
            setShowSwap(orderHistoryState?.isSwapOrderHistoryEnabled ?? true);
        }
    }, [isUserConnected]);

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

    const resetAndRescaleDisplay = (
        <div className={styles.chart_overlay_container}>
            {showLatest && (
                <div className={styles.settings_container}>
                    <button
                        onClick={() => {
                            if (rescale) {
                                setReset(true);
                            } else {
                                setLatest(true);
                            }
                        }}
                        className={styles.non_active_selected_button}
                        aria-label='Show latest.'
                    >
                        Latest
                    </button>
                </div>
            )}

            <div className={styles.settings_container}>
                <button
                    onClick={() => {
                        setReset(true);
                        setRescale(true);
                    }}
                    className={
                        reset
                            ? styles.active_selected_button
                            : styles.non_active_selected_button
                    }
                    aria-label='Reset.'
                >
                    Reset
                </button>
            </div>

            <div className={styles.settings_container}>
                <button
                    onClick={() => {
                        setRescale((prevState) => {
                            return !prevState;
                        });
                    }}
                    className={
                        rescale
                            ? styles.active_selected_button
                            : styles.non_active_selected_button
                    }
                    aria-label='Auto rescale.'
                >
                    Auto
                </button>
            </div>
        </div>
    );

    const timeFrameContentDesktop = (
        <section className={styles.time_frame_container}>
            <div className={styles.mobile_settings_row}>
                <p className={styles.mobile_settings_header}>Time Frame:</p>
                <TimeFrame candleTime={chartSettings.candleTime.global} />
            </div>
            <div className={styles.mobile_settings_row}>
                <p className={styles.mobile_settings_header}>Volume:</p>

                <VolumeTVLFee
                    setShowVolume={setShowVolume}
                    setShowTvl={setShowTvl}
                    setShowFeeRate={setShowFeeRate}
                    showVolume={showVolume}
                    showTvl={showTvl}
                    showFeeRate={showFeeRate}
                />
            </div>
            {isUserConnected && (
                <div className={styles.mobile_settings_row}>
                    <p className={styles.mobile_settings_header}>Buy/Sells:</p>

                    <OrderHistoryDisplay
                        setShowHistorical={setShowHistorical}
                        setShowSwap={setShowSwap}
                        setShowLiquidity={setShowLiquidity}
                        showLiquidity={showLiquidity}
                        showHistorical={showHistorical}
                        showSwap={showSwap}
                    />
                </div>
            )}
            {!isFuta && (
                <div className={styles.mobile_settings_row}>
                    <p className={styles.mobile_settings_header}>
                        Curve/Depth:
                    </p>
                    <CurveDepth overlayMethods={chartSettings.poolOverlay} />
                </div>
            )}
            <div className={styles.chart_overlay_container}>
                {resetAndRescaleDisplay}
            </div>
        </section>
    );
    const timeFrameContent = smallScreen ? (
        <>
            {isMobileSettingsModalOpen && (
                <Modal
                    onClose={closeMobileSettingsModal}
                    title='Chart Settings'
                >
                    {timeFrameContentDesktop}
                    <div className={styles.settings_apply_button_container}>
                        <button onClick={closeMobileSettingsModal}>
                            Apply
                        </button>
                    </div>
                </Modal>
            )}
        </>
    ) : (
        timeFrameContentDesktop
    );

    // END OF TIME FRAME CONTENT--------------------------------------------------------------

    const [isTutorialEnabled, setIsTutorialEnabled] = useState(false);

    return (
        <>
            <MainContainer
                flexDirection='column'
                fullHeight
                fullWidth
                style={{
                    padding: isChartFullScreen ? '1rem' : '0',
                    background: isChartFullScreen
                        ? isFuta
                            ? 'var(--dark1)'
                            : 'var(--dark2)'
                        : '',
                }}
                ref={chartCanvasRef}
            >
                {isTutorialActive && (
                    <FlexContainer
                        fullWidth
                        justifyContent='flex-end'
                        alignItems='flex-end'
                        padding='0 8px'
                    >
                        <TutorialButton
                            onClick={() => setIsTutorialEnabled(true)}
                        >
                            Tutorial Mode
                        </TutorialButton>
                    </FlexContainer>
                )}
                {isChartFullScreen && <TradeChartsHeader />}
                {timeFrameContent}
                <div
                    style={{ width: '100%', height: '100%' }}
                    onClick={() => {
                        if (isPoolDropdownOpen) setIsPoolDropdownOpen(false);
                    }}
                >
                    <TradeCandleStickChart
                        changeState={props.changeState}
                        chartItemStates={chartItemStates}
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
                        updateURL={updateURL}
                    />
                </div>
                <TutorialOverlay
                    isTutorialEnabled={isTutorialEnabled}
                    setIsTutorialEnabled={setIsTutorialEnabled}
                    steps={tradeChartTutorialSteps}
                />
            </MainContainer>
        </>
    );
}

export default memo(TradeCharts);
