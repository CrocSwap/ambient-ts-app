import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CandleContext } from './CandleContext';
import { ChartContext } from './ChartContext';
import { useSimulatedIsPoolInitialized } from '../App/hooks/useSimulatedIsPoolInitialized';
import { useAccount } from 'wagmi';
import {
    resetConnectedUserDataLoadingStatus,
    resetPoolDataLoadingStatus,
} from '../utils/state/graphDataSlice';
import { useAppDispatch } from '../utils/hooks/reduxToolkit';

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

    const isPoolInitialized = useSimulatedIsPoolInitialized();

    const { pathname: currentLocation } = useLocation();

    const [showAllData, setShowAllData] = useState(true);
    const [currentTxActiveInTransactions, setCurrentTxActiveInTransactions] =
        useState('');
    const [currentPositionActive, setCurrentPositionActive] = useState('');

    const [isTradeTableMinimized, setIsTradeTableMinimized] = useState(false);

    const [showSwapPulseAnimation, setShowSwapPulseAnimation] = useState(false);
    const [showOrderPulseAnimation, setShowOrderPulseAnimation] =
        useState(false);
    const [showRangePulseAnimation, setShowRangePulseAnimation] =
        useState(false);
    const [selectedOutsideTab, setSelectedOutsideTab] = useState(0);
    const [outsideControl, setOutsideControl] = useState(false);
    const [activeMobileComponent, setActiveMobileComponent] = useState('trade');

    const { isConnected } = useAccount();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!isConnected) {
            dispatch(resetPoolDataLoadingStatus());
            dispatch(resetConnectedUserDataLoadingStatus());
            setShowAllData(true);
        }
    }, [isConnected]);

    const tradeTableContext = {
        showAllData,
        setShowAllData,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        currentPositionActive,
        setCurrentPositionActive,
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

    function toggleTradeTabBasedOnRoute() {
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
    }

    useEffect(() => {
        if (
            !currentTxActiveInTransactions &&
            !currentPositionActive &&
            location.pathname.includes('/trade')
        )
            toggleTradeTabBasedOnRoute();
    }, [location.pathname]);

    const resetTable = () => {
        if (
            chartHeights.saved > chartHeights.min &&
            chartHeights.saved < chartHeights.max
        ) {
            setChartHeight(chartHeights.saved);
        }
    };
    useEffect(() => {
        if (isCandleDataNull && isPoolInitialized) {
            setChartHeight(chartHeights.min);
        } else {
            resetTable();
        }
    }, [isCandleDataNull, isPoolInitialized]);
    return (
        <TradeTableContext.Provider value={tradeTableContext}>
            {props.children}
        </TradeTableContext.Provider>
    );
};
