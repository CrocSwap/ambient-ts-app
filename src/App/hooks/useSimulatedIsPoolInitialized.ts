import { useContext, useState, useEffect } from 'react';
import { PoolContext } from '../../contexts/PoolContext';

// Custom hook to simulate isPoolInitialized for the first 2 seconds
export const useSimulatedIsPoolInitialized = () => {
    const poolContext = useContext(PoolContext);
    const [simulatedIsPoolInitialized, setSimulatedIsPoolInitialized] =
        useState(true);

    useEffect(() => {
        // Simulate the pool initialization for the first 2 seconds
        const timeoutId = setTimeout(() => {
            setSimulatedIsPoolInitialized(false);
        }, 500);

        // Clean up the timeout when the component unmounts
        return () => clearTimeout(timeoutId);
    }, []);

    return simulatedIsPoolInitialized || poolContext.isPoolInitialized;
};
