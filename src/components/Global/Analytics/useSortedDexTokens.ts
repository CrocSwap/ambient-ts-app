import { useMemo, useState } from 'react';
import { dexTokenData } from '../../../pages/Explore/useTokenStats';
import { columnSlugs } from './DexTokens';

export interface sortedDexTokensIF {
    data: dexTokenData[];
    update: (s: columnSlugs) => void;
}

export const useSortedDexTokens = (
    unsorted: dexTokenData[],
): sortedDexTokensIF => {
    const [sortBy, setSortBy] = useState<columnSlugs | null>(null);
    const [reverse, setReverse] = useState<boolean>(false);

    const sortedData = useMemo<dexTokenData[]>(() => {
        // console.log(sortBy, reverse);
        let output: dexTokenData[];
        switch (sortBy) {
            case 'tvl':
                output = sortByTvl(unsorted);
                break;
            case 'fees':
                output = sortByFees(unsorted);
                break;
            case 'volume':
                output = sortByVolume(unsorted);
                break;
            case 'name':
                output = sortByName(unsorted);
                break;
            default:
                output = sortByTime(unsorted);
                break;
        }
        return reverse ? [...output].reverse() : output;
    }, [sortBy, reverse]);

    function sortByName(tkns: dexTokenData[]): dexTokenData[] {
        const data = tkns.sort((a: dexTokenData, b: dexTokenData) => {
            const nameTokenA: string = a.tokenMeta?.name ?? '';
            const nameTokenB: string = b.tokenMeta?.name ?? '';
            return nameTokenB.localeCompare(nameTokenA);
        });
        return data;
    }

    function sortByTime(tkns: dexTokenData[]): dexTokenData[] {
        const data = tkns.sort((a: dexTokenData, b: dexTokenData) => {
            return b.latestTime - a.latestTime;
        });
        return data;
    }

    function sortByTvl(tkns: dexTokenData[]): dexTokenData[] {
        const data = tkns.sort((a: dexTokenData, b: dexTokenData) => {
            return b.dexTvlNorm - a.dexTvlNorm;
        });
        return data;
    }

    function sortByVolume(tkns: dexTokenData[]): dexTokenData[] {
        const data = tkns.sort((a: dexTokenData, b: dexTokenData) => {
            return b.dexVolNorm - a.dexVolNorm;
        });
        return data;
    }

    function sortByFees(tkns: dexTokenData[]): dexTokenData[] {
        const data = tkns.sort((a: dexTokenData, b: dexTokenData) => {
            return b.dexFeesNorm - a.dexFeesNorm;
        });
        return data;
    }

    function updateSort(s: columnSlugs): void {
        const isNewSort: boolean = sortBy !== s;
        if (isNewSort) {
            setSortBy(s);
            setReverse(false);
        } else if (reverse === false) {
            setReverse(true);
        } else {
            setSortBy(s);
            setReverse(false);
        }
    }

    return {
        data: sortedData,
        update: updateSort,
    };
};
