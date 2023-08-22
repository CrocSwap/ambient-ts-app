import React, { createContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    chartSettingsMethodsIF,
    useChartSettings,
} from '../App/hooks/useChartSettings';
import { drawDataHistory } from '../pages/Chart/ChartUtils/chartUtils';

interface ChartHeights {
    current: number;
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
    isDrawActive: boolean;
    setIsDrawActive: React.Dispatch<React.SetStateAction<boolean>>;
    drawnShapeHistory: drawDataHistory[];
    setDrawnShapeHistory: React.Dispatch<
        React.SetStateAction<drawDataHistory[]>
    >;
}

export const ChartContext = createContext<ChartContextIF>({} as ChartContextIF);

export const ChartContextProvider = (props: { children: React.ReactNode }) => {
    // 2:1 ratio of the window height subtracted by main header and token info header
    const CHART_MAX_HEIGHT = window.innerHeight - 98;
    const CHART_DEFAULT_HEIGHT = Math.floor((CHART_MAX_HEIGHT * 2) / 3);
    const [isDrawActive, setIsDrawActive] = useState(false);
    const [drawnShapeHistory, setDrawnShapeHistory] = useState<
        drawDataHistory[]
    >([]);
    const [chartHeights, setChartHeights] = useState<{
        current: number;
        max: number;
        default: number;
    }>({
        current: CHART_DEFAULT_HEIGHT,
        max: CHART_MAX_HEIGHT,
        default: CHART_DEFAULT_HEIGHT,
    });

    // the max size is based on the max height, and is subtracting the minimum size of table and the padding around the drag bar
    useEffect(() => {
        const updateDimension = () => {
            setChartHeights({
                ...chartHeights,
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

    const setChartHeight = (val: number) =>
        setChartHeights({
            ...chartHeights,
            current: val,
        });

    const isChartEnabled =
        !!process.env.REACT_APP_CHART_IS_ENABLED &&
        process.env.REACT_APP_CHART_IS_ENABLED.toLowerCase() === 'false'
            ? false
            : true;
    const chartSettings = useChartSettings();

    const chartContext = {
        chartSettings,
        isFullScreen: fullScreenChart,
        setIsFullScreen: setFullScreenChart,
        chartHeights,
        setChartHeight,
        isEnabled: isChartEnabled,
        canvasRef,
        chartCanvasRef,
        isDrawActive,
        setIsDrawActive,
        drawnShapeHistory,
        setDrawnShapeHistory,
    };

    useEffect(() => {
        if (!currentLocation.startsWith('/trade')) {
            setFullScreenChart(false);
        }
    }, [currentLocation]);

    return (
        <ChartContext.Provider value={chartContext}>
            {props.children}
        </ChartContext.Provider>
    );
};
