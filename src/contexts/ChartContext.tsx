import React, { createContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    chartSettingsMethodsIF,
    useChartSettings,
} from '../App/hooks/useChartSettings';
import { TRADE_TABLE_HEADER_HEIGHT } from './TradeTableContext';

// 2:1 ratio of the window height subtracted by main header and token info header
export const CHART_MAX_HEIGHT = window.innerHeight - 98;
export const CHART_DEFAULT_HEIGHT = Math.floor((CHART_MAX_HEIGHT * 2) / 3);

interface ChartContextIF {
    chartSettings: chartSettingsMethodsIF;
    isFullScreen: boolean;
    setIsFullScreen: (val: boolean) => void;
    chartHeight: number;
    setChartHeight: (val: number) => void;
    maxChartSize: number;
    setMaxChartSize: (val: number) => void;
    isEnabled: boolean;
    canvasRef: React.MutableRefObject<null>;
}

export const ChartContext = createContext<ChartContextIF>({} as ChartContextIF);

export const ChartContextProvider = (props: { children: React.ReactNode }) => {
    const { pathname: currentLocation } = useLocation();
    const canvasRef = useRef(null);

    const [fullScreenChart, setFullScreenChart] = useState(false);
    const [chartHeight, setChartHeight] = useState(CHART_DEFAULT_HEIGHT);
    // the max size is based on the max height, and is subtracting the minimum size of table and the padding around the drag bar
    const [maxChartSize, setMaxChartSize] = useState(CHART_MAX_HEIGHT - TRADE_TABLE_HEADER_HEIGHT - 8);
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
        chartHeight,
        setChartHeight,
        maxChartSize,
        setMaxChartSize,
        isEnabled: isChartEnabled,
        canvasRef,
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
