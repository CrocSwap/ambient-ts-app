// START: Import React and Dongles
import { useEffect, useState, Dispatch, SetStateAction } from 'react';

// interface for shape of data held in local storage
interface chartSettingsLocalStorageIF {
    isVolumeSubchartEnabled: boolean;
    isTvlSubchartEnabled: boolean;
    isFeeRateSubchartEnabled: boolean;
}

// interface for class to manage a given subchart setting
interface subchartSettingsIF {
    readonly isEnabled: boolean;
    enable: () => void;
    disable: () => void;
    toggle: () => void;
}

// interface for return value of this hool
export interface chartSettingsMethodsIF {
    volumeSubchart: subchartSettingsIF;
    tvlSubchart: subchartSettingsIF;
    feeRateSubchart: subchartSettingsIF;
}

// hook to manage user preferences for chart settings
export const useChartSettings = (): chartSettingsMethodsIF => {
    // fn to check a user preference for any given subchart
    const getPreference = (subchart: string): boolean | undefined => {
        // persisted data from local storage, returns undefined if not present
        const chartSettings: chartSettingsLocalStorageIF | null = JSON.parse(
            localStorage.getItem('chart_settings') as string,
        );
        let output: boolean | undefined;
        switch (subchart) {
            case 'volume':
                output = chartSettings?.isVolumeSubchartEnabled;
                break;
            case 'tvl':
                output = chartSettings?.isTvlSubchartEnabled;
                break;
            case 'feeRate':
                output = chartSettings?.isFeeRateSubchartEnabled;
                break;
            default:
                return;
        }
        return output;
    };

    // hooks to memoize user preferences in local state
    // initializer fallback value is default setting for new users
    const [isVolumeSubchartEnabled, setIsVolumeSubchartEnabled] = useState<boolean>(
        getPreference('volume') ?? true,
    );
    const [isTvlSubchartEnabled, setIsTvlSubchartEnabled] = useState<boolean>(
        getPreference('tvl') ?? false,
    );
    const [isFeeRateSubchartEnabled, setIsFeeRateSubchartEnabled] = useState<boolean>(
        getPreference('feeRate') ?? false,
    );

    // hook to update local storage any time one of the preference primitives changes
    // this must be implemented as a response to change, not in Subchart methods
    useEffect(() => {
        localStorage.setItem(
            'chart_settings',
            JSON.stringify({
                isVolumeSubchartEnabled,
                isTvlSubchartEnabled,
                isFeeRateSubchartEnabled,
            }),
        );
    }, [isVolumeSubchartEnabled, isTvlSubchartEnabled, isFeeRateSubchartEnabled]);

    // class definition for subchart setting and methods
    // checked against subchartSettingsIF
    class Subchart implements subchartSettingsIF {
        // base value of the preference
        public readonly isEnabled: boolean;
        // state setter fn
        private readonly setter: Dispatch<SetStateAction<boolean>>;
        // @param enabled ➡ current value from local state
        // @param setterFn ➡ fn to update local state
        constructor(enabled: boolean, setterFn: Dispatch<SetStateAction<boolean>>) {
            this.isEnabled = enabled;
            this.setter = setterFn;
        }
        // methods to assign a new value of the variable
        // code in this file will carry through new value to local storage
        enable() {
            this.setter(true);
        }
        disable() {
            this.setter(false);
        }
        toggle() {
            this.setter(!this.isEnabled);
        }
    }

    return {
        volumeSubchart: new Subchart(isVolumeSubchartEnabled, setIsVolumeSubchartEnabled),
        tvlSubchart: new Subchart(isTvlSubchartEnabled, setIsTvlSubchartEnabled),
        feeRateSubchart: new Subchart(isFeeRateSubchartEnabled, setIsFeeRateSubchartEnabled),
    };
};
