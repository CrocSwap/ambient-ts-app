import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CandleContext } from './CandleContext';

interface TradeTableContextIF {
    showOrderPulseAnimation: boolean;
    setShowOrderPulseAnimation: (val: boolean) => void;
    showRangePulseAnimation: boolean;
    setShowRangePulseAnimation: (val: boolean) => void;
    showSwapPulseAnimation: boolean;
    setShowSwapPulseAnimation: (val: boolean) => void;
    currentPositionActive: string;
    setCurrentPositionActive: (val: string) => void;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: (val: string) => void;
    expandTradeTable: boolean;
    setExpandTradeTable: (val: boolean) => void;
    showAllData: boolean;
    setShowAllData: (val: boolean) => void;
    selectedOutsideTab: number;
    setSelectedOutsideTab: (val: number) => void;
    outsideControl: boolean;
    setOutsideControl: (val: boolean) => void;
}

export const TradeTableContext = createContext<TradeTableContextIF>(
    {} as TradeTableContextIF,
);

export const TradeTableContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const { isCandleSelected } = useContext(CandleContext);

    const { pathname: currentLocation } = useLocation();

    const [showAllData, setShowAllData] = useState(true);
    const [currentTxActiveInTransactions, setCurrentTxActiveInTransactions] =
        useState('');
    const [currentPositionActive, setCurrentPositionActive] = useState('');
    const [expandTradeTable, setExpandTradeTable] = useState(true);

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
        expandTradeTable,
        setExpandTradeTable,
        showSwapPulseAnimation,
        setShowSwapPulseAnimation,
        showOrderPulseAnimation,
        setShowOrderPulseAnimation,
        showRangePulseAnimation,
        setShowRangePulseAnimation,
        selectedOutsideTab,
        setSelectedOutsideTab,
        outsideControl,
        setOutsideControl,
    };

    function toggleTradeTabBasedOnRoute() {
        if (!isCandleSelected) {
            setOutsideControl(true);
            if (currentLocation.includes('/market')) {
                setSelectedOutsideTab(0);
            } else if (currentLocation.includes('/limit')) {
                setSelectedOutsideTab(1);
            } else if (
                currentLocation.includes('/range') ||
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
