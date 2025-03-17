/* eslint-disable no-irregular-whitespace */
import {
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { LimitOrderIF } from '../../../ambient-utils/types/limitOrder';
import { PositionIF } from '../../../ambient-utils/types/position';
import { TransactionIF } from '../../../ambient-utils/types/transaction';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { PageDataCountIF } from '../../Chat/ChatIFs';
import { LimitSortType } from '../TradeTabs/useSortedLimits';
import { RangeSortType } from '../TradeTabs/useSortedPositions';
import { TxSortType } from '../TradeTabs/useSortedTxs';
import TableRowsInfiniteScroll from './TableRowsInfiniteScroll';
import useInfiniteScrollFetchers from './useInfiniteScrollFetchers';
import useMergeWithPendingTxs from './useMergeWithPendingTxs';

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
    reverseSort: boolean;
    showAllData: boolean;
    componentLock?: boolean;
    extraRequestCreditLimit?: number;
    txFetchType?: TxFetchType;
    txFetchAddress?: `0x${string}` | string;
}

export enum TxFetchType {
    UserTxs,
    PoolTxs,
    UserPoolTxs,
    None,
}

function InfiniteScroll(props: propsIF) {
    const { baseToken, quoteToken, blackListedTimeParams, addToBlackList } =
        useContext(TradeDataContext);
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
        extraRequestCreditLimit,
        txFetchType,
        txFetchAddress,
        componentLock,
        reverseSort,
    } = props;

    const PAGE_COUNT_DIVIDE_THRESHOLD = 20;

    const EXTRA_REQUEST_CREDIT_COUNT = extraRequestCreditLimit || 0;

    const selectedBaseAddress: string = baseToken.address;
    const selectedQuoteAddress: string = quoteToken.address;

    const componentLockRef = useRef<boolean>();
    componentLockRef.current = componentLock;

    const prevTxFetchType = useRef<TxFetchType>();

    const {
        fetchLimitOrders,
        fetchPositions,
        fetchTxsPool,
        fetchTxsUser,
        fetchTxsUserPool,
    } = useInfiniteScrollFetchers();

    // TODO: check if we need infiniteScrollLock state variable or not (we were using it on Ranges.tsx)
    //   (That threshold value was used on related lock mechanism)
    const INITIAL_EXTRA_REQUEST_THRESHOLD = 20;

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
        setPageDataCount((prev) => {
            return {
                pair: prev.pair,
                counts: [prev.counts[0] + hotTxsCount, ...prev.counts.slice(1)],
            };
        });
    };

    const updateInitialPageDataCounts = (dataCount: number) => {
        if (dataCount < PAGE_COUNT_DIVIDE_THRESHOLD) {
            return {
                pair: (
                    selectedBaseAddress + selectedQuoteAddress
                ).toLowerCase(),
                counts: [dataCount, 0],
            };
        }

        return {
            pair: (selectedBaseAddress + selectedQuoteAddress).toLowerCase(),
            counts: [Math.ceil(dataCount / 2), Math.floor(dataCount / 2)],
        };
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

    const [extraRequestCreditCount, setExtraRequestCreditCount] =
        useState<number>(EXTRA_REQUEST_CREDIT_COUNT);

    const extraRequestCreditRef = useRef<number>();
    extraRequestCreditRef.current = extraRequestCreditCount;

    const pageDataCountRef = useRef<PageDataCountIF>();
    pageDataCountRef.current = pageDataCount;

    const [lastOldestTimeParam, setLastOldestTimeParam] = useState<number>(-1);
    const lastOldestTimeParamRef = useRef<number>(lastOldestTimeParam);
    lastOldestTimeParamRef.current = lastOldestTimeParam;

    const [requestedOldestTimes, setRequestedOldestTimes] = useState<number[]>(
        [],
    );
    const requestedOldestTimesRef = useRef<number[]>(requestedOldestTimes);
    requestedOldestTimesRef.current = requestedOldestTimes;

    const isAliveRef = useRef<boolean>(true);
    isAliveRef.current = true;

    useEffect(() => {
        return () => {
            isAliveRef.current = false;
        };
    }, []);

    // no need to use it for now
    const resetInfiniteScroll = () => {
        setFetchedTransactions(assignInitialFetchedTransactions());
        setPageDataCount(getInitialDataPageCounts());
        setHotTransactions([]);
        setRequestedOldestTimes([]);
        setExtraPagesAvailable(0);
        setMoreDataAvailable(true);
        setLastFetchedCount(0);
        setMoreDataLoading(false);
    };

    const stopFetchingAnimation = () => {
        setMoreDataLoading(false);
        setTimeout(() => {
            setMoreDataLoading(false);
        }, 1000);
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
                const existingTxs = new Set(
                    txs.map((e) => e.limitOrderId + ',' + e.positionLiq),
                );
                ret = (dirtyData as LimitOrderIF[]).filter(
                    (e) =>
                        !existingTxs.has(e.limitOrderId + ',' + e.positionLiq),
                );
            } else {
                txs = fetchedTransactionsRef.current
                    ? (fetchedTransactionsRef.current as PositionIF[])
                    : (fetchedTransactions as PositionIF[]);
                const existingTxs = new Set(
                    txs.map((e) => e.positionId + ',' + e.positionLiq),
                );

                ret = (dirtyData as PositionIF[]).filter(
                    (e) => !existingTxs.has(e.positionId + ',' + e.positionLiq),
                );
            }

            return ret;
        },
        [fetchedTransactions, fetchedTransactionsRef.current],
    );

    const getOldestTime = (
        txs: TransactionIF[] | LimitOrderIF[] | PositionIF[],
    ): number => {
        if (txs.length == 0) return Infinity;

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

    const addMoreData = async (byPassPageIncrement?: boolean) => {
        if (componentLockRef.current) {
            return;
        }

        setMoreDataLoading(true);

        let addedDataCount = 0;

        const newTxData: LimitOrderIF[] | PositionIF[] | TransactionIF[] = [];

        let oldestTimeParam = getOldestTime(
            fetchedTransactionsRef.current || fetchedTransactions,
        );

        // ------------------- FETCH DATA WITH LOOP -------------------
        while (addedDataCount < targetCount) {
            if (!isAliveRef.current) {
                break;
            }

            if (lastOldestTimeParamRef.current === oldestTimeParam) {
                stopFetchingAnimation();
                break;
            }

            if (requestedOldestTimesRef.current.includes(oldestTimeParam)) {
                stopFetchingAnimation();
                break;
            }

            if (
                blackListedTimeParams.has(
                    selectedBaseAddress + selectedQuoteAddress,
                ) &&
                blackListedTimeParams
                    .get(selectedBaseAddress + selectedQuoteAddress)
                    ?.has(oldestTimeParam)
            ) {
                stopFetchingAnimation();
                break;
            }

            setRequestedOldestTimes((prev) => [...prev, oldestTimeParam]);

            let dirtyData: LimitOrderIF[] | PositionIF[] | TransactionIF[] = [];

            if (props.type === 'Order') {
                dirtyData = await fetchLimitOrders(oldestTimeParam, fetchCount);
            } else if (props.type === 'Range') {
                dirtyData = await fetchPositions(oldestTimeParam, fetchCount);

                // set last used oldest time param
                setLastOldestTimeParam(oldestTimeParam);

                // get oldest time from dirty data to potential usage for extra requests
                const oldestTimeTemp = getOldestTime(dirtyData);
                oldestTimeParam =
                    oldestTimeTemp < oldestTimeParam
                        ? oldestTimeTemp
                        : oldestTimeParam;
            } else if (
                props.type === 'Transaction' &&
                txFetchType !== undefined
            ) {
                switch (txFetchType) {
                    case TxFetchType.UserTxs:
                        if (txFetchAddress) {
                            dirtyData = await fetchTxsUser(
                                oldestTimeParam,
                                fetchCount,
                                txFetchAddress,
                            );
                        }
                        break;
                    case TxFetchType.UserPoolTxs:
                        if (txFetchAddress) {
                            dirtyData = await fetchTxsUserPool(
                                oldestTimeParam,
                                fetchCount,
                                txFetchAddress as `0x${string}`,
                            );
                        }
                        break;
                    case TxFetchType.PoolTxs:
                        dirtyData = await fetchTxsPool(
                            oldestTimeParam,
                            fetchCount,
                        );
                        break;
                }
            }

            if (props.type === 'Range') {
                dirtyData = (dirtyData as PositionIF[]).filter(
                    (e: PositionIF) => (e as PositionIF).positionLiq !== 0,
                ) as PositionIF[];
            }

            if (dirtyData.length == 0) {
                // if current tab is range and request result is empty Array
                // add last sent time parameter into black list to not send redundandt backend calls
                // also reduce extra request credit value by 1
                if (props.type === 'Range') {
                    addToBlackList(
                        selectedBaseAddress + selectedQuoteAddress,
                        oldestTimeParam,
                    );
                }

                // this code block checks if there available extra request credit
                // if there is, it will reduce extra request credit value by 1
                // and continue the loop
                const creditVal =
                    extraRequestCreditRef.current !== undefined
                        ? extraRequestCreditRef.current
                        : extraRequestCreditCount;
                if (creditVal > 0) {
                    setExtraRequestCreditCount(creditVal - 1);
                    continue;
                }

                // if there is no available extra request credit, break the loop
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
            if (byPassPageIncrement) {
                const currTxsLen = fetchedTransactionsRef.current
                    ? fetchedTransactionsRef.current.length
                    : fetchedTransactions.length;
                setPageDataCount(
                    updateInitialPageDataCounts(currTxsLen + addedDataCount),
                );
            } else {
                setLastFetchedCount(addedDataCount);
                addPageDataCount(addedDataCount);
                setExtraPagesAvailable((prev) => prev + 1);
                setPagesVisible((prev) => [prev[0] + 1, prev[1] + 1]);
                setExtraRequestCreditCount(EXTRA_REQUEST_CREDIT_COUNT);
            }
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
            let idSet: Set<string>;

            if (props.type === 'Order') {
                idSet = new Set(
                    (newTxs as LimitOrderIF[]).map((e) => e.limitOrderId),
                );
            } else if (props.type === 'Range') {
                idSet = new Set(
                    (newTxs as PositionIF[]).map((e) => e.positionId),
                );
            }

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
                                    if (sortOrders) {
                                        return sortOrders([
                                            ...(newTxs as LimitOrderIF[]),
                                            ...(prev as LimitOrderIF[]).filter(
                                                (e) =>
                                                    !idSet.has(e.limitOrderId),
                                            ),
                                        ] as LimitOrderIF[]);
                                    }
                                    return [
                                        ...(newTxs as LimitOrderIF[]),
                                        ...(prev as LimitOrderIF[]).filter(
                                            (e) => !idSet.has(e.limitOrderId),
                                        ),
                                    ] as LimitOrderIF[];
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
                                    if (sortPositions) {
                                        return sortPositions([
                                            ...(newTxs as PositionIF[]),
                                            ...(prev as PositionIF[]).filter(
                                                (e) => !idSet.has(e.positionId),
                                            ),
                                        ] as PositionIF[]);
                                    }
                                    return [
                                        ...(newTxs as PositionIF[]),
                                        ...(prev as PositionIF[]).filter(
                                            (e) => !idSet.has(e.positionId),
                                        ),
                                    ] as PositionIF[];
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
                                    if (sortTransactions) {
                                        return sortTransactions([
                                            ...(newTxs as TransactionIF[]),
                                            ...(prev as TransactionIF[]),
                                        ] as TransactionIF[]);
                                    }
                                    return [
                                        ...(newTxs as TransactionIF[]),
                                        ...(prev as TransactionIF[]),
                                    ] as TransactionIF[];
                                },
                            );
                            break;
                        default:
                            break;
                    }
                    mergePageDataCounts(newTxs.length);
                } else {
                    updateHotTransactions(newTxs);
                }
            }
        }
    }, [data]);

    useEffect(() => {
        if (props.type === 'Transaction') {
            if (
                prevTxFetchType.current &&
                prevTxFetchType.current !== txFetchType
            ) {
                resetInfiniteScroll();
            }
            prevTxFetchType.current = txFetchType;
        }
    }, [txFetchType]);

    // merge hot txs with first page once user is on page 0
    useEffect(() => {
        if (pagesVisible[0] === 0 && hotTransactions.length > 0) {
            if (props.type === 'Order') {
                setFetchedTransactions((prev) => [
                    ...(hotTransactions as LimitOrderIF[]),
                    ...(prev as LimitOrderIF[]),
                ]);
            } else if (props.type === 'Range') {
                setFetchedTransactions((prev) => [
                    ...(hotTransactions as PositionIF[]),
                    ...(prev as PositionIF[]),
                ]);
            } else {
                setFetchedTransactions((prev) => [
                    ...(hotTransactions as TransactionIF[]),
                    ...(prev as TransactionIF[]),
                ]);
            }
            mergePageDataCounts(hotTransactions.length);
            setHotTransactions([]);
        }
    }, [pagesVisible[0]]);

    // back to first page once component lock has been changed (once candle transactions mode is activated)
    useEffect(() => {
        if (props.type === 'Transaction') {
            setPagesVisible([0, 1]);
            setFetchedTransactions(assignInitialFetchedTransactions());
            setPageDataCount(getInitialDataPageCounts());
        }
    }, [componentLock]);

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

    useEffect(() => {
        if (props.type === 'Range' && sortPositions) {
            setFetchedTransactions(
                sortPositions(fetchedTransactionsRef.current as PositionIF[]),
            );
        } else if (props.type === 'Order' && sortOrders) {
            setFetchedTransactions(
                sortOrders(fetchedTransactionsRef.current as LimitOrderIF[]),
            );
        } else if (props.type === 'Transaction' && sortTransactions) {
            setFetchedTransactions(
                sortTransactions(
                    fetchedTransactionsRef.current as TransactionIF[],
                ),
            );
        }
    }, [sortBy, reverseSort]);

    const dataToDisplay = useMemo(() => {
        const startIndex = getIndexForPages(true);
        const endIndex = getIndexForPages(
            false,
            recentlyUpdatedPositions.length,
        );
        return mergedData.slice(startIndex, endIndex);
    }, [pagesVisible, mergedData, recentlyUpdatedPositions]);

    useEffect(() => {
        if (props.type === 'Range') {
            if (
                mergedData.length < INITIAL_EXTRA_REQUEST_THRESHOLD &&
                mergedData.length > 0
            ) {
                addMoreData(true);
            }
        }
    }, [mergedData]);

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
            componentLock={componentLock}
        />
    );
}

export default memo(InfiniteScroll);
