import { useEffect, useState, Dispatch, SetStateAction, useMemo } from 'react';
import {
    LS_KEY_CHART_SETTINGS,
    LS_KEY_SUBCHART_SETTINGS,
} from '../../constants';
import { getLocalStorageItem } from '../../utils/functions/getLocalStorageItem';

// interface for shape of data held in local storage
interface chartSettingsIF {
    isVolumeSubchartEnabled: boolean;
    isTvlSubchartEnabled: boolean;
    isFeeRateSubchartEnabled: boolean;
    marketOverlay: string;
    rangeOverlay: string;
    candleTimeMarket: number;
    candleTimeRange: number;
}

// interface for class to manage a given subchart setting
interface subchartSettingsIF {
    readonly isEnabled: boolean;
    enable: () => void;
    disable: () => void;
    toggle: () => void;
}

export interface SubChartTogglesIF {
    isVolumeSubchartEnabled: boolean;
    isTvlSubchartEnabled: boolean;
    isFeeRateSubchartEnabled: boolean;
}

// interface for class to manage a given chart overlay
export interface overlayIF {
    readonly overlay: string;
    readonly showDepth: () => void;
    readonly showCurve: () => void;
    readonly showNone: () => void;
}

export interface candleTimeIF {
    time: number;
    changeTime: (val: number) => void;
    defaults: Array<{ readable: string; seconds: number }>;
    readableTime: string;
}

// interface for return value of this hook
export interface chartSettingsMethodsIF {
    volumeSubchart: subchartSettingsIF;
    tvlSubchart: subchartSettingsIF;
    feeRateSubchart: subchartSettingsIF;
    marketOverlay: overlayIF;
    rangeOverlay: overlayIF;
    candleTime: {
        market: candleTimeIF;
        range: candleTimeIF;
    };
}

// hook to manage user preferences for chart settings
export const useChartSettings = (): chartSettingsMethodsIF => {
    // fn to get user preference for overlay to display on the chart by module
    // will return `undefined` if the value does not exist yet
    // value of `undefined` will be handled downstream
    const getOverlay = (overlayFor: string): string | undefined => {
        const chartSettings: chartSettingsIF | null = getLocalStorageItem(
            LS_KEY_CHART_SETTINGS,
        );
        // declare an output variable to be assigned in switch router
        let output: string | undefined;
        // logic router to assign a value to output
        // returns `undefined` if there is missing data or for invalid input
        switch (overlayFor) {
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

    const getCandleTime = (timeFor: string): number | undefined => {
        const chartSettings: chartSettingsIF | null = getLocalStorageItem(
            LS_KEY_CHART_SETTINGS,
        );
        let time: number | undefined;
        switch (timeFor) {
            case 'market':
            case 'limit':
                time = chartSettings?.candleTimeMarket;
                break;
            case 'range':
                time = chartSettings?.candleTimeRange;
                break;
            default:
                return;
        }
        return time;
    };

    const getSubChartToggles = (subchart: 'volume' | 'tvl' | 'feeRate') => {
        const subChartToggles: SubChartTogglesIF | null = getLocalStorageItem(
            LS_KEY_SUBCHART_SETTINGS,
        );

        switch (subchart) {
            case 'volume':
                return subChartToggles?.isVolumeSubchartEnabled;
            case 'tvl':
                return subChartToggles?.isTvlSubchartEnabled;
            case 'feeRate':
                return subChartToggles?.isFeeRateSubchartEnabled;
            default:
                return false;
        }
    };

    // hooks to memoize user preferences in local state
    // initializer fallback value is default setting for new users
    const [isVolumeSubchartEnabled, setIsVolumeSubchartEnabled] =
        useState<boolean>(getSubChartToggles('volume') ?? true);
    const [isTvlSubchartEnabled, setIsTvlSubchartEnabled] = useState<boolean>(
        getSubChartToggles('tvl') ?? false,
    );
    const [isFeeRateSubchartEnabled, setIsFeeRateSubchartEnabled] =
        useState<boolean>(getSubChartToggles('feeRate') ?? false);

    const [marketOverlay, setMarketOverlay] = useState<string>(
        getOverlay('market') ?? 'depth',
    );
    const [rangeOverlay, setRangeOverlay] = useState<string>(
        getOverlay('range') ?? 'curve',
    );
    const [candleTimeMarket, setCandleTimeMarket] = useState<number>(
        getCandleTime('market') ?? 900,
    );
    const [candleTimeRange, setCandleTimeRange] = useState<number>(
        getCandleTime('range') ?? 900, // switched from 86400 (1 day)
    );

    // hook to update local storage any time one of the preference primitives changes
    // this must be implemented as a response to change, not in Subchart methods
    useEffect(() => {
        localStorage.setItem(
            LS_KEY_CHART_SETTINGS,
            JSON.stringify({
                marketOverlay,
                rangeOverlay,
                candleTimeMarket,
                candleTimeRange,
            }),
        );
    }, [marketOverlay, rangeOverlay, candleTimeMarket, candleTimeRange]);

    // class definition for subchart setting and methods
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

    // class definition for overlay setting and methods
    class Overlay implements overlayIF {
        // base value
        public readonly overlay: string;
        // pre-loaded setter functions
        public readonly showDepth: () => void;
        public readonly showCurve: () => void;
        public readonly showNone: () => void;
        // @param value ➡ current value from local state
        // @param setterFn ➡ fn to update local state
        constructor(value: string, setterFn: Dispatch<SetStateAction<string>>) {
            this.overlay = value;
            this.showDepth = () => setterFn('depth');
            this.showCurve = () => setterFn('curve');
            this.showNone = () => setterFn('none');
        }
    }

    class CandleTime implements candleTimeIF {
        time: number;
        // eslint-disable-next-line
        changeTime: (_val: number) => void;
        defaults = [
            { readable: '1m', seconds: 60 },
            { readable: '5m', seconds: 300 },
            { readable: '15m', seconds: 900 },
            { readable: '1h', seconds: 3600 },
            { readable: '4h', seconds: 14400 },
            { readable: '1d', seconds: 86400 },
        ];
        readableTime =
            this.defaults.find((pair) => pair.seconds === this.time)
                ?.readable ?? '';
        constructor(t: number, setterFn: Dispatch<SetStateAction<number>>) {
            this.time = t;
            this.changeTime = (val: number) => {
                setterFn(val);
            };
        }
    }

    const chartSettings = useMemo(() => {
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
            candleTime: {
                market: new CandleTime(candleTimeMarket, setCandleTimeMarket),
                range: new CandleTime(candleTimeRange, setCandleTimeRange),
            },
        };
    }, [
        isVolumeSubchartEnabled,
        isTvlSubchartEnabled,
        isFeeRateSubchartEnabled,
        candleTimeMarket,
        candleTimeRange,
        marketOverlay,
        rangeOverlay,
    ]);

    return chartSettings;
};
