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

import { Pagination } from '@mui/material';
import TransactionHeader from './TransactionsTable/TransactionHeader';
import { useSortedTxs } from '../useSortedTxs';
import NoTableData from '../NoTableData/NoTableData';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import usePagination from '../../../Global/Pagination/usePagination';
import { RowsPerPageDropdown } from '../../../Global/Pagination/RowsPerPageDropdown';
import Spinner from '../../../Global/Spinner/Spinner';
import { CandleContext } from '../../../../contexts/CandleContext';
import { ChartContext } from '../../../../contexts/ChartContext';
import { fetchPoolRecentChanges } from '../../../../ambient-utils/api';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { TokenContext } from '../../../../contexts/TokenContext';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import { IS_LOCAL_ENV } from '../../../../ambient-utils/constants';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { TransactionRowPlaceholder } from './TransactionsTable/TransactionRowPlaceholder';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import {
    TransactionRow as TransactionRowStyled,
    ViewMoreButton,
} from '../../../../styled/Components/TransactionTable';
import { FlexContainer, Text } from '../../../../styled/Common';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
import { DataLoadingContext } from '../../../../contexts/DataLoadingContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import TableRows from '../TableRows';

interface propsIF {
    filter?: CandleDataIF | undefined;
    activeAccountTransactionData?: TransactionIF[];
    connectedAccountActive?: boolean;
    isAccountView: boolean; // when viewing from /account: fullscreen and not paginated
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
    } = useContext(AppStateContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { isCandleSelected } = useContext(CandleContext);
    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const { chartSettings, tradeTableState } = useContext(ChartContext);
    const {
        crocEnv,
        activeNetwork,
        provider,
        chainData: { chainId, poolIndex },
    } = useContext(CrocEnvContext);
    const { showAllData: showAllDataSelection, toggleTradeTable } =
        useContext(TradeTableContext);
    const { setOutsideControl } = useContext(TradeTableContext);
    const { tokens } = useContext(TokenContext);

    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);

    const candleTime = chartSettings.candleTime.global;

    // only show all data and expand when on trade tab page
    const showAllData = !isAccountView && showAllDataSelection;
    const isTradeTableExpanded =
        !isAccountView && tradeTableState === 'Expanded';

    const NUM_TRANSACTIONS_WHEN_COLLAPSED = isAccountView ? 13 : 10; // Number of transactions we show when the table is collapsed (i.e. half page)
    // NOTE: this is done to improve rendering speed for this page.

    const dataLoadingStatus = useContext(DataLoadingContext);
    const {
        userTransactionsByPool,
        transactionsByPool,
        unindexedNonFailedSessionTransactionHashes,
    } = useContext(GraphDataContext);
    const { transactionsByType } = useContext(ReceiptContext);
    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const selectedBaseAddress = baseToken.address;
    const selectedQuoteAddress = quoteToken.address;
    const quoteTokenSymbol = quoteToken?.symbol;
    const baseTokenSymbol = baseToken?.symbol;

    const [candleTransactionData, setCandleTransactionData] = useState<
        TransactionIF[]
    >([]);

    const transactionData = useMemo(
        () =>
            isAccountView
                ? activeAccountTransactionData || []
                : !showAllData
                ? userTransactionsByPool.changes.filter(
                      (tx) =>
                          tx.changeType !== 'fill' && tx.changeType !== 'cross',
                  )
                : transactionsByPool.changes.filter(
                      (tx) =>
                          tx.changeType !== 'fill' && tx.changeType !== 'cross',
                  ),
        [
            showAllData,
            activeAccountTransactionData,
            userTransactionsByPool,
            transactionsByPool,
        ],
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

    const isLoading = useMemo(
        () =>
            isCandleSelected
                ? dataLoadingStatus.isCandleDataLoading
                : isAccountView && connectedAccountActive
                ? dataLoadingStatus.isConnectedUserTxDataLoading
                : isAccountView
                ? dataLoadingStatus.isLookupUserTxDataLoading
                : !showAllData
                ? dataLoadingStatus.isConnectedUserPoolTxDataLoading
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
    const isSmallScreen = useMediaQuery('(max-width: 800px)');
    const isLargeScreen = useMediaQuery('(min-width: 1600px)');

    const tableView =
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

    const getCandleData = () =>
        crocEnv &&
        provider &&
        fetchPoolRecentChanges({
            tokenList: tokens.tokenUniv,
            base: selectedBaseAddress,
            quote: selectedQuoteAddress,
            poolIdx: poolIndex,
            chainId: chainId,
            annotate: true,
            addValue: true,
            simpleCalc: true,
            annotateMEV: false,
            ensResolution: true,
            n: 80,
            period: candleTime.time,
            time: filter?.time,
            crocEnv: crocEnv,
            graphCacheUrl: activeNetwork.graphCacheUrl,
            provider,
            lastBlockNumber,
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

    // Changed this to have the sort icon be inline with the last row rather than under it
    const walID = (
        <>
            <p>ID</p>
            Wallet
        </>
    );
    const sideType = (
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

    const txDataToDisplay = isCandleSelected
        ? candleTransactionData
        : transactionData;

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedTransactions] =
        useSortedTxs('time', txDataToDisplay);

    const headerColumnsDisplay = (
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

    const [page, setPage] = useState(1);
    const resetPageToFirst = () => setPage(1);

    const isScreenShort =
        (isAccountView && useMediaQuery('(max-height: 900px)')) ||
        (!isAccountView && useMediaQuery('(max-height: 700px)'));

    const isScreenTall =
        (isAccountView && useMediaQuery('(min-height: 1100px)')) ||
        (!isAccountView && useMediaQuery('(min-height: 1000px)'));

    const _DATA = usePagination(
        sortedTransactions,
        isScreenShort,
        isScreenTall,
    );

    const {
        showingFrom,
        showingTo,
        totalItems,
        setCurrentPage,
        rowsPerPage,
        changeRowsPerPage,
        count,
        fullData,
    } = _DATA;
    const handleChange = (e: React.ChangeEvent<unknown>, p: number) => {
        setPage(p);
        _DATA.jump(p);
    };

    const handleChangeRowsPerPage = (
        event:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | React.ChangeEvent<HTMLSelectElement>,
    ) => {
        changeRowsPerPage(parseInt(event.target.value, 10));
    };

    const tradePageCheck = isTradeTableExpanded && txDataToDisplay.length > 30;

    const listRef = useRef<HTMLUListElement>(null);
    const sPagination = useMediaQuery('(max-width: 800px)');
    const footerDisplay = rowsPerPage > 0 &&
        ((isAccountView && txDataToDisplay.length > 10) ||
            (!isAccountView && tradePageCheck)) && (
            <FlexContainer
                alignItems='center'
                justifyContent='center'
                gap={isSmallScreen ? 4 : 8}
                margin={isSmallScreen ? 'auto' : '16px auto'}
                background='dark1'
                flexDirection={isSmallScreen ? 'column' : 'row'}
            >
                <RowsPerPageDropdown
                    rowsPerPage={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                    itemCount={sortedTransactions.length}
                    setCurrentPage={setCurrentPage}
                    resetPageToFirst={resetPageToFirst}
                />
                <Pagination
                    count={count}
                    page={page}
                    shape='circular'
                    color='secondary'
                    onChange={handleChange}
                    showFirstButton
                    showLastButton
                    size={sPagination ? 'small' : 'medium'}
                />
                {!isSmallScreen && (
                    <Text
                        fontSize='mini'
                        color='text2'
                        style={{ whiteSpace: 'nowrap' }}
                    >{` ${showingFrom} - ${showingTo} of ${totalItems}`}</Text>
                )}
            </FlexContainer>
        );

    const handleKeyDownViewTransaction = (
        event: React.KeyboardEvent<HTMLUListElement | HTMLDivElement>,
    ) => {
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

    const showViewMoreButton =
        !isTradeTableExpanded &&
        !isAccountView &&
        sortedTransactions.length > NUM_TRANSACTIONS_WHEN_COLLAPSED;

    const shouldDisplayNoTableData =
        !isLoading &&
        !txDataToDisplay.length &&
        unindexedNonFailedSessionTransactionHashes.length === 0;

    const transactionDataOrNull = shouldDisplayNoTableData ? (
        <NoTableData
            setSelectedDate={setSelectedDate}
            type='transactions'
            isAccountView={isAccountView}
        />
    ) : (
        <div onKeyDown={handleKeyDownViewTransaction}>
            <ul ref={listRef} id='current_row_scroll'>
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
                    data={_DATA.currentData}
                    fullData={fullData}
                    tableView={tableView}
                    isAccountView={isAccountView}
                />
            </ul>
            {showViewMoreButton && (
                <FlexContainer
                    justifyContent='center'
                    alignItems='center'
                    padding='8px'
                >
                    <ViewMoreButton onClick={() => toggleTradeTable()}>
                        View More
                    </ViewMoreButton>
                </FlexContainer>
            )}
            {/* Show a 'View More' button at the end of the table when collapsed (half-page) and it's not a /account render */}
        </div>
    );

    useEffect(() => {
        if (_DATA.currentData.length && !isTradeTableExpanded) {
            setCurrentPage(1);
            const mockEvent = {} as React.ChangeEvent<unknown>;
            handleChange(mockEvent, 1);
        }
    }, [isTradeTableExpanded]);

    return (
        <FlexContainer flexDirection='column' fullHeight={!isSmallScreen}>
            <div>{headerColumnsDisplay}</div>

            <div style={{ flex: 1, overflow: 'auto' }}>
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

            {footerDisplay}
        </FlexContainer>
    );
}

export default memo(Transactions);
