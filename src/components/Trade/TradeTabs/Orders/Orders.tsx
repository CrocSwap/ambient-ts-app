/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    LimitOrderIF,
    LimitOrderServerIF,
} from '../../../../ambient-utils/types';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import NoTableData from '../NoTableData/NoTableData';
import { useSortedLimits } from '../useSortedLimits';
import OrderHeader from './OrderTable/OrderHeader';

import { fetchPoolLimitOrders } from '../../../../ambient-utils/api/fetchPoolLimitOrders';
import { AppStateContext, ChainDataContext } from '../../../../contexts';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { DataLoadingContext } from '../../../../contexts/DataLoadingContext';
import {
    GraphDataContext,
    LimitOrdersByPool,
} from '../../../../contexts/GraphDataContext';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import { TokenContext } from '../../../../contexts/TokenContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FlexContainer } from '../../../../styled/Common';
import { OrderRow as OrderRowStyled } from '../../../../styled/Components/TransactionTable';
import { PageDataCountIF } from '../../../Chat/ChatIFs';
import Spinner from '../../../Global/Spinner/Spinner';
import TableRows from '../TableRows';
import TableRowsInfiniteScroll from '../../InfiniteScroll/TableRowsInfiniteScroll';
import { OrderRowPlaceholder } from './OrderTable/OrderRowPlaceholder';
import { getLimitOrderData } from '../../../../ambient-utils/dataLayer';
import { getPositionHash } from '../../../../ambient-utils/dataLayer/functions/getPositionHash';
import {
    baseTokenForConcLiq,
    bigIntToFloat,
    quoteTokenForConcLiq,
    tickToPrice,
} from '@crocswap-libs/sdk';
import InfiniteScroll from '../../InfiniteScroll/InfiniteScroll';
// import DebugDiv from '../../../Chat/DomDebugger/Draggable/DebugDiv';

interface propsIF {
    activeAccountLimitOrderData?: LimitOrderIF[];
    connectedAccountActive?: boolean;
    isAccountView: boolean;
}

