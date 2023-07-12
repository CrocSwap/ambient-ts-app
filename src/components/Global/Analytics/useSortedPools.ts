import { useMemo, useState } from 'react';
import { PoolDataIF } from '../../../contexts/AnalyticsContext';

export type sortType = 'Price' | 'TVL' | 'APR' | 'Volume';
export type directionType = 'ascending' | 'descending';

export interface SortedPoolMethodsIF {
    pools: PoolDataIF[];
    current: sortType;
    direction: directionType;
    updateSort: (type: sortType) => void;
}

export const useSortedPools = (allPools: PoolDataIF[]): SortedPoolMethodsIF => {
    const DEFAULT_SORT: sortType = 'TVL';
    const DEFAULT_DIRECTION: directionType = 'ascending';
    const [sortBy, setSortBy] = useState<sortType>(DEFAULT_SORT);
    const [direction, setDirection] =
        useState<directionType>(DEFAULT_DIRECTION);

    const sortedPools = useMemo<PoolDataIF[]>(() => {
        const sortedByTVL = allPools.sort(
            (poolA: PoolDataIF, poolB: PoolDataIF) => {
                return parseFloat(poolB.tvl) - parseFloat(poolA.tvl);
            },
        );
        return direction ? sortedByTVL : sortedByTVL.reverse();
    }, [sortBy]);

    function updateSort(sort: sortType) {
        if (sort === sortBy) {
            setDirection(
                direction === 'ascending' ? 'descending' : 'ascending',
            );
        } else {
            setDirection('ascending');
            setSortBy(sort);
        }
    }

    return {
        pools: sortedPools,
        current: sortBy,
        direction,
        updateSort: updateSort,
    };
};
