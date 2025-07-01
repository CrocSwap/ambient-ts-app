import { useEffect, useMemo, useState } from 'react';
import {
    FASTLANE_LS_KEY,
    MEV_PROXY_PREF_LS_KEY,
} from '../../ambient-utils/constants';
import { monadTestnet } from '../../ambient-utils/constants/networks/monadTestnet';

export interface FastLaneProtectionIF {
    isEnabled: boolean;
    enable: () => void;
    disable: () => void;
    toggle: () => void;
    isChainAccepted: (chainId: string) => boolean;
}

export const useFastLaneProtection = (): FastLaneProtectionIF => {
    const ACCEPTED_NETWORKS = [monadTestnet];
    const [enabled, setEnabled] = useState<boolean>(() => {
        const stored = localStorage.getItem(MEV_PROXY_PREF_LS_KEY);
        return stored ? JSON.parse(stored) : false;
    });

    useEffect(() => {
        // remove old fastlane key on mount
        localStorage.removeItem(FASTLANE_LS_KEY);
    }, []);

    // Effect to persist enabled state to localStorage
    useEffect(() => {
        localStorage.setItem(MEV_PROXY_PREF_LS_KEY, JSON.stringify(enabled));
    }, [enabled]);

    const isChainAccepted = (chainId: string): boolean => {
        return ACCEPTED_NETWORKS.some(
            (network) =>
                network.chainId.toLowerCase() === chainId.toLowerCase(),
        );
    };

    const result = useMemo(() => {
        return {
            isEnabled: enabled,
            enable: () => setEnabled(true),
            disable: () => setEnabled(false),
            toggle: () => setEnabled((prev) => !prev),
            isChainAccepted,
        };
    }, [enabled]);
    return result;
};
