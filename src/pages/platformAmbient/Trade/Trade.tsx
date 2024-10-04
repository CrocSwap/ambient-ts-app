/* eslint-disable @typescript-eslint/no-explicit-any */
// START: Import React and Dongles
import { Outlet } from 'react-router-dom';
import { NumberSize } from 're-resizable';
import {
    useEffect,
    useState,
    useContext,
    useCallback,
    memo,
    useRef,
} from 'react';

// START: Import JSX Components
import TradeTabs2 from '../../../components/Trade/TradeTabs/TradeTabs2';
// START: Import Local Files
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { CandleContext } from '../../../contexts/CandleContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { ChartContext } from '../../../contexts/ChartContext';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import { useUrlParams } from '../../../utils/hooks/useUrlParams';
import { TokenContext } from '../../../contexts/TokenContext';
import { CandleDataIF } from '../../../ambient-utils/types';
import {
    getFormattedNumber,
    getUnicodeCharacter,
} from '../../../ambient-utils/dataLayer';
import { NoChartData } from '../../../components/NoChartData/NoChartData';
import { TradeChartsHeader } from './TradeCharts/TradeChartsHeader/TradeChartsHeader';
import { useSimulatedIsPoolInitialized } from '../../../App/hooks/useSimulatedIsPoolInitialized';
import { FlexContainer } from '../../../styled/Common';
import {
    ChartContainer,
    MainSection,
    ResizableContainer,
} from '../../../styled/Components/Trade';
import { Direction } from 're-resizable/lib/resizer';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import { PoolContext } from '../../../contexts/PoolContext';
import ChartToolbar from '../Chart/Draw/Toolbar/Toolbar';
import PointsBanner from './PointsBanner';
import styles from './Trade.module.css';

import { AppStateContext } from '../../../contexts/AppStateContext';
import { BrandContext } from '../../../contexts/BrandContext';
import TokenIcon from '../../../components/Global/TokenIcon/TokenIcon';
import TableInfo from '../../../components/Trade/TableInfo/TableInfo';
import { useModal } from '../../../components/Global/Modal/useModal';
import { LuSettings } from 'react-icons/lu';
import TradeCharts from './TradeCharts/TradeCharts';
import TimeFrame from './TradeCharts/TradeChartsComponents/TimeFrame';
import { useSwipeable } from 'react-swipeable';
import { AnimatePresence, motion } from 'framer-motion';

const TRADE_CHART_MIN_HEIGHT = 175;

