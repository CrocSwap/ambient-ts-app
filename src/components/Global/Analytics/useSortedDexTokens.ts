import { useMemo, useState } from 'react';
import { dexTokenData } from '../../../pages/Explore/useTokenStats';
import { columnSlugs } from './DexTokens';

export interface sortedDexTokensIF {
    data: dexTokenData[];
    update: (s: columnSlugs) => void;
}

interface sortIF {
    slug: columnSlugs | null;
    reverse: boolean;
}

export const useSortedDexTokens = (
    unsorted: dexTokenData[],
): sortedDexTokensIF => {
    const [sort, setSort] = useState<sortIF>({ slug: null, reverse: false });

    const sortedData = useMemo<dexTokenData[]>(() => {
        let output: dexTokenData[];
        switch (sort.slug) {
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
        return sort.reverse ? [...output].reverse() : output;
    }, [sort]);

    function sortByName(tkns: dexTokenData[]): dexTokenData[] {
        const data = tkns.sort((a: dexTokenData, b: dexTokenData) => {
            const nameTokenA: string = a.tokenMeta?.name ?? '';
            const nameTokenB: string = b.tokenMeta?.name ?? '';
            return nameTokenA.localeCompare(nameTokenB);
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
        const isNewSort: boolean = sort.slug !== s;
        if (isNewSort) {
            setSort({ slug: s, reverse: false });
        } else if (sort.reverse === false) {
            setSort({ slug: sort.slug, reverse: true });
        } else {
            setSort({ slug: null, reverse: false });
        }
    }

    return {
        data: sortedData,
        update: updateSort,
    };
};
