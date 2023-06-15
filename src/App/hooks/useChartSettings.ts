import { useEffect, useState, Dispatch, SetStateAction, useMemo } from 'react';
import { LS_KEY_CHART_SETTINGS } from '../../constants';
import { getLocalStorageItem } from '../../utils/functions/getLocalStorageItem';

// interface for shape of data held in local storage
interface chartSettingsIF {
    marketOverlay: string;
    rangeOverlay: string;
    candleTimeGlobal: number;
    candleTimeMarket: number;
    candleTimeRange: number;
}

// interface for class to manage a given chart overlay
export interface overlayIF {
    readonly overlay: string;
    readonly showDepth: () => void;
    readonly showCurve: () => void;
    readonly showNone: () => void;
}

type ReadableTimeType = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
type TimeInSecondsType = 60 | 300 | 900 | 3600 | 14400 | 86400;

interface DefaultTimeIF {
    readable: ReadableTimeType;
    seconds: TimeInSecondsType;
}

export interface candleTimeIF {
    time: TimeInSecondsType;
    changeTime: (val: TimeInSecondsType) => void;
    defaults: DefaultTimeIF[];
    readableTime: ReadableTimeType;
}

type OverlayType = 'depth' | 'curve' | 'none';

// interface for return value of this hook
export interface chartSettingsMethodsIF {
    marketOverlay: overlayIF;
    rangeOverlay: overlayIF;
    candleTime: {
        global: candleTimeIF;
        market: candleTimeIF;
        range: candleTimeIF;
    };
}

// hook to manage user preferences for chart settings
export const useChartSettings = (): chartSettingsMethodsIF => {
    // fn to get user preference for overlay to display on the chart by module
    // will return `undefined` if the value does not exist yet
    // value of `undefined` will be handled downstream
    const getOverlay = (
        overlayFor: 'market' | 'limit' | 'range',
    ): OverlayType | undefined => {
        const chartSettings: chartSettingsIF | null = JSON.parse(
            getLocalStorageItem(LS_KEY_CHART_SETTINGS) ?? '',
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
        return output as OverlayType;
    };

    const getCandleTime = (
        timeFor: 'global' | 'market' | 'limit' | 'range',
    ): TimeInSecondsType | undefined => {
        const chartSettings: chartSettingsIF | null = JSON.parse(
            getLocalStorageItem(LS_KEY_CHART_SETTINGS) ?? '',
        );
        let time: number | undefined;
        switch (timeFor) {
            case 'global':
            case 'market':
            case 'limit':
            case 'range':
                time = chartSettings?.candleTimeGlobal;
                break;
            default:
                return;
        }
        return time as TimeInSecondsType;
    };

    const [marketOverlay, setMarketOverlay] = useState<OverlayType>(
        getOverlay('market') ?? 'depth',
    );
    const [rangeOverlay, setRangeOverlay] = useState<OverlayType>(
        getOverlay('range') ?? 'curve',
    );
    const [candleTimeGlobal, setCandleTimeGlobal] = useState<TimeInSecondsType>(
        getCandleTime('global') ?? 3600, // 1 hr default
    );
    const [candleTimeMarket, setCandleTimeMarket] = useState<TimeInSecondsType>(
        getCandleTime('market') ?? 900,
    );
    const [candleTimeRange, setCandleTimeRange] = useState<TimeInSecondsType>(
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
                candleTimeGlobal,
                candleTimeMarket,
                candleTimeRange,
            }),
        );
    }, [
        marketOverlay,
        rangeOverlay,
        candleTimeMarket,
        candleTimeRange,
        candleTimeGlobal,
    ]);

    // class definition for overlay setting and methods
    class Overlay implements overlayIF {
        // base value
        public readonly overlay: OverlayType;
        // pre-loaded setter functions
        public readonly showDepth: () => void;
        public readonly showCurve: () => void;
        public readonly showNone: () => void;
        // @param value ➡ current value from local state
        // @param setterFn ➡ fn to update local state
        constructor(
            value: OverlayType,
            setterFn: Dispatch<SetStateAction<OverlayType>>,
        ) {
            this.overlay = value;
            this.showDepth = () => setterFn('depth');
            this.showCurve = () => setterFn('curve');
            this.showNone = () => setterFn('none');
        }
    }

    class CandleTime implements candleTimeIF {
        time: TimeInSecondsType;
        // eslint-disable-next-line
        changeTime: (_val: TimeInSecondsType) => void;
        defaults: DefaultTimeIF[] = [
            { readable: '1m', seconds: 60 },
            { readable: '5m', seconds: 300 },
            { readable: '15m', seconds: 900 },
            { readable: '1h', seconds: 3600 },
            { readable: '4h', seconds: 14400 },
            { readable: '1d', seconds: 86400 },
        ];
        readableTime =
            this.defaults.find(
                (pair: DefaultTimeIF) => pair.seconds === this.time,
            )?.readable ?? '15m';
        constructor(
            t: TimeInSecondsType,
            setterFn: Dispatch<SetStateAction<TimeInSecondsType>>,
        ) {
            this.time = t;
            this.changeTime = (val: TimeInSecondsType) => {
                setterFn(val);
            };
        }
    }

    const chartSettings = useMemo<chartSettingsMethodsIF>(() => {
        return {
            marketOverlay: new Overlay(marketOverlay, setMarketOverlay),
            rangeOverlay: new Overlay(rangeOverlay, setRangeOverlay),
            candleTime: {
                global: new CandleTime(candleTimeGlobal, setCandleTimeGlobal),
                market: new CandleTime(candleTimeMarket, setCandleTimeMarket),
                range: new CandleTime(candleTimeRange, setCandleTimeRange),
            },
        };
    }, [
        candleTimeMarket,
        candleTimeRange,
        candleTimeGlobal,
        marketOverlay,
        rangeOverlay,
    ]);

    return chartSettings;
};
