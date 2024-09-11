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
import { TransactionRow as TransactionRowStyled } from '../../../../styled/Components/TransactionTable';
import { FlexContainer } from '../../../../styled/Common';
import {
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

interface propsIF {
    filter?: CandleDataIF | undefined;
    activeAccountTransactionData?: TransactionIF[];
    connectedAccountActive?: boolean;
    isAccountView: boolean;
    setSelectedDate?: Dispatch<number | undefined>;
    setSelectedInsideTab?: Dispatch<number>;
    fullLayoutActive?: boolean;
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

    const showAllData = !isAccountView && showAllDataSelection;

    const transactionData = useMemo<TransactionIF[]>(
        () =>
            isAccountView
                ? activeAccountTransactionData || []
                : !showAllData
                  ? userTransactionsByPool.changes
                  : transactionsByPool.changes,
        [
            activeAccountTransactionData,
            userTransactionsByPool,
            transactionsByPool,
            showAllData,
        ],
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
    const isSmallScreen: boolean = useMediaQuery('(max-width: 768px)');
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
            n: 80,
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

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedTransactions] =
        useSortedTxs('time', txDataToDisplay);

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

    const shouldDisplayNoTableData: boolean =
        !isLoading &&
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
        <div onKeyDown={handleKeyDownViewTransaction} style={{ height: '100%'}}>
        <ul
        ref={listRef}
        // id='current_row_scroll'
        style={{height: '100%'}}
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
            data={sortedTransactions.filter(
                (tx) => tx.changeType !== 'cross',
            )}
            fullData={sortedTransactions}
            tableView={tableView}
            isAccountView={isAccountView}
        />
                </ul>
                </div>
       
    );




    



    if (isSmallScreen) return (
        <div style={{  overflow: 'scroll', height:  '100%'}}>
            <div style={{position: 'sticky', top: 0, background: 'var(--dark2', zIndex: '1'}}>
            {headerColumnsDisplay}

            </div>
            <div style={{overflowY: 'scroll', height: '100%'}}>
                
            {transactionDataOrNull}   
</div>
        </div>
    )

    return (
        <FlexContainer
            flexDirection='column'
            style={{ height: '100%' }}
        >
            <div>{headerColumnsDisplay}</div>

            <div
                style={{ flex: 1, overflow: 'auto' }}
                className='custom_scroll_ambient'
            >
                {(
                    isCandleSelected
                        ? dataLoadingStatus.isCandleDataLoading
                        : isLoading
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
