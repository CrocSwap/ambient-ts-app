import {
    Dispatch,
    SetStateAction,
    useContext,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import {
    BrandContext,
    ChartContext,
    CrocEnvContext,
    PoolContext,
    TokenContext,
    TradeDataContext,
} from '../../../contexts';
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import { Outlet } from 'react-router-dom';
import {  useUrlParams } from '../../../utils/hooks/useUrlParams';
import styles from './TradeMobile.module.css';
import { AnimatePresence, motion } from 'framer-motion';
import TokenIcon from '../../../components/Global/TokenIcon/TokenIcon';
import { FlexContainer } from '../../../styled/Common';
import TimeFrame from './TradeCharts/TradeChartsComponents/TimeFrame';
import { LuSettings } from 'react-icons/lu';
import TableInfo from '../../../components/Trade/TableInfo/TableInfo';
import ChartToolbar from '../Chart/Draw/Toolbar/Toolbar';
import TradeCharts from './TradeCharts/TradeCharts';
import TradeTabs2 from '../../../components/Trade/TradeTabs/TradeTabs2';
import { useSimulatedIsPoolInitialized } from '../../../App/hooks/useSimulatedIsPoolInitialized';
import { CandleDataIF } from '../../../ambient-utils/types';
import { useBottomSheet } from '../../../contexts/BottomSheetContext';

interface propsIF {
    poolPrice: string;
    futaActiveTab: string | undefined;
    poolPriceChangeString: string;

    // tradecharts
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleDataIF | undefined,
    ) => void;
    selectedDate: number | undefined;
    setSelectedDate: Dispatch<SetStateAction<number | undefined>>;
    isMobileSettingsModalOpen: boolean;
    openMobileSettingsModal: () => void;
    closeMobileSettingsModal: () => void;

    // tradetabs
    filter: CandleDataIF | undefined;
    transactionFilter: CandleDataIF | undefined;
    setTransactionFilter: Dispatch<SetStateAction<CandleDataIF | undefined>>;

    hasInitialized: boolean;
    setHasInitialized: Dispatch<SetStateAction<boolean>>;
    unselectCandle: () => void;
}
export default function TradeMobile(props: propsIF) {
    const { platformName } = useContext(BrandContext);
    const isFuta = ['futa'].includes(platformName);
    const {
        poolPrice,
        futaActiveTab,
        poolPriceChangeString,

        // tradehcharts
        changeState,
        selectedDate,
        setSelectedDate,
        isMobileSettingsModalOpen,
        openMobileSettingsModal,
        closeMobileSettingsModal,

        // tradetabs

        setTransactionFilter,
        hasInitialized,
        setHasInitialized,
        unselectCandle,
        transactionFilter,
    } = props;

    const {
        chainData: { chainId },
        provider,
    } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);
    const {
        baseToken,
        quoteToken,
        isDenomBase,
        limitTick,
        toggleDidUserFlipDenom,
    } = useContext(TradeDataContext);
    const isPoolInitialized = useSimulatedIsPoolInitialized();
    const { isPoolPriceChangePositive } = useContext(PoolContext);

    const {
        chartSettings,

        isChartHeightMinimum,
        isCandleDataNull,
    } = useContext(ChartContext);
    const { urlParamMap, updateURL } = useUrlParams(tokens, chainId, provider);

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
    const {  isBottomSheetOpen } =
    useBottomSheet();
    const [availableHeight, setAvailableHeight] = useState<number>(
        window.innerHeight,
    );
    const [activeTab, setActiveTab] = useState<string>('Order');
    const [direction, setDirection] = useState<number>(0);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    useLayoutEffect(() => {
        const calculateHeight = () => {
            const totalHeight = window.innerHeight;
            const heightToSubtract = isFuta ? 137 : 112; // Combine fixed values for a cleaner subtraction
            setAvailableHeight(totalHeight - heightToSubtract);
        };

        calculateHeight(); // Calculate initial height immediately
        window.addEventListener('resize', calculateHeight);

        return () => window.removeEventListener('resize', calculateHeight);
    }, []);

    const contentHeight = availableHeight - 75;

    // -----------------------------------------------------------------------

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
    const handleTabChange = (newTab: string): void => {
        const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
        const newIndex = tabs.findIndex((tab) => tab.id === newTab);
        setDirection(newIndex > currentIndex ? 1 : -1);
        setActiveTab(newTab);
    };

    const handleTouchStart = (e: React.TouchEvent): void => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent): void => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (): void => {
        if (!touchStartX.current || !touchEndX.current) return;

        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);

        if (isLeftSwipe && currentIndex < tabs.length - 1) {
            handleTabChange(tabs[currentIndex + 1].id);
        } else if (isRightSwipe && currentIndex > 0) {
            handleTabChange(tabs[currentIndex - 1].id);
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };


    
    
    
    const mobileTabs = (
        <div className={styles.mobile_tabs_container}
        style={{zIndex: isBottomSheetOpen ? 0 : 2}}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
                    onClick={() => handleTabChange(tab.id)}
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


    const slideVariants = {
        enter: (custom: number) => ({
            x: custom > 0 ? 100 : -100,
            opacity: 0,
            position: 'absolute' as const,
           
            zIndex: 1, // Ensure it stays below the tabs
            height: '100%',
        }),
        center: {
            x: 0,
            opacity: 1,
            position: 'relative' as const,
            zIndex: 0, // Center content should take the normal stacking order
            height: '100%',
        },
        exit: (custom: number) => ({
            x: custom < 0 ? 100 : -100,
            opacity: 0,
            position: 'absolute' as const,
           
            zIndex: 1,
            height: '100%',
        }),
    };
    

    return (
        <div
        className={styles.mobile_container}
        style={{ height: `${availableHeight}px` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
        {!isFuta && mobileTabs}
        <div
            className={styles.mobile_header}
            style={{ padding: isFuta ? '8px' : '', zIndex: isBottomSheetOpen ? 0: '2' }}
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
                key={isFuta ? futaActiveTab : activeTab}
                custom={direction}
                variants={slideVariants}
                initial='enter'
                animate='center'
                exit='exit'
                transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                }}
                style={{
                    height: `${contentHeight}px`,
                    overflowY: 'scroll',

                    width: '100%', // Ensure full width of content
                }}
            >
                {tabs.find((tab) => tab.id === (isFuta ? futaActiveTab : activeTab))?.data}
            </motion.div>
        </AnimatePresence>
    </div>
    )
}
