import { useEffect, useState } from 'react';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';

// Custom hook to simulate isUserConnected for the first 2 seconds
export const useSimulatedIsUserConnected = () => {
    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );
    const [simulatedIsUserConnected, setSimulatedIsUserConnected] =
        useState(true);

    useEffect(() => {
        setSimulatedIsUserConnected(true);
        // Simulate the user connection for the first 2 seconds
        const timeoutId = setTimeout(() => {
            setSimulatedIsUserConnected(false);
        }, 2000);

        // Clean up the timeout when the component unmounts
        return () => clearTimeout(timeoutId);
    }, [isUserConnected]);

    return isUserConnected === undefined
        ? simulatedIsUserConnected
        : isUserConnected;
};