function Orders(props: propsIF) {
    const {
        activeAccountLimitOrderData,
        connectedAccountActive,
        isAccountView,
    } = props;
    const { showAllData: showAllDataSelection } = useContext(TradeTableContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);

    const { crocEnv, provider } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);

    const {
        activeNetwork: { chainId, poolIndex, GCGO_URL },
    } = useContext(AppStateContext);

    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);

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

    const {
        tokens: { tokenUniv: tokenList },
    } = useContext(TokenContext);

    const [showInfiniteScroll, setShowInfiniteScroll] = useState<boolean>(
        !isAccountView && showAllData,
    );

    useEffect(() => {
        setShowInfiniteScroll(!isAccountView && showAllData);
    }, [isAccountView, showAllData]);

    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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

    type RecentlyUpdatedPosition = {
        positionHash: string;
        timestamp: number;
        order: LimitOrderIF;
        type: string;
        action: string;
    };

    // list of recently updated positions
    const [listOfRecentlyUpdatedOrders, setListOfRecentlyUpdatedOrders] =
        useState<RecentlyUpdatedPosition[]>([]);

    const addRecentlyUpdatedOrder = (
        type: string,
        action: string,
        order: LimitOrderIF,
        timestamp: number,
    ) => {
        setListOfRecentlyUpdatedOrders((prev) => {
            return [
                ...prev.filter((e) => e.positionHash !== order.positionHash),
                {
                    positionHash: order.positionHash,
                    timestamp: timestamp,
                    order: order,
                    type: type,
                    action: action,
                },
            ];
        });
    };

    useEffect(() => {
        (async () => {
            // if (relevantTransactionsByType.length === 0) {
            //     setUnindexedUpdatedOrders([]);
            // }

            const pendingOrders = relevantTransactionsByType.filter((tx) => {
                return tx.txType === 'Limit';
            });

            await Promise.all(
                pendingOrders.map(async (pendingOrder) => {
                    if (!crocEnv || !pendingOrder.txDetails)
                        return {} as LimitOrderIF;

                    const pos = crocEnv.positions(
                        pendingOrder.txDetails.quoteAddress,
                        pendingOrder.txDetails.baseAddress,
                        pendingOrder.userAddress,
                    );

                    const poolPriceNonDisplay = await cachedQuerySpotPrice(
                        crocEnv,
                        pendingOrder.txDetails.baseAddress,
                        pendingOrder.txDetails.quoteAddress,
                        chainId,
                        lastBlockNumber,
                    );

                    const position = await pos.queryKnockoutLivePos(
                        pendingOrder.txAction === 'Buy',
                        pendingOrder.txDetails.lowTick || 0,
                        pendingOrder.txDetails.highTick || 0,
                        // lastBlockNumber
                    );
                    if (!pendingOrder.txDetails) {
                        return {} as LimitOrderIF;
                    }

                    const liqBigInt = position.liq;
                    const liqNum = bigIntToFloat(liqBigInt);

                    const highTickPrice = tickToPrice(
                        pendingOrder.txDetails.highTick || 0,
                    );

                    const usdValue = pendingOrder.txDetails.isBid
                        ? (1 / poolPriceNonDisplay) *
                          parseFloat(
                              pendingOrder.txDetails.initialTokenQty || '1',
                          )
                        : (1 / highTickPrice) *
                          parseFloat(
                              pendingOrder.txDetails.initialTokenQty || '1',
                          );

                    const positionLiqBase = bigIntToFloat(
                        baseTokenForConcLiq(
                            poolPriceNonDisplay,
                            liqBigInt,
                            tickToPrice(pendingOrder.txDetails.lowTick || 0),
                            tickToPrice(pendingOrder.txDetails.highTick || 0),
                        ),
                    );
                    const positionLiqQuote = bigIntToFloat(
                        quoteTokenForConcLiq(
                            poolPriceNonDisplay,
                            liqBigInt,
                            tickToPrice(pendingOrder.txDetails.lowTick || 0),
                            tickToPrice(pendingOrder.txDetails.highTick || 0),
                        ),
                    );

                    const positionHash = getPositionHash(undefined, {
                        isPositionTypeAmbient: false,
                        user: pendingOrder.userAddress,
                        baseAddress: pendingOrder.txDetails.baseAddress,
                        quoteAddress: pendingOrder.txDetails.quoteAddress,
                        poolIdx: pendingOrder.txDetails.poolIdx,
                        bidTick: pendingOrder.txDetails.lowTick || 0,
                        askTick: pendingOrder.txDetails.highTick || 0,
                    });

                    const mockServerOrder: LimitOrderServerIF = {
                        chainId: chainId,
                        limitOrderId: positionHash,
                        pivotTime: 0,
                        askTick: pendingOrder.txDetails.highTick || 0,
                        bidTick: pendingOrder.txDetails.lowTick || 0,
                        isBid: pendingOrder.txAction === 'Buy',
                        poolIdx: poolIndex,
                        base: pendingOrder.txDetails.baseAddress,
                        quote: pendingOrder.txDetails.quoteAddress,
                        user: pendingOrder.userAddress,
                        concLiq: liqNum,
                        rewardLiq: 0,
                        claimableLiq: 0,
                        crossTime: 0,
                        latestUpdateTime: Math.floor(Date.now() / 1000),
                    };

                    const limitOrderData = await getLimitOrderData(
                        mockServerOrder,
                        tokenList,
                        crocEnv,
                        provider,
                        chainId,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                        cachedEnsResolve,
                    );

                    const totalValueUSD = limitOrderData.totalValueUSD;

                    const onChainOrder: LimitOrderIF = {
                        positionLiq: liqNum,
                        positionLiqBase: positionLiqBase,
                        positionLiqQuote: positionLiqQuote,
                        totalValueUSD:
                            usdValue + (totalValueUSD ? totalValueUSD : 0) ||
                            totalValueUSD
                                ? totalValueUSD
                                : 0,
                        base: pendingOrder.txDetails.baseAddress,
                        quote: pendingOrder.txDetails.quoteAddress,
                        baseDecimals:
                            pendingOrder.txDetails.baseTokenDecimals || 0,
                        quoteDecimals:
                            pendingOrder.txDetails.quoteTokenDecimals || 0,
                        baseSymbol: pendingOrder.txDetails.baseSymbol || '',
                        quoteSymbol: pendingOrder.txDetails.quoteSymbol || '',
                        baseName: limitOrderData.baseName,
                        quoteName: limitOrderData.quoteName,
                        poolIdx: limitOrderData.poolIdx,
                        bidTick: limitOrderData.bidTick,
                        user: limitOrderData.user,
                        askTick: limitOrderData.askTick,
                        isBid: limitOrderData.isBid,
                        timeFirstMint: limitOrderData.timeFirstMint,
                        latestUpdateTime: limitOrderData.latestUpdateTime,
                        concLiq: limitOrderData.concLiq,
                        rewardLiq: limitOrderData.rewardLiq,
                        id: limitOrderData.id,

                        limitOrderId: limitOrderData.limitOrderId,
                        positionHash: limitOrderData.positionHash,
                        pivotTime: limitOrderData.pivotTime,
                        crossTime: limitOrderData.crossTime,
                        curentPoolPriceDisplayNum:
                            limitOrderData.curentPoolPriceDisplayNum,
                        askTickInvPriceDecimalCorrected:
                            limitOrderData.askTickInvPriceDecimalCorrected,
                        askTickPriceDecimalCorrected:
                            limitOrderData.askTickPriceDecimalCorrected,
                        bidTickInvPriceDecimalCorrected:
                            limitOrderData.bidTickInvPriceDecimalCorrected,
                        bidTickPriceDecimalCorrected:
                            limitOrderData.bidTickPriceDecimalCorrected,
                        originalPositionLiqBase:
                            limitOrderData.originalPositionLiqBase,
                        originalPositionLiqQuote:
                            limitOrderData.originalPositionLiqQuote,
                        expectedPositionLiqBase:
                            limitOrderData.expectedPositionLiqBase,
                        expectedPositionLiqQuote:
                            limitOrderData.expectedPositionLiqQuote,
                        positionLiqBaseDecimalCorrected:
                            limitOrderData.positionLiqBaseDecimalCorrected,
                        positionLiqQuoteDecimalCorrected:
                            limitOrderData.positionLiqQuoteDecimalCorrected,
                        originalPositionLiqBaseDecimalCorrected:
                            limitOrderData.originalPositionLiqBaseDecimalCorrected,
                        originalPositionLiqQuoteDecimalCorrected:
                            limitOrderData.originalPositionLiqQuoteDecimalCorrected,
                        expectedPositionLiqBaseDecimalCorrected:
                            limitOrderData.expectedPositionLiqBaseDecimalCorrected,
                        expectedPositionLiqQuoteDecimalCorrected:
                            limitOrderData.expectedPositionLiqQuoteDecimalCorrected,
                        claimableLiq: limitOrderData.claimableLiq,
                        claimableLiqPivotTimes:
                            limitOrderData.claimableLiqPivotTimes,
                        claimableLiqBase: limitOrderData.claimableLiqBase,
                        claimableLiqQuote: limitOrderData.claimableLiqQuote,
                        claimableLiqBaseDecimalCorrected:
                            limitOrderData.claimableLiqBaseDecimalCorrected,
                        claimableLiqQuoteDecimalCorrected:
                            limitOrderData.claimableLiqQuoteDecimalCorrected,
                        baseTokenLogoURI: limitOrderData.baseTokenLogoURI,
                        quoteTokenLogoURI: limitOrderData.quoteTokenLogoURI,
                        limitPrice: limitOrderData.limitPrice,
                        invLimitPrice: limitOrderData.invLimitPrice,
                        limitPriceDecimalCorrected:
                            limitOrderData.limitPriceDecimalCorrected,
                        invLimitPriceDecimalCorrected:
                            limitOrderData.invLimitPriceDecimalCorrected,
                        baseUsdPrice: limitOrderData.baseUsdPrice,
                        quoteUsdPrice: limitOrderData.quoteUsdPrice,
                        isBaseTokenMoneynessGreaterOrEqual:
                            limitOrderData.isBaseTokenMoneynessGreaterOrEqual,
                        ensResolution: limitOrderData.ensResolution,
                        chainId: limitOrderData.chainId,
                    };

                    addRecentlyUpdatedOrder(
                        pendingOrder.txType || '',
                        pendingOrder.txAction || '',
                        onChainOrder,
                        Date.now(),
                    );

                    return onChainOrder;
                }),
            );

            // setUnindexedUpdatedOrders([...updatedOrders]);
        })();
    }, [JSON.stringify(relevantTransactionsByType), lastBlockNumber]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const getPositionHashFromRelevantTransactions = (pos: any) => {
        return getPositionHash(undefined, {
            isPositionTypeAmbient: false,
            user: pos.userAddress,
            baseAddress: pos.txDetails?.baseAddress || '',
            quoteAddress: pos.txDetails?.quoteAddress || '',
            poolIdx: pos.txDetails?.poolIdx || 0,
            bidTick: pos.txDetails?.lowTick || 0,
            askTick: pos.txDetails?.highTick || 0,
        });
    };

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

            const matchingPosition = listOfRecentlyUpdatedOrders.find(
                (recentlyUpdatedOrder) => {
                    return pendingPosHash === recentlyUpdatedOrder.positionHash;
                },
            );
            return !matchingPosition;
        });
    }, [relevantTransactionsByType, listOfRecentlyUpdatedOrders]);

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

    // infinite scroll ------------------------------------------------------------------------------------------------------------------------------

    const mergeDataWithPendingOrders = (
        data: LimitOrderIF[],
        pendingOrders: RecentlyUpdatedPosition[],
    ): { mergedList: LimitOrderIF[]; recentlyUpdatedCount: number } => {
        const updatedHashes = new Set();
        const recentlyUpdatedToShow: LimitOrderIF[] = [];

        pendingOrders.forEach((e) => {
            const isFresh =
                Math.floor(e.timestamp / 1000) - Math.floor(Date.now() / 1000) <
                60;
            // if(e.action !== 'Remove' && e.timestamp < Date.now() / 1000 - 60) {
            if (isFresh) {
                if (e.action !== 'Remove') {
                    recentlyUpdatedToShow.push(e.order);
                }
                updatedHashes.add(e.positionHash);
            }
        });

        const mergedList: LimitOrderIF[] = [
            ...recentlyUpdatedToShow.reverse(),
            ...data.filter((e) => !updatedHashes.has(e.positionHash)),
        ];

        return {
            mergedList,
            recentlyUpdatedCount: recentlyUpdatedToShow.length,
        };
    };

    const sortedLimitsToDisplayAccount = useMemo(() => {
        const { mergedList } = mergeDataWithPendingOrders(
            sortedLimits,
            listOfRecentlyUpdatedOrders,
        );
        return mergedList;
    }, [sortedLimits, listOfRecentlyUpdatedOrders]);

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
                    // <TableRowsInfiniteScroll
                    //     type='Order'
                    //     data={sortedLimitDataToDisplay}
                    //     tableView={tableView}
                    //     isAccountView={isAccountView}
                    //     fetcherFunction={addMoreData}
                    //     sortBy={sortBy}
                    //     showAllData={showAllData}
                    //     moreDataAvailable={moreDataAvailableRef.current}
                    //     pagesVisible={pagesVisible}
                    //     setPagesVisible={setPagesVisible}
                    //     extraPagesAvailable={extraPagesAvailable}
                    //     // setExtraPagesAvailable={setExtraPagesAvailable}
                    //     tableKey='Orders'
                    //     dataPerPage={dataPerPage}
                    //     pageDataCount={pageDataCountRef.current.counts}
                    //     lastFetchedCount={lastFetchedCount}
                    //     setLastFetchedCount={setLastFetchedCount}
                    //     moreDataLoading={moreDataLoading}
                    // />
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
            {/* <DebugDiv title= 'relevant transactions'
            left={700}
            top={100}
            >
                {
                    relevantTransactionsByType.map((tx, idx) => (                 
                        <div key={`updated-${idx}`}> {getPositionHashFromRelevantTransactions(tx).substring(0,6)} {tx.txAction} </div>
                    ))
                }
            </DebugDiv> */}
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
