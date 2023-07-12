import { useMemo, useState } from 'react';
import { PoolDataIF } from '../../../contexts/AnalyticsContext';

export type sortType = 'price' | 'tvl' | 'apr' | 'volume';
export type directionType = 'ascending' | 'descending';

export interface SortedPoolMethodsIF {
    pools: PoolDataIF[];
    current: sortType;
    direction: directionType;
    updateSort: (type: sortType) => void;
}

export const useSortedPools = (allPools: PoolDataIF[]): SortedPoolMethodsIF => {
    const DEFAULT_SORT: sortType = 'tvl';
    const DEFAULT_DIRECTION: directionType = 'ascending';
    const [sortBy, setSortBy] = useState<sortType>(DEFAULT_SORT);
    const [direction, setDirection] =
        useState<directionType>(DEFAULT_DIRECTION);

    // logic router for sort mechanism
    const sortedPools = useMemo<PoolDataIF[]>(() => {
        let output: PoolDataIF[];
        switch (sortBy) {
            case 'price':
                output = allPools;
                break;
            case 'tvl':
                output = allPools;
                break;
            case 'apr':
                output = allPools;
                break;
            case 'volume':
                output = allPools;
                break;
        }
        return direction ? output : output.reverse();
    }, [sortBy, direction]);

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
