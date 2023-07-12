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

    const sortedPools = useMemo<PoolDataIF[]>(() => {
        let output: PoolDataIF[];
        const sortPrice = (): PoolDataIF[] => {
            return allPools;
        };
        const sortTvl = (): PoolDataIF[] => {
            return allPools;
        };
        const sortApr = (): PoolDataIF[] => {
            return allPools;
        };
        const sortVolume = (): PoolDataIF[] => {
            return allPools;
        };
        // logic router for sort mechanism
        switch (sortBy) {
            case 'price':
                output = sortPrice();
                break;
            case 'apr':
                output = sortApr();
                break;
            case 'volume':
                output = sortVolume();
                break;
            case 'tvl':
            default:
                output = sortTvl();
                break;
        }
        // reverse data if user has indicated descending sort sequence
        return direction === 'ascending' ? output : output.reverse();
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
