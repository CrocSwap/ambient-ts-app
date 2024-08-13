import { useContext, useEffect, useState } from 'react';
import { UserDataContext } from '../../contexts/UserDataContext';

// Custom hook to simulate isUserConnected for the first 2 seconds
export const useSimulatedIsUserConnected = () => {
    const { isUserConnected } = useContext(UserDataContext);
    const [simulatedIsUserConnected, setSimulatedIsUserConnected] = useState<
        boolean | undefined
    >(true);

    useEffect(() => {
        // Simulate the user connection for the first 2 seconds
        const timeoutId = setTimeout(() => {
            setSimulatedIsUserConnected(undefined);
        }, 2000);

        // Clean up the timeout when the component unmounts
        return () => clearTimeout(timeoutId);
    }, []);

    return simulatedIsUserConnected || isUserConnected;
};
