import { useMemo, useState } from 'react';
import { PoolDataIF } from '../../../contexts/ExploreContext';
import { sortDirections } from '../../../ambient-utils/types';

export type sortType = 'price' | 'tvl' | '24h vol.' | '24h price δ' | null;
type sortableKeysType = 'priceChange' | 'tvl' | 'volume';

export interface SortedPoolMethodsIF {
    pools: PoolDataIF[];
    current: sortType;
    direction: sortDirections;
    updateSort: (type: sortType) => void;
}

// hook to sort pools in the Explore module
export const useSortedPools = (
    allPools: Array<PoolDataIF>,
): SortedPoolMethodsIF => {
    // default sort values (`null` will sort by TVL)
    const DEFAULT_SORT: sortType = '24h vol.';
    const DEFAULT_DIRECTION: sortDirections = 'ascending';
    // hooks to hold current sort values
    const [sortBy, setSortBy] = useState<sortType>(DEFAULT_SORT);
    const [direction, setDirection] =
        useState<sortDirections>(DEFAULT_DIRECTION);

    // logic to apply the correct sort as specified by the user
    const sortedPools = useMemo<PoolDataIF[]>(() => {
        // declare an output variable
        let output: PoolDataIF[];
        // fn to sort data
        const sort = (key: sortableKeysType): PoolDataIF[] =>
            allPools.sort(
                (poolA: PoolDataIF, poolB: PoolDataIF) =>
                    poolB[key] - poolA[key],
            );
        // logic router for sort mechanism, default goes last
        switch (sortBy) {
            case '24h vol.':
                output = sort('volume');
                break;
            case '24h price δ':
                output = sort('priceChange');
                break;
            case 'tvl':
            case null:
            default:
                output = sort('tvl');
                break;
        }
        // reverse data if user has indicated descending sort sequence
        const sequencedData: PoolDataIF[] =
            direction === 'descending' ? output.reverse() : output;
        // logic to demote arbitrary values depending on current sort
        const preferredData: PoolDataIF[] = [];
        const demotedData: PoolDataIF[] = [];
        sequencedData.forEach((p: PoolDataIF) => {
            // boolean for control flow
            let needsDemotion: boolean;
            // assign bool based on given value for a given key
            switch (sortBy) {
                case '24h price δ':
                    needsDemotion = p.priceChangeStr === '';
                    break;
                default:
                    needsDemotion = false;
            }
            // push each result into the preferred or demoted array
            needsDemotion ? demotedData.push(p) : preferredData.push(p);
        });
        // combine and return the two sub-arrays
        return preferredData.concat(demotedData);
    }, [sortBy, direction, allPools]);

    // fn to respond to user clicks and update sort values correctly
    function updateSort(sort: sortType) {
        if (sort === sortBy) {
            let updatedDirection: sortDirections;
            switch (direction) {
                case null:
                    updatedDirection = 'ascending';
                    break;
                case 'ascending':
                    updatedDirection = 'descending';
                    break;
                case 'descending':
                default:
                    updatedDirection = null;
                    setSortBy(null);
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
