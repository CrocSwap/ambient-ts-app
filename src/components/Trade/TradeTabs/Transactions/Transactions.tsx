/* eslint-disable no-irregular-whitespace */
import { CandleDataIF, TransactionIF } from '../../../../ambient-utils/types';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';

import {
    Dispatch,
    memo,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    fetchPoolRecentChanges,
    fetchUserRecentChanges,
} from '../../../../ambient-utils/api';

import { fetchPoolUserChanges } from '../../../../ambient-utils/api/fetchPoolUserChanges';
import { IS_LOCAL_ENV } from '../../../../ambient-utils/constants';
import { candleTimeIF } from '../../../../App/hooks/useChartSettings';
import { UserDataContext } from '../../../../contexts';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import { CandleContext } from '../../../../contexts/CandleContext';
import { ChartContext } from '../../../../contexts/ChartContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { DataLoadingContext } from '../../../../contexts/DataLoadingContext';
import {
    Changes,
    GraphDataContext,
} from '../../../../contexts/GraphDataContext';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TokenContext } from '../../../../contexts/TokenContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { FlexContainer } from '../../../../styled/Common';
import { TransactionRow as TransactionRowStyled } from '../../../../styled/Components/TransactionTable';
import Spinner from '../../../Global/Spinner/Spinner';
import NoTableData from '../NoTableData/NoTableData';
import TableRowsInfiniteScroll from '../TableRowsInfiniteScroll';
import { useSortedTxs } from '../useSortedTxs';
import TransactionHeader from './TransactionsTable/TransactionHeader';
import { TransactionRowPlaceholder } from './TransactionsTable/TransactionRowPlaceholder';

interface propsIF {
    filter?: CandleDataIF | undefined;
    activeAccountTransactionData?: TransactionIF[];
    connectedAccountActive?: boolean;
    isAccountView: boolean;
    setSelectedDate?: Dispatch<number | undefined>;
    setSelectedInsideTab?: Dispatch<number>;
    fullLayoutActive?: boolean;
    accountAddress?: string | undefined;
}

