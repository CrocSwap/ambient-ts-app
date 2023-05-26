import React, { createContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    chartSettingsMethodsIF,
    useChartSettings,
} from '../App/hooks/useChartSettings';

interface ChartIF {
    chartSettings: chartSettingsMethodsIF;
    isFullScreen: boolean;
    setIsFullScreen: (val: boolean) => void;
    isEnabled: boolean;
}

export const ChartContext = createContext<ChartIF>({} as ChartIF);

export const ChartContextProvider = (props: { children: React.ReactNode }) => {
    const { pathname: currentLocation } = useLocation();

    const [fullScreenChart, setFullScreenChart] = useState(false);
    const isChartEnabled =
        !!process.env.REACT_APP_CHART_IS_ENABLED &&
        process.env.REACT_APP_CHART_IS_ENABLED.toLowerCase() === 'false'
            ? false
            : true;
    const chartSettings = useChartSettings();

    const chartState = {
        chartSettings,
        isFullScreen: fullScreenChart,
        setIsFullScreen: setFullScreenChart,
        isEnabled: isChartEnabled,
    };

    useEffect(() => {
        if (!currentLocation.startsWith('/trade')) {
            setFullScreenChart(false);
        }
    }, [currentLocation]);

    return (
        <ChartContext.Provider value={chartState}>
            {props.children}
        </ChartContext.Provider>
    );
};
