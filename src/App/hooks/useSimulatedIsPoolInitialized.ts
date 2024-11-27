import { useContext, useEffect, useState } from 'react';
import {
    AppStateContext,
    AppStateContextIF,
} from '../../contexts/AppStateContext';
import { PoolContext, PoolContextIF } from '../../contexts/PoolContext';

// Custom hook to simulate isPoolInitialized for the first 2 seconds
export const useSimulatedIsPoolInitialized = () => {
    const {
        activeNetwork: { chainId },
    } = useContext<AppStateContextIF>(AppStateContext);
    const poolContext = useContext<PoolContextIF>(PoolContext);
    const [simulatedIsPoolInitialized, setSimulatedIsPoolInitialized] =
        useState<boolean>(true);

    useEffect(() => {
        setSimulatedIsPoolInitialized(true);
        // Simulate the pool initialization for the first 10 seconds
        const timeoutId = setTimeout(() => {
            setSimulatedIsPoolInitialized(false);
        }, 10000);

        // Clean up the timeout when the component unmounts
        return () => clearTimeout(timeoutId);
    }, [poolContext.pool, chainId]);

    return poolContext.isPoolInitialized === undefined
        ? simulatedIsPoolInitialized
        : poolContext.isPoolInitialized;
};
