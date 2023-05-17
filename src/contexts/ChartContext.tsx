import { createContext } from 'react';
import { chartSettingsMethodsIF } from '../App/hooks/useChartSettings';

interface ChartIF {
    chartSettings: chartSettingsMethodsIF;
    isFullScreen: boolean;
    setIsFullScreen: (val: boolean) => void;
    isEnabled: boolean;
}

export const ChartContext = createContext<ChartIF>({} as ChartIF);
