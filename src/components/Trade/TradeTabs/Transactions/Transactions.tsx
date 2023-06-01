/* eslint-disable no-irregular-whitespace */
import styles from './Transactions.module.css';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import {
    CandleData,
    setDataLoadingStatus,
} from '../../../../utils/state/graphDataSlice';
import { TransactionIF } from '../../../../utils/interfaces/exports';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import {
    Dispatch,
    SetStateAction,
    useState,
    useEffect,
    useRef,
    useContext,
    memo,
} from 'react';

import { Pagination } from '@mui/material';
import TransactionHeader from './TransactionsTable/TransactionHeader';
import TransactionRow from './TransactionsTable/TransactionRow';
import { useSortedTransactions } from '../useSortedTxs';
import useDebounce from '../../../../App/hooks/useDebounce';
import NoTableData from '../NoTableData/NoTableData';
import { diffHashSigTxs } from '../../../../utils/functions/diffHashSig';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import usePagination from '../../../Global/Pagination/usePagination';
import { RowsPerPageDropdown } from '../../../Global/Pagination/RowsPerPageDropdown';
import Spinner from '../../../Global/Spinner/Spinner';

interface propsIF {
    activeAccountTransactionData?: TransactionIF[];
    connectedAccountActive?: boolean;
    portfolio?: boolean;
    changesInSelectedCandle: TransactionIF[] | undefined;
    isAccountView: boolean; // when viewing from /account: fullscreen and not paginated
    setIsCandleSelected?: Dispatch<SetStateAction<boolean | undefined>>;
    isCandleSelected: boolean | undefined;
    changeState?: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    setSelectedDate?: Dispatch<number | undefined>;
}
function Transactions(props: propsIF) {
    const {
        activeAccountTransactionData,
        connectedAccountActive,
        changesInSelectedCandle,
        isCandleSelected,
        changeState,
        setSelectedDate,
        isAccountView,
    } = props;

    const {
        showAllData: showAllDataSelection,
        expandTradeTable: expandTradeTableSelection,
        setExpandTradeTable,
    } = useContext(TradeTableContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);

    // only show all data and expand when on trade tab page
    const showAllData = !isAccountView && showAllDataSelection;
    const expandTradeTable = !isAccountView && expandTradeTableSelection;

    const NUM_TRANSACTIONS_WHEN_COLLAPSED = isAccountView ? 13 : 10; // Number of transactions we show when the table is collapsed (i.e. half page)
    // NOTE: this is done to improve rendering speed for this page.

    const dispatch = useAppDispatch();

    const graphData = useAppSelector((state) => state?.graphData);
    const tradeData = useAppSelector((state) => state.tradeData);

    const changesByUser = graphData?.changesByUser?.changes;
    const changesByPool = graphData?.changesByPool?.changes;
    const dataLoadingStatus = graphData?.dataLoadingStatus;

    const baseTokenAddressLowerCase = tradeData.baseToken.address.toLowerCase();
    const quoteTokenAddressLowerCase =
        tradeData.quoteToken.address.toLowerCase();

    const changesByUserMatchingSelectedTokens = changesByUser.filter((tx) => {
        if (
            tx.base.toLowerCase() === baseTokenAddressLowerCase &&
            tx.quote.toLowerCase() === quoteTokenAddressLowerCase &&
            tx.changeType !== 'fill'
        ) {
            return true;
        } else {
            return false;
        }
    });

    const changesByPoolWithoutFills = changesByPool.filter((tx) => {
        if (
            tx.base.toLowerCase() === baseTokenAddressLowerCase &&
            tx.quote.toLowerCase() === quoteTokenAddressLowerCase &&
            tx.changeType !== 'fill'
        ) {
            return true;
        } else {
            return false;
        }
    });

    const [transactionData, setTransactionData] = useState(
        isAccountView
            ? activeAccountTransactionData || []
            : changesByPoolWithoutFills,
    );

    const isConnectedUserTxDataLoading =
        dataLoadingStatus?.isConnectedUserTxDataLoading;
    const isLookupUserTxDataLoading =
        dataLoadingStatus?.isLookupUserTxDataLoading;
    const isPoolTxDataLoading = dataLoadingStatus?.isPoolTxDataLoading;

    const isTxDataLoadingForPortfolio =
        (connectedAccountActive && isConnectedUserTxDataLoading) ||
        (!connectedAccountActive && isLookupUserTxDataLoading);

    const isTxDataLoadingForTradeTable =
        !isCandleSelected &&
        ((showAllData && isPoolTxDataLoading) ||
            (!showAllData && isConnectedUserTxDataLoading));

    const shouldDisplayLoadingAnimation =
        (isAccountView && isTxDataLoadingForPortfolio) ||
        (!isAccountView && isTxDataLoadingForTradeTable);

    const shouldDisplayNoTableData = !transactionData.length;

    const debouncedShouldDisplayLoadingAnimation = useDebounce(
        shouldDisplayLoadingAnimation,
        1000,
    ); // debounce 1 second
    const debouncedShouldDisplayNoTableData = useDebounce(
        shouldDisplayNoTableData,
        1000,
    ); // debounce 1 second

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedTransactions] =
        useSortedTransactions(
            'time',
            showAllData && !isCandleSelected
                ? changesByPoolWithoutFills
                : transactionData,
        );

    function handleUserSelected() {
        setTransactionData(changesByUserMatchingSelectedTokens);
    }
    function handlePoolSelected() {
        if (!isAccountView) {
            setTransactionData(changesByPoolWithoutFills);
        }
    }

    useEffect(() => {
        if (isAccountView && activeAccountTransactionData) {
            setTransactionData(activeAccountTransactionData);
        }
    }, [isAccountView, diffHashSigTxs(activeAccountTransactionData)]);

    // update tx table content when candle selected or underlying data changes
    useEffect(() => {
        if (!isAccountView) {
            if (isCandleSelected) {
                if (changesInSelectedCandle !== undefined) {
                    setTransactionData(changesInSelectedCandle);
                    dispatch(
                        setDataLoadingStatus({
                            datasetName: 'candleData',
                            loadingStatus: false,
                        }),
                    );
                }
            } else if (showAllData) {
                handlePoolSelected();
            } else {
                handleUserSelected();
            }
        }
    }, [
        isAccountView,
        isCandleSelected,
        isCandleSelected ? diffHashSigTxs(changesInSelectedCandle) : '',
        changesByPoolWithoutFills.length,
        changesByPoolWithoutFills.at(0)?.poolHash,
        changesByUserMatchingSelectedTokens.length,
        changesByUserMatchingSelectedTokens.at(0)?.user,
        showAllData,
    ]);

    const ipadView = useMediaQuery('(max-width: 580px)');
    const showPair = useMediaQuery('(min-width: 768px)') || !isSidebarOpen;
    const max1400px = useMediaQuery('(max-width: 1600px)');
    const max1700px = useMediaQuery('(max-width: 1800px)');

    const showColumns =
        (max1400px && !isSidebarOpen) || (max1700px && isSidebarOpen);
    const view2 = useMediaQuery('(max-width: 1568px)');

    // Get current transactions

    const quoteTokenSymbol = tradeData.quoteToken?.symbol;
    const baseTokenSymbol = tradeData.baseToken?.symbol;

    const walID = (
        <>
            <p>ID</p>
            <p>Wallet</p>
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
            show: !showColumns,

            slug: 'time',
            sortable: true,
        },
        {
            name: 'Pair',
            className: '',
            show: isAccountView && showPair,
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
            sortable: showAllData,
        },
        {
            name: walID,

            show: showColumns,
            slug: 'walletid',
            sortable: false,
            alignCenter: false,
        },
        {
            name: 'Price',

            show: !ipadView,
            slug: 'price',
            sortable: false,
            alignRight: true,
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

    const [rowsPerPage, setRowsPerPage] = useState(
        isScreenShort ? 5 : isScreenTall ? 20 : 10,
    );

    const count = Math.ceil(sortedTransactions.length / rowsPerPage);
    const _DATA = usePagination(sortedTransactions, rowsPerPage);

    const { showingFrom, showingTo, totalItems, setCurrentPage } = _DATA;
    const handleChange = (e: React.ChangeEvent<unknown>, p: number) => {
        setPage(p);
        _DATA.jump(p);
    };

    const handleChangeRowsPerPage = (
        event:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | React.ChangeEvent<HTMLSelectElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
    };
    const tradePageCheck = expandTradeTable && transactionData.length > 30;

    const listRef = useRef<HTMLUListElement>(null);
    const sPagination = useMediaQuery('(max-width: 800px)');
    const footerDisplay = rowsPerPage > 0 &&
        ((isAccountView && transactionData.length > 10) ||
            (!isAccountView && tradePageCheck)) && (
            <div className={styles.footer}>
                <div className={styles.footer_content}>
                    <RowsPerPageDropdown
                        value={rowsPerPage}
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
            tradeData={tradeData}
            ipadView={ipadView}
            showColumns={showColumns}
            view2={view2}
            showPair={showPair}
            isAccountView={isAccountView}
        />
    ));
    const sortedRowItemContent = sortedTransactions.map((tx, idx) => (
        <TransactionRow
            key={idx}
            tx={tx}
            tradeData={tradeData}
            ipadView={ipadView}
            showColumns={showColumns}
            view2={view2}
            showPair={showPair}
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

    const transactionDataOrNull = debouncedShouldDisplayNoTableData ? (
        <NoTableData
            setSelectedDate={setSelectedDate}
            changeState={changeState}
            type='transactions'
            isAccountView={isAccountView}
        />
    ) : (
        <div onKeyDown={handleKeyDownViewTransaction}>
            <ul ref={listRef} id='current_row_scroll'>
                {currentRowItemContent}
            </ul>

            {/* Show a 'View More' button at the end of the table when collapsed (half-page) and it's not a /account render */}
            {!expandTradeTable &&
                !isAccountView &&
                sortedRowItemContent.length >
                    NUM_TRANSACTIONS_WHEN_COLLAPSED && (
                    <div className={styles.view_more_container}>
                        <button
                            className={styles.view_more_button}
                            onClick={() => setExpandTradeTable(true)}
                        >
                            View More
                        </button>
                    </div>
                )}
        </div>
    );

    const mobileView = useMediaQuery('(max-width: 1200px)');

    useEffect(() => {
        if (mobileView) {
            setExpandTradeTable(true);
        }
    }, [mobileView]);

    const mobileViewHeight = mobileView ? '70vh' : '260px';

    const expandStyle = expandTradeTable
        ? mobileView
            ? 'calc(100vh - 15rem) '
            : 'calc(100vh - 9rem)'
        : mobileViewHeight;

    const portfolioPageStyle = props.isAccountView
        ? 'calc(100vh - 19.5rem)'
        : expandStyle;
    const portfolioPageFooter = props.isAccountView ? '1rem 0' : '';

    return (
        <section
            className={`${styles.main_list_container} ${
                expandTradeTable && styles.main_list_expanded
            }`}
            style={{ height: portfolioPageStyle }}
        >
            <div>{headerColumnsDisplay}</div>

            <div className={styles.table_content}>
                {debouncedShouldDisplayLoadingAnimation ? (
                    <Spinner size={100} bg='var(--dark1)' centered />
                ) : (
                    transactionDataOrNull
                )}
            </div>

            <div style={{ margin: portfolioPageFooter }}>{footerDisplay}</div>
        </section>
    );
}

export default memo(Transactions);