// React functional component
function Trade(props: { futaActiveTab?: string | undefined }) {
    const { futaActiveTab } = props;

    const {
        chainData: { chainId },
        provider,
    } = useContext(CrocEnvContext);
    const { setIsCandleSelected } = useContext(CandleContext);
    const { showPoints } = useContext(BrandContext);

    const {
        isFullScreen: isChartFullScreen,
        chartSettings,
        chartHeights,
        setChartHeight,
        canvasRef,
        tradeTableState,
        isChartHeightMinimum,
        isCandleDataNull,
        setIsChartHeightMinimum,
    } = useContext(ChartContext);

    const isPoolInitialized = useSimulatedIsPoolInitialized();
    const { platformName } = useContext(BrandContext);

    const isFuta = ['futa'].includes(platformName);

    const { tokens } = useContext(TokenContext);

    const { showTopPtsBanner, dismissTopBannerPopup } =
        useContext(AppStateContext);
    const { setOutsideControl, setSelectedOutsideTab } =
        useContext(TradeTableContext);

    const {
        baseToken,
        quoteToken,
        isDenomBase,
        limitTick,
        toggleDidUserFlipDenom,
    } = useContext(TradeDataContext);

    const { urlParamMap, updateURL } = useUrlParams(tokens, chainId, provider);

    const [transactionFilter, setTransactionFilter] = useState<CandleDataIF>();
    const [selectedDate, setSelectedDate] = useState<number | undefined>();

    const tradeTableRef = useRef<HTMLDivElement>(null);

    const [hasInitialized, setHasInitialized] = useState(false);

    const changeState = useCallback(
        (isOpen: boolean | undefined, candleData: CandleDataIF | undefined) => {
            setIsCandleSelected(isOpen);
            setHasInitialized(false);
            setTransactionFilter(candleData);
            if (isOpen) {
                setOutsideControl(true);
                setSelectedOutsideTab(0);
            }
        },
        [],
    );

    const unselectCandle = useCallback(() => {
        setSelectedDate(undefined);
        changeState(false, undefined);
        setIsCandleSelected(false);
    }, []);

    useEffect(() => {
        unselectCandle();
    }, [chartSettings.candleTime.global.time, baseToken.name, quoteToken.name]);

    const smallScreen = useMediaQuery('(max-width: 768px)');

    const [
        isMobileSettingsModalOpen,
        openMobileSettingsModal,
        closeMobileSettingsModal,
    ] = useModal();

    const tradeChartsProps = {
        changeState: changeState,
        selectedDate: selectedDate,
        setSelectedDate: setSelectedDate,
        updateURL,
        isMobileSettingsModalOpen,
        openMobileSettingsModal,
        closeMobileSettingsModal,
    };

    const tradeTabsProps = {
        filter: transactionFilter,
        setTransactionFilter: setTransactionFilter,
        changeState: changeState,
        selectedDate: selectedDate,
        setSelectedDate: setSelectedDate,
        hasInitialized: hasInitialized,
        setHasInitialized: setHasInitialized,
        unselectCandle: unselectCandle,
        candleTime: chartSettings.candleTime.global,
        tokens,
    };
    const {
        poolPriceDisplay,
        poolPriceChangePercent,
        isPoolPriceChangePositive,
        usdPrice,
        isTradeDollarizationEnabled,
    } = useContext(PoolContext);
    const currencyCharacter = isDenomBase
        ? // denom in a, return token b character
          getUnicodeCharacter(quoteToken.symbol)
        : // denom in b, return token a character
          getUnicodeCharacter(baseToken.symbol);

    const poolPriceDisplayWithDenom = poolPriceDisplay
        ? isDenomBase
            ? 1 / poolPriceDisplay
            : poolPriceDisplay
        : 0;

    const truncatedPoolPrice = getFormattedNumber({
        value: poolPriceDisplayWithDenom,
        abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
    });

    const poolPrice = isTradeDollarizationEnabled
        ? usdPrice
            ? getFormattedNumber({ value: usdPrice, prefix: '$' })
            : '…'
        : poolPriceDisplay === Infinity ||
            poolPriceDisplay === 0 ||
            poolPriceDisplay === undefined
          ? '…'
          : `${currencyCharacter}${truncatedPoolPrice}`;

    const poolPriceChangeString =
        poolPriceChangePercent === undefined ? '…' : poolPriceChangePercent;

    const [availableHeight, setAvailableHeight] = useState(window.innerHeight);

    useEffect(() => {
        const calculateHeight = () => {
            const totalHeight = window.innerHeight;
            const heightToSubtract = isFuta ? 56 + 56 + 25 : 56 + 56; // Subtract 56px from top and 56px from bottom
            setAvailableHeight(totalHeight - heightToSubtract);
        };

        calculateHeight(); // Calculate initial height
        window.addEventListener('resize', calculateHeight);

        return () => window.removeEventListener('resize', calculateHeight);
    }, []);

    const contentHeight = availableHeight - 75;

    // -----------------------------------------------------------------------

    const [activeTab, setActiveTab] = useState('Order');
            // eslint-disable-next-line 
    const [direction, setDirection] = useState(0); // To track the swipe direction for animations

    const tabs = [
        {
            id: 'Order',
            label: 'Order',
            data: (
                <ContentContainer isOnTradeRoute style={{ padding: '0 1rem' }}>
                    <Outlet
                        context={{
                            urlParamMap: urlParamMap,
                            limitTick: limitTick,
                            updateURL: updateURL,
                        }}
                    />
                </ContentContainer>
            ),
        },
        {
            id: 'Chart',
            label: 'Chart',
            data: (
                <>
                    {!isChartHeightMinimum && <ChartToolbar />}
                    {isPoolInitialized && !isCandleDataNull && (
                        <TradeCharts {...tradeChartsProps} />
                    )}
                </>
            ),
        },
        { id: 'Txns', label: 'Txns', data: <TradeTabs2 {...tradeTabsProps} /> },
        { id: 'Info', label: 'Info', data: <TableInfo /> },
    ];
    const mobileTabs = (
        <div className={styles.mobile_tabs_container}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                        color:
                            activeTab === tab.id
                                ? 'var(--accent1)'
                                : 'var(--text2)',
                        border:
                            activeTab === tab.id
                                ? '1px solid var(--accent1)'
                                : '1px solid transparent',
                    }}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );

    const activeTabData = tabs.find(
        (tab) => tab.id === (isFuta ? futaActiveTab : activeTab),
    )?.data;

    // To track the swipe and prevent rapid multiple swipes
    const swipeAction = useRef(false);

    // Handle swiping left (next tab)
    const handleSwipeLeft = () => {
        if (swipeAction.current) return; // Prevent multiple rapid swipes
        swipeAction.current = true;

        const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id);
        }

        setTimeout(() => {
            swipeAction.current = false;
        }, 300); // Adjust delay for debouncing
    };

    // Handle swiping right (previous tab)
    const handleSwipeRight = () => {
        if (swipeAction.current) return; // Prevent multiple rapid swipes
        swipeAction.current = true;

        const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
        if (currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1].id);
        }

        setTimeout(() => {
            swipeAction.current = false;
        }, 300); // Adjust delay for debouncing
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: handleSwipeLeft,
        onSwipedRight: handleSwipeRight,
        onSwiping: (eventData) => {
            const { initial, event } = eventData;

            // Check if the swipe started near the edges to prevent default back navigation
            const startX = initial[0];
            const edgeThreshold = 50; // Threshold for edge swipes, you can adjust this value

            if (
                event.cancelable &&
                startX > edgeThreshold &&
                startX < window.innerWidth - edgeThreshold
            ) {
                event.preventDefault(); // Only prevent default if not too close to the edges
            }
        },
        trackMouse: true, // For desktop swipe handling
    });
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300, // Off-screen position for sliding
            opacity: 0,
        }),
        center: {
            x: 0, // Centered position
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300, // Slide off-screen
            opacity: 0,
        }),
    };

    const mobileComponent = (
        <div
            className={styles.mobile_container}
            style={{ height: `${availableHeight}px` }}
            {...swipeHandlers}
        >
            {!isFuta && mobileTabs}
            <div
                className={styles.mobile_header}
                style={{ padding: isFuta ? '8px' : '' }}
            >
                <div
                    className={styles.mobile_token_icons}
                    onClick={toggleDidUserFlipDenom}
                >
                    <TokenIcon
                        token={isDenomBase ? baseToken : quoteToken}
                        src={
                            isDenomBase ? baseToken.logoURI : quoteToken.logoURI
                        }
                        alt={isDenomBase ? baseToken.symbol : quoteToken.symbol}
                        size={'s'}
                    />
                    <TokenIcon
                        token={isDenomBase ? quoteToken : baseToken}
                        src={
                            isDenomBase ? quoteToken.logoURI : baseToken.logoURI
                        }
                        alt={isDenomBase ? quoteToken.symbol : baseToken.symbol}
                        size={'s'}
                    />
                    <div>
                        {isDenomBase ? baseToken.symbol : quoteToken.symbol}
                        {'/'}
                        {isDenomBase ? quoteToken.symbol : baseToken.symbol}
                    </div>
                </div>
                <div
                    className={styles.conv_rate}
                    onClick={toggleDidUserFlipDenom}
                >
                    {poolPrice}

                    <p
                        style={{
                            color: isPoolPriceChangePositive
                                ? 'var(--positive)'
                                : 'var(--negative)',
                            fontSize: 'var(--body-size)',
                        }}
                    >
                        {poolPriceChangeString}
                    </p>
                </div>
            </div>

            {(isFuta ? futaActiveTab === 'Chart' : activeTab === 'Chart') && (
                <FlexContainer
                    style={{
                        justifyContent: 'space-between',
                        padding: '0px 1rem 1rem 0.5rem',
                    }}
                >
                    <div className={styles.mobile_settings_row}>
                        <TimeFrame
                            candleTime={chartSettings.candleTime.global}
                        />
                    </div>

                    <LuSettings
                        size={20}
                        onClick={openMobileSettingsModal}
                        color='var(--text2)'
                    />
                </FlexContainer>
            )}
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    style={{
                        height: `${contentHeight}px`,
                        overflowY: 'scroll',
                       
                        width: '100%', // Ensure full width of content
                    }}
                    key={activeTab} // Ensure that Framer Motion tracks the current tab
                    custom={direction} // Pass the direction for custom animations
                    variants={slideVariants}
                    initial='enter'
                    animate='center'
                    exit='exit'
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                        duration: 0.3,
                    }}
                    // style={{ position: 'absolute', width: '100%' }} // Ensure full width of content
                >
                    {activeTabData}
                </motion.div>
            </AnimatePresence>
        </div>
    );

    if (smallScreen) return mobileComponent;

    return (
        <>
            <MainSection isFill={isFuta}>
                <FlexContainer
                    flexDirection='column'
                    fullWidth
                    background='dark2'
                    style={{ height: 'calc(100vh - 56px)' }}
                    ref={canvasRef}
                >
                    {showTopPtsBanner && showPoints && (
                        <div style={{ padding: '0 8px' }}>
                            <PointsBanner dismissElem={dismissTopBannerPopup} />
                        </div>
                    )}

                    {!isChartFullScreen && <TradeChartsHeader tradePage />}
                    {/* This div acts as a parent to maintain a min/max for the resizable element below */}
                    <FlexContainer
                        flexDirection='column'
                        fullHeight
                        overflow='hidden'
                    >
                        <ResizableContainer
                            showResizeable={
                                !isCandleDataNull &&
                                !isChartFullScreen &&
                                !isFuta
                            }
                            isFuta={isFuta}
                            enable={{
                                bottom: !isChartFullScreen,
                                top: false,
                                left: false,
                                topLeft: false,
                                bottomLeft: false,
                                right: false,
                                topRight: false,
                                bottomRight: false,
                            }}
                            size={{
                                width: '100%',
                                height: chartHeights.current,
                            }}
                            minHeight={4}
                            onResize={(
                                evt: MouseEvent | TouchEvent,
                                dir: Direction,
                                ref: HTMLElement,
                                d: NumberSize,
                            ) => {
                                if (
                                    chartHeights.current + d.height <
                                    TRADE_CHART_MIN_HEIGHT
                                ) {
                                    setIsChartHeightMinimum(true);
                                } else {
                                    setIsChartHeightMinimum(false);
                                }
                            }}
                            onResizeStart={() => {
                                // may be useful later
                            }}
                            onResizeStop={(
                                evt: MouseEvent | TouchEvent,
                                dir: Direction,
                                ref: HTMLElement,
                                d: NumberSize,
                            ) => {
                                if (
                                    chartHeights.current + d.height <
                                    TRADE_CHART_MIN_HEIGHT
                                ) {
                                    if (tradeTableState == 'Expanded') {
                                        setChartHeight(chartHeights.default);
                                    } else {
                                        setChartHeight(chartHeights.min);
                                    }
                                } else {
                                    setChartHeight(
                                        chartHeights.current + d.height,
                                    );
                                }
                            }}
                            bounds={'parent'}
                        >
                            {(isCandleDataNull || !isPoolInitialized) && (
                                <NoChartData
                                    chainId={chainId}
                                    tokenA={
                                        isDenomBase ? baseToken : quoteToken
                                    }
                                    tokenB={
                                        isDenomBase ? quoteToken : baseToken
                                    }
                                    isCandleDataNull
                                    isTableExpanded={
                                        tradeTableState == 'Expanded'
                                    }
                                    isPoolInitialized={isPoolInitialized}
                                />
                            )}
                            {!isCandleDataNull && isPoolInitialized && (
                                <ChartContainer
                                    fullScreen={isChartFullScreen}
                                    isFuta={isFuta}
                                >
                                    {!isCandleDataNull && (
                                        <TradeCharts {...tradeChartsProps} />
                                    )}
                                </ChartContainer>
                            )}
                        </ResizableContainer>
                        {!isChartFullScreen && !isFuta && (
                            <FlexContainer
                                ref={tradeTableRef}
                                style={{ flex: 1 }}
                                overflow='hidden'
                            >
                                <TradeTabs2 {...tradeTabsProps} />
                            </FlexContainer>
                        )}
                    </FlexContainer>
                </FlexContainer>
                <FlexContainer
                    flexDirection='column'
                    fullHeight
                    fullWidth
                    background='dark1'
                    overflow='auto'
                >
                    <Outlet
                        context={{
                            urlParamMap: urlParamMap,
                            limitTick: limitTick,
                            updateURL: updateURL,
                        }}
                    />
                </FlexContainer>
                {!isChartHeightMinimum && <ChartToolbar />}
            </MainSection>
        </>
    );
}

export default memo(Trade);
