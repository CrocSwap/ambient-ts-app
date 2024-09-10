/* eslint-disable no-irregular-whitespace */
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { TransactionIF, CandleDataIF } from '../../../../ambient-utils/types';

import {
    Dispatch,
    useState,
    useEffect,
    useRef,
    useContext,
    memo,
    useMemo,
} from 'react';
import TransactionHeader from './TransactionsTable/TransactionHeader';
import { useSortedTxs } from '../useSortedTxs';
import NoTableData from '../NoTableData/NoTableData';
import {
    TradeTableContext,
    TradeTableContextIF,
} from '../../../../contexts/TradeTableContext';
import Spinner from '../../../Global/Spinner/Spinner';
import {
    CandleContext,
    CandleContextIF,
} from '../../../../contexts/CandleContext';
import {
    ChartContext,
    ChartContextIF,
} from '../../../../contexts/ChartContext';
import { fetchPoolRecentChanges } from '../../../../ambient-utils/api';
import {
    AppStateContext,
    AppStateContextIF,
} from '../../../../contexts/AppStateContext';
import {
    CrocEnvContext,
    CrocEnvContextIF,
} from '../../../../contexts/CrocEnvContext';
import {
    TokenContext,
    TokenContextIF,
} from '../../../../contexts/TokenContext';
import {
    CachedDataContext,
    CachedDataIF,
} from '../../../../contexts/CachedDataContext';
import { IS_LOCAL_ENV } from '../../../../ambient-utils/constants';
import { TransactionRowPlaceholder } from './TransactionsTable/TransactionRowPlaceholder';
import {
    SidebarContext,
    SidebarStateIF,
} from '../../../../contexts/SidebarContext';
import {
    ScrollToTopButton,
    TransactionRow as TransactionRowStyled,
} from '../../../../styled/Components/TransactionTable';
import { FlexContainer } from '../../../../styled/Common';
import {
    Changes,
    GraphDataContext,
    GraphDataContextIF,
} from '../../../../contexts/GraphDataContext';
import {
    DataLoadingContext,
    DataLoadingContextIF,
} from '../../../../contexts/DataLoadingContext';
import {
    TradeDataContext,
    TradeDataContextIF,
} from '../../../../contexts/TradeDataContext';
import {
    ReceiptContext,
    ReceiptContextIF,
} from '../../../../contexts/ReceiptContext';
import TableRows from '../TableRows';
import { candleTimeIF } from '../../../../App/hooks/useChartSettings';
import { domDebug } from '../../../Chat/DomDebugger/DomDebuggerUtils';

interface propsIF {
    filter?: CandleDataIF | undefined;
    activeAccountTransactionData?: TransactionIF[];
    connectedAccountActive?: boolean;
    isAccountView: boolean;
    setSelectedDate?: Dispatch<number | undefined>;
    setSelectedInsideTab?: Dispatch<number>;
    fullLayoutActive?: boolean;
}

enum ScrollDirection {
    UP,
    DOWN,
}

