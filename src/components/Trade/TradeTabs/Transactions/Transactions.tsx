/* eslint-disable no-irregular-whitespace */
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { TransactionIF } from '../../../../utils/interfaces/exports';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { Dispatch, useState, useEffect, useRef, useContext, memo } from 'react';

import { Pagination } from '@mui/material';
import TransactionHeader from './TransactionsTable/TransactionHeader';
import TransactionRow from './TransactionsTable/TransactionRow';
import { useSortedTxs } from '../useSortedTxs';
import NoTableData from '../NoTableData/NoTableData';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import usePagination from '../../../Global/Pagination/usePagination';
import { RowsPerPageDropdown } from '../../../Global/Pagination/RowsPerPageDropdown';
import Spinner from '../../../Global/Spinner/Spinner';
import { CandleContext } from '../../../../contexts/CandleContext';
import { ChartContext } from '../../../../contexts/ChartContext';
import { CandleData } from '../../../../App/functions/fetchCandleSeries';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { fetchPoolRecentChanges } from '../../../../App/functions/fetchPoolRecentChanges';
import { TokenContext } from '../../../../contexts/TokenContext';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import { IS_LOCAL_ENV } from '../../../../constants';
import useDebounce from '../../../../App/hooks/useDebounce';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { TransactionRowPlaceholder } from './TransactionsTable/TransactionRowPlaceholder';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import {
    TransactionRow as TransactionRowStyled,
    ViewMoreButton,
} from '../../../../styled/Components/TransactionTable';
import { FlexContainer, Text } from '../../../../styled/Common';

interface propsIF {
    filter?: CandleData | undefined;
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

    const graphData = useAppSelector((state) => state?.graphData);
    const tradeData = useAppSelector((state) => state.tradeData);
    const { transactionsByType, pendingTransactions } = useAppSelector(
        (state) => state.receiptData,
    );

    const selectedBase = tradeData.baseToken.address;
    const selectedQuote = tradeData.quoteToken.address;

    const [transactionData, setTransactionData] = useState<TransactionIF[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const lastBlockNumWait = useDebounce(lastBlockNumber, 2000);

    useEffect(() => {
        // handled in useEffect below
        if (isCandleSelected) return;
        if (isAccountView)
            setTransactionData(activeAccountTransactionData || []);
        else if (!showAllData)
            setTransactionData(
                graphData?.changesByUser?.changes.filter(
                    (tx) =>
                        tx.base.toLowerCase() ===
                            tradeData.baseToken.address.toLowerCase() &&
                        tx.quote.toLowerCase() ===
                            tradeData.quoteToken.address.toLowerCase() &&
                        tx.changeType !== 'fill' &&
                        tx.changeType !== 'cross',
                ),
            );
        else {
            setTransactionData(
                graphData?.changesByPool?.changes.filter(
                    (tx) =>
                        tx.base.toLowerCase() ===
                            tradeData.baseToken.address.toLowerCase() &&
                        tx.quote.toLowerCase() ===
                            tradeData.quoteToken.address.toLowerCase() &&
                        tx.changeType !== 'fill' &&
                        tx.changeType !== 'cross',
                ),
            );
        }
    }, [
        showAllData,
        isCandleSelected,
        activeAccountTransactionData,
        graphData?.changesByUser,
        graphData?.changesByPool,
    ]);

    useEffect(() => {
        if (!isCandleSelected) setIsLoading(true);
    }, [isCandleSelected]);

    useEffect(() => {
        if (isAccountView && connectedAccountActive)
            setIsLoading(
                graphData?.dataLoadingStatus.isConnectedUserTxDataLoading,
            );
        else if (isAccountView)
            setIsLoading(
                graphData?.dataLoadingStatus.isLookupUserTxDataLoading,
            );
        else if (isCandleSelected) {
            setIsLoading(graphData?.dataLoadingStatus.isCandleDataLoading);
        } else if (!showAllData)
            setIsLoading(
                graphData?.dataLoadingStatus.isConnectedUserTxDataLoading,
            );
        else setIsLoading(graphData?.dataLoadingStatus.isPoolTxDataLoading);
    }, [
        isCandleSelected,
        showAllData,
        connectedAccountActive,
        graphData?.dataLoadingStatus.isConnectedUserTxDataLoading,
        graphData?.dataLoadingStatus.isLookupUserTxDataLoading,
        graphData?.dataLoadingStatus.isPoolTxDataLoading,
        graphData?.dataLoadingStatus.isCandleDataLoading,
    ]);

    const relevantTransactionsByType = transactionsByType.filter(
        (tx) =>
            tx.txAction &&
            pendingTransactions.includes(tx.txHash) &&
            tx.txDetails?.baseAddress.toLowerCase() ===
                tradeData.baseToken.address.toLowerCase() &&
            tx.txDetails?.quoteAddress.toLowerCase() ===
                tradeData.quoteToken.address.toLowerCase() &&
            tx.txDetails?.poolIdx === poolIndex,
    );

    const shouldDisplayNoTableData =
        !isLoading &&
        !transactionData.length &&
        (relevantTransactionsByType.length === 0 ||
            pendingTransactions.length === 0);

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedTransactions] =
        useSortedTxs('time', transactionData);

