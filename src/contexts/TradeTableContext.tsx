import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CandleContext } from './CandleContext';
import { ChartContext, CHART_DEFAULT_HEIGHT } from './ChartContext';

interface TradeTableContextIF {
    showOrderPulseAnimation: boolean;
    showRangePulseAnimation: boolean;
    showSwapPulseAnimation: boolean;
    currentPositionActive: string;
    setCurrentPositionActive: (val: string) => void;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: (val: string) => void;
    isTradeTableExpanded: boolean;
    setIsTradeTableExpanded: (val: boolean) => void;
    setExpandTradeTable: (val: boolean) => void;
    showAllData: boolean;
    setShowAllData: (val: boolean) => void;
    selectedOutsideTab: number;
    setSelectedOutsideTab: (val: number) => void;
    outsideControl: boolean;
    setOutsideControl: (val: boolean) => void;
    handlePulseAnimation: (type: 'swap' | 'limitOrder' | 'range') => void;
}

export const TradeTableContext = createContext<TradeTableContextIF>(
    {} as TradeTableContextIF,
);

export const TradeTableContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const { isCandleSelected } = useContext(CandleContext);
    const { chartHeight, setChartHeight } = useContext(ChartContext);

    const { pathname: currentLocation } = useLocation();

    const [showAllData, setShowAllData] = useState(true);
    const [currentTxActiveInTransactions, setCurrentTxActiveInTransactions] =
        useState('');
    const [currentPositionActive, setCurrentPositionActive] = useState('');
    const [isTradeTableExpanded, setIsTradeTableExpanded] = useState(false);

    const [showSwapPulseAnimation, setShowSwapPulseAnimation] = useState(false);
    const [showOrderPulseAnimation, setShowOrderPulseAnimation] =
        useState(false);
    const [showRangePulseAnimation, setShowRangePulseAnimation] =
        useState(false);
    const [selectedOutsideTab, setSelectedOutsideTab] = useState(0);
    const [outsideControl, setOutsideControl] = useState(false);

    const tradeTableContext = {
        showAllData,
        setShowAllData,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        currentPositionActive,
        setCurrentPositionActive,
        isTradeTableExpanded,
        setIsTradeTableExpanded,
        // chartHeight is a minimum of 4 when closed since the resizable selector is 4px in height
        setExpandTradeTable: () => {
            chartHeight === 4
                ? setChartHeight(CHART_DEFAULT_HEIGHT)
                : setChartHeight(4);
            setIsTradeTableExpanded(!isTradeTableExpanded);
        },
        showSwapPulseAnimation,
        showOrderPulseAnimation,
        showRangePulseAnimation,
        handlePulseAnimation,
        selectedOutsideTab,
        setSelectedOutsideTab,
        outsideControl,
        setOutsideControl,
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

    return (
        <TradeTableContext.Provider value={tradeTableContext}>
            {props.children}
        </TradeTableContext.Provider>
    );
};
