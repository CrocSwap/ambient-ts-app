import { useEffect, useState } from 'react';

interface chartSettingsLocalStorageIF {
    volume: boolean,
    tvl: boolean,
    feeRate: boolean
}

interface subchartSettingsIF {
    isEnabled: boolean,
    enable: () => void,
    disable: () => void,
    toggle: () => void
}

export interface chartSettingsMethodsIF {
    volumeSubchart: subchartSettingsIF,
    tvlSubchart: subchartSettingsIF,
    feeRateSubchart: subchartSettingsIF
}

export const useChartSettings = (): chartSettingsMethodsIF => {
    const getPreference = (subchart: string): boolean|undefined => {
        const allPreferences: chartSettingsLocalStorageIF|null = JSON.parse(
            localStorage.getItem('chartSettings') as string
        );
        let output: boolean|undefined;
        switch (subchart) {
            case 'volume':
                output = allPreferences?.volume;
                break;
            case 'tvl':
                output = allPreferences?.tvl;
                break;
            case 'feeRate':
                output = allPreferences?.feeRate;
                break;
            default:
                return;
        }
        return output;
    };

    const [isVolumeSubchartEnabled, setIsVolumeSubchartEnabled] = useState<boolean>(
        getPreference('volume') ?? true
    );
    const [isTvlSubchartEnabled, setIsTvlSubchartEnabled] = useState<boolean>(
        getPreference('tvl') ?? false
    );
    const [isFeeRateSubchartEnabled, setIsFeeRateSubchartEnabled] = useState<boolean>(
        getPreference('feeRate') ?? false
    );

    useEffect(() => {
        localStorage.setItem(
            'chart_settings',
            JSON.stringify({
                isVolumeSubchartEnabled,
                isTvlSubchartEnabled,
                isFeeRateSubchartEnabled
            })
        );
    }, [isVolumeSubchartEnabled, isTvlSubchartEnabled, isFeeRateSubchartEnabled]);

    return {
        volumeSubchart: {
            isEnabled: isVolumeSubchartEnabled,
            enable: () => setIsVolumeSubchartEnabled(true),
            disable: () => setIsVolumeSubchartEnabled(false),
            toggle: () => setIsVolumeSubchartEnabled(!isVolumeSubchartEnabled)
        },
        tvlSubchart: {
            isEnabled: isTvlSubchartEnabled,
            enable: () => setIsTvlSubchartEnabled(true),
            disable: () => setIsTvlSubchartEnabled(false),
            toggle: () => setIsTvlSubchartEnabled(!isTvlSubchartEnabled)
        },
        feeRateSubchart: {
            isEnabled: isFeeRateSubchartEnabled,
            enable: () => setIsFeeRateSubchartEnabled(true),
            disable: () => setIsFeeRateSubchartEnabled(false),
            toggle: () => setIsFeeRateSubchartEnabled(!isFeeRateSubchartEnabled)
        }
    };
}