import { useContext, useState, useEffect } from 'react';
import { PoolContext } from '../../contexts/PoolContext';

// Custom hook to simulate isPoolInitialized for the first 2 seconds
export const useSimulatedIsPoolInitialized = () => {
    const poolContext = useContext(PoolContext);
    const [simulatedIsPoolInitialized, setSimulatedIsPoolInitialized] =
        useState(true);

    useEffect(() => {
        setSimulatedIsPoolInitialized(true);
        // Simulate the pool initialization for the first 2 seconds
        const timeoutId = setTimeout(() => {
            setSimulatedIsPoolInitialized(false);
        }, 2000);

        // Clean up the timeout when the component unmounts
        return () => clearTimeout(timeoutId);
    }, [poolContext.pool]);

    return poolContext.isPoolInitialized === undefined
        ? simulatedIsPoolInitialized
        : poolContext.isPoolInitialized;
};
