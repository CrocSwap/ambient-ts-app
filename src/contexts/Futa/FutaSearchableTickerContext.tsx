import React, {
    createContext,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from 'react';

type TradeTableState = 'Expanded' | 'Collapsed' | undefined;

interface SearchableTickerHeights {
    current: number;
    saved: number;
    min: number;
    max: number;
    default: number;
}

interface FutaSearchableTickerContextIF {
    isFullScreen: boolean;
    setIsFullScreen: (val: boolean) => void;
    setSearchableTickerHeight: (val: number) => void;
    canvasRef: React.MutableRefObject<null>;
    chartCanvasRef: React.MutableRefObject<null>;

    tradeTableState: TradeTableState;
    searchableTickerHeights: SearchableTickerHeights;
    isSearchableTickerHeightMinimum: boolean;
    setIsSearchableTickerHeightMinimum: React.Dispatch<SetStateAction<boolean>>;
}

export const FutaSearchableTickerContext = createContext(
    {} as FutaSearchableTickerContextIF,
);

export const FutaSearchableTickerContextProvider = (props: {
    children: React.ReactNode;
}) => {
    if (import.meta.hot) {
        import.meta.hot.accept(() => {
            window.location.reload(); // Forces a full browser reload when context code changes
        });
    } // 2:1 ratio of the window height subtracted by main header and token info header
    const SEARCHABLE_TICKER_MAX_HEIGHT = window.innerHeight - 160;
    const SEARCHABLE_TICKER_MIN_HEIGHT = 54;
    const SEARCHABLE_TICKER_DEFAULT_HEIGHT = Math.floor(
        (SEARCHABLE_TICKER_MAX_HEIGHT * 2) / 3,
    );
    let SEARCHABLE_TICKER_SAVED_HEIGHT = SEARCHABLE_TICKER_DEFAULT_HEIGHT;

    // Fetch alternative default height from local storage if it exists
    const SEARCHABLE_TICKER_SAVED_HEIGHT_LOCAL_STORAGE = localStorage.getItem(
        'savedSearchableTickerHeight',
    );

    if (SEARCHABLE_TICKER_SAVED_HEIGHT_LOCAL_STORAGE) {
        SEARCHABLE_TICKER_SAVED_HEIGHT = parseInt(
            SEARCHABLE_TICKER_SAVED_HEIGHT_LOCAL_STORAGE,
        );
    }

    const [
        isSearchableTickerHeightMinimum,
        setIsSearchableTickerHeightMinimum,
    ] = useState(false);

    const [searchableTickerHeights, setSearchableTickerHeights] =
        useState<SearchableTickerHeights>({
            current: SEARCHABLE_TICKER_SAVED_HEIGHT,
            saved: SEARCHABLE_TICKER_SAVED_HEIGHT,
            min: SEARCHABLE_TICKER_MIN_HEIGHT,
            max: SEARCHABLE_TICKER_MAX_HEIGHT,
            default: SEARCHABLE_TICKER_DEFAULT_HEIGHT,
        });

    // the max size is based on the max height, and is subtracting the minimum size of table and the padding around the drag bar
    useEffect(() => {
        const updateDimension = () => {
            setSearchableTickerHeights({
                ...searchableTickerHeights,
                min: SEARCHABLE_TICKER_MIN_HEIGHT,
                max: SEARCHABLE_TICKER_MAX_HEIGHT,
                default: SEARCHABLE_TICKER_DEFAULT_HEIGHT,
            });
        };
        window.addEventListener('resize', updateDimension);
        return () => {
            window.removeEventListener('resize', updateDimension);
        };
    }, [window.innerHeight, searchableTickerHeights]);

    const canvasRef = useRef(null);
    const chartCanvasRef = useRef(null);

    const [fullScreenChart, setFullScreenChart] = useState(false);
    const setSearchableTickerHeight = (val: number) => {
        if (
            val > SEARCHABLE_TICKER_MIN_HEIGHT &&
            val < SEARCHABLE_TICKER_MAX_HEIGHT
        ) {
            localStorage.setItem('savedSearchableTickerHeight', val.toString());
        }

        setSearchableTickerHeights({
            ...searchableTickerHeights,
            current: val,
            saved:
                val > SEARCHABLE_TICKER_MIN_HEIGHT &&
                val < SEARCHABLE_TICKER_MAX_HEIGHT
                    ? val
                    : searchableTickerHeights.saved,
            default: SEARCHABLE_TICKER_DEFAULT_HEIGHT,
        });
    };

    const tradeTableState: TradeTableState =
        searchableTickerHeights.current === searchableTickerHeights.min
            ? 'Expanded'
            : searchableTickerHeights.current === searchableTickerHeights.max
              ? 'Collapsed'
              : undefined;

    const contextValue = {
        isFullScreen: fullScreenChart,
        setIsFullScreen: setFullScreenChart,
        searchableTickerHeights,
        setSearchableTickerHeight,
        canvasRef,
        tradeTableState,
        isSearchableTickerHeightMinimum,
        setIsSearchableTickerHeightMinimum,
        chartCanvasRef,
    };

    useEffect(() => {
        setIsSearchableTickerHeightMinimum(
            searchableTickerHeights.current <= SEARCHABLE_TICKER_MIN_HEIGHT,
        );
    }, [searchableTickerHeights.current]);

    return (
        <FutaSearchableTickerContext.Provider value={contextValue}>
            {props.children}
        </FutaSearchableTickerContext.Provider>
    );
};
