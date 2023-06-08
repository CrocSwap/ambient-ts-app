import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { PositionIF } from '../../../utils/interfaces/exports';
import { diffHashSig } from '../../../utils/functions/diffHashSig';
import { BigNumber } from 'ethers';

export type RangeSortType =
    | 'id'
    | 'wallet'
    | 'walletid'
    | 'pool'
    | 'apy'
    | 'apr'
    | 'min'
    | 'max'
    | 'value'
    | 'time'
    | 'status'
    | 'default';

export const useSortedPositions = (
    defaultSort: RangeSortType,
    positions: PositionIF[],
): [
    RangeSortType,
    Dispatch<SetStateAction<RangeSortType>>,
    boolean,
    Dispatch<SetStateAction<boolean>>,
    PositionIF[],
] => {
    // default sort function
    const sortByTime = (unsortedData: PositionIF[]): PositionIF[] =>
        [...unsortedData].sort((a, b) => {
            const aTime = a.latestUpdateTime || a.timeFirstMint || Date.now();
            const bTime = b.latestUpdateTime || b.timeFirstMint || Date.now();
            return bTime - aTime;
        });
    // sort by positionHash
    const sortById = (unsortedData: PositionIF[]): PositionIF[] =>
        [...unsortedData].sort((a, b) =>
            b.firstMintTx.localeCompare(a.firstMintTx),
        );
    // sort by wallet address
    const sortByWallet = (unsortedData: PositionIF[]): PositionIF[] => {
        // array to hold positions with a valid ENS
        const positionsENS: PositionIF[] = [];
        // array to hold positions with no ENS value
        const positionsNoENS: PositionIF[] = [];
        // push each position to one of the above temporary arrays
        unsortedData.forEach((pos: PositionIF) => {
            pos.ensResolution
                ? positionsENS.push(pos)
                : positionsNoENS.push(pos);
        });
        // sort positions with an ENS by the ENS value (alphanumeric)
        const sortedENS: PositionIF[] = positionsENS.sort((a, b) => {
            return a.ensResolution.localeCompare(b.ensResolution);
        });
        // sort positions with no ENS by the wallet address, for some reason
        // ... alphanumeric sort fails so we're running a BigNumber comparison
        const sortedNoENS: PositionIF[] = positionsNoENS.sort((a, b) => {
            const walletA = BigNumber.from(a.user);
            const walletB = BigNumber.from(b.user);
            return walletA.gte(walletB) ? 1 : -1;
        });
        // combine and return sorted arrays
        return [...sortedENS, ...sortedNoENS];
    };
    const sortByPool = (unsortedData: PositionIF[]): PositionIF[] =>
        [...unsortedData].sort((a, b) => {
            const poolA = a.baseSymbol + a.quoteSymbol + a.positionId;
            const poolB = b.baseSymbol + b.quoteSymbol + b.positionId;
            return poolA.localeCompare(poolB);
        });
    const sortByApy = (unsortedData: PositionIF[]): PositionIF[] =>
        [...unsortedData].sort(
            (a, b) =>
                (b.apy * 1000000000000 ||
                    b.bidTickInvPriceDecimalCorrected * 0.000001) -
                (a.apy * 1000000000000 ||
                    a.bidTickInvPriceDecimalCorrected * 0.000001),
        );
    // TODO: for some reason sortByMin() is leaving the final value out of sequence?
    const sortByMin = (unsortedData: PositionIF[]): PositionIF[] =>
        [...unsortedData].sort(
            (a, b) =>
                parseFloat(b.lowRangeDisplayInBase) -
                parseFloat(a.lowRangeDisplayInBase),
        );
    const sortByMax = (unsortedData: PositionIF[]): PositionIF[] =>
        [...unsortedData].sort(
            (a, b) =>
                parseFloat(b.highRangeDisplayInBase) -
                parseFloat(a.highRangeDisplayInBase),
        );
    const sortByValue = (unsortedData: PositionIF[]): PositionIF[] =>
        [...unsortedData].sort(
            (a, b) =>
                (b.totalValueUSD * 1000000000000 ||
                    b.bidTickInvPriceDecimalCorrected * 0.000001) -
                (a.totalValueUSD * 1000000000000 ||
                    a.bidTickInvPriceDecimalCorrected * 0.000001),
        );

    const sortByStatus = (unsortedData: PositionIF[]): PositionIF[] => {
        const outOfRange: PositionIF[] = [];
        const inRange: PositionIF[] = [];
        const ambient: PositionIF[] = [];
        const empty: PositionIF[] = [];
        const huh: PositionIF[] = [];

        const checkInRange = (
            val: number,
            low: number,
            high: number,
        ): boolean => {
            return val > low && val < high;
        };
        unsortedData.forEach((pos: PositionIF) => {
            if (pos.totalValueUSD === 0) {
                empty.push(pos);
            } else if (pos.positionType === 'ambient') {
                ambient.push(pos);
            } else if (
                checkInRange(pos.poolPriceInTicks, pos.bidTick, pos.askTick)
            ) {
                inRange.push(pos);
            } else if (
                !checkInRange(pos.poolPriceInTicks, pos.bidTick, pos.askTick)
            ) {
                outOfRange.push(pos);
            } else {
                huh.push(pos);
            }
        });

        const outOfRangeAfterSecondarySort: PositionIF[] =
            sortByTime(outOfRange);
        const inRangeAfterSecondarySort: PositionIF[] = sortByTime(inRange);
        const ambientAfterSecondarySort: PositionIF[] = sortByTime(ambient);
        const emptyAfterSecondarySort: PositionIF[] = sortByTime(empty);
        const huhAfterSecondarySort: PositionIF[] = sortByTime(huh);

        const outOfRangeAfterTertiarySort: PositionIF[] = sortById(
            outOfRangeAfterSecondarySort,
        );
        const inRangeAfterTertiarySort: PositionIF[] = sortById(
            inRangeAfterSecondarySort,
        );
        const ambientAfterTertiarySort: PositionIF[] = sortById(
            ambientAfterSecondarySort,
        );
        const emptyAfterTertiarySort: PositionIF[] = sortById(
            emptyAfterSecondarySort,
        );
        const huhAfterTertiarySort: PositionIF[] = sortById(
            huhAfterSecondarySort,
        );
        return [
            ...outOfRangeAfterTertiarySort,
            ...inRangeAfterTertiarySort,
            ...ambientAfterTertiarySort,
            ...emptyAfterTertiarySort,
            ...huhAfterTertiarySort,
        ];
    };

    // column the user wants the table sorted by
    const [sortBy, setSortBy] = useState<RangeSortType>(defaultSort);
    // whether the sort should be ascending or descening
    const [reverseSort, setReverseSort] = useState<boolean>(false);

    // router to pass data through the appropriate sort function
    const sortData = (data: PositionIF[]): PositionIF[] => {
        // variable to hold output
        let sortedData: PositionIF[];
        // router to apply a specific sort function
        switch (sortBy) {
            case 'id':
                sortedData = sortById(data);
                break;
            // sort by wallet
            case 'wallet':
            case 'walletid':
                sortedData = sortByWallet(data);
                break;
            // sort by token pair
            case 'pool':
                sortedData = sortByPool(data);
                break;
            // sort by APR
            case 'apy':
            case 'apr':
                sortedData = sortByApy(data);
                break;
            case 'min':
                sortedData = sortByMin(data);
                break;
            case 'max':
                sortedData = sortByMax(data);
                break;
            case 'value':
                sortedData = sortByValue(data);
                break;
            case 'time':
                sortedData = sortByTime(data);
                break;
            case 'status':
                sortedData = sortByStatus(data);
                break;
            // return data unsorted if user did not choose a sortable column
            default:
                return sortByTime(data);
        }
        // return reversed data if user wants data reversed
        return reverseSort ? [...sortedData].reverse() : sortedData;
    };

    // Generates a fingerprint from the positions objects. Used for comparison
    // in below React hook
    const posHashSum = useMemo<string>(
        () => diffHashSig(positions),
        [positions],
    );

    // array of positions sorted by the relevant column
    const sortedPositions = useMemo<PositionIF[]>(() => {
        return sortData(positions);
    }, [sortBy, reverseSort, posHashSum]); // fix failure to refresh rows when data changes

    return [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions];
};
