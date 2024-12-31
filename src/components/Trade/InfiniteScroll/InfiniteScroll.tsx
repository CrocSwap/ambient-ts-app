/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { PositionIF } from '../../../ambient-utils/types/position';
import { LimitOrderIF } from '../../../ambient-utils/types/limitOrder';
import { TransactionIF } from '../../../ambient-utils/types/transaction';
import {
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Changes,
    GraphDataContext,
    LimitOrdersByPool,
    PositionsByPool,
} from '../../../contexts/GraphDataContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { PageDataCountIF } from '../../Chat/ChatIFs';
import useInfiniteScrollFetchers from './useInfiniteScrollFetchers';
import TableRowsInfiniteScroll from './TableRowsInfiniteScroll';
import { RangeSortType } from '../TradeTabs/useSortedPositions';
import { LimitSortType } from '../TradeTabs/useSortedLimits';
import { TxSortType } from '../TradeTabs/useSortedTxs';
import useGenFakeTableRow from './useGenFakeTableRow';
import {
    ReceiptContext,
    TransactionByType,
} from '../../../contexts/ReceiptContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { AppStateContext } from '../../../contexts/AppStateContext';
import useMergeWithPendingTxs, {
    RecentlyUpdatedPositionIF,
} from './useMergeWithPendingTxs';

interface propsIF {
    type: 'Transaction' | 'Order' | 'Range';
    tableView: 'small' | 'medium' | 'large';
    isAccountView: boolean;
    data: TransactionIF[] | LimitOrderIF[] | PositionIF[];
    dataPerPage: number;
    fetchCount: number;
    targetCount: number;
    sortOrders?: (data: LimitOrderIF[]) => LimitOrderIF[];
    sortPositions?: (data: PositionIF[]) => PositionIF[];
    sortTransactions?: (data: TransactionIF[]) => TransactionIF[];
    sortBy: TxSortType | LimitSortType | RangeSortType;
    showAllData: boolean;
}

