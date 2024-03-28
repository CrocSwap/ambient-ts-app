import { useEffect, useState, Dispatch, SetStateAction, useMemo } from 'react';
import { LS_KEY_CHART_SETTINGS } from '../../ambient-utils/constants';
import { getLocalStorageItem } from '../../ambient-utils/dataLayer';

// interface for shape of data held in local storage
export interface chartSettingsIF {
    marketOverlay: string;
    poolOverlay: string;
    candleTimeGlobal: number;
    candleTimeMarket: number;
    candleTimePool: number;
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
    time: TimeInSecondsType | undefined;
    changeTime: (val: TimeInSecondsType) => void;
    defaults: DefaultTimeIF[];
    readableTime: ReadableTimeType;
}

type OverlayType = 'depth' | 'curve' | 'none';

// interface for return value of this hook
export interface chartSettingsMethodsIF {
    marketOverlay: overlayIF;
    poolOverlay: overlayIF;
    candleTime: {
        global: candleTimeIF;
        // market: candleTimeIF;
        // pool: candleTimeIF;
    };
}

// hook to manage user preferences for chart settings
export const useChartSettings = (
    numCandlesFetched: number | undefined,
    currentPoolString: string,
): chartSettingsMethodsIF => {
    // fn to get user preference for overlay to display on the chart by module
    // will return `undefined` if the value does not exist yet
    // value of `undefined` will be handled downstream
    const getOverlay = (
        overlayFor: 'market' | 'limit' | 'pool',
    ): OverlayType | undefined => {
        const chartSettings: chartSettingsIF | null = JSON.parse(
            getLocalStorageItem(LS_KEY_CHART_SETTINGS) ?? '{}',
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
            case 'pool':
                output = chartSettings?.poolOverlay ?? 'curve';
                break;
            default:
                return;
        }
        return output as OverlayType;
    };

    const [maxDuration, setMaxDuration] = useState<TimeInSecondsType>(86400);

    useEffect(() => {
        setMaxDuration(86400);
    }, [currentPoolString]);

    const getCandleTime = (
        currentCandleTimeGlobal: TimeInSecondsType | undefined,
    ): TimeInSecondsType | undefined => {
        if (numCandlesFetched === undefined) {
            return undefined;
        }

        let newCandleDuration;
        if (currentCandleTimeGlobal === undefined) {
            if (numCandlesFetched >= 7) {
                newCandleDuration = 3600;
            } else {
                newCandleDuration = 900;
            }
        } else {
            if (numCandlesFetched >= 7) {
                newCandleDuration = currentCandleTimeGlobal;
            } else {
                if (currentCandleTimeGlobal === 86400) {
                    newCandleDuration = 14400;
                    setMaxDuration(14400);
                } else if (currentCandleTimeGlobal === 14400) {
                    newCandleDuration = 3600;
                    setMaxDuration(3600);
                } else if (currentCandleTimeGlobal === 3600) {
                    newCandleDuration = 900;
                    setMaxDuration(900);
                } else if (currentCandleTimeGlobal === 900) {
                    newCandleDuration = 300;
                    setMaxDuration(300);
                } else {
                    newCandleDuration = 60;
                    setMaxDuration(60);
                }
            }
        }

        return newCandleDuration as TimeInSecondsType;
    };

    useEffect(() => {
        const chartSettings: chartSettingsIF | null = JSON.parse(
            getLocalStorageItem(LS_KEY_CHART_SETTINGS) ?? '{}',
        );
        const currentCandleTimeGlobal = chartSettings?.candleTimeGlobal as
            | TimeInSecondsType
            | undefined;

        setCandleTimeGlobal(() => getCandleTime(currentCandleTimeGlobal));
    }, [numCandlesFetched]);

    const [marketOverlay, setMarketOverlay] = useState<OverlayType>(
        getOverlay('market') ?? 'depth',
    );
    const [poolOverlay, setPoolOverlay] = useState<OverlayType>(
        getOverlay('pool') ?? 'curve',
    );

    const [candleTimeGlobal, setCandleTimeGlobal] = useState<
        TimeInSecondsType | undefined
    >();

    // const [candleTimeMarket, setCandleTimeMarket] = useState<TimeInSecondsType>(
    //     getCandleTime('market') ?? 900,
    // );
    // const [candleTimePool, setCandleTimePool] = useState<TimeInSecondsType>(
    //     getCandleTime('pool') ?? 900, // switched from 86400 (1 day)
    // );

    // hook to update local storage any time one of the preference primitives changes
    // this must be implemented as a response to change, not in Subchart methods
    useEffect(() => {
        const chartSettings: chartSettingsIF | null = JSON.parse(
            getLocalStorageItem(LS_KEY_CHART_SETTINGS) ?? '{}',
        );
        const currentCandleTimeGlobal = chartSettings?.candleTimeGlobal as
            | TimeInSecondsType
            | undefined;

        const candleTimeToSave = candleTimeGlobal || currentCandleTimeGlobal;
        localStorage.setItem(
            LS_KEY_CHART_SETTINGS,
            JSON.stringify({
                marketOverlay,
                poolOverlay,
                candleTimeGlobal: candleTimeToSave,
                // candleTimeMarket,
                // candleTimePool,
            }),
        );
    }, [
        marketOverlay,
        poolOverlay,
        // candleTimeMarket,
        // candleTimePool,
        candleTimeGlobal,
        getLocalStorageItem,
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
        time: TimeInSecondsType | undefined;
        // eslint-disable-next-line
        changeTime: (_val: TimeInSecondsType) => void;
        defaults: DefaultTimeIF[] =
            maxDuration === 86400
                ? [
                      { readable: '1m', seconds: 60 },
                      { readable: '5m', seconds: 300 },
                      { readable: '15m', seconds: 900 },
                      { readable: '1h', seconds: 3600 },
                      { readable: '4h', seconds: 14400 },
                      { readable: '1d', seconds: 86400 },
                  ]
                : maxDuration === 14400
                ? [
                      { readable: '1m', seconds: 60 },
                      { readable: '5m', seconds: 300 },
                      { readable: '15m', seconds: 900 },
                      { readable: '1h', seconds: 3600 },
                      { readable: '4h', seconds: 14400 },
                  ]
                : maxDuration === 3600
                ? [
                      { readable: '1m', seconds: 60 },
                      { readable: '5m', seconds: 300 },
                      { readable: '15m', seconds: 900 },
                      { readable: '1h', seconds: 3600 },
                  ]
                : maxDuration === 900
                ? [
                      { readable: '1m', seconds: 60 },
                      { readable: '5m', seconds: 300 },
                      { readable: '15m', seconds: 900 },
                  ]
                : maxDuration === 300
                ? [
                      { readable: '1m', seconds: 60 },
                      { readable: '5m', seconds: 300 },
                  ]
                : [{ readable: '1m', seconds: 60 }];
        readableTime =
            this.defaults.find(
                (pair: DefaultTimeIF) => pair.seconds === this.time,
            )?.readable ?? '15m';
        constructor(
            t: TimeInSecondsType | undefined,
            setterFn: Dispatch<SetStateAction<TimeInSecondsType | undefined>>,
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
            poolOverlay: new Overlay(poolOverlay, setPoolOverlay),
            candleTime: {
                global: new CandleTime(candleTimeGlobal, setCandleTimeGlobal),
                // market: new CandleTime(candleTimeMarket, setCandleTimeMarket),
                // pool: new CandleTime(candleTimePool, setCandleTimePool),
            },
        };
    }, [
        // candleTimeMarket,
        // candleTimePool,
        candleTimeGlobal,
        marketOverlay,
        poolOverlay,
        maxDuration,
    ]);

    return chartSettings;
};