    // TODO: Use these as media width constants
    const isSmallScreen = useMediaQuery('(max-width: 600px)');
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
        fetchPoolRecentChanges({
            tokenList: tokens.tokenUniv,
            base: selectedBase,
            quote: selectedQuote,
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
                    setTransactionData(selectedCandleChangesWithoutFills);
                }
                setOutsideControl(true);
                setSelectedInsideTab && setSelectedInsideTab(0);
                setIsLoading(false);
            })
            .catch(console.error);

    // update candle transactions on fresh load
    useEffect(() => {
        if (
            isServerEnabled &&
            isCandleSelected &&
            candleTime.time &&
            filter?.time &&
            crocEnv
        ) {
            setIsLoading(true);
            getCandleData();
        }
    }, [isServerEnabled, isCandleSelected, filter?.time, candleTime.time]);

    // update candle transactions on last block num change
    useEffect(() => {
        if (isCandleSelected) getCandleData();
    }, [lastBlockNumWait]);

    const quoteTokenSymbol = tradeData.quoteToken?.symbol;
    const baseTokenSymbol = tradeData.baseToken?.symbol;

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

    const headerColumns = [
        {
            name: 'Timestamp',
            className: '',
            show: tableView === 'large',

            slug: 'time',
            sortable: true,
        },
        {
            name: 'Pair',
            className: '',
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
            name: isAccountView ? <></> : `${baseTokenSymbol}ㅤㅤ`,
            show: tableView === 'large',
            slug: baseTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: isAccountView ? <></> : `${quoteTokenSymbol}ㅤㅤ`, // invisible character added to offset token logo
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
            show: true,
            slug: 'menu',
            sortable: false,
        },
    ];

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
    const tradePageCheck = isTradeTableExpanded && transactionData.length > 30;

    const listRef = useRef<HTMLUListElement>(null);
    const sPagination = useMediaQuery('(max-width: 800px)');
    const footerDisplay = rowsPerPage > 0 &&
        ((isAccountView && transactionData.length > 10) ||
            (!isAccountView && tradePageCheck)) && (
            <FlexContainer
                alignItems='center'
                justifyContent='center'
                gap={isSmallScreen ? 4 : 8}
                margin='16px auto'
                background='dark1'
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

    const currentRowItemContent = _DATA.currentData.map((tx, idx) => (
        <TransactionRow
            key={idx}
            tx={tx}
            tableView={tableView}
            isAccountView={isAccountView}
        />
    ));
    const sortedRowItemContent = sortedTransactions.map((tx, idx) => (
        <TransactionRow
            key={idx}
            tx={tx}
            tableView={tableView}
            isAccountView={isAccountView}
        />
    ));
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
        sortedRowItemContent.length > NUM_TRANSACTIONS_WHEN_COLLAPSED;

    const transactionDataOrNull = shouldDisplayNoTableData ? (
        <NoTableData
            setSelectedDate={setSelectedDate}
            type='transactions'
            isAccountView={isAccountView}
        />
    ) : (
        <FlexContainer
            flexDirection='column'
            onKeyDown={handleKeyDownViewTransaction}
        >
            <ul ref={listRef} id='current_row_scroll'>
                {!isAccountView &&
                    pendingTransactions.length > 0 &&
                    relevantTransactionsByType.reverse().map((tx, idx) => {
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
                                            lowTick: tx.txDetails?.lowTick,
                                            highTick: tx.txDetails?.highTick,
                                            gridSize: tx.txDetails?.gridSize,
                                        },
                                    }}
                                    tableView={tableView}
                                />
                            </>
                        );
                    })}
                {currentRowItemContent}
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
        </FlexContainer>
    );

    useEffect(() => {
        if (_DATA.currentData.length && !isTradeTableExpanded) {
            setCurrentPage(1);
            const mockEvent = {} as React.ChangeEvent<unknown>;
            handleChange(mockEvent, 1);
        }
    }, [isTradeTableExpanded]);

    return (
        <FlexContainer flexDirection='column' fullHeight>
            <div>{headerColumnsDisplay}</div>

            <div style={{ flex: 1, overflow: 'auto' }}>
                {isLoading ? (
                    <Spinner size={100} bg='var(--dark1)' centered />
                ) : (
                    transactionDataOrNull
                )}
            </div>

            {footerDisplay}
        </FlexContainer>
    );
}

export default memo(Transactions);
