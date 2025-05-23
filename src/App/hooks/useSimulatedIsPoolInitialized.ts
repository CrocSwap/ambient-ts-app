import { useContext, useEffect, useState } from 'react';
import { TradeDataContext } from '../../contexts';
import { AppStateContext } from '../../contexts/AppStateContext';
import { PoolContext } from '../../contexts/PoolContext';

// Custom hook to simulate isPoolInitialized for the first 2 seconds
export const useSimulatedIsPoolInitialized = () => {
    const {
        activeNetwork: { chainId },
        isUserOnline,
    } = useContext(AppStateContext);

    const { baseToken, quoteToken } = useContext(TradeDataContext);
    const poolContext = useContext(PoolContext);
    const [simulatedIsPoolInitialized, setSimulatedIsPoolInitialized] =
        useState<boolean>(true);

    useEffect(() => {
        setSimulatedIsPoolInitialized(true);
        if (isUserOnline) {
            // Simulate the pool initialization for the first 10 seconds
            const timeoutId = setTimeout(() => {
                setSimulatedIsPoolInitialized(false);
            }, 10000);
            // Clean up the timeout when the component unmounts
            return () => clearTimeout(timeoutId);
        }
    }, [isUserOnline, baseToken.address + quoteToken.address, chainId]);

    return poolContext.isPoolInitialized === undefined
        ? simulatedIsPoolInitialized
        : poolContext.isPoolInitialized;
};
