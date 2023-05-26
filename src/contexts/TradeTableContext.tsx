import React, { createContext, useState } from 'react';

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
}

export const TradeTableContext = createContext<TradeTableIF>(
    {} as TradeTableIF,
);

export const TradeTableContextProvider = (props: {
    children: React.ReactNode;
}) => {
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
    };

    return (
        <TradeTableContext.Provider value={tradeTableState}>
            {props.children}
        </TradeTableContext.Provider>
    );
};
