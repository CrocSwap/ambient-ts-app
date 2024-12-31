/* eslint-disable no-irregular-whitespace */
import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LimitOrderIF } from '../../../../ambient-utils/types';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import NoTableData from '../NoTableData/NoTableData';
import { useSortedLimits } from '../useSortedLimits';
import OrderHeader from './OrderTable/OrderHeader';

import { getPositionHash } from '../../../../ambient-utils/dataLayer/functions/getPositionHash';
import { AppStateContext } from '../../../../contexts';
import { DataLoadingContext } from '../../../../contexts/DataLoadingContext';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FlexContainer } from '../../../../styled/Common';
import { OrderRow as OrderRowStyled } from '../../../../styled/Components/TransactionTable';
import Spinner from '../../../Global/Spinner/Spinner';
import InfiniteScroll from '../../InfiniteScroll/InfiniteScroll';
import useMergeWithPendingTxs from '../../InfiniteScroll/useMergeWithPendingTxs';
import TableRows from '../TableRows';
import { OrderRowPlaceholder } from './OrderTable/OrderRowPlaceholder';

interface propsIF {
    activeAccountLimitOrderData?: LimitOrderIF[];
    connectedAccountActive?: boolean;
    isAccountView: boolean;
    unselectCandle?: () => void;
}

