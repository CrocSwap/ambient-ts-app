import React, {
    createContext,
    SetStateAction,
    Dispatch,
    useState,
} from 'react';

interface RangeContextIF {
    rangeTicksCopied: boolean;
    setRangeTicksCopied: Dispatch<SetStateAction<boolean>>;

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
    currentRangeInEdit: string;
    setCurrentRangeInEdit: Dispatch<SetStateAction<string>>;
    currentRangeInAdd: string;
    setCurrentRangeInAdd: Dispatch<SetStateAction<string>>;

    advancedMode: boolean;
    advancedLowTick: number;
    advancedHighTick: number;
    setAdvancedMode: Dispatch<SetStateAction<boolean>>;
    setAdvancedLowTick: Dispatch<SetStateAction<number>>;
    setAdvancedHighTick: Dispatch<SetStateAction<number>>;
    isLinesSwitched: boolean | undefined;
    setIsLinesSwitched: Dispatch<SetStateAction<boolean | undefined>>;

    pinnedDisplayPrices:
        | {
              pinnedMinPriceDisplay: string;
              pinnedMaxPriceDisplay: string;
              pinnedMinPriceDisplayTruncated: string;
              pinnedMaxPriceDisplayTruncated: string;
              pinnedMinPriceDisplayTruncatedWithCommas: string;
              pinnedMaxPriceDisplayTruncatedWithCommas: string;
              pinnedLowTick: number;
              pinnedHighTick: number;
              pinnedMinPriceNonDisplay: number;
              pinnedMaxPriceNonDisplay: number;
          }
        | undefined;

    setPinnedDisplayPrices: React.Dispatch<
        React.SetStateAction<
            | {
                  pinnedMinPriceDisplay: string;
                  pinnedMaxPriceDisplay: string;
                  pinnedMinPriceDisplayTruncated: string;
                  pinnedMaxPriceDisplayTruncated: string;
                  pinnedMinPriceDisplayTruncatedWithCommas: string;
                  pinnedMaxPriceDisplayTruncatedWithCommas: string;
                  pinnedLowTick: number;
                  pinnedHighTick: number;
                  pinnedMinPriceNonDisplay: number;
                  pinnedMaxPriceNonDisplay: number;
              }
            | undefined
        >
    >;
}

export const RangeContext = createContext<RangeContextIF>({} as RangeContextIF);

export const RangeContextProvider = (props: { children: React.ReactNode }) => {
    // low and high bounds of range to display in DOM for advanced mode
    const [maxRangePrice, setMaxRangePrice] = useState<number>(0);
    const [minRangePrice, setMinRangePrice] = useState<number>(0);

    const [rangeTicksCopied, setRangeTicksCopied] = useState<boolean>(false);
    const [simpleRangeWidth, setSimpleRangeWidth] = useState<number>(10);

    const [currentRangeInReposition, setCurrentRangeInReposition] =
        useState<string>('');
    const [currentRangeInEdit, setCurrentRangeInEdit] = useState<string>('');
    const [currentRangeInAdd, setCurrentRangeInAdd] = useState<string>('');
    const [advancedMode, setAdvancedMode] = useState<boolean>(false);
    const [advancedLowTick, setAdvancedLowTick] = useState<number>(0);
    const [advancedHighTick, setAdvancedHighTick] = useState<number>(0);
    const [
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
    ] = useState<boolean>(false);
    const [chartTriggeredBy, setChartTriggeredBy] = useState<string>('');
    const [isLinesSwitched, setIsLinesSwitched] = useState<boolean | undefined>(
        undefined,
    );

    const [pinnedDisplayPrices, setPinnedDisplayPrices] = useState<
        | {
              pinnedMinPriceDisplay: string;
              pinnedMaxPriceDisplay: string;
              pinnedMinPriceDisplayTruncated: string;
              pinnedMaxPriceDisplayTruncated: string;
              pinnedMinPriceDisplayTruncatedWithCommas: string;
              pinnedMaxPriceDisplayTruncatedWithCommas: string;
              pinnedLowTick: number;
              pinnedHighTick: number;
              pinnedMinPriceNonDisplay: number;
              pinnedMaxPriceNonDisplay: number;
          }
        | undefined
    >();

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
        currentRangeInEdit,
        setCurrentRangeInEdit,
        currentRangeInAdd,
        setCurrentRangeInAdd,
        rangeTicksCopied,
        setRangeTicksCopied,

        advancedMode,
        setAdvancedMode,
        advancedLowTick,
        setAdvancedLowTick,
        advancedHighTick,
        setAdvancedHighTick,
        isLinesSwitched,
        setIsLinesSwitched,
        pinnedDisplayPrices,
        setPinnedDisplayPrices,
    };

    return (
        <RangeContext.Provider value={rangeContext}>
            {props.children}
        </RangeContext.Provider>
    );
};
