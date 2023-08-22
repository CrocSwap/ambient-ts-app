/* eslint-disable no-irregular-whitespace */
// START: Import React and Dongles
import { useContext, useEffect, useRef, useState, memo } from 'react';

// START: Import JSX Elements
import styles from './Orders.module.css';

// START: Import Local Files
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import OrderHeader from './OrderTable/OrderHeader';
import OrderRow from './OrderTable/OrderRow';
import { useSortedLimits } from '../useSortedLimits';
import { LimitOrderIF } from '../../../../utils/interfaces/exports';
import NoTableData from '../NoTableData/NoTableData';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { RowsPerPageDropdown } from '../../../Global/Pagination/RowsPerPageDropdown';
import usePagination from '../../../Global/Pagination/usePagination';
import { Pagination } from '@mui/material';
import Spinner from '../../../Global/Spinner/Spinner';
import { ChartContext } from '../../../../contexts/ChartContext';
import { OrderRowPlaceholder } from './OrderTable/OrderRowPlaceholder';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';

// import OrderAccordions from './OrderAccordions/OrderAccordions';

// interface for props for react functional component
interface propsIF {
    activeAccountLimitOrderData?: LimitOrderIF[];
    connectedAccountActive?: boolean;
    isAccountView: boolean;
}

// main react functional component
function Orders(props: propsIF) {
    const {
        activeAccountLimitOrderData,
        connectedAccountActive,
        isAccountView,
    } = props;
    const { showAllData: showAllDataSelection, toggleTradeTable } =
        useContext(TradeTableContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);

    const {
        chainData: { poolIndex },
    } = useContext(CrocEnvContext);

    const { tradeTableState } = useContext(ChartContext);

    // only show all data when on trade tabs page
    const showAllData = !isAccountView && showAllDataSelection;
    const isTradeTableExpanded =
        !isAccountView && tradeTableState === 'Expanded';

    const graphData = useAppSelector((state) => state?.graphData);
    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );

    const tradeData = useAppSelector((state) => state.tradeData);
    const { transactionsByType, pendingTransactions } = useAppSelector(
        (state) => state.receiptData,
    );

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;

    const [limitOrderData, setLimitOrderData] = useState<LimitOrderIF[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isAccountView) setLimitOrderData(activeAccountLimitOrderData || []);
        else if (!showAllData)
            setLimitOrderData(
                graphData?.userLimitOrdersByPool?.limitOrders.filter(
                    (order) =>
                        order.base.toLowerCase() ===
                            baseTokenAddress.toLowerCase() &&
                        order.quote.toLowerCase() ===
                            quoteTokenAddress.toLowerCase() &&
                        (order.positionLiq != 0 || order.claimableLiq !== 0),
                ),
            );
        else {
            setLimitOrderData(graphData?.limitOrdersByPool.limitOrders);
        }
    }, [
        showAllData,
        isAccountView,
        activeAccountLimitOrderData,
        graphData?.limitOrdersByPool,
        graphData?.userLimitOrdersByPool,
    ]);

    useEffect(() => {
        if (isAccountView && connectedAccountActive)
            setIsLoading(
                graphData?.dataLoadingStatus.isConnectedUserOrderDataLoading,
            );
        else if (isAccountView)
            setIsLoading(
                graphData?.dataLoadingStatus.isLookupUserOrderDataLoading,
            );
        else if (!showAllData)
            setIsLoading(
                graphData?.dataLoadingStatus
                    .isConnectedUserPoolOrderDataLoading,
            );
        else setIsLoading(graphData?.dataLoadingStatus.isPoolOrderDataLoading);
    }, [
        showAllData,
        isAccountView,
        connectedAccountActive,
        graphData?.dataLoadingStatus.isConnectedUserOrderDataLoading,
        graphData?.dataLoadingStatus.isConnectedUserPoolOrderDataLoading,
        graphData?.dataLoadingStatus.isLookupUserOrderDataLoading,
        graphData?.dataLoadingStatus.isPoolOrderDataLoading,
    ]);

    const shouldDisplayNoTableData = !isLoading && !limitOrderData.length;

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedLimits] =
        useSortedLimits('time', limitOrderData);

    const ipadView = useMediaQuery('(max-width: 600px)');
    const showPair = useMediaQuery('(min-width: 768px)') || !isSidebarOpen;
    const showColumns = useMediaQuery('(max-width: 1599px)');

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
    const tokens = isAccountView ? (
        <>Tokens</>
    ) : (
        <>
            <p>{`${baseTokenSymbol}`}</p>
            <p>{`${quoteTokenSymbol}`}</p>
        </>
    );
    const headerColumns = [
        {
            name: 'Last Updated',
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
            className: 'ID',
            show: !showColumns,
            slug: 'id',
            sortable: false,
        },
        {
            name: 'Wallet',
            className: 'wallet',
            show: !isAccountView && !showColumns,
            slug: 'wallet',
            sortable: showAllData,
        },
        {
            name: walID,
            className: 'wallet_it',
            show: showColumns,
            slug: 'walletid',
            sortable: !isAccountView,
        },
        {
            name: 'Limit Price',

            show: !ipadView,
            slug: 'price',
            sortable: true,
            alignRight: true,
        },
        {
            name: 'Side',
            className: 'side',
            show: !showColumns,
            slug: 'side',
            sortable: true,
            alignCenter: true,
        },
        {
            name: 'Type',
            className: 'type',
            show: !showColumns,
            slug: 'type',
            sortable: true,
            alignCenter: true,
        },
        {
            name: sideType,
            className: 'side_type',
            show: showColumns && !ipadView,
            slug: 'sidetype',
            sortable: false,
            alignCenter: true,
        },

        {
            name: 'Value (USD)',
            className: 'value',
            show: true,
            slug: 'value',
            sortable: true,
            alignRight: true,
        },
        {
            name: isAccountView ? '' : `${baseTokenSymbol}`,

            show: !showColumns,
            slug: baseTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: isAccountView ? '' : `${quoteTokenSymbol}`,

            show: !showColumns,
            slug: quoteTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: tokens,
            className: 'tokens',
            show: showColumns,
            slug: 'tokens',
            sortable: false,
            alignRight: true,
        },
        {
            name: 'Claimable',
            // name: ' ',
            className: '',
            show: !ipadView,
            slug: 'status',
            sortable: false,
            alignCenter: true,
        },

        {
            name: '',
            className: '',
            show: true,
            slug: 'menu',
            sortable: false,
        },
    ];
    const headerStyle = isAccountView
        ? styles.portfolio_header
        : styles.trade_header;

    // ---------------------
    // orders per page media queries
    const NUM_RANGES_WHEN_COLLAPSED = 10; // Number of ranges we show when the table is collapsed (i.e. half page)

    useEffect(() => {
        setCurrentPage(1);
    }, [userAddress, showAllData, baseTokenAddress + quoteTokenAddress]);

    // Get current tranges

    const [page, setPage] = useState(1);
    const resetPageToFirst = () => setPage(1);

    const isScreenShort =
        (isAccountView && useMediaQuery('(max-height: 900px)')) ||
        (!isAccountView && useMediaQuery('(max-height: 700px)'));

    const isScreenTall =
        (isAccountView && useMediaQuery('(min-height: 1100px)')) ||
        (!isAccountView && useMediaQuery('(min-height: 1000px)'));

    const _DATA = usePagination(sortedLimits, isScreenShort, isScreenTall);

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

    const tradePageCheck = isTradeTableExpanded && limitOrderData.length > 10;

    const listRef = useRef<HTMLUListElement>(null);
    const sPagination = useMediaQuery('(max-width: 800px)');

    const footerDisplay = rowsPerPage > 0 &&
        ((isAccountView && limitOrderData.length > 10) ||
            (!isAccountView && tradePageCheck)) && (
            <div className={styles.footer}>
                <div className={styles.footer_content}>
                    <RowsPerPageDropdown
                        rowsPerPage={rowsPerPage}
                        onChange={handleChangeRowsPerPage}
                        itemCount={sortedLimits.length}
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

    // ----------------------

    const headerColumnsDisplay = (
        <ul
            className={`${isAccountView ? styles.account_header : undefined} ${
                styles.header
            } ${headerStyle}`}
        >
            {headerColumns.map((header, idx) => (
                <OrderHeader
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

    const currentRowItemContent = _DATA.currentData.map((order, idx) => (
        <OrderRow
            showPair={showPair}
            showColumns={showColumns}
            ipadView={ipadView}
            key={idx}
            limitOrder={order}
            isAccountView={isAccountView}
        />
    ));

    const sortedRowItemContent = sortedLimits.map((order, idx) => (
        <OrderRow
            showPair={showPair}
            showColumns={showColumns}
            ipadView={ipadView}
            key={idx}
            limitOrder={order}
            isAccountView={isAccountView}
        />
    ));

    const handleKeyDownViewOrder = (
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
    const orderDataOrNull = shouldDisplayNoTableData ? (
        <NoTableData type='orders' isAccountView={isAccountView} />
    ) : (
        <div onKeyDown={handleKeyDownViewOrder}>
            <ul ref={listRef}>
                {!isAccountView &&
                    pendingTransactions.length > 0 &&
                    transactionsByType
                        .filter(
                            (tx) =>
                                tx.txAction &&
                                tx.txType === 'Limit' &&
                                pendingTransactions.includes(tx.txHash) &&
                                tx.txDetails?.baseAddress ===
                                    tradeData.baseToken.address &&
                                tx.txDetails?.quoteAddress ===
                                    tradeData.quoteToken.address &&
                                tx.txDetails?.poolIdx === poolIndex,
                        )
                        .reverse()
                        .map((tx, idx) => (
                            <OrderRowPlaceholder
                                key={idx}
                                transaction={{
                                    hash: tx.txHash,
                                    baseSymbol:
                                        tx.txDetails?.baseSymbol ?? '...',
                                    quoteSymbol:
                                        tx.txDetails?.quoteSymbol ?? '...',
                                    side: tx.txAction,
                                    type: tx.txType,
                                }}
                                showColumns={showColumns}
                                ipadView={ipadView}
                            />
                        ))}
                {currentRowItemContent}
            </ul>
            {
                // Show a 'View More' button at the end of the table when collapsed (half-page) and it's not a /account render
                // TODO (#1804): we should instead be adding results to RTK
                !isTradeTableExpanded &&
                    !isAccountView &&
                    sortedRowItemContent.length > NUM_RANGES_WHEN_COLLAPSED && (
                        <div className={styles.view_more_container}>
                            <button
                                className={styles.view_more_button}
                                onClick={() => {
                                    toggleTradeTable();
                                }}
                            >
                                View More
                            </button>
                        </div>
                    )
            }
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
            className={`${styles.main_list_container} ${
                isTradeTableExpanded && styles.main_list_expanded
            }`}
        >
            <div>{headerColumnsDisplay}</div>

            <div className={styles.table_content}>
                {isLoading ? (
                    <Spinner size={100} bg='var(--dark1)' centered />
                ) : (
                    orderDataOrNull
                )}
            </div>

            <div style={{ margin: portfolioPageFooter }}>{footerDisplay}</div>
        </div>
    );
}

export default memo(Orders);
