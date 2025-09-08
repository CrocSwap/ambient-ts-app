import { useContext, useEffect, useMemo, useState } from 'react';
import {
    FASTLANE_LS_KEY,
    MEV_PROTECTION_PREF_LS_KEY,
} from '../../ambient-utils/constants';
import { AppStateContext } from '../../contexts';

export interface FastLaneProtectionIF {
    isEnabled: boolean;
    enable: () => void;
    disable: () => void;
    toggle: () => void;
    isChainAccepted: boolean;
}

export const useFastLaneProtection = (): FastLaneProtectionIF => {
    const {
        activeNetwork: { fastLaneProtectionEnabled },
    } = useContext(AppStateContext);

    const [enabled, setEnabled] = useState<boolean>(() => {
        const stored = localStorage.getItem(MEV_PROTECTION_PREF_LS_KEY);
        return stored ? JSON.parse(stored) : false;
    });

    useEffect(() => {
        // remove old fastlane key on mount
        localStorage.removeItem(FASTLANE_LS_KEY);
    }, []);

    // Effect to persist enabled state to localStorage
    useEffect(() => {
        localStorage.setItem(
            MEV_PROTECTION_PREF_LS_KEY,
            JSON.stringify(enabled),
        );
    }, [enabled]);

    const isChainAccepted = useMemo(() => {
        return fastLaneProtectionEnabled;
    }, [fastLaneProtectionEnabled]);

    const result = useMemo(() => {
        return {
            isEnabled: enabled,
            enable: () => setEnabled(true),
            disable: () => setEnabled(false),
            toggle: () => setEnabled((prev) => !prev),
            isChainAccepted,
        };
    }, [enabled, isChainAccepted]);
    return result;
};
