import React, {
    createContext,
    SetStateAction,
    Dispatch,
    useState,
} from 'react';

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

export const RangeContextProvider = (props: { children: React.ReactNode }) => {
    const [maxRangePrice, setMaxRangePrice] = useState<number>(0);
    const [minRangePrice, setMinRangePrice] = useState<number>(0);
    const [simpleRangeWidth, setSimpleRangeWidth] = useState<number>(10);
    const [repositionRangeWidth, setRepositionRangeWidth] =
        useState<number>(10);
    const [
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
    ] = useState<boolean>(false);
    const [chartTriggeredBy, setChartTriggeredBy] = useState<string>('');

    const rangeState = {
        maxRangePrice,
        setMaxRangePrice,
        minRangePrice,
        setMinRangePrice,
        simpleRangeWidth,
        setSimpleRangeWidth,
        repositionRangeWidth,
        setRepositionRangeWidth,
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
        chartTriggeredBy,
        setChartTriggeredBy,
    };

    return (
        <RangeContext.Provider value={rangeState}>
            {props.children}
        </RangeContext.Provider>
    );
};
