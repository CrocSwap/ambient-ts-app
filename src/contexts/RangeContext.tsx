import { createContext, SetStateAction, Dispatch } from 'react';

interface RangeStateIF {
    maxRangePrice: number;
    setMaxRangePrice: Dispatch<SetStateAction<number>>;
    minRangePrice: number;
    setMinRangePrice: Dispatch<SetStateAction<number>>;
    simpleRangeWidth: number;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
    repositionRangeWidth: number;
    setRepositionRangeWidth: Dispatch<SetStateAction<number>>;
    rescaleRangeBoundariesWithSlider: boolean;
    setRescaleRangeBoundariesWithSlider: Dispatch<SetStateAction<boolean>>;
    chartTriggeredBy: string;
    setChartTriggeredBy: Dispatch<SetStateAction<string>>;
}

export const RangeContext = createContext<RangeStateIF>({} as RangeStateIF);