enum ScrollPosition {
    TOP,
    BOTTOM,
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
    } = props;

    const {
        server: { isEnabled: isServerEnabled },
    } = useContext<AppStateContextIF>(AppStateContext);
    const { isCandleSelected } = useContext<CandleContextIF>(CandleContext);
    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext<CachedDataIF>(CachedDataContext);
    const { chartSettings } = useContext<ChartContextIF>(ChartContext);
    const {
        crocEnv,
        activeNetwork,
        provider,
        chainData: { chainId, poolIndex },
    } = useContext<CrocEnvContextIF>(CrocEnvContext);

    const { setOutsideControl, showAllData: showAllDataSelection } =
        useContext<TradeTableContextIF>(TradeTableContext);
    const { tokens } = useContext<TokenContextIF>(TokenContext);

    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext<SidebarStateIF>(SidebarContext);

    const candleTime: candleTimeIF = chartSettings.candleTime.global;

    const dataLoadingStatus =
        useContext<DataLoadingContextIF>(DataLoadingContext);
    const {
        transactionsByUser,
        userTransactionsByPool,
        transactionsByPool,
        unindexedNonFailedSessionTransactionHashes,
    } = useContext<GraphDataContextIF>(GraphDataContext);
    const { transactionsByType } = useContext<ReceiptContextIF>(ReceiptContext);
    const { baseToken, quoteToken } =
        useContext<TradeDataContextIF>(TradeDataContext);

    const selectedBaseAddress: string = baseToken.address;
    const selectedQuoteAddress: string = quoteToken.address;
    const quoteTokenSymbol: string = quoteToken?.symbol;
    const baseTokenSymbol: string = baseToken?.symbol;

    const [candleTransactionData, setCandleTransactionData] = useState<
        TransactionIF[]
    >([]);

    // ref holding scrollable element (to attach event listener)
    const scrollRef = useRef<HTMLDivElement>(null);

    const [pagesVisible, setPagesVisible] = useState<[number, number]>([0, 1]);
    const [extraPagesAvailable, setExtraPagesAvailable] = useState<number>(0);
    const [moreDataAvailable, setMoreDataAvailable] = useState<boolean>(true);
    const [moreDataLoading, setMoreDataLoading] = useState<boolean>(false);

    const moreDataLoadingRef = useRef<boolean>();
    moreDataLoadingRef.current = moreDataLoading;

    const extraPagesAvailableRef = useRef<number>();
    extraPagesAvailableRef.current = extraPagesAvailable;

    const moreDataAvailableRef = useRef<boolean>();
    moreDataAvailableRef.current = moreDataAvailable;

    const pagesVisibleRef = useRef<[number, number]>();
    pagesVisibleRef.current = pagesVisible;

    const lastRowRef = useRef<HTMLDivElement | null>(null);
    const firstRowRef = useRef<HTMLDivElement | null>(null);

    const showAllData = !isAccountView && showAllDataSelection;

    const [fetchedTransactions, setFetchedTransactions] = useState<Changes>({
        dataReceived: false,
        changes: [...transactionsByPool.changes],
    });
    // const fetchedTransactionsRef = useRef<Changes>();
    // fetchedTransactionsRef.current = fetchedTransactions;

    useEffect(() => {
        // clear fetched transactions when switching pools
        if (transactionsByPool.changes.length === 0) {
            setFetchedTransactions({
                dataReceived: true,
                changes: [],
            });
        }
    }, [transactionsByPool.changes]);

    const transactionData = useMemo<TransactionIF[]>(
        () =>
            isAccountView
                ? activeAccountTransactionData || []
                : !showAllData
                  ? userTransactionsByPool.changes
                  : fetchedTransactions.changes,
        [
            activeAccountTransactionData,
            userTransactionsByPool,
            transactionsByPool,
            showAllData,
            fetchedTransactions,
        ],
    );

    const [lastSeenTxID, setLastSeenTxID] = useState<string>('');
    const lastSeenTxIDRef = useRef<string>();
    lastSeenTxIDRef.current = lastSeenTxID;

    const [firstSeenTxID, setFirstSeenTxID] = useState<string>('');
    const firstSeenTxIDRef = useRef<string>();
    firstSeenTxIDRef.current = firstSeenTxID;

    const [autoScroll, setAutoScroll] = useState(false);
    const autoScrollRef = useRef<boolean>();
    autoScrollRef.current = autoScroll;

    const [autoScrollDirection, setAutoScrollDirection] = useState(
        ScrollDirection.DOWN,
    );
    const autoScrollDirectionRef = useRef<ScrollDirection>();
    autoScrollDirectionRef.current = autoScrollDirection;

    useEffect(() => {
        const existingChanges = new Set(
            fetchedTransactions.changes.map(
                (change) => change.txHash || change.txId,
            ),
        ); // Adjust if using a different unique identifier

        const uniqueChanges = transactionsByPool.changes.filter(
            (change) => !existingChanges.has(change.txHash || change.txId),
        );

        if (uniqueChanges.length > 0) {
            setFetchedTransactions((prev) => {
                return {
                    dataReceived: true,
                    changes: [...uniqueChanges, ...prev.changes],
                };
            });
        }
    }, [transactionsByPool]);

    const oldestTxTime = useMemo(
        () =>
            transactionData.length > 0
                ? transactionData.reduce((min, transaction) => {
                      return transaction.txTime < min
                          ? transaction.txTime
                          : min;
                  }, transactionData[0].txTime)
                : 0,
        [transactionData],
    );

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
            dataLoadingStatus.setDataLoadingStatus({
                datasetName: 'isCandleDataLoading',
                loadingStatus: true,
            });
        }
    }, [isCandleSelected]);

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
            unindexedNonFailedSessionTransactionHashes.includes(tx.txHash) &&
            tx.txDetails?.baseAddress.toLowerCase() ===
                baseToken.address.toLowerCase() &&
            tx.txDetails?.quoteAddress.toLowerCase() ===
                quoteToken.address.toLowerCase() &&
            tx.txDetails?.poolIdx === poolIndex,
    );

    // TODO: Use these as media width constants
    const isSmallScreen: boolean = useMediaQuery('(max-width: 800px)');
    const isLargeScreen: boolean = useMediaQuery('(min-width: 1600px)');

    const tableView: 'small' | 'medium' | 'large' =
        isSmallScreen ||
        (isAccountView &&
            !isLargeScreen &&
            isSidebarOpen &&
            fullLayoutActive === false)
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
            n: 100,
            period: candleTime.time,
            time: filter?.time,
            crocEnv: crocEnv,
            graphCacheUrl: activeNetwork.graphCacheUrl,
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

    const walID: JSX.Element = (
        <>
            <p>ID</p>
            Wallet
        </>
    );
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
            name: 'ID',
            show: tableView === 'large',
            slug: 'id',
            sortable: false,
        },
        {
            name: 'Wallet',
            show: tableView === 'large' && !isAccountView,
            slug: 'wallet',
            sortable: true,
        },
        {
            name: walID,
            show: tableView !== 'large',
            slug: 'walletid',
            sortable: !isAccountView,
            alignCenter: false,
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

    const txDataToDisplay: TransactionIF[] = isCandleSelected
        ? candleTransactionData
        : transactionData;

    const [
        sortBy,
        setSortBy,
        reverseSort,
        setReverseSort,
        sortedTransactions,
        sortData,
    ] = useSortedTxs('time', txDataToDisplay);

    const sortedTxDataToDisplay = useMemo<TransactionIF[]>(() => {
        return isCandleSelected || isAccountView
            ? sortedTransactions
            : sortedTransactions.slice(
                  pagesVisible[0] * 50,
                  pagesVisible[1] * 50 + 50,
              );
    }, [sortedTransactions, pagesVisible, isCandleSelected, isAccountView]);

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

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const moreDataLoadingVal = moreDataLoadingRef.current
                    ? moreDataLoadingRef.current
                    : moreDataLoading;
                const moreDataAvailableVal = moreDataAvailableRef.current
                    ? moreDataAvailableRef.current
                    : moreDataAvailable;
                const extraPagesAvailableVal = extraPagesAvailableRef.current
                    ? extraPagesAvailableRef.current
                    : extraPagesAvailable;
                const pagesVisibleVal = pagesVisibleRef.current
                    ? pagesVisibleRef.current
                    : pagesVisible;

                const entry = entries[0];
                if (moreDataLoadingVal) return;
                if (entry.isIntersecting) {
                    bindLastSeenRow();
                    setTransactionTableOpacity('.5');
                    // last row is visible
                    extraPagesAvailableVal + 1 > pagesVisibleVal[1]
                        ? shiftDown()
                        : moreDataAvailableVal
                          ? addMoreData()
                          : undefined;
                }
            },
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
            },
        );

        const currentElement = lastRowRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [
        lastRowRef.current,
        moreDataLoading,
        moreDataAvailable,
        extraPagesAvailable,
        // pagesVisible[1],
    ]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (moreDataLoading) return;
                if (entry.isIntersecting) {
                    // first row is visible
                    pagesVisible[0] > 0 && shiftUp();
                    bindFirstSeenRow();
                }
            },
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
            },
        );

        const currentElement = firstRowRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [firstRowRef.current, moreDataLoading, pagesVisible[0]]);

    useEffect(() => {
        setPagesVisible([0, 1]);
        setExtraPagesAvailable(0);
        setMoreDataAvailable(true);
        setMoreDataLoading(false);
    }, [selectedBaseAddress + selectedQuoteAddress]);

    const scrollToTop = () => {
        setPagesVisible([0, 1]);

        if (scrollRef.current) {
            // scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' }); // For smooth scrolling
            scrollRef.current.scrollTo({
                top: 0,
                behavior: 'instant' as ScrollBehavior,
            });
        }
    };

    const triggerAutoScroll = (
        direction: ScrollDirection,
        timeout?: number,
    ) => {
        setTransactionTableOpacity('1');
        setAutoScroll(true);
        setAutoScrollDirection(direction);
        setTimeout(
            () => {
                setAutoScroll(false);
            },
            timeout ? timeout : 2000,
        );
    };

    const setTransactionTableOpacity = (val: string) => {
        if (scrollRef.current) {
            scrollRef.current.style.opacity = val;
        }
    };

    const shiftUp = (): void => {
        setPagesVisible((prev) => [prev[0] - 1, prev[1] - 1]);
        triggerAutoScroll(ScrollDirection.UP);
    };

    const shiftDown = (): void => {
        setPagesVisible((prev) => [prev[0] + 1, prev[1] + 1]);
        triggerAutoScroll(ScrollDirection.DOWN);
    };

    useEffect(() => {
        domDebug('sortBy', sortBy);
        scrollToTop();
    }, [sortBy, showAllData]);

    const markRows = false;

    const scrollByTxID = (txID: string, pos: ScrollPosition): void => {
        const txSpans = document.querySelectorAll(
            '#current_row_scroll > div > div:nth-child(2) > div > span',
        );

        txSpans.forEach((span) => {
            if (span.textContent === txID) {
                const row = span.parentElement?.parentElement as HTMLDivElement;
                // row.style.backgroundColor = 'red';

                const parent = row.parentElement as HTMLDivElement;
                if (markRows) {
                    parent.style.background = 'blue';
                }

                parent.scrollIntoView({
                    block: pos === ScrollPosition.BOTTOM ? 'end' : 'start',
                    behavior: 'instant' as ScrollBehavior,
                });
            }
        });
    };

    const bindFirstSeenRow = (): void => {
        const rows = document.querySelectorAll('#current_row_scroll > div');
        if (rows.length > 0) {
            const firstRow = rows[0] as HTMLDivElement;
            if (markRows) {
                firstRow.style.backgroundColor = 'cyan';
            }

            const txDiv = firstRow.querySelector('div:nth-child(2)');
            if (txDiv) {
                const txText = txDiv.querySelector('span')?.textContent;
                setFirstSeenTxID(txText || '');
                domDebug('firstSeenTxID', txText);
            }
        }
    };

    const bindLastSeenRow = (): void => {
        const rows = document.querySelectorAll('#current_row_scroll > div');
        if (rows.length > 0) {
            // const lastRow = rows[rows.length - 1] as HTMLDivElement;
            rows.forEach((row) => {
                (row as HTMLDivElement).style.backgroundColor = 'transparent';
            });
            const lastRow = rows[rows.length - 1] as HTMLDivElement;
            if (markRows) {
                lastRow.style.backgroundColor = 'blue';
            }

            const txDiv = lastRow.querySelector('div:nth-child(2)');
            if (txDiv) {
                const txText = txDiv.querySelector('span')?.textContent;
                setLastSeenTxID(txText || '');
                domDebug('lastSeenTxID', txText);
            }
        }
    };

    const autoScrollAlternateSolutionActive = true;

    const addMoreData = (): void => {
        if (!crocEnv || !provider) return;
        // retrieve pool recent changes
        setMoreDataLoading(true);
        fetchPoolRecentChanges({
            tokenList: tokens.tokenUniv,
            base: selectedBaseAddress,
            quote: selectedQuoteAddress,
            poolIdx: poolIndex,
            chainId: chainId,
            n: 50,
            timeBefore: oldestTxTime,
            crocEnv: crocEnv,
            graphCacheUrl: activeNetwork.graphCacheUrl,
            provider: provider,
            cachedFetchTokenPrice: cachedFetchTokenPrice,
            cachedQuerySpotPrice: cachedQuerySpotPrice,
            cachedTokenDetails: cachedTokenDetails,
            cachedEnsResolve: cachedEnsResolve,
        })
            .then((poolChangesJsonData) => {
                if (poolChangesJsonData && poolChangesJsonData.length > 0) {
                    // setTransactionsByPool((prev) => {
                    setFetchedTransactions((prev) => {
                        const existingChanges = new Set(
                            prev.changes.map(
                                (change) => change.txHash || change.txId,
                            ),
                        ); // Adjust if using a different unique identifier
                        const uniqueChanges = poolChangesJsonData.filter(
                            (change) =>
                                !existingChanges.has(
                                    change.txHash || change.txId,
                                ),
                        );
                        if (uniqueChanges.length > 0) {
                            setExtraPagesAvailable((prev) => prev + 1);
                            setPagesVisible((prev) => [
                                prev[0] + 1,
                                prev[1] + 1,
                            ]);

                            triggerAutoScroll(ScrollDirection.DOWN);
                        } else {
                            setMoreDataAvailable(false);
                        }
                        let newTxData = [];
                        if (autoScrollAlternateSolutionActive) {
                            newTxData = sortData([
                                ...prev.changes,
                                ...uniqueChanges,
                            ]);
                        } else {
                            newTxData = [...prev.changes, ...uniqueChanges];
                        }
                        return {
                            dataReceived: true,
                            changes: newTxData,
                        };
                    });
                } else {
                    setMoreDataAvailable(false);
                }
            })
            .then(() => setMoreDataLoading(false))
            .catch(console.error);
    };

    const logData = () => {
        domDebug('sortedTxDataDisp', sortedTxDataToDisplay.length);
        // if(sortedTxDataToDisplay.length > 0){
        //     domDebug('sortedTxDataDisp LAST', sortedTxDataToDisplay[sortedTxDataToDisplay.length - 1].txHash);
        // }
        // if(sortedTxDataToDisplay.length > 0){
        //     domDebug('sortedTxDataDisp FIRST', sortedTxDataToDisplay[0].txHash);
        // }
        domDebug('sortedTransactions', sortedTransactions.length);
        domDebug('pagesVisible', pagesVisible[0] + ' ' + pagesVisible[1]);
        // if(sortedTransactions.length > 0){
        //     domDebug('sortedTransactions LAST ', sortedTransactions[sortedTransactions.length - 1].txHash);
        // }
        // if(sortedTransactions.length > 0){
        //     domDebug('sortedTransactions FIRST ', sortedTransactions[0].txHash);
        // }
    };

    // const disableAutoScroll = true;

    useEffect(() => {
        logData();
        // if(disableAutoScroll) return;
        if (autoScroll) {
            if (sortBy === 'time' || !autoScrollAlternateSolutionActive) {
                if (autoScrollDirection === ScrollDirection.DOWN) {
                    scrollByTxID(
                        lastSeenTxIDRef.current || '',
                        ScrollPosition.BOTTOM,
                    );
                } else if (autoScrollDirection === ScrollDirection.UP) {
                    scrollByTxID(
                        firstSeenTxIDRef.current || '',
                        ScrollPosition.TOP,
                    );
                }
            } else {
                scrollWithAlternateStrategy();
            }
        }
    }, [sortedTxDataToDisplay]);

    const scrollWithAlternateStrategy = () => {
        if (autoScrollDirection === ScrollDirection.DOWN && scrollRef.current) {
            scrollRef.current.scrollTo({
                top: 1912,
                behavior: 'instant' as ScrollBehavior,
            });
        } else if (
            autoScrollDirection === ScrollDirection.UP &&
            scrollRef.current
        ) {
            scrollRef.current.scrollTo({
                top: 1850,
                behavior: 'instant' as ScrollBehavior,
            });
        }
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
                            ? { maxHeight: 'calc(100svh - 310px)' }
                            : { height: 'calc(100svh - 330px)' }
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
                <TableRows
                    type='Transaction'
                    data={sortedTxDataToDisplay}
                    fullData={sortedTransactions}
                    tableView={tableView}
                    isAccountView={isAccountView}
                    firstRowRef={firstRowRef}
                    lastRowRef={lastRowRef}
                />
            </ul>
        </div>
    );

    return (
        <FlexContainer
            flexDirection='column'
            style={{
                height: isSmallScreen ? '95%' : '100%',
                position: 'relative',
            }}
        >
            <div>{headerColumnsDisplay}</div>
            {showAllData && !isCandleSelected && pagesVisible[0] > 0 && (
                <ScrollToTopButton
                    onClick={() => {
                        scrollToTop();
                    }}
                    className='scroll_to_top_button'
                >
                    Return to Top
                </ScrollToTopButton>
            )}
            <div
                ref={scrollRef}
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
