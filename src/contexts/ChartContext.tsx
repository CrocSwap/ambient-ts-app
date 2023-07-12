import React, { createContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    chartSettingsMethodsIF,
    useChartSettings,
} from '../App/hooks/useChartSettings';

export const CHART_DEFAULT_HEIGHT = 400;

interface ChartContextIF {
    chartSettings: chartSettingsMethodsIF;
    isFullScreen: boolean;
    setIsFullScreen: (val: boolean) => void;
    chartHeight: number;
    setChartHeight: (val: number) => void;
    isEnabled: boolean;
    canvasRef: React.MutableRefObject<null>;
}

export const ChartContext = createContext<ChartContextIF>({} as ChartContextIF);

export const ChartContextProvider = (props: { children: React.ReactNode }) => {
    const { pathname: currentLocation } = useLocation();
    const canvasRef = useRef(null);

    const [fullScreenChart, setFullScreenChart] = useState(false);
    const [chartHeight, setChartHeight] = useState(CHART_DEFAULT_HEIGHT);
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
