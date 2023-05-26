import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CandleContext } from './CandleContext';

interface TradeTableIF {
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
    outsideTab: { selected: number; setSelected: (val: number) => void };
    outsideControl: { isActive: boolean; setIsActive: (val: boolean) => void };
}

export const TradeTableContext = createContext<TradeTableIF>(
    {} as TradeTableIF,
);

export const TradeTableContextProvider = (props: {
    children: React.ReactNode;
}) => {
    // const { isCandleSelected: { value: isCandleSelected }} = useContext(CandleContext);

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

    const tradeTableState = {
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
        outsideTab: {
            selected: selectedOutsideTab,
            setSelected: setSelectedOutsideTab,
        },
        outsideControl: {
            isActive: outsideControl,
            setIsActive: setOutsideControl,
        },
    };

    function toggleTradeTabBasedOnRoute() {
        // if (!isCandleSelected) {
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
        // }
    }

    useEffect(() => {
        if (!currentTxActiveInTransactions && !currentPositionActive)
            toggleTradeTabBasedOnRoute();
    }, [location.pathname.includes('/trade')]);

    return (
        <TradeTableContext.Provider value={tradeTableState}>
            {props.children}
        </TradeTableContext.Provider>
    );
};
