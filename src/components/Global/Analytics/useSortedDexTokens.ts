import { useMemo, useState } from 'react';
import { dexTokenData } from '../../../pages/Explore/useTokenStats';

type sortByTypes = 'default' | 'time';

interface sortedDexTokensIF {
    data: dexTokenData[];
    update: (s: sortByTypes) => void;
}

export const useSortedDexTokens = (
    unsorted: dexTokenData[],
): sortedDexTokensIF => {
    const [sortBy, setSortBy] = useState<sortByTypes>('default');

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
        update: (s: sortByTypes) => setSortBy(s),
    };
};
