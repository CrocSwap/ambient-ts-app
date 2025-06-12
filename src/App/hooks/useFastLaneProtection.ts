import { useContext, useEffect, useMemo, useState } from 'react';
import { monadTestnet } from '../../ambient-utils/constants/networks/monadTestnet';
import { AppStateContext } from '../../contexts/AppStateContext';

export interface FastLaneProtectionIF {
    isEnabled: boolean;
    enable: () => void;
    disable: () => void;
    toggle: () => void;
    isChainAccepted: (chainId: string) => boolean;
}

export const useFastLaneProtection = (): FastLaneProtectionIF => {
    const LS_KEY = 'fastlane_protection';
    const ACCEPTED_NETWORKS = [monadTestnet];
    // const {
    //     activeNetwork: { chainId },
    // } = useContext(AppStateContext);
    const [enabled, setEnabled] = useState<boolean>(() => {
        const stored = localStorage.getItem(LS_KEY);
        return stored ? JSON.parse(stored) : false;
    });

    // Effect to persist enabled state to localStorage
    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(enabled));
    }, [enabled]);

    const isChainAccepted = (chainId: string): boolean => {
        return ACCEPTED_NETWORKS.some(
            (network) =>
                network.chainId.toLowerCase() === chainId.toLowerCase(),
        );
    };

    const result = useMemo(() => {
        // const isSupported = isChainAccepted(chainId);
        return {
            isEnabled: enabled,
            enable: () => setEnabled(true),
            //     if (isSupported) {
            //         setEnabled(true);
            //     }
            // },
            disable: () => setEnabled(false),
            toggle: () => setEnabled((prev) => !prev),
            //     if (isSupported) {
            //         setEnabled((prev) => !prev);
            //     }
            // },
            isChainAccepted,
        };
    }, [enabled]);
    return result;
};
