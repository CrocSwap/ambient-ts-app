/* eslint-disable no-irregular-whitespace */
import styles from './Transactions.module.css';
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

interface propsIF {
    filter?: CandleData | undefined;
    activeAccountTransactionData?: TransactionIF[];
    connectedAccountActive?: boolean;
    isAccountView: boolean; // when viewing from /account: fullscreen and not paginated
    setSelectedDate?: Dispatch<number | undefined>;
    setSelectedInsideTab?: Dispatch<number>;
}
function Transactions(props: propsIF) {
    const {
        filter,
        activeAccountTransactionData,
        connectedAccountActive,
        setSelectedDate,
        setSelectedInsideTab,
        isAccountView,
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
        showAllData,
        connectedAccountActive,
        graphData?.dataLoadingStatus.isConnectedUserTxDataLoading,
        graphData?.dataLoadingStatus.isLookupUserTxDataLoading,
        graphData?.dataLoadingStatus.isPoolTxDataLoading,
        graphData?.dataLoadingStatus.isCandleDataLoading,
    ]);

    const shouldDisplayNoTableData = !isLoading && !transactionData.length;

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedTransactions] =
        useSortedTxs('time', transactionData);

    const ipadView = useMediaQuery('(max-width: 600px)');
    const showTimestamp = useMediaQuery('(min-width: 1200px)');

    const showColumns = useMediaQuery('(max-width: 1599px)');

    // const showColumns = false;

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
                            if (tx.changeType !== 'fill') {
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
            show: showTimestamp,

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

            show: !showColumns,
            slug: 'id',
            sortable: false,
        },
        {
            name: 'Wallet',
            show: !showColumns && !isAccountView,
            slug: 'wallet',
            sortable: true,
        },
        {
            name: walID,
            show: showColumns,
            slug: 'walletid',
            sortable: !isAccountView,
            alignCenter: false,
        },
        {
            name: 'Price',
            show: !ipadView,
            slug: 'price',
            sortable: false,
            alignCenter: true,
        },
        {
            name: 'Side',
            show: !showColumns,
            slug: 'side',
            sortable: false,
            alignCenter: true,
        },
        {
            name: 'Type',
            show: !showColumns,
            slug: 'type',
            sortable: false,
            alignCenter: true,
        },
        {
            name: sideType,
            show: showColumns && !ipadView,
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

            show: !showColumns,
            slug: baseTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: isAccountView ? <></> : `${quoteTokenSymbol}ㅤㅤ`, // invisible character added
            show: !showColumns,
            slug: quoteTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: 'Tokensㅤㅤ',
            show: !isAccountView && showColumns,
            slug: 'tokens',
            sortable: false,
            alignRight: true,
        },
        {
            name: <>Tokensㅤㅤ</>,
            show: isAccountView && showColumns,
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

    const headerStyle = isAccountView
        ? styles.portfolio_header
        : styles.trade_header;

    const headerColumnsDisplay = (
        <ul className={`${styles.header} ${headerStyle}`}>
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
        </ul>
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
            <div className={styles.footer}>
                <div className={styles.footer_content}>
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
                    <p
                        className={styles.showing_text}
                    >{` ${showingFrom} - ${showingTo} of ${totalItems}`}</p>
                </div>
            </div>
        );

    const currentRowItemContent = _DATA.currentData.map((tx, idx) => (
        <TransactionRow
            key={idx}
            tx={tx}
            ipadView={ipadView}
            showColumns={showColumns}
            showTimestamp={showTimestamp}
            isAccountView={isAccountView}
        />
    ));
    const sortedRowItemContent = sortedTransactions.map((tx, idx) => (
        <TransactionRow
            key={idx}
            tx={tx}
            ipadView={ipadView}
            showColumns={showColumns}
            showTimestamp={showTimestamp}
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

    const gridTxStyle =
        showViewMoreButton && isCandleSelected ? styles.show_more_grid : '';

    const transactionDataOrNull = shouldDisplayNoTableData ? (
        <NoTableData
            setSelectedDate={setSelectedDate}
            type='transactions'
            isAccountView={isAccountView}
        />
    ) : (
        <div onKeyDown={handleKeyDownViewTransaction} className={gridTxStyle}>
            <ul ref={listRef} id='current_row_scroll'>
                {!isAccountView &&
                    pendingTransactions.length > 0 &&
                    transactionsByType
                        .filter(
                            (tx) =>
                                tx.txAction &&
                                pendingTransactions.includes(tx.txHash),
                        )
                        .reverse()
                        .map((tx, idx) => {
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
                                        showTimestamp={showTimestamp}
                                        showColumns={showColumns}
                                        ipadView={ipadView}
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
                                                    tx.txDetails
                                                        ?.baseTokenDecimals,
                                                quoteTokenDecimals:
                                                    tx.txDetails
                                                        ?.quoteTokenDecimals,
                                                lowTick: tx.txDetails?.lowTick,
                                                highTick:
                                                    tx.txDetails?.highTick,
                                                gridSize:
                                                    tx.txDetails?.gridSize,
                                            },
                                        }}
                                        showTimestamp={showTimestamp}
                                        showColumns={showColumns}
                                        ipadView={ipadView}
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
                                                    tx.txDetails
                                                        ?.baseTokenDecimals,
                                                quoteTokenDecimals:
                                                    tx.txDetails
                                                        ?.quoteTokenDecimals,
                                                lowTick: tx.txDetails?.lowTick,
                                                highTick:
                                                    tx.txDetails?.highTick,
                                                gridSize:
                                                    tx.txDetails?.gridSize,
                                            },
                                        }}
                                        showTimestamp={showTimestamp}
                                        showColumns={showColumns}
                                        ipadView={ipadView}
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
                                                    tx.txDetails
                                                        ?.baseTokenDecimals,
                                                quoteTokenDecimals:
                                                    tx.txDetails
                                                        ?.quoteTokenDecimals,
                                                lowTick: tx.txDetails?.lowTick,
                                                highTick:
                                                    tx.txDetails?.highTick,
                                                gridSize:
                                                    tx.txDetails?.gridSize,
                                            },
                                        }}
                                        showTimestamp={showTimestamp}
                                        showColumns={showColumns}
                                        ipadView={ipadView}
                                    />
                                </>
                            );
                        })}
                {currentRowItemContent}
            </ul>
            {showViewMoreButton && (
                <div className={styles.view_more_container}>
                    <button
                        className={styles.view_more_button}
                        onClick={() => toggleTradeTable()}
                    >
                        View More
                    </button>
                </div>
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

    const portfolioPageFooter = props.isAccountView ? '1rem 0' : '';

    return (
        <div
            className={`${
                isAccountView
                    ? styles.acc_list_container
                    : styles.main_list_container
            } ${isTradeTableExpanded && styles.main_list_expanded}`}
        >
            <div>{headerColumnsDisplay}</div>

            <div className={styles.table_content}>
                {isLoading ? (
                    <Spinner size={100} bg='var(--dark1)' centered />
                ) : (
                    transactionDataOrNull
                )}
            </div>

            <div style={{ margin: portfolioPageFooter }}>{footerDisplay}</div>
        </div>
    );
}

export default memo(Transactions);
