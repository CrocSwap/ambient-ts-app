import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';


export const useSortedPositions = (
    isShowAllEnabled: boolean,
    userPositions: PositionIF[],
    poolPositions: PositionIF[]
): [
    string,
    Dispatch<SetStateAction<string>>,
    boolean,
    Dispatch<SetStateAction<boolean>>,
    PositionIF[]
] => {
    console.log('firing hook useSortedPositions()');
    function reverseArray(inputArray: PositionIF[]) {
        const outputArray: PositionIF[] = [];
        inputArray.forEach((elem) => outputArray.unshift(elem));
        return outputArray;
    }

    const [ sortBy, setSortBy ] = useState('default');
    const [ reverseSort, setReverseSort ] = useState(false);

    const sortByWallet = (unsortedData: PositionIF[]) => (
        [...unsortedData].sort((a, b) => a.user.localeCompare(b.user))
    );

    const sortByApy = (unsortedData: PositionIF[]) => (
        [...unsortedData].sort((a, b) => b.apy - a.apy)
    );

    const sortData = (data: PositionIF[]) => {
        let sortedData: PositionIF[];
        switch (sortBy) {
            case 'wallet':
                sortedData = sortByWallet(data);
                break;
            case 'apy':
                sortedData = sortByApy(data);
                break;
            default:
                sortedData = data;
        }
        return reverseSort ? reverseArray(sortedData) : sortedData;
    }

    // TODO: new user positions reset table sort, new pool positions retains sort

    const sortedPositions = useMemo(() => {
        const positions = isShowAllEnabled ? poolPositions : userPositions;
        return sortData(positions);
    }, [
        sortBy,
        reverseSort,
        isShowAllEnabled,
        poolPositions,
        userPositions
    ]);

    return [
        sortBy,
        setSortBy,
        reverseSort,
        setReverseSort,
        sortedPositions
    ];
}