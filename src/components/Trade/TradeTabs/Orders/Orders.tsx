/* eslint-disable no-irregular-whitespace */
import { useContext, useEffect, useRef, useState, memo, useMemo } from 'react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import OrderHeader from './OrderTable/OrderHeader';
import { useSortedLimits } from '../useSortedLimits';
import { LimitOrderIF } from '../../../../ambient-utils/types';
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
import {
    OrderRow as OrderRowStyled,
    ViewMoreButton,
} from '../../../../styled/Components/TransactionTable';
import { FlexContainer, Text } from '../../../../styled/Common';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { DataLoadingContext } from '../../../../contexts/DataLoadingContext';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import TableRows from '../TableRows';

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

    const {
        userLimitOrdersByPool,
        limitOrdersByPool,
        unindexedNonFailedSessionLimitOrderUpdates,
    } = useContext(GraphDataContext);
    const dataLoadingStatus = useContext(DataLoadingContext);
    const { userAddress } = useContext(UserDataContext);

    const { transactionsByType } = useContext(ReceiptContext);

    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const baseTokenSymbol = baseToken.symbol;
    const quoteTokenSymbol = quoteToken.symbol;
    const baseTokenAddress = baseToken.address;
    const quoteTokenAddress = quoteToken.address;

    const limitOrderData = useMemo(
        () =>
            isAccountView
                ? activeAccountLimitOrderData || []
                : !showAllData
                ? userLimitOrdersByPool?.limitOrders.filter(
                      (order) =>
                          order.positionLiq != 0 || order.claimableLiq !== 0,
                  )
                : limitOrdersByPool.limitOrders,
        [
            showAllData,
            isAccountView,
            activeAccountLimitOrderData,
            limitOrdersByPool,
            userLimitOrdersByPool,
        ],
    );

    const isLoading = useMemo(
        () =>
            isAccountView && connectedAccountActive
                ? dataLoadingStatus.isConnectedUserOrderDataLoading
                : isAccountView
                ? dataLoadingStatus.isLookupUserOrderDataLoading
                : !showAllData
                ? dataLoadingStatus.isConnectedUserPoolOrderDataLoading
                : dataLoadingStatus.isPoolOrderDataLoading,
        [
            isAccountView,
            showAllData,
            connectedAccountActive,
            dataLoadingStatus.isCandleDataLoading,
            dataLoadingStatus.isConnectedUserOrderDataLoading,
            dataLoadingStatus.isConnectedUserPoolOrderDataLoading,
            dataLoadingStatus.isLookupUserOrderDataLoading,
            dataLoadingStatus.isPoolOrderDataLoading,
        ],
    );

    const relevantTransactionsByType = transactionsByType.filter(
        (tx) =>
            unindexedNonFailedSessionLimitOrderUpdates.some(
                (update) => update.txHash === tx.txHash,
            ) &&
            tx.userAddress.toLowerCase() ===
                (userAddress || '').toLowerCase() &&
            tx.txDetails?.baseAddress.toLowerCase() ===
                baseToken.address.toLowerCase() &&
            tx.txDetails?.quoteAddress.toLowerCase() ===
                quoteToken.address.toLowerCase() &&
            tx.txDetails?.poolIdx === poolIndex,
    );

    const shouldDisplayNoTableData =
        !isLoading &&
        !limitOrderData.length &&
        unindexedNonFailedSessionLimitOrderUpdates.length === 0;

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedLimits] =
        useSortedLimits('time', limitOrderData);

    // TODO: Use these as media width constants
    const isSmallScreen = useMediaQuery('(max-width: 750px)');
    const isLargeScreen = useMediaQuery('(min-width: 1600px)');

    const tableView =
        isSmallScreen || (isAccountView && !isLargeScreen && isSidebarOpen)
            ? 'small'
            : (!isSmallScreen && !isLargeScreen) ||
              (isAccountView &&
                  connectedAccountActive &&
                  isLargeScreen &&
                  isSidebarOpen)
            ? 'medium'
            : 'large';

    // Changed this to have the sort icon be inline with the last row rather than under it
    const walID = (
        <>
            <p>Position ID</p>
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
            name: 'Position ID',
            className: 'ID',
            show: tableView === 'large',
            slug: 'id',
            sortable: false,
        },
        {
            name: 'Wallet',
            className: 'wallet',
            show: tableView === 'large' && !isAccountView,
            slug: 'wallet',
            sortable: showAllData,
        },
        {
            name: walID,
            className: 'wallet_it',
            show: tableView !== 'large',
            slug: 'walletid',
            sortable: !isAccountView,
        },
        {
            name: 'Limit Price',
            show: tableView !== 'small',
            slug: 'price',
            sortable: true,
            alignRight: true,
        },
        {
            name: 'Side',
            className: 'side',
            show: tableView === 'large',
            slug: 'side',
            sortable: true,
            alignCenter: true,
        },
        {
            name: 'Type',
            className: 'type',
            show: tableView === 'large',
            slug: 'type',
            sortable: false,
            alignCenter: true,
        },
        {
            name: sideType,
            className: 'side_type',
            show: tableView !== 'large',
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
            show: tableView === 'large',
            slug: baseTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: isAccountView ? '' : `${quoteTokenSymbol}`,
            show: tableView === 'large',
            slug: quoteTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: tokens,
            className: 'tokens',
            show: tableView === 'medium',
            slug: 'tokens',
            sortable: false,
            alignRight: true,
        },
        {
            name: 'Claimable',
            // name: ' ',
            className: '',
            show: tableView !== 'small',
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
    // ---------------------

    useEffect(() => {
        setCurrentPage(1);
    }, [userAddress, showAllData, baseTokenAddress + quoteTokenAddress]);

    // Get current tranges

    const [page, setPage] = useState(1);
    const resetPageToFirst = () => setPage(1);

    // const isScreenShort =
    //     (isAccountView && useMediaQuery('(max-height: 900px)')) ||
    //     (!isAccountView && useMediaQuery('(max-height: 700px)'));

    // const isScreenTall =
    //     (isAccountView && useMediaQuery('(min-height: 1100px)')) ||
    //     (!isAccountView && useMediaQuery('(min-height: 1000px)'));

    const _DATA = usePagination(
        sortedLimits,
        // , isScreenShort, isScreenTall
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
        const element = document.getElementById('current_row_scroll');
        element?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'start',
        });
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
                {!isSmallScreen && (
                    <Text
                        fontSize='mini'
                        color='text2'
                        style={{ whiteSpace: 'nowrap' }}
                    >{` ${showingFrom} - ${showingTo} of ${totalItems}`}</Text>
                )}
            </FlexContainer>
        );

    // ----------------------

    const headerColumnsDisplay = (
        <OrderRowStyled size={tableView} header account={isAccountView}>
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
        </OrderRowStyled>
    );

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
        <NoTableData type='limits' isAccountView={isAccountView} />
    ) : (
        <div onKeyDown={handleKeyDownViewOrder}>
            <ul
                ref={listRef}
                id='current_row_scroll'
                style={
                    isSmallScreen
                        ? isAccountView
                            ? { height: 'calc(100svh - 310px)' }
                            : { height: 'calc(100svh - 380px)' }
                        : undefined
                }
            >
                {!isAccountView &&
                    relevantTransactionsByType.length > 0 &&
                    relevantTransactionsByType.reverse().map((tx, idx) => (
                        <OrderRowPlaceholder
                            key={idx}
                            transaction={{
                                hash: tx.txHash,
                                baseSymbol: tx.txDetails?.baseSymbol ?? '...',
                                quoteSymbol: tx.txDetails?.quoteSymbol ?? '...',
                                side: tx.txAction,
                                type: tx.txType,
                                details: tx.txDetails,
                            }}
                            tableView={tableView}
                        />
                    ))}
                <TableRows
                    type='Order'
                    data={_DATA.currentData}
                    fullData={fullData}
                    tableView={tableView}
                    isAccountView={isAccountView}
                />
            </ul>
            {
                // Show a 'View More' button at the end of the table when collapsed (half-page) and it's not a /account render
                !isTradeTableExpanded &&
                    !isAccountView &&
                    sortedLimits.length > rowsPerPage && (
                        <FlexContainer
                            justifyContent='center'
                            alignItems='center'
                            padding='8px'
                        >
                            <ViewMoreButton onClick={() => toggleTradeTable()}>
                                View More
                            </ViewMoreButton>
                        </FlexContainer>
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

    return (
        <FlexContainer
            flexDirection='column'
            style={{ height: isSmallScreen ? '95%' : '100%' }}
        >
            <div>{headerColumnsDisplay}</div>

            <div style={{ flex: 1, overflow: 'auto' }}>
                {isLoading ? (
                    <Spinner size={100} bg='var(--dark1)' centered />
                ) : (
                    orderDataOrNull
                )}
            </div>

            {footerDisplay}
        </FlexContainer>
    );
}

export default memo(Orders);
