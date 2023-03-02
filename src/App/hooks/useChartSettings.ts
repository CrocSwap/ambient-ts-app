import { useEffect, useState } from 'react';

export const useChartSettings = () => {
    const getPreference = (subchart: string) => {
        const allPreferences = JSON.parse(
            localStorage.getItem('chartSettings') as string
        );
        let output: boolean;
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

    const [
        volumeSubchartEnabled,
        setVolumeSubchartEnabled
    ] = useState<boolean>(getPreference('volume') ?? true);
    const [
        tvlSubchartEnabled,
        setTvlSubchartEnabled
    ] = useState<boolean>(getPreference('tvl') ?? false);
    const [
        feeRateSubchartEnabled,
        setFeeRateSubchartEnabled
    ] = useState<boolean>(getPreference('feeRate') ?? false);

    useEffect(() => {
        localStorage.setItem(
            'chart_settings',
            JSON.stringify({
                volumeSubchartEnabled,
                tvlSubchartEnabled,
                feeRateSubchartEnabled
            })
        );
    }, [volumeSubchartEnabled, tvlSubchartEnabled, feeRateSubchartEnabled]);

    false && volumeSubchartEnabled;
    false && setVolumeSubchartEnabled;
    false && tvlSubchartEnabled;
    false && setTvlSubchartEnabled;
    false && feeRateSubchartEnabled;
    false && setFeeRateSubchartEnabled;
}