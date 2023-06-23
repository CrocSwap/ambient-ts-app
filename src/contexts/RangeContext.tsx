import React, {
    createContext,
    SetStateAction,
    Dispatch,
    useState,
} from 'react';

interface RangeContextIF {
    maxRangePrice: number;
    setMaxRangePrice: Dispatch<SetStateAction<number>>;
    minRangePrice: number;
    setMinRangePrice: Dispatch<SetStateAction<number>>;
    simpleRangeWidth: number;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
    rescaleRangeBoundariesWithSlider: boolean;
    setRescaleRangeBoundariesWithSlider: Dispatch<SetStateAction<boolean>>;
    chartTriggeredBy: string;
    setChartTriggeredBy: Dispatch<SetStateAction<string>>;
    currentRangeInReposition: string;
    setCurrentRangeInReposition: Dispatch<SetStateAction<string>>;
}

export const RangeContext = createContext<RangeContextIF>({} as RangeContextIF);

export const RangeContextProvider = (props: { children: React.ReactNode }) => {
    const [maxRangePrice, setMaxRangePrice] = useState<number>(0);
    const [minRangePrice, setMinRangePrice] = useState<number>(0);
    const [simpleRangeWidth, setSimpleRangeWidth] = useState<number>(10);

    const [currentRangeInReposition, setCurrentRangeInReposition] =
        useState<string>('');

    const [
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
    ] = useState<boolean>(false);
    const [chartTriggeredBy, setChartTriggeredBy] = useState<string>('');

    const rangeContext = {
        maxRangePrice,
        setMaxRangePrice,
        minRangePrice,
        setMinRangePrice,
        simpleRangeWidth,
        setSimpleRangeWidth,
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
        chartTriggeredBy,
        setChartTriggeredBy,
        currentRangeInReposition,
        setCurrentRangeInReposition,
    };

    return (
        <RangeContext.Provider value={rangeContext}>
            {props.children}
        </RangeContext.Provider>
    );
};
