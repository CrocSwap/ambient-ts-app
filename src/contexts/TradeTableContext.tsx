import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { CandleContext } from './CandleContext';
import { ChartContext } from './ChartContext';
import { UserDataContext } from './UserDataContext';
import { DataLoadingContext } from './DataLoadingContext';
import { PoolContext } from './PoolContext';

// 54 is the height of the trade table header
export const TRADE_TABLE_HEADER_HEIGHT = 54;
interface TradeTableContextIF {
    showOrderPulseAnimation: boolean;
    showRangePulseAnimation: boolean;
    showSwapPulseAnimation: boolean;
    currentPositionActive: string;
    setCurrentPositionActive: (val: string) => void;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: (val: string) => void;
    currentLimitOrderActive: string;
    setCurrentLimitOrderActive: (val: string) => void;
    toggleTradeTable: () => void;
    toggleTradeTableCollapse: () => void;
    showAllData: boolean;
    setShowAllData: (val: boolean) => void;
    selectedOutsideTab: number;
    setSelectedOutsideTab: (val: number) => void;
    outsideControl: boolean;
    setOutsideControl: (val: boolean) => void;
    handlePulseAnimation: (type: 'swap' | 'limitOrder' | 'range') => void;

    activeMobileComponent: string;
    setActiveMobileComponent: (val: string) => void;
}

export const TradeTableContext = createContext<TradeTableContextIF>(
    {} as TradeTableContextIF,
);

export const TradeTableContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const { isCandleSelected, isCandleDataNull } = useContext(CandleContext);
    const { setChartHeight, chartHeights } = useContext(ChartContext);
    const { isPoolInitialized } = useContext(PoolContext);
    const { isUserConnected } = useContext(UserDataContext);
    const { resetPoolDataLoadingStatus, resetConnectedUserDataLoadingStatus } =
        useContext(DataLoadingContext);

    const { pathname: currentLocation } = useLocation();

    const [showAllData, setShowAllData] = useState(true);
    const [currentTxActiveInTransactions, setCurrentTxActiveInTransactions] =
        useState('');
    const [currentPositionActive, setCurrentPositionActive] = useState('');
    const [currentLimitOrderActive, setCurrentLimitOrderActive] = useState('');

    const [isTradeTableMinimized, setIsTradeTableMinimized] = useState(false);

    const [showSwapPulseAnimation, setShowSwapPulseAnimation] = useState(false);
    const [showOrderPulseAnimation, setShowOrderPulseAnimation] =
        useState(false);
    const [showRangePulseAnimation, setShowRangePulseAnimation] =
        useState(false);
    const [selectedOutsideTab, setSelectedOutsideTab] = useState(0);
    const [outsideControl, setOutsideControl] = useState(false);
    const [activeMobileComponent, setActiveMobileComponent] = useState('trade');

    useEffect(() => {
        console.log('tradetablecontext 0');
        if (!isUserConnected) {
            resetPoolDataLoadingStatus();
            resetConnectedUserDataLoadingStatus();
            setShowAllData(true);
        }
    }, [
        isUserConnected,
        resetConnectedUserDataLoadingStatus,
        resetPoolDataLoadingStatus,
    ]);

    const tradeTableContext = {
        showAllData,
        setShowAllData,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        currentPositionActive,
        setCurrentPositionActive,
        currentLimitOrderActive,
        setCurrentLimitOrderActive,
        // chartHeight is a minimum of 4 when closed since the resizable selector is 4px in height
        toggleTradeTable: () => {
            if (
                chartHeights.current > chartHeights.min &&
                chartHeights.current < chartHeights.max
            ) {
                setChartHeight(chartHeights.min);
            } else {
                setChartHeight(chartHeights.saved);
            }
        },
        toggleTradeTableCollapse: () => {
            if (
                chartHeights.current > chartHeights.min &&
                chartHeights.current < chartHeights.max
            ) {
                setChartHeight(chartHeights.max);
            } else {
                setChartHeight(chartHeights.saved);
            }
        },
        isTradeTableMinimized,
        setIsTradeTableMinimized,
        showSwapPulseAnimation,
        showOrderPulseAnimation,
        showRangePulseAnimation,
        handlePulseAnimation,
        selectedOutsideTab,
        setSelectedOutsideTab,
        outsideControl,
        setOutsideControl,
        activeMobileComponent,
        setActiveMobileComponent,
    };

    function handlePulseAnimation(type: 'swap' | 'limitOrder' | 'range') {
        switch (type) {
            case 'swap':
                setShowSwapPulseAnimation(true);
                setTimeout(() => {
                    setShowSwapPulseAnimation(false);
                }, 3000);
                break;
            case 'limitOrder':
                setShowOrderPulseAnimation(true);
                setTimeout(() => {
                    setShowOrderPulseAnimation(false);
                }, 3000);
                break;
            case 'range':
                setShowRangePulseAnimation(true);

                setTimeout(() => {
                    setShowRangePulseAnimation(false);
                }, 3000);
                break;
            default:
                break;
        }
    }

    const toggleTradeTabBasedOnRoute = useCallback(() => {
        if (!isCandleSelected) {
            setOutsideControl(true);
            if (currentLocation.includes('/market')) {
                setSelectedOutsideTab(0);
            } else if (currentLocation.includes('/limit')) {
                setSelectedOutsideTab(1);
            } else if (
                currentLocation.includes('/pool') ||
                currentLocation.includes('reposition') ||
                currentLocation.includes('add')
            ) {
                setSelectedOutsideTab(2);
            }
        }
    }, [currentLocation, isCandleSelected]);

    useEffect(() => {
        console.log('tradetablecontext 1');
        if (
            !currentTxActiveInTransactions &&
            !currentPositionActive &&
            location.pathname.includes('/trade')
        )
            toggleTradeTabBasedOnRoute();
    }, [
        currentPositionActive,
        currentTxActiveInTransactions,
        toggleTradeTabBasedOnRoute,
    ]);

    useEffect(() => {
        console.log('tradetablecontext 2');
        if (isCandleDataNull && isPoolInitialized) {
            console.log('setting chart height from trade table context');
            setChartHeight(chartHeights.min);
        }
    }, [chartHeights.min, isCandleDataNull, isPoolInitialized, setChartHeight]);

    return (
        <TradeTableContext.Provider value={tradeTableContext}>
            {props.children}
        </TradeTableContext.Provider>
    );
};
