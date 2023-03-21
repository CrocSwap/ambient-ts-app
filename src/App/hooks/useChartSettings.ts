// START: Import React and Dongles
import { useEffect, useState, Dispatch, SetStateAction } from 'react';

// interface for shape of data held in local storage
interface chartSettingsLocalStorageIF {
    isVolumeSubchartEnabled: boolean;
    isTvlSubchartEnabled: boolean;
    isFeeRateSubchartEnabled: boolean;
    marketOverlay: string | null;
    rangeOverlay: string | null;
}

// interface for class to manage a given subchart setting
interface subchartSettingsIF {
    readonly isEnabled: boolean;
    enable: () => void;
    disable: () => void;
    toggle: () => void;
}

// interface for class to manage a given chart overlay
interface overlayIF {
    readonly pref: string;
    readonly showDepth: () => void;
    readonly showCurve: () => void;
    readonly showNone: () => void;
}

// interface for return value of this hool
export interface chartSettingsMethodsIF {
    volumeSubchart: subchartSettingsIF;
    tvlSubchart: subchartSettingsIF;
    feeRateSubchart: subchartSettingsIF;
    marketOverlay: overlayIF;
    rangeOverlay: overlayIF;
}

// hook to manage user preferences for chart settings
export const useChartSettings = (): chartSettingsMethodsIF => {
    const localStorageKey = 'chart_settings';

    const getDataFromLocalStorage = (): chartSettingsLocalStorageIF | null => {
        return JSON.parse(localStorage.getItem(localStorageKey) as string);
    };

    // fn to check a user preference for any given subchart
    const getPreference = (subchart: string): boolean | undefined => {
        // persisted data from local storage, returns undefined if not present
        const chartSettings: chartSettingsLocalStorageIF | null =
            getDataFromLocalStorage();
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

    const getOverlay = (overlay: string): string | undefined => {
        const chartSettings: chartSettingsLocalStorageIF | null =
            getDataFromLocalStorage();
        let output: string | undefined;
        switch (overlay) {
            case 'market':
            case 'limit':
                output = chartSettings?.marketOverlay ?? 'depth';
                break;
            case 'range':
                output = chartSettings?.rangeOverlay ?? 'curve';
                break;
            default:
                return;
        }
        return output;
    };

    // hooks to memoize user preferences in local state
    // initializer fallback value is default setting for new users
    const [isVolumeSubchartEnabled, setIsVolumeSubchartEnabled] =
        useState<boolean>(getPreference('volume') ?? true);
    const [isTvlSubchartEnabled, setIsTvlSubchartEnabled] = useState<boolean>(
        getPreference('tvl') ?? false,
    );
    const [isFeeRateSubchartEnabled, setIsFeeRateSubchartEnabled] =
        useState<boolean>(getPreference('feeRate') ?? false);

    const [marketOverlay, setMarketOverlay] = useState<string>(
        getOverlay('market') ?? 'depth',
    );
    const [rangeOverlay, setRangeOverlay] = useState<string>(
        getOverlay('range') ?? 'curve',
    );

    // hook to update local storage any time one of the preference primitives changes
    // this must be implemented as a response to change, not in Subchart methods
    useEffect(() => {
        localStorage.setItem(
            localStorageKey,
            JSON.stringify({
                isVolumeSubchartEnabled,
                isTvlSubchartEnabled,
                isFeeRateSubchartEnabled,
                marketOverlay,
                rangeOverlay,
            }),
        );
    }, [
        isVolumeSubchartEnabled,
        isTvlSubchartEnabled,
        isFeeRateSubchartEnabled,
        marketOverlay,
        rangeOverlay,
    ]);

    // class definition for subchart setting and methods
    // checked against subchartSettingsIF
    class Subchart implements subchartSettingsIF {
        // base value of the preference
        public readonly isEnabled: boolean;
        // state setter fn
        private readonly setter: Dispatch<SetStateAction<boolean>>;
        // @param enabled ➡ current value from local state
        // @param setterFn ➡ fn to update local state
        constructor(
            enabled: boolean,
            setterFn: Dispatch<SetStateAction<boolean>>,
        ) {
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

    class Overlay implements overlayIF {
        public readonly pref: string;
        public readonly showDepth: () => void;
        public readonly showCurve: () => void;
        public readonly showNone: () => void;
        constructor(value: string, setterFn: Dispatch<SetStateAction<string>>) {
            this.pref = value;
            this.showDepth = () => setterFn('depth');
            this.showCurve = () => setterFn('curve');
            this.showNone = () => setterFn('none');
        }
    }

    return {
        volumeSubchart: new Subchart(
            isVolumeSubchartEnabled,
            setIsVolumeSubchartEnabled,
        ),
        tvlSubchart: new Subchart(
            isTvlSubchartEnabled,
            setIsTvlSubchartEnabled,
        ),
        feeRateSubchart: new Subchart(
            isFeeRateSubchartEnabled,
            setIsFeeRateSubchartEnabled,
        ),
        marketOverlay: new Overlay(marketOverlay, setMarketOverlay),
        rangeOverlay: new Overlay(rangeOverlay, setRangeOverlay),
    };
};