function Orders(props: propsIF) {
    const {
        activeAccountLimitOrderData,
        connectedAccountActive,
        isAccountView,
        unselectCandle,
    } = props;
    const { showAllData: showAllDataSelection } = useContext(TradeTableContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);

    const {
        activeNetwork: { poolIndex },
    } = useContext(AppStateContext);

    // only show all data when on trade tabs page
    const showAllData = !isAccountView && showAllDataSelection;

    const {
        limitOrdersByUser,
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

    const activeUserLimitOrdersByPool = useMemo(
        () =>
            userLimitOrdersByPool?.limitOrders.filter(
                (order) => order.positionLiq != 0 || order.claimableLiq !== 0,
            ),
        [userLimitOrdersByPool],
    );

    const [showInfiniteScroll, setShowInfiniteScroll] = useState<boolean>(
        !isAccountView && showAllData,
    );

    useEffect(() => {
        setShowInfiniteScroll(!isAccountView && showAllData);
    }, [isAccountView, showAllData]);

    const limitOrderData = useMemo<LimitOrderIF[]>(
        () =>
            isAccountView
                ? activeAccountLimitOrderData || []
                : !showAllData
                  ? activeUserLimitOrdersByPool
                  : limitOrdersByPool.limitOrders,
        [
            showAllData,
            isAccountView,
            activeAccountLimitOrderData,
            activeUserLimitOrdersByPool,
            limitOrdersByPool.limitOrders, // infinite scroll
        ],
    );

    const activeUserLimitOrdersLength = useMemo(
        () =>
            isAccountView
                ? activeAccountLimitOrderData
                    ? activeAccountLimitOrderData.filter(
                          (order) =>
                              order.positionLiq != 0 ||
                              order.claimableLiq !== 0,
                      ).length
                    : 0
                : limitOrdersByUser.limitOrders.filter(
                      (order) =>
                          order.positionLiq != 0 || order.claimableLiq !== 0,
                  ).length,
        [activeAccountLimitOrderData, isAccountView, limitOrdersByUser],
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
            !tx.isRemoved &&
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
        relevantTransactionsByType.length === 0;

    const [
        sortBy,
        setSortBy,
        reverseSort,
        setReverseSort,
        sortedLimits,
        sortData,
    ] = useSortedLimits('time', limitOrderData);

    const { mergedData, recentlyUpdatedPositions } = useMergeWithPendingTxs({
        type: 'Order',
        data: sortedLimits,
    });

    const sortedLimitsToDisplayAccount = useMemo(() => {
        return mergedData;
    }, [mergedData]);

    const pendingPositionsToDisplayPlaceholder = useMemo(() => {
        return relevantTransactionsByType.filter((pos) => {
            const pendingPosHash = getPositionHash(undefined, {
                isPositionTypeAmbient: false,
                user: pos.userAddress,
                baseAddress: pos.txDetails?.baseAddress || '',
                quoteAddress: pos.txDetails?.quoteAddress || '',
                poolIdx: pos.txDetails?.poolIdx || 0,
                bidTick: pos.txDetails?.lowTick || 0,
                askTick: pos.txDetails?.highTick || 0,
            });

            const matchingPosition = recentlyUpdatedPositions.find(
                (recentlyUpdatedOrder) => {
                    return pendingPosHash === recentlyUpdatedOrder.positionHash;
                },
            );
            return !matchingPosition;
        });
    }, [relevantTransactionsByType, recentlyUpdatedPositions]);

    // -----------------------------------------------------------------------------------------------------------------------------

    // TODO: Use these as media width constants
    const isSmallScreen = useMediaQuery('(max-width: 768px)');
    const isTabletScreen = useMediaQuery(
        '(min-width: 768px) and (max-width: 1200px)',
    );
    const isLargeScreen = useMediaQuery('(min-width: 1600px)');

    const tableView =
        isSmallScreen ||
        isTabletScreen ||
        (isAccountView && !isLargeScreen && isSidebarOpen)
            ? 'small'
            : (!isSmallScreen && !isLargeScreen) ||
                (isAccountView &&
                    connectedAccountActive &&
                    isLargeScreen &&
                    isSidebarOpen)
              ? 'medium'
              : 'large';

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
            className: 'position_id',
            show:
                tableView === 'large' ||
                (tableView === 'medium' && isAccountView),
            slug: 'positionid',
            sortable: false,
        },
        {
            name: 'Wallet',
            className: 'wallet',
            show: !isAccountView,
            slug: 'wallet',
            sortable: showAllData,
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

    const listRef = useRef<HTMLUListElement>(null);

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
        <NoTableData
            type='limits'
            isAccountView={isAccountView}
            activeUserPositionsLength={activeUserLimitOrdersLength}
            activeUserPositionsByPoolLength={activeUserLimitOrdersByPool.length}
            unselectCandle={unselectCandle}
        />
    ) : (
        <div onKeyDown={handleKeyDownViewOrder} style={{ height: '100%' }}>
            <ul
                ref={listRef}
                id='current_row_scroll'
                // style={{ height: '100%' }}
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
                    pendingPositionsToDisplayPlaceholder.length > 0 &&
                    pendingPositionsToDisplayPlaceholder
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
                                    details: tx.txDetails,
                                }}
                                tableView={tableView}
                            />
                        ))}
                {showInfiniteScroll ? (
                    <InfiniteScroll
                        type='Order'
                        data={sortedLimits}
                        tableView={tableView}
                        isAccountView={isAccountView}
                        sortBy={sortBy}
                        showAllData={showAllData}
                        dataPerPage={50}
                        fetchCount={50}
                        targetCount={30}
                        sortOrders={sortData}
                    />
                ) : (
                    <TableRows
                        type='Order'
                        data={sortedLimitsToDisplayAccount}
                        fullData={sortedLimitsToDisplayAccount}
                        tableView={tableView}
                        isAccountView={isAccountView}
                    />
                )}
            </ul>
        </div>
    );

    if (isSmallScreen)
        return (
            <div style={{ overflow: 'scroll', height: '100%' }}>
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
                <div style={{ overflowY: 'scroll', height: '100%' }}>
                    {orderDataOrNull}
                </div>
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

            <div
                style={{ flex: 1, overflow: 'auto' }}
                className='custom_scroll_ambient'
            >
                {isLoading ? (
                    <Spinner size={100} bg='var(--dark1)' centered />
                ) : (
                    orderDataOrNull
                )}
            </div>
        </FlexContainer>
    );
}

export default memo(Orders);
