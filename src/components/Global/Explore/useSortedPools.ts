import { useMemo, useState } from 'react';
import { PoolIF, sortDirections } from '../../../ambient-utils/types';

export type sortType =
    | 'price'
    | 'tvl'
    | '24h vol.'
    | 'apr'
    | '24h price δ'
    | 'change'
    | null;
type sortableKeysType =
    | 'priceChange24h'
    | 'tvlTotalUsd'
    | 'volumeChange24h'
    | 'apr';

export interface SortedPoolMethodsIF {
    pools: PoolIF[];
    current: sortType;
    direction: sortDirections;
    updateSort: (type: sortType) => void;
}

// hook to sort pools in the Explore module
export const useSortedPools = (
    allPools: Array<PoolIF>,
): SortedPoolMethodsIF => {
    // default sort values (`null` will sort by TVL)
    const DEFAULT_SORT: sortType = '24h vol.';
    const DEFAULT_DIRECTION: sortDirections = 'ascending';
    // hooks to hold current sort values
    const [sortBy, setSortBy] = useState<sortType>(DEFAULT_SORT);
    const [direction, setDirection] =
        useState<sortDirections>(DEFAULT_DIRECTION);

    // logic to apply the correct sort as specified by the user
    const sortedPools = useMemo<PoolIF[]>(() => {
        // declare an output variable
        let output: PoolIF[];
        // fn to sort data
        const sort = (key: sortableKeysType): PoolIF[] =>
            allPools.sort(
                (poolA: PoolIF, poolB: PoolIF) =>
                    (poolB[key] || 0) - (poolA[key] || 0),
            );
        // logic router for sort mechanism, default goes last
        switch (sortBy) {
            case '24h vol.':
                output = sort('volumeChange24h');
                break;
            case 'apr':
                output = sort('apr');
                break;
            case '24h price δ':
                output = sort('priceChange24h');
                break;
            case 'change':
                output = sort('priceChange24h');
                break;
            case 'tvl':
            case null:
            default:
                output = sort('tvlTotalUsd');
                break;
        }
        // reverse data if user has indicated descending sort sequence
        const sequencedData: PoolIF[] =
            direction === 'descending' ? output.reverse() : output;
        // logic to demote arbitrary values depending on current sort
        const preferredData: PoolIF[] = [];
        const demotedData: PoolIF[] = [];
        sequencedData.forEach((p: PoolIF) => {
            // boolean for control flow
            let needsDemotion: boolean;
            // assign bool based on given value for a given key
            switch (sortBy) {
                case '24h price δ':
                    needsDemotion = !p.priceChange24h;
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