function Transactions(props: propsIF) {
    const {
        filter,
        activeAccountTransactionData,
        connectedAccountActive,
        setSelectedDate,
        setSelectedInsideTab,
        isAccountView,
        fullLayoutActive,
        accountAddress,
    } = props;

    const {
        server: { isEnabled: isServerEnabled },
    } = useContext(AppStateContext);
    const { isCandleSelected } = useContext(CandleContext);
    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const { chartSettings } = useContext(ChartContext);
    const { crocEnv, provider } = useContext(CrocEnvContext);
    const {
        activeNetwork: { chainId, poolIndex, GCGO_URL },
    } = useContext(AppStateContext);

    const { setOutsideControl, showAllData: showAllDataSelection } =
        useContext(TradeTableContext);
    const { tokens } = useContext(TokenContext);

    const { userAddress } = useContext(UserDataContext);

    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);

    const candleTime: candleTimeIF = chartSettings.candleTime.global;

    const dataLoadingStatus = useContext(DataLoadingContext);
    const {
        transactionsByUser,
        userTransactionsByPool,
        transactionsByPool,
        unindexedNonFailedSessionTransactionHashes,
    } = useContext(GraphDataContext);

    const { transactionsByType } = useContext(ReceiptContext);
    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const selectedBaseAddress: string = baseToken.address;
    const selectedQuoteAddress: string = quoteToken.address;
    const quoteTokenSymbol: string = quoteToken?.symbol;
    const baseTokenSymbol: string = baseToken?.symbol;

    const showAllData = !isAccountView && showAllDataSelection;

    const [candleTransactionData, setCandleTransactionData] = useState<
        TransactionIF[]
    >([]);

    // infinite scroll variables and useEffects -----------------------------------------------

    // ref holding scrollable element (to attach event listener)

    const getInitialChangesData = () => {
        let ret: TransactionIF[] = [];
        if (isAccountView) {
            ret = activeAccountTransactionData
                ? activeAccountTransactionData
                : [];
        } else if (showAllData) {
            ret = transactionsByPool.changes;
        } else {
            ret = userTransactionsByPool.changes;
        }

        return ret;
    };
    const [fetchedTransactions, setFetchedTransactions] = useState<Changes>({
        dataReceived: false,
        changes: [...getInitialChangesData()],
    });

    const [infiniteScrollLock, setInfiniteScrollLock] =
        useState<boolean>(false);

    const [hotTransactions, setHotTransactions] = useState<TransactionIF[]>([]);

    const fetchedTransactionsRef = useRef<Changes>();
    fetchedTransactionsRef.current = fetchedTransactions;

    const [pagesVisible, setPagesVisible] = useState<[number, number]>([0, 1]);

    const [extraPagesAvailable, setExtraPagesAvailable] = useState<number>(0);

    const [moreDataAvailable, setMoreDataAvailable] = useState<boolean>(true);
    const moreDataAvailableRef = useRef<boolean>();
    moreDataAvailableRef.current = moreDataAvailable;

    const [moreDataLoading, setMoreDataLoading] = useState<boolean>(false);

    const [lastFetchedCount, setLastFetchedCount] = useState<number>(0);

    const showAllDataRef = useRef<boolean>(showAllData);
    showAllDataRef.current = showAllData;

    const isAccountViewRef = useRef<boolean>(isAccountView);
    isAccountViewRef.current = isAccountView;

    const userAddressRef = useRef<`0x${string}` | undefined>(userAddress);
    userAddressRef.current = userAddress;

    const accountAddressRef = useRef<string | undefined>(accountAddress);
    accountAddressRef.current = accountAddress;

    const resetInfiniteScrollData = () => {
        console.log('reset infinite scroll data');
        setPagesVisible([0, 1]);
        setExtraPagesAvailable(0);
        setMoreDataAvailable(true);
        setLastFetchedCount(0);
        setHotTransactions([]);
    };

    useEffect(() => {
        resetInfiniteScrollData();
    }, [selectedBaseAddress + selectedQuoteAddress]);

    useEffect(() => {
        resetInfiniteScrollData();
        setFetchedTransactions({
            dataReceived: false,
            changes: [...getInitialChangesData()],
        });
    }, [showAllData]);

    useEffect(() => {
        if (pagesVisible[0] === 0 && fetchedTransactions.changes.length === 0) {
            resetInfiniteScrollData();
            setFetchedTransactions({
                dataReceived: false,
                changes: [...getInitialChangesData()],
            });
        }
    }, [activeAccountTransactionData]);

    useEffect(() => {
        // clear fetched transactions when switching pools
        if (
            !isAccountView &&
            showAllData &&
            transactionsByPool.changes.length === 0
        ) {
            setFetchedTransactions({
                dataReceived: true,
                changes: [],
            });
        } else if (
            !isAccountView &&
            !showAllData &&
            userAddressRef.current &&
            userTransactionsByPool.changes.length === 0
        ) {
            setFetchedTransactions({
                dataReceived: true,
                changes: [],
            });
        } else if (
            isAccountView &&
            (accountAddressRef.current || userAddressRef.current) &&
            activeAccountTransactionData?.length === 0
        ) {
            setFetchedTransactions({
                dataReceived: true,
                changes: [],
            });
        }
    }, [
        transactionsByPool,
        userTransactionsByPool,
        activeAccountTransactionData,
    ]);

    // const [showInfiniteScroll, setShowInfiniteScroll] = useState<boolean>(!isAccountView && showAllData);
    // useEffect(() => {
    //     setShowInfiniteScroll(!isAccountView && showAllData);
    // }, [isAccountView, showAllData]);

    // ----------------------------------------------------------------------------------------------

    const txDataToDisplay: TransactionIF[] = isCandleSelected
        ? candleTransactionData
        : fetchedTransactions.changes;

    const [
        sortBy,
        setSortBy,
        reverseSort,
        setReverseSort,
        sortedTransactions,
        sortData,
    ] = useSortedTxs('time', txDataToDisplay);

    const sortedTxDataToDisplay = useMemo<TransactionIF[]>(() => {
        return isCandleSelected
            ? sortedTransactions
            : sortedTransactions.slice(
                  pagesVisible[0] * 50,
                  pagesVisible[1] * 50 + 50,
              );
    }, [sortedTransactions, pagesVisible, isCandleSelected, isAccountView]);

    useEffect(() => {
        if (!showAllData) return;
        const existingChanges = new Set(
            fetchedTransactions.changes.map(
                (change) => change.txHash || change.txId,
            ),
        ); // Adjust if using a different unique identifier

        const uniqueChanges = transactionsByPool.changes.filter(
            (change) => !existingChanges.has(change.txHash || change.txId),
        );

        if (uniqueChanges.length > 0) {
            if (pagesVisible[0] === 0) {
                setFetchedTransactions((prev) => {
                    return {
                        dataReceived: true,
                        changes: [...uniqueChanges, ...prev.changes],
                    };
                });
            } else {
                updateHotTransactions(uniqueChanges);
            }
        }
    }, [transactionsByPool]);

    useEffect(() => {
        if (showAllData) return;
        const existingChanges = new Set(
            fetchedTransactions.changes.map(
                (change) => change.txHash || change.txId,
            ),
        ); // Adjust if using a different unique identifier

        const uniqueChanges = userTransactionsByPool.changes.filter(
            (change) => !existingChanges.has(change.txHash || change.txId),
        );

        if (uniqueChanges.length > 0) {
            if (pagesVisible[0] === 0) {
                setFetchedTransactions((prev) => {
                    return {
                        dataReceived: true,
                        changes: [...uniqueChanges, ...prev.changes],
                    };
                });
            } else {
                updateHotTransactions(uniqueChanges);
            }
        }
    }, [userTransactionsByPool]);

    const updateHotTransactions = (changes: TransactionIF[]) => {
        const existingChanges = new Set(
            hotTransactions.map((change) => change.txHash || change.txId),
        );

        const uniqueChanges = changes.filter(
            (change) => !existingChanges.has(change.txHash || change.txId),
        );

        setHotTransactions((prev) => [...uniqueChanges, ...prev]);
    };

    useEffect(() => {
        if (pagesVisible[0] === 0 && hotTransactions.length > 0) {
            setFetchedTransactions((prev) => {
                return {
                    dataReceived: true,
                    changes: [...hotTransactions, ...prev.changes],
                };
            });
            setHotTransactions([]);
        }
    }, [pagesVisible[0]]);

    const oldestTxTime = useMemo(() => {
        const dataToFilter = fetchedTransactionsRef.current?.changes || [];
        return dataToFilter.length > 0
            ? dataToFilter.reduce((min, transaction) => {
                  return transaction.txTime < min ? transaction.txTime : min;
              }, dataToFilter[0].txTime)
            : 0;
    }, [fetchedTransactions, showAllData, isAccountView]);

    const oldestTxTimeRef = useRef<number>(oldestTxTime);
    oldestTxTimeRef.current = oldestTxTime;

    const userTransacionsLength = useMemo<number>(
        () =>
            isAccountView
                ? activeAccountTransactionData
                    ? activeAccountTransactionData.length
                    : 0
                : transactionsByUser.changes.length,
        [activeAccountTransactionData, transactionsByUser, isAccountView],
    );

    useEffect(() => {
        if (!isCandleSelected) {
            setCandleTransactionData([]);
            setInfiniteScrollLock(false);
            dataLoadingStatus.setDataLoadingStatus({
                datasetName: 'isCandleDataLoading',
                loadingStatus: true,
            });
        }
    }, [isCandleSelected]);

    useEffect(() => {
        if (isCandleSelected) {
            setInfiniteScrollLock(true);
            resetInfiniteScrollData();
        }
        // setTimeout(() => {
        //     setInfiniteScrollLock(false);
        // }, 500);
    }, [candleTransactionData]);

    const isLoading = useMemo<boolean>(
        () =>
            isCandleSelected
                ? dataLoadingStatus.isCandleDataLoading
                : isAccountView && connectedAccountActive
                  ? dataLoadingStatus.isConnectedUserTxDataLoading
                  : isAccountView
                    ? dataLoadingStatus.isLookupUserTxDataLoading
                    : dataLoadingStatus.isPoolTxDataLoading,
        [
            isAccountView,
            showAllData,
            connectedAccountActive,
            isCandleSelected,
            dataLoadingStatus.isCandleDataLoading,
            dataLoadingStatus.isConnectedUserTxDataLoading,
            dataLoadingStatus.isConnectedUserPoolTxDataLoading,
            dataLoadingStatus.isLookupUserTxDataLoading,
            dataLoadingStatus.isPoolTxDataLoading,
        ],
    );

    const unindexedNonFailedTransactions = transactionsByType.filter(
        (tx) =>
            !tx.isRemoved &&
            unindexedNonFailedSessionTransactionHashes.includes(tx.txHash) &&
            tx.txDetails?.baseAddress.toLowerCase() ===
                baseToken.address.toLowerCase() &&
            tx.txDetails?.quoteAddress.toLowerCase() ===
                quoteToken.address.toLowerCase() &&
            tx.txDetails?.poolIdx === poolIndex,
    );

    // TODO: Use these as media width constants
    const isSmallScreen: boolean = useMediaQuery('(max-width: 768px)');
    const isTabletScreen = useMediaQuery(
        '(min-width: 768px) and (max-width: 1200px)',
    );
    const isLargeScreen: boolean = useMediaQuery('(min-width: 1600px)');

    const tableView: 'small' | 'medium' | 'large' =
        isSmallScreen || isTabletScreen
            ? 'small'
            : (!isSmallScreen && !isLargeScreen) ||
                (isAccountView &&
                    isLargeScreen &&
                    isSidebarOpen &&
                    fullLayoutActive === false)
              ? 'medium'
              : 'large';

    const getCandleData = (): Promise<void> | undefined =>
        crocEnv &&
        provider &&
        fetchPoolRecentChanges({
            tokenList: tokens.tokenUniv,
            base: selectedBaseAddress,
            quote: selectedQuoteAddress,
            poolIdx: poolIndex,
            chainId: chainId,
            n: 200,
            period: candleTime.time,
            time: filter?.time,
            crocEnv: crocEnv,
            GCGO_URL: GCGO_URL,
            provider,
            cachedFetchTokenPrice: cachedFetchTokenPrice,
            cachedQuerySpotPrice: cachedQuerySpotPrice,
            cachedTokenDetails: cachedTokenDetails,
            cachedEnsResolve: cachedEnsResolve,
        })
            .then((selectedCandleChangesJson) => {
                IS_LOCAL_ENV && console.debug({ selectedCandleChangesJson });
                if (selectedCandleChangesJson) {
                    const selectedCandleChangesWithoutFills =
                        selectedCandleChangesJson.filter((tx) => {
                            if (
                                tx.changeType !== 'fill' &&
                                tx.changeType !== 'cross'
                            ) {
                                return true;
                            } else {
                                return false;
                            }
                        });
                    setCandleTransactionData(selectedCandleChangesWithoutFills);
                }
                setOutsideControl(true);
                setSelectedInsideTab && setSelectedInsideTab(0);
            })
            .catch(console.error);

    // update candle transactions on fresh load
    useEffect(() => {
        if (
            isServerEnabled &&
            isCandleSelected &&
            candleTime.time &&
            filter?.time &&
            crocEnv &&
            provider
        ) {
            dataLoadingStatus.setDataLoadingStatus({
                datasetName: 'isCandleDataLoading',
                loadingStatus: true,
            });
            getCandleData()?.then(() => {
                dataLoadingStatus.setDataLoadingStatus({
                    datasetName: 'isCandleDataLoading',
                    loadingStatus: false,
                });
            });
        }
    }, [
        isServerEnabled,
        isCandleSelected,
        filter?.time,
        candleTime.time,
        !!crocEnv,
        !!provider,
    ]);

    const sideType: JSX.Element = (
        <>
            <p>Type</p>
            <p>Side</p>
        </>
    );

    const headerColumns: {
        name: string | JSX.Element;
        show: boolean;
        slug: string;
        sortable: boolean;
        alignRight?: boolean;
        alignCenter?: boolean;
    }[] = [
        {
            name: 'Timestamp',
            show: tableView !== 'small',
            slug: 'time',
            sortable: true,
        },
        {
            name: 'Pair',
            show: isAccountView,
            slug: 'pool',
            sortable: true,
        },
        {
            name: 'Transaction ID',
            show:
                tableView === 'large' ||
                (tableView === 'medium' && isAccountView),
            slug: 'id',
            sortable: false,
        },
        {
            name: 'Wallet',
            show: !isAccountView,
            slug: 'wallet',
            sortable: showAllData,
        },
        {
            name: 'Price',
            show: tableView !== 'small',
            slug: 'price',
            sortable: false,
            alignRight: true,
        },
        {
            name: 'Side',
            show: tableView === 'large',
            slug: 'side',
            sortable: false,
            alignCenter: true,
        },
        {
            name: 'Type',
            show: tableView === 'large',
            slug: 'type',
            sortable: false,
            alignCenter: true,
        },
        {
            name: sideType,
            show: tableView !== 'large',
            slug: 'sidetype',
            sortable: false,
            alignCenter: true,
        },
        {
            name: 'Value (USD)',
            show: true,
            slug: 'value',
            sortable: true,
            alignRight: true,
        },
        {
            name: isAccountView ? <></> : `${baseTokenSymbol}`,
            show: tableView === 'large',
            slug: baseTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: isAccountView ? <></> : `${quoteTokenSymbol}`,
            show: tableView === 'large',
            slug: quoteTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: 'Tokens',
            show: !isAccountView && tableView === 'medium',
            slug: 'tokens',
            sortable: false,
            alignRight: true,
        },
        {
            name: <>Tokens</>,
            show: isAccountView && tableView === 'medium',
            slug: 'tokens',
            sortable: false,
            alignRight: true,
        },
        {
            name: '',
            show: false,
            slug: 'menu',
            sortable: false,
        },
    ];

    const headerColumnsDisplay: JSX.Element = (
        <TransactionRowStyled size={tableView} header account={isAccountView}>
            {headerColumns.map((header, idx) => (
                <TransactionHeader
                    key={idx}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    reverseSort={reverseSort}
                    setReverseSort={setReverseSort}
                    header={header}
                />
            ))}
        </TransactionRowStyled>
    );

    const listRef = useRef<HTMLUListElement>(null);

    const handleKeyDownViewTransaction = (
        event: React.KeyboardEvent<HTMLUListElement | HTMLDivElement>,
    ): void => {
        // Opens a modal which displays the contents of a transaction and some other information
        const { key } = event;

        if (key === 'ArrowDown' || key === 'ArrowUp') {
            const rows = document.querySelectorAll('.row_container_global');
            const currentRow = event.target as HTMLLIElement;
            const index = Array.from(rows).indexOf(currentRow);

            if (key === 'ArrowDown') {
                event.preventDefault();
                if (index < rows.length - 1) {
                    (rows[index + 1] as HTMLLIElement).focus();
                } else {
                    (rows[0] as HTMLLIElement).focus();
                }
            } else if (key === 'ArrowUp') {
                event.preventDefault();
                if (index > 0) {
                    (rows[index - 1] as HTMLLIElement).focus();
                } else {
                    (rows[rows.length - 1] as HTMLLIElement).focus();
                }
            }
        }
    };

    const dataDiffCheck = (dirty: TransactionIF[]): TransactionIF[] => {
        const txs = fetchedTransactionsRef.current
            ? fetchedTransactionsRef.current.changes
            : fetchedTransactions.changes;

        const existingChanges = new Set(
            txs.map((change) => change.txHash || change.txId),
        );

        const ret = dirty.filter(
            (change) => !existingChanges.has(change.txHash || change.txId),
        );

        return ret;
    };

    const addMoreData = async () => {
        setMoreDataLoading(true);
        // retrieve pool recent changes
        if (!crocEnv || !provider) {
            setMoreDataLoading(false);
            return;
        } else {
            let poolChangesJsonData;
            if (showAllDataRef.current && !isAccountViewRef.current) {
                poolChangesJsonData = await fetchPoolRecentChanges({
                    tokenList: tokens.tokenUniv,
                    base: selectedBaseAddress,
                    quote: selectedQuoteAddress,
                    poolIdx: poolIndex,
                    chainId: chainId,
                    n: 50,
                    timeBefore: oldestTxTimeRef.current,
                    crocEnv: crocEnv,
                    GCGO_URL: GCGO_URL,
                    provider: provider,
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                    cachedEnsResolve: cachedEnsResolve,
                });
            } else if (
                !showAllDataRef.current &&
                !isAccountViewRef.current &&
                userAddressRef.current
            ) {
                poolChangesJsonData = await fetchPoolUserChanges({
                    tokenList: tokens.tokenUniv,
                    base: selectedBaseAddress,
                    quote: selectedQuoteAddress,
                    poolIdx: poolIndex,
                    chainId: chainId,
                    user: userAddressRef.current,
                    n: 50,
                    timeBefore: oldestTxTimeRef.current,
                    crocEnv: crocEnv,
                    GCGO_URL: GCGO_URL,
                    provider: provider,
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                    cachedEnsResolve: cachedEnsResolve,
                });
            } else if (accountAddressRef.current || userAddressRef.current) {
                const userParam =
                    accountAddress && accountAddress.length > 0
                        ? accountAddress
                        : userAddress
                          ? userAddress
                          : '';
                poolChangesJsonData = await fetchUserRecentChanges({
                    tokenList: tokens.tokenUniv,
                    chainId: chainId,
                    user: userParam,
                    n: 50,
                    timeBefore: oldestTxTimeRef.current,
                    crocEnv: crocEnv,
                    GCGO_URL: GCGO_URL,
                    provider: provider,
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                    cachedEnsResolve: cachedEnsResolve,
                });
            }
            if (poolChangesJsonData && poolChangesJsonData.length > 0) {
                const cleanData = dataDiffCheck(poolChangesJsonData);

                if (cleanData.length > 0) {
                    setFetchedTransactions((prev) => {
                        const sortedData = sortData([
                            ...prev.changes,
                            ...cleanData,
                        ]);
                        return {
                            dataReceived: true,
                            changes: sortedData,
                        };
                    });
                    setLastFetchedCount(cleanData.length);
                    setExtraPagesAvailable((prev) => prev + 1);
                    setPagesVisible((prev) => [prev[0] + 1, prev[1] + 1]);
                } else {
                    setMoreDataAvailable(false);
                }
            } else {
                setMoreDataAvailable(false);
            }
            setMoreDataLoading(false);
        }
        setMoreDataLoading(false);
    };

    const [debouncedIsLoading, setDebouncedIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!isLoading && !txDataToDisplay.length) {
            // use a timeout to keep the isLoading state true 1 second longer
            const handler = setTimeout(
                () => setDebouncedIsLoading(isLoading),
                1000,
            );
            return () => clearTimeout(handler);
        } else {
            setDebouncedIsLoading(isLoading);
        }
    }, [isLoading, txDataToDisplay.length]);

    const shouldDisplayNoTableData: boolean =
        !debouncedIsLoading &&
        !txDataToDisplay.length &&
        unindexedNonFailedTransactions.length === 0;

    const transactionDataOrNull: JSX.Element = shouldDisplayNoTableData ? (
        <NoTableData
            setSelectedDate={setSelectedDate}
            type='transactions'
            isAccountView={isAccountView}
            activeUserPositionsLength={userTransacionsLength}
            activeUserPositionsByPoolLength={
                userTransactionsByPool.changes.length
            }
        />
    ) : (
        <div onKeyDown={handleKeyDownViewTransaction}>
            <ul
                ref={listRef}
                id='current_row_scroll'
                style={
                    isSmallScreen
                        ? isAccountView
                            ? {
                                  maxHeight: 'calc(100svh - 310px)',
                                  overflowY: 'auto',
                              }
                            : {
                                  height: 'calc(100svh - 300px)',
                                  overflowY: 'auto',
                              }
                        : undefined
                }
            >
                {!isAccountView &&
                    unindexedNonFailedTransactions.length > 0 &&
                    unindexedNonFailedTransactions.reverse().map((tx, idx) => {
                        if (tx.txAction !== 'Reposition')
                            return (
                                <TransactionRowPlaceholder
                                    key={idx}
                                    transaction={{
                                        hash: tx.txHash,
                                        side: tx.txAction,
                                        type: tx.txType,
                                        action: tx.txAction,
                                        details: tx.txDetails,
                                    }}
                                    tableView={tableView}
                                />
                            );
                        return (
                            <>
                                <TransactionRowPlaceholder
                                    key={idx + 'sell'}
                                    transaction={{
                                        hash: tx.txHash,
                                        side: 'Sell',
                                        type: 'Market',
                                        action: tx.txAction,
                                        details: {
                                            baseSymbol:
                                                tx.txDetails?.baseSymbol ??
                                                '...',
                                            quoteSymbol:
                                                tx.txDetails?.quoteSymbol ??
                                                '...',
                                            baseTokenDecimals:
                                                tx.txDetails?.baseTokenDecimals,
                                            quoteTokenDecimals:
                                                tx.txDetails
                                                    ?.quoteTokenDecimals,
                                            lowTick: tx.txDetails?.lowTick,
                                            highTick: tx.txDetails?.highTick,
                                            gridSize: tx.txDetails?.gridSize,
                                            isBid: tx.txDetails?.isBid,
                                        },
                                    }}
                                    tableView={tableView}
                                />
                                <TransactionRowPlaceholder
                                    key={idx + 'add'}
                                    transaction={{
                                        hash: tx.txHash,
                                        side: 'Add',
                                        type: 'Range',
                                        action: tx.txAction,
                                        details: {
                                            baseSymbol:
                                                tx.txDetails?.baseSymbol ??
                                                '...',
                                            quoteSymbol:
                                                tx.txDetails?.quoteSymbol ??
                                                '...',
                                            baseTokenDecimals:
                                                tx.txDetails?.baseTokenDecimals,
                                            quoteTokenDecimals:
                                                tx.txDetails
                                                    ?.quoteTokenDecimals,
                                            lowTick: tx.txDetails?.lowTick,
                                            highTick: tx.txDetails?.highTick,
                                            gridSize: tx.txDetails?.gridSize,
                                        },
                                    }}
                                    tableView={tableView}
                                />
                                <TransactionRowPlaceholder
                                    key={idx + 'remove'}
                                    transaction={{
                                        hash: tx.txHash,
                                        side: 'Remove',
                                        type: 'Range',
                                        action: tx.txAction,
                                        details: {
                                            baseSymbol:
                                                tx.txDetails?.baseSymbol ??
                                                '...',
                                            quoteSymbol:
                                                tx.txDetails?.quoteSymbol ??
                                                '...',
                                            baseTokenDecimals:
                                                tx.txDetails?.baseTokenDecimals,
                                            quoteTokenDecimals:
                                                tx.txDetails
                                                    ?.quoteTokenDecimals,
                                            lowTick:
                                                tx.txDetails?.originalLowTick,
                                            highTick:
                                                tx.txDetails?.originalHighTick,
                                            gridSize: tx.txDetails?.gridSize,
                                        },
                                    }}
                                    tableView={tableView}
                                />
                            </>
                        );
                    })}
                <TableRowsInfiniteScroll
                    type='Transaction'
                    data={sortedTxDataToDisplay}
                    tableView={tableView}
                    isAccountView={isAccountView}
                    fetcherFunction={addMoreData}
                    sortBy={sortBy}
                    showAllData={showAllData}
                    moreDataAvailable={moreDataAvailableRef.current}
                    pagesVisible={pagesVisible}
                    setPagesVisible={setPagesVisible}
                    extraPagesAvailable={extraPagesAvailable}
                    lastFetchedCount={lastFetchedCount}
                    setLastFetchedCount={setLastFetchedCount}
                    moreDataLoading={moreDataLoading}
                    componentLock={infiniteScrollLock}
                />
            </ul>
        </div>
    );

    if (isSmallScreen)
        return (
            <div
                style={{
                    overflow: 'scroll',
                    height: '100%',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        position: 'sticky',
                        top: 0,
                        background: 'var(--dark2',
                        zIndex: '1',
                    }}
                >
                    {headerColumnsDisplay}
                </div>
                <div>{transactionDataOrNull}</div>
            </div>
        );

    return (
        <FlexContainer
            flexDirection='column'
            style={{ height: '100%', position: 'relative' }}
        >
            <div>{headerColumnsDisplay}</div>
            <div
                style={{
                    flex: 1,
                    overflow: 'auto',
                    transition: 'all .1s ease-in-out',
                }}
                className='custom_scroll_ambient'
            >
                {(
                    isCandleSelected
                        ? dataLoadingStatus.isCandleDataLoading
                        : debouncedIsLoading
                ) ? (
                    <div style={{ height: isSmallScreen ? '80vh' : '100%' }}>
                        <Spinner size={100} bg='var(--dark1)' centered />
                    </div>
                ) : (
                    transactionDataOrNull
                )}
            </div>
        </FlexContainer>
    );
}

export default memo(Transactions);
