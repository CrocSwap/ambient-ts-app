import { createContext } from 'react';

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
