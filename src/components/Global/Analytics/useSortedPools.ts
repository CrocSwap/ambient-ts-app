import { useMemo, useState } from 'react';
import { PoolDataIF } from '../../../contexts/ExploreContext';

export type sortType = '' | 'price' | 'tvl' | 'apr' | 'volume' | 'change';
export type directionType = '' | 'ascending' | 'descending';

export interface SortedPoolMethodsIF {
    pools: PoolDataIF[];
    current: sortType;
    direction: directionType;
    updateSort: (type: sortType) => void;
}

// hook to sort pools in the Explore module
export const useSortedPools = (allPools: PoolDataIF[]): SortedPoolMethodsIF => {
    // default sort values
    const DEFAULT_SORT: sortType = 'tvl';
    const DEFAULT_DIRECTION: directionType = 'ascending';
    // hooks to hold current sort values
    const [sortBy, setSortBy] = useState<sortType>(DEFAULT_SORT);
    const [direction, setDirection] =
        useState<directionType>(DEFAULT_DIRECTION);

    // logic to apply the correct sort as specified by the user
    const sortedPools = useMemo<PoolDataIF[]>(() => {
        // declare an output variable
        let output: PoolDataIF[];
        // fn to sort by total value locked
        const sortTvl = (): PoolDataIF[] =>
            allPools.sort(
                (poolA: PoolDataIF, poolB: PoolDataIF) => poolB.tvl - poolA.tvl,
            );
        // fn to sort by apr/apy
        const sortApr = (): PoolDataIF[] =>
            allPools.sort(
                (poolA: PoolDataIF, poolB: PoolDataIF) => poolB.apy - poolA.apy,
            );
        // fn to sort by total volume
        const sortVolume = (): PoolDataIF[] =>
            allPools.sort(
                (poolA: PoolDataIF, poolB: PoolDataIF) =>
                    poolB.volume - poolA.volume,
            );
        // fn to sort by 24hr price change
        const sortChange = (): PoolDataIF[] =>
            allPools.sort(
                (poolA: PoolDataIF, poolB: PoolDataIF) =>
                    poolB.priceChange - poolA.priceChange,
            );
        // logic router for sort mechanism, default goes last
        console.clear();
        switch (sortBy) {
            case 'apr':
                output = sortApr();
                break;
            case 'volume':
                output = sortVolume();
                break;
            case 'change':
                output = sortChange();
                break;
            case 'tvl':
            case '':
            default:
                output = sortTvl();
                break;
        }
        // reverse data if user has indicated descending sort sequence
        return direction === 'descending' ? output.reverse() : output;
    }, [sortBy, direction, allPools]);

    // fn to respond to user clicks and update sort values correctly
    function updateSort(sort: sortType) {
        if (sort === sortBy) {
            let updatedDirection: directionType;
            switch (direction) {
                case '':
                    updatedDirection = 'ascending';
                    break;
                case 'ascending':
                    updatedDirection = 'descending';
                    break;
                case 'descending':
                default:
                    updatedDirection = '';
                    setSortBy('');
                    break;
            }
            setDirection(updatedDirection);
        } else {
            setDirection('ascending');
            setSortBy(sort);
        }
    }

    return {
        // pools post-sorting
        pools: sortedPools,
        // current value to sort by
        current: sortBy,
        // ascending or descending sort
        direction,
        // fn to update the sort values
        updateSort,
    };
};
