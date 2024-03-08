import { useMemo, useState } from 'react';
import { dexTokenData } from '../../../pages/Explore/useTokenStats';

type sortTypes = 'default' | 'time';

export interface sortedDexTokensIF {
    data: dexTokenData[];
    update: (s: sortTypes) => void;
}

export const useSortedDexTokens = (
    unsorted: dexTokenData[],
): sortedDexTokensIF => {
    const [sortBy, setSortBy] = useState<sortTypes>('default');

    const sortedData = useMemo<dexTokenData[]>(() => {
        let output: dexTokenData[];
        switch (sortBy) {
            case 'default':
            case 'time':
            default:
                output = sortByTime(unsorted);
        }
        return output;
    }, [sortBy]);

    function sortByTime(tkns: dexTokenData[]): dexTokenData[] {
        const data = tkns.sort((a: dexTokenData, b: dexTokenData) => {
            return a.latestTime - b.latestTime;
        });
        return data;
    }

    return {
        data: sortedData,
        update: (s: sortTypes) => setSortBy(s),
    };
};