function InfiniteScroll(props: propsIF) {
    const { baseToken, quoteToken } = useContext(TradeDataContext);
    const {
        data,
        dataPerPage,
        targetCount,
        fetchCount,
        sortOrders,
        sortPositions,
        sortTransactions,
        tableView,
        isAccountView,
        sortBy,
        showAllData,
    } = props;
    const baseTokenSymbol = baseToken.symbol;
    const quoteTokenSymbol = quoteToken.symbol;
    const selectedBaseAddress: string = baseToken.address;
    const selectedQuoteAddress: string = quoteToken.address;

    const { fetchLimitOrders, fetchPositions } = useInfiniteScrollFetchers();
    const { genFakeLimitOrder, genFakePosition } = useGenFakeTableRow();

    const PAGE_COUNT_DIVIDE_THRESHOLD = 20;
    const INITIAL_EXTRA_REQUEST_THRESHOLD = 20;

    const prevBaseQuoteAddressRef = useRef<string>(
        selectedBaseAddress + selectedQuoteAddress,
    );

    const { transactionsByType } = useContext(ReceiptContext);

    const {
        unindexedNonFailedSessionLimitOrderUpdates,
        unindexedNonFailedSessionPositionUpdates,
    } = useContext(GraphDataContext);

    const { userAddress } = useContext(UserDataContext);

    const assignInitialFetchedTransactions = ():
        | LimitOrderIF[]
        | PositionIF[]
        | TransactionIF[] => {
        const ret = data;
        return ret;
    };

    // PAGE DATA COUNTS

    // method which used to decide inital page data counts
    // that method divides intial data into 2 pieces to make infinite scroll working
    // if data count less than threshold value, component will assume first page with full data to not trigger redundant fetch process initially
    const getInitialDataPageCounts = (): PageDataCountIF => {
        let counts: [number, number];
        if (data.length == 0) {
            counts = [0, 0];
        } else if (data.length < PAGE_COUNT_DIVIDE_THRESHOLD) {
            counts = [data.length, 0];
        } else if (data.length / dataPerPage < 2) {
            counts = [Math.ceil(data.length / 2), Math.floor(data.length / 2)];
        } else {
            counts = [
                data.length > dataPerPage ? dataPerPage : data.length,
                data.length / dataPerPage == 2
                    ? dataPerPage
                    : data.length - dataPerPage,
            ];
        }

        return {
            pair: (selectedBaseAddress + selectedQuoteAddress).toLowerCase(),
            counts: counts,
        };
    };

    const addPageDataCount = (dataCount: number) => {
        setPageDataCount((prev) => {
            return {
                pair: prev.pair,
                counts: [...prev.counts, dataCount],
            };
        });
    };

    const mergePageDataCounts = (hotTxsCount: number) => {
        const counts = pageDataCountRef.current?.counts || pageDataCount.counts;
        const newCounts = counts.map((e) => {
            if (e < dataPerPage && hotTxsCount > 0) {
                const gap = dataPerPage - e;
                if (hotTxsCount > gap) {
                    e += gap;
                    hotTxsCount -= gap;
                } else {
                    e += hotTxsCount;
                    hotTxsCount = 0;
                }
            }
            return e;
        });

        if (hotTxsCount > 0) {
            for (let i = 0; i < hotTxsCount / dataPerPage - 1; i++) {
                newCounts.push(dataPerPage);
            }
            newCounts.push(hotTxsCount % dataPerPage);
        }

        setPageDataCount((prev) => {
            return {
                pair: prev.pair,
                counts: newCounts,
            };
        });
    };

    const [fetchedTransactions, setFetchedTransactions] = useState<
        LimitOrderIF[] | PositionIF[] | TransactionIF[]
    >(assignInitialFetchedTransactions());

    const fetchedTransactionsRef = useRef<
        LimitOrderIF[] | PositionIF[] | TransactionIF[]
    >();
    fetchedTransactionsRef.current = fetchedTransactions;

    const [hotTransactions, setHotTransactions] = useState<
        LimitOrderIF[] | PositionIF[] | TransactionIF[]
    >([]);

    const [extraPagesAvailable, setExtraPagesAvailable] = useState<number>(0);

    const [moreDataAvailable, setMoreDataAvailable] = useState<boolean>(true);
    const moreDataAvailableRef = useRef<boolean>();
    moreDataAvailableRef.current = moreDataAvailable;

    const [lastFetchedCount, setLastFetchedCount] = useState<number>(0);

    const [moreDataLoading, setMoreDataLoading] = useState<boolean>(false);

    const [pagesVisible, setPagesVisible] = useState<[number, number]>([0, 1]);
    const [pageDataCount, setPageDataCount] = useState<PageDataCountIF>(
        getInitialDataPageCounts(),
    );

    const pageDataCountRef = useRef<PageDataCountIF>();
    pageDataCountRef.current = pageDataCount;

    const isAliveRef = useRef<boolean>(true);
    isAliveRef.current = true;

    useEffect(() => {
        return () => {
            isAliveRef.current = false;
        };
    }, []);

    const resetInfiniteScroll = () => {
        setFetchedTransactions(assignInitialFetchedTransactions());
        setHotTransactions([]);
        setExtraPagesAvailable(0);
        setMoreDataAvailable(true);
        setLastFetchedCount(0);
        setMoreDataLoading(false);
    };

    // method which used to check if new txs are located in parameter data
    // its called after fetch data through fetcher functions
    // also used to decide if there are hot txs came from contexts data list
    const dataDiffCheck = useCallback(
        (
            dirtyData: LimitOrderIF[] | PositionIF[] | TransactionIF[],
        ): LimitOrderIF[] | PositionIF[] | TransactionIF[] => {
            let txs: TransactionIF[] | LimitOrderIF[] | PositionIF[];
            let ret: LimitOrderIF[] | PositionIF[] | TransactionIF[];

            if (props.type === 'Transaction') {
                txs = fetchedTransactionsRef.current
                    ? (fetchedTransactionsRef.current as TransactionIF[])
                    : (fetchedTransactions as TransactionIF[]);
                const existingTxs = new Set(txs.map((e) => e.txHash || e.txId));
                ret = (dirtyData as TransactionIF[]).filter(
                    (e) => !existingTxs.has(e.txHash || e.txId),
                );
            } else if (props.type === 'Order') {
                txs = fetchedTransactionsRef.current
                    ? (fetchedTransactionsRef.current as LimitOrderIF[])
                    : (fetchedTransactions as LimitOrderIF[]);
                const existingTxs = new Set(txs.map((e) => e.limitOrderId));
                ret = (dirtyData as LimitOrderIF[]).filter(
                    (e) => !existingTxs.has(e.limitOrderId),
                );
            } else {
                txs = fetchedTransactionsRef.current
                    ? (fetchedTransactionsRef.current as PositionIF[])
                    : (fetchedTransactions as PositionIF[]);
                const existingTxs = new Set(txs.map((e) => e.positionId));
                ret = (dirtyData as PositionIF[]).filter(
                    (e) => !existingTxs.has(e.positionId),
                );
            }

            return ret;
        },
        [fetchedTransactions, fetchedTransactionsRef.current],
    );

    const getOldestTime = (
        txs: TransactionIF[] | LimitOrderIF[] | PositionIF[],
    ): number => {
        if (txs.length == 0) return 0;

        let oldestTime = 0;
        switch (props.type) {
            case 'Transaction':
                oldestTime = (txs as TransactionIF[]).reduce(
                    (min, tx) => {
                        return min < tx.txTime ? min : tx.txTime;
                    },
                    (txs[0] as TransactionIF).txTime,
                );
                break;
            case 'Order':
                oldestTime = (txs as LimitOrderIF[]).reduce(
                    (min, limitOrder) => {
                        return min < limitOrder.latestUpdateTime
                            ? min
                            : limitOrder.latestUpdateTime;
                    },
                    (txs[0] as LimitOrderIF).latestUpdateTime,
                );
                break;
            case 'Range':
                oldestTime = (txs as PositionIF[]).reduce(
                    (min, position) => {
                        return min < position.latestUpdateTime
                            ? min
                            : position.latestUpdateTime;
                    },
                    (txs[0] as PositionIF).latestUpdateTime,
                );
                break;
        }
        return oldestTime;
    };

    const addMoreData = async () => {
        setMoreDataLoading(true);

        let addedDataCount = 0;

        const newTxData: LimitOrderIF[] | PositionIF[] | TransactionIF[] = [];

        let oldestTimeParam = getOldestTime(fetchedTransactions);

        // ------------------- FETCH DATA WITH LOOP -------------------
        while (addedDataCount < targetCount) {
            if (!isAliveRef.current) {
                break;
            }

            let dirtyData: LimitOrderIF[] | PositionIF[] | TransactionIF[] = [];

            if (props.type === 'Order') {
                dirtyData = await fetchLimitOrders(oldestTimeParam, fetchCount);
            } else if (props.type === 'Range') {
                dirtyData = await fetchPositions(oldestTimeParam, fetchCount);
            } else {
                // dirtyData = await fetchTransactions(oldestTimeParam, fetchCount);
            }

            if (dirtyData.length == 0) {
                break;
            }

            const cleanData = dataDiffCheck(dirtyData);

            if (cleanData.length == 0) {
                break;
            } else {
                addedDataCount += cleanData.length;
                if (props.type === 'Order') {
                    (newTxData as LimitOrderIF[]).push(
                        ...(cleanData as LimitOrderIF[]),
                    );
                } else if (props.type === 'Range') {
                    (newTxData as PositionIF[]).push(
                        ...(cleanData as PositionIF[]),
                    );
                } else {
                    (newTxData as TransactionIF[]).push(
                        ...(cleanData as TransactionIF[]),
                    );
                }

                const oldestTimeTemp = getOldestTime(cleanData);
                if (oldestTimeTemp < oldestTimeParam) {
                    oldestTimeParam = oldestTimeTemp;
                }
            }
        }
        // ------------------------------------------------------------------

        if (addedDataCount > 0) {
            setFetchedTransactions(
                (prev: LimitOrderIF[] | PositionIF[] | TransactionIF[]) => {
                    if (props.type === 'Order' && sortOrders) {
                        return sortOrders([
                            ...(prev as LimitOrderIF[]),
                            ...(newTxData as LimitOrderIF[]),
                        ] as LimitOrderIF[]);
                    } else if (props.type === 'Range' && sortPositions) {
                        return sortPositions([
                            ...(prev as PositionIF[]),
                            ...(newTxData as PositionIF[]),
                        ] as PositionIF[]);
                    } else if (
                        props.type === 'Transaction' &&
                        sortTransactions
                    ) {
                        return sortTransactions([
                            ...(prev as TransactionIF[]),
                            ...(newTxData as TransactionIF[]),
                        ] as TransactionIF[]);
                    } else {
                        return [] as TransactionIF[];
                    }
                },
            );
            setLastFetchedCount(addedDataCount);
            addPageDataCount(addedDataCount);
            setExtraPagesAvailable((prev) => prev + 1);
            setPagesVisible((prev) => [prev[0] + 1, prev[1] + 1]);
        } else {
            setMoreDataAvailable(false);
        }

        setMoreDataLoading(false);
    };

    const updateHotTransactions = (
        hotTxs: LimitOrderIF[] | PositionIF[] | TransactionIF[],
    ) => {
        const newTxs: LimitOrderIF[] | PositionIF[] | TransactionIF[] = [];

        if (props.type === 'Order') {
            const existingChanges = new Set(
                hotTransactions.map(
                    (change) => (change as LimitOrderIF).limitOrderId,
                ),
            );

            hotTxs.forEach((tx) => {
                if (!existingChanges.has((tx as LimitOrderIF).limitOrderId)) {
                    (newTxs as LimitOrderIF[]).push(tx as LimitOrderIF);
                }
            });

            setHotTransactions((prev) => [
                ...(newTxs as LimitOrderIF[]),
                ...(prev as LimitOrderIF[]),
            ]);
        } else if (props.type === 'Range') {
            const existingChanges = new Set(
                hotTransactions.map(
                    (change) => (change as PositionIF).positionId,
                ),
            );

            hotTxs.forEach((tx) => {
                if (!existingChanges.has((tx as PositionIF).positionId)) {
                    (newTxs as PositionIF[]).push(tx as PositionIF);
                }
            });

            setHotTransactions((prev) => [
                ...(newTxs as PositionIF[]),
                ...(prev as PositionIF[]),
            ]);
        } else {
            const existingChanges = new Set(
                hotTransactions.map(
                    (change) => (change as TransactionIF).txHash,
                ),
            );

            hotTxs.forEach((tx) => {
                if (!existingChanges.has((tx as TransactionIF).txHash)) {
                    (newTxs as TransactionIF[]).push(tx as TransactionIF);
                }
            });

            setHotTransactions((prev) => [
                ...(newTxs as TransactionIF[]),
                ...(prev as TransactionIF[]),
            ]);
        }
    };

    // USE EFFECTS --------------------------------------------------------------------------------------------------------------------------

    //  this effect has been triggered once pivot data has been changed through contexts
    //  it will check new txs, then gonna add into table if user is on first page
    //  if not, it will update hot txs (and these hot txs will be merged once user backs to page 0)
    // its also trancuates table if data is an empty Array
    useEffect(() => {
        if (data.length == 0) {
            setFetchedTransactions(assignInitialFetchedTransactions());
        } else {
            const newTxs = dataDiffCheck(data);

            if (newTxs.length > 0) {
                if (pagesVisible[0] == 0) {
                    switch (props.type) {
                        case 'Order':
                            setFetchedTransactions(
                                (
                                    prev:
                                        | LimitOrderIF[]
                                        | PositionIF[]
                                        | TransactionIF[],
                                ) => {
                                    return [
                                        ...(prev as LimitOrderIF[]),
                                        ...(newTxs as LimitOrderIF[]),
                                    ];
                                },
                            );
                            break;
                        case 'Range':
                            setFetchedTransactions(
                                (
                                    prev:
                                        | LimitOrderIF[]
                                        | PositionIF[]
                                        | TransactionIF[],
                                ) => {
                                    return [
                                        ...(prev as PositionIF[]),
                                        ...(newTxs as PositionIF[]),
                                    ];
                                },
                            );
                            break;
                        case 'Transaction':
                            setFetchedTransactions(
                                (
                                    prev:
                                        | TransactionIF[]
                                        | LimitOrderIF[]
                                        | PositionIF[],
                                ) => {
                                    return [
                                        ...(prev as TransactionIF[]),
                                        ...(newTxs as TransactionIF[]),
                                    ];
                                },
                            );
                            break;
                    }
                } else {
                    updateHotTransactions(newTxs);
                }
            }
        }
    }, [data]);

    const getIndexForPages = (start: boolean, offset = 0) => {
        const pageDataCountVal = (
            pageDataCountRef.current ? pageDataCountRef.current : pageDataCount
        ).counts;

        let ret = 0;
        if (start) {
            for (let i = 0; i < pagesVisible[0]; i++) {
                ret += pageDataCountVal[i];
            }
        } else {
            for (let i = 0; i <= pagesVisible[1]; i++) {
                ret += pageDataCountVal[i];
                if (pagesVisible[1] === 1 && offset > 0) {
                    ret += offset;
                }
            }
        }
        return ret;
    };

    const { mergedData, recentlyUpdatedPositions } = useMergeWithPendingTxs({
        type: props.type,
        data: fetchedTransactions,
    });

    const dataToDisplay = useMemo(() => {
        const startIndex = getIndexForPages(true);
        const endIndex = getIndexForPages(
            false,
            recentlyUpdatedPositions.length,
        );

        return mergedData.slice(startIndex, endIndex);
    }, [pagesVisible, mergedData, recentlyUpdatedPositions]);

    return (
        <TableRowsInfiniteScroll
            type={props.type}
            data={dataToDisplay}
            tableView={tableView}
            isAccountView={isAccountView}
            fetcherFunction={addMoreData}
            sortBy={sortBy}
            showAllData={showAllData}
            pagesVisible={pagesVisible}
            setPagesVisible={setPagesVisible}
            moreDataAvailable={moreDataAvailable}
            extraPagesAvailable={extraPagesAvailable}
            pageDataCount={pageDataCount.counts}
            dataPerPage={dataPerPage}
            tableKey={selectedBaseAddress + selectedQuoteAddress}
            lastFetchedCount={lastFetchedCount}
            setLastFetchedCount={setLastFetchedCount}
            moreDataLoading={moreDataLoading}
        />
    );
}

export default memo(InfiniteScroll);
