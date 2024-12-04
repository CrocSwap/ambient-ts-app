import { ZeroAddress } from 'ethers';
import { useMemo, useState } from 'react';
import { dexTokenData } from '../../../pages/platformAmbient/Explore/useTokenStats';
import { columnSlugs } from './DexTokens/DexTokens';

interface sortIF {
    slug: columnSlugs | null;
    reverse: boolean;
}

export interface sortedDexTokensIF {
    data: dexTokenData[];
    sortBy: sortIF;
    update: (s: columnSlugs) => void;
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
    }, [sort, unsorted]);

    function sortByName(tkns: dexTokenData[]): dexTokenData[] {
        const data = tkns.sort((a: dexTokenData, b: dexTokenData) => {
            const comparatorA: string = a.tokenMeta?.name ?? '';
            const comparatorB: string = b.tokenMeta?.name ?? '';
            return comparatorA.localeCompare(comparatorB);
        });
        return data;
    }

    function sortByTime(tkns: dexTokenData[]): dexTokenData[] {
        const data = tkns.sort((a: dexTokenData, b: dexTokenData) => {
            // sort ETH to top if in top two tokens
            return b.latestTime - a.latestTime === 0
                ? a.tokenAddr === ZeroAddress
                    ? -1
                    : 1
                : b.latestTime - a.latestTime;
        });
        return data;
    }

    function sortByTvl(tkns: dexTokenData[]): dexTokenData[] {
        const data = tkns.sort((a: dexTokenData, b: dexTokenData) => {
            const comparatorA: number = a.normalized?.dexTvlNorm.raw ?? 0;
            const comparatorB: number = b.normalized?.dexTvlNorm.raw ?? 0;
            return comparatorB - comparatorA;
        });
        return data;
    }

    function sortByVolume(tkns: dexTokenData[]): dexTokenData[] {
        const data = tkns.sort((a: dexTokenData, b: dexTokenData) => {
            const comparatorA: number = a.normalized?.dexVolNorm.raw ?? 0;
            const comparatorB: number = b.normalized?.dexVolNorm.raw ?? 0;
            return comparatorB - comparatorA;
        });
        return data;
    }

    function sortByFees(tkns: dexTokenData[]): dexTokenData[] {
        const data = tkns.sort((a: dexTokenData, b: dexTokenData) => {
            const comparatorA: number = a.normalized?.dexFeesNorm.raw ?? 0;
            const comparatorB: number = b.normalized?.dexFeesNorm.raw ?? 0;
            return comparatorB - comparatorA;
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
        sortBy: sort,
        update: updateSort,
    };
};
