import React, {
    createContext,
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
    chartSettingsMethodsIF,
    useChartSettings,
} from '../App/hooks/useChartSettings';
import { getLocalStorageItem } from '../ambient-utils/dataLayer';
import { LS_KEY_CHART_ANNOTATIONS } from '../pages/Chart/ChartUtils/chartConstants';
import {
    actionKeyIF,
    actionStackIF,
    useUndoRedo,
} from '../pages/Chart/ChartUtils/useUndoRedo';
import { TradeDataContext, TradeDataContextIF } from './TradeDataContext';
import {
    drawDataHistory,
    selectedDrawnData,
} from '../pages/Chart/ChartUtils/chartUtils';

type TradeTableState = 'Expanded' | 'Collapsed' | undefined;

interface ChartHeights {
    current: number;
    saved: number;
    min: number;
    max: number;
    default: number;
}

interface ChartContextIF {
    chartSettings: chartSettingsMethodsIF;
    isFullScreen: boolean;
    setIsFullScreen: (val: boolean) => void;
    setChartHeight: (val: number) => void;
    chartHeights: ChartHeights;
    isEnabled: boolean;
    canvasRef: React.MutableRefObject<null>;
    chartCanvasRef: React.MutableRefObject<null>;
    tradeTableState: TradeTableState;
    isMagnetActive: { value: boolean };
    setIsMagnetActive: React.Dispatch<{ value: boolean }>;
    isChangeScaleChart: boolean;
    setIsChangeScaleChart: React.Dispatch<boolean>;
    isCandleDataNull: boolean;
    setNumCandlesFetched: React.Dispatch<number | undefined>;
    numCandlesFetched: number | undefined;
    setIsCandleDataNull: Dispatch<SetStateAction<boolean>>;
    isToolbarOpen: boolean;
    setIsToolbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    undoRedoOptions: {
        undo: () => void;
        redo: () => void;
        deleteItem: (item: drawDataHistory) => void;
        currentPool: TradeDataContextIF;
        drawnShapeHistory: drawDataHistory[];
        setDrawnShapeHistory: React.Dispatch<SetStateAction<drawDataHistory[]>>;
        drawActionStack: Map<actionKeyIF, actionStackIF[]>;
        actionKey: actionKeyIF;
        addDrawActionStack: (
            tempLastData: drawDataHistory,
            isNewShape: boolean,
            type: string,
            updatedData?: drawDataHistory | undefined,
        ) => void;
        undoStack: Map<actionKeyIF, actionStackIF[]>;
        deleteAllShapes: () => void;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toolbarRef: React.MutableRefObject<any>;
    activeDrawingType: string;
    setActiveDrawingType: React.Dispatch<SetStateAction<string>>;
    selectedDrawnShape: selectedDrawnData | undefined;
    setSelectedDrawnShape: React.Dispatch<
        SetStateAction<selectedDrawnData | undefined>
    >;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chartContainerOptions: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setChartContainerOptions: React.Dispatch<SetStateAction<any>>;
    isChartHeightMinimum: boolean;
    setIsChartHeightMinimum: React.Dispatch<SetStateAction<boolean>>;
    isMagnetActiveLocal: boolean;
    setIsMagnetActiveLocal: React.Dispatch<SetStateAction<boolean>>;
}

export const ChartContext = createContext<ChartContextIF>({} as ChartContextIF);

export const ChartContextProvider = (props: { children: React.ReactNode }) => {
    // 2:1 ratio of the window height subtracted by main header and token info header
    const CHART_MAX_HEIGHT = window.innerHeight - 160;
    const CHART_MIN_HEIGHT = 4;
    const CHART_DEFAULT_HEIGHT = Math.floor((CHART_MAX_HEIGHT * 2) / 3);
    let CHART_SAVED_HEIGHT = CHART_DEFAULT_HEIGHT;

    // Fetch alternative default height from local storage if it exists
    const CHART_SAVED_HEIGHT_LOCAL_STORAGE =
        localStorage.getItem('savedChartHeight');

    if (CHART_SAVED_HEIGHT_LOCAL_STORAGE) {
        CHART_SAVED_HEIGHT = parseInt(CHART_SAVED_HEIGHT_LOCAL_STORAGE);
    }

    const [isCandleDataNull, setIsCandleDataNull] = useState(false);

    const chartAnnotations: {
        isMagnetActive: boolean;
    } | null = JSON.parse(
        getLocalStorageItem(LS_KEY_CHART_ANNOTATIONS) ?? '{}',
    );

    const [isMagnetActive, setIsMagnetActive] = useState({
        value: chartAnnotations?.isMagnetActive ?? false,
    });

    const [isMagnetActiveLocal, setIsMagnetActiveLocal] = useState(
        isMagnetActive.value,
    );

    const { isDenomBase, isTokenABase } = useContext(TradeDataContext);
    const toolbarRef = useRef<HTMLDivElement | null>(null);

    const denominationsInBase = isDenomBase;
    const undoRedoOptions = useUndoRedo(denominationsInBase, isTokenABase);
    const [isChangeScaleChart, setIsChangeScaleChart] = useState(false);

    const [activeDrawingType, setActiveDrawingType] = useState('Cross');

    const [selectedDrawnShape, setSelectedDrawnShape] = useState<
        selectedDrawnData | undefined
    >(undefined);

    const [chartContainerOptions, setChartContainerOptions] = useState();

    const [isChartHeightMinimum, setIsChartHeightMinimum] = useState(false);

    const [chartHeights, setChartHeights] = useState<{
        current: number;
        saved: number;
        min: number;
        max: number;
        default: number;
    }>({
        current: CHART_SAVED_HEIGHT,
        saved: CHART_SAVED_HEIGHT,
        min: CHART_MIN_HEIGHT,
        max: CHART_MAX_HEIGHT,
        default: CHART_DEFAULT_HEIGHT,
    });

    // the max size is based on the max height, and is subtracting the minimum size of table and the padding around the drag bar
    useEffect(() => {
        const updateDimension = () => {
            setChartHeights({
                ...chartHeights,
                min: CHART_MIN_HEIGHT,
                max: CHART_MAX_HEIGHT,
                default: CHART_DEFAULT_HEIGHT,
            });
        };
        window.addEventListener('resize', updateDimension);
        return () => {
            window.removeEventListener('resize', updateDimension);
        };
    }, [window.innerHeight, chartHeights]);

    const { pathname: currentLocation } = useLocation();
    const canvasRef = useRef(null);
    const chartCanvasRef = useRef(null);

    const [fullScreenChart, setFullScreenChart] = useState(false);
    const setChartHeight = (val: number) => {
        if (val > CHART_MIN_HEIGHT && val < CHART_MAX_HEIGHT) {
            localStorage.setItem('savedChartHeight', val.toString());
        }

        setChartHeights({
            ...chartHeights,
            current: val,
            saved:
                val > CHART_MIN_HEIGHT && val < CHART_MAX_HEIGHT
                    ? val
                    : chartHeights.saved,
            default: CHART_DEFAULT_HEIGHT,
        });
    };

    const tradeTableState: TradeTableState =
        chartHeights.current === chartHeights.min
            ? 'Expanded'
            : chartHeights.current === chartHeights.max
            ? 'Collapsed'
            : undefined;

    const isChartEnabled =
        !!import.meta.env.VITE_CHART_IS_ENABLED &&
        import.meta.env.VITE_CHART_IS_ENABLED.toLowerCase() === 'false'
            ? false
            : true;

    const initialData = localStorage.getItem(LS_KEY_CHART_ANNOTATIONS);

    const initialIsToolbarOpen = initialData
        ? JSON.parse(initialData).isOpenAnnotationPanel
        : true;

    const [isToolbarOpen, setIsToolbarOpen] =
        useState<boolean>(initialIsToolbarOpen);

    const [numCandlesFetched, setNumCandlesFetched] = useState<
        number | undefined
    >();

    const currentPoolString =
        undoRedoOptions.currentPool.tokenA.address +
        '/' +
        undoRedoOptions.currentPool.tokenB.address;

    const chartSettings = useChartSettings(
        numCandlesFetched,
        currentPoolString,
    );

    const chartContext = {
        chartSettings,
        isFullScreen: fullScreenChart,
        setIsFullScreen: setFullScreenChart,
        chartHeights,
        setChartHeight,
        isEnabled: isChartEnabled,
        canvasRef,
        chartCanvasRef,
        tradeTableState,
        isMagnetActive,
        setIsMagnetActive,
        isChangeScaleChart,
        setIsChangeScaleChart,
        isCandleDataNull,
        setIsCandleDataNull,
        isToolbarOpen,
        setIsToolbarOpen,
        undoRedoOptions,
        toolbarRef,
        activeDrawingType,
        setActiveDrawingType,
        selectedDrawnShape,
        setSelectedDrawnShape,
        chartContainerOptions,
        setChartContainerOptions,
        isChartHeightMinimum,
        setIsChartHeightMinimum,
        isMagnetActiveLocal,
        setIsMagnetActiveLocal,
        numCandlesFetched,
        setNumCandlesFetched,
    };

    useEffect(() => {
        setIsChartHeightMinimum(chartHeights.current <= CHART_MIN_HEIGHT);
    }, [chartHeights.current]);

    useEffect(() => {
        if (!currentLocation.startsWith('/trade')) {
            setFullScreenChart(false);
        }
    }, [currentLocation]);

    useEffect(() => {
        const storedData = localStorage.getItem(LS_KEY_CHART_ANNOTATIONS);
        if (!storedData) {
            localStorage.setItem(
                LS_KEY_CHART_ANNOTATIONS,
                JSON.stringify({
                    isOpenAnnotationPanel: true,
                    drawnShapes: [],
                    isMagnetActive: false,
                }),
            );
        }
    }, []);

    useEffect(() => {
        const storedData = localStorage.getItem(LS_KEY_CHART_ANNOTATIONS);
        if (storedData) {
            const parseStoredData = JSON.parse(storedData);
            parseStoredData.isMagnetActive = isMagnetActive.value;
            localStorage.setItem(
                LS_KEY_CHART_ANNOTATIONS,
                JSON.stringify(parseStoredData),
            );
        }
    }, [isMagnetActive]);

    return (
        <ChartContext.Provider value={chartContext}>
            {props.children}
        </ChartContext.Provider>
    );
};
