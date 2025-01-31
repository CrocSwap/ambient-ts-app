/* eslint-disable no-irregular-whitespace */
import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useLocation } from 'react-router-dom';
import { LS_KEY_HIDE_EMPTY_POSITIONS_ON_ACCOUNT } from '../../../../ambient-utils/constants';
import { getPositionData } from '../../../../ambient-utils/dataLayer/functions/getPositionData';
import { PositionIF, PositionServerIF } from '../../../../ambient-utils/types';
import {
    AppStateContext,
    CachedDataContext,
    CrocEnvContext,
    TokenContext,
} from '../../../../contexts';
import { DataLoadingContext } from '../../../../contexts/DataLoadingContext';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
import { RangeContext } from '../../../../contexts/RangeContext';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FlexContainer } from '../../../../styled/Common';
import {
    HideEmptyPositionContainer,
    RangeRow as RangeRowStyled,
} from '../../../../styled/Components/TransactionTable';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import Toggle from '../../../Form/Toggle';
import Spinner from '../../../Global/Spinner/Spinner';
import InfiniteScroll from '../../InfiniteScroll/InfiniteScroll';
import useMergeWithPendingTxs from '../../InfiniteScroll/useMergeWithPendingTxs';
import NoTableData from '../NoTableData/NoTableData';
import TableRows from '../TableRows';
import { useSortedPositions } from '../useSortedPositions';
import RangeHeader from './RangesTable/RangeHeader';
import { RangesRowPlaceholder } from './RangesTable/RangesRowPlaceholder';

// interface for props
interface propsIF {
    activeAccountPositionData?: PositionIF[];
    connectedAccountActive?: boolean;
    isAccountView: boolean;
    unselectCandle?: () => void;
}

// react functional component
function Ranges(props: propsIF) {
    const {
        activeAccountPositionData,
        connectedAccountActive,
        isAccountView,
        unselectCandle,
    } = props;

    const {
        showAllData: showAllDataSelection,
        hideEmptyPositionsOnAccount,
        setHideEmptyPositionsOnAccount,
    } = useContext(TradeTableContext);

    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const { setCurrentRangeInReposition } = useContext(RangeContext);

    const {
        activeNetwork: { poolIndex, GCGO_URL, chainId },
    } = useContext(AppStateContext);

    const { tokens } = useContext(TokenContext);
    const { crocEnv, provider } = useContext(CrocEnvContext);

    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);

    // only show all data when on trade tabs page
    const showAllData = !isAccountView && showAllDataSelection;

    const { userAddress } = useContext(UserDataContext);

    const {
        positionsByUser,
        userPositionsByPool,
        positionsByPool,
        setUserPositionsByPool,
        pendingRecentlyUpdatedPositions,
    } = useContext(GraphDataContext);
    const dataLoadingStatus = useContext(DataLoadingContext);

    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const baseTokenSymbol = baseToken.symbol;
    const quoteTokenSymbol = quoteToken.symbol;
    const path = useLocation().pathname;

    if (!path.includes('reposition')) {
        setCurrentRangeInReposition('');
    }

    const activeUserPositionsInOtherPoolsLength = useMemo(
        () =>
            isAccountView
                ? activeAccountPositionData
                    ? activeAccountPositionData.filter(
                          (position) => position.positionLiq != 0,
                      ).length
                    : 0
                : positionsByUser.positions.filter(
                      (position) =>
                          position.positionLiq != 0 &&
                          (position.base.toLowerCase() !==
                              baseToken.address.toLowerCase() ||
                              position.quote.toLowerCase() !==
                                  quoteToken.address.toLowerCase() ||
                              position.poolIdx !== poolIndex),
                  ).length,
        [
            activeAccountPositionData,
            positionsByUser,
            isAccountView,
            baseToken.address,
            quoteToken.address,
            poolIndex,
        ],
    );

    const activeUserPositionsByPool = useMemo(
        () =>
            userPositionsByPool?.positions.filter(
                (position) => position.positionLiq != 0,
            ),
        [userPositionsByPool],
    );

    // infinite scroll props, methods ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const [showInfiniteScroll, setShowInfiniteScroll] = useState<boolean>(
        !isAccountView && showAllData,
    );

    useEffect(() => {
        setShowInfiniteScroll(!isAccountView && showAllData);
    }, [isAccountView, showAllData]);

    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const rangeData = useMemo(
        () =>
            isAccountView
                ? activeAccountPositionData || []
                : !showAllData
                  ? activeUserPositionsByPool
                  : positionsByPool.positions,
        [
            showAllData,
            isAccountView,
            activeAccountPositionData,
            activeUserPositionsByPool,
            positionsByPool,
        ],
    );

    useEffect(() => {
        if (
            showAllData ||
            !userAddress ||
            !baseToken ||
            !quoteToken ||
            !poolIndex ||
            !GCGO_URL ||
            !crocEnv
        )
            return;
        // retrieve user_pool_positions
        const userPoolPositionsCacheEndpoint =
            GCGO_URL + '/user_pool_positions?';
        const forceOnchainLiqUpdate = true;
        fetch(
            userPoolPositionsCacheEndpoint +
                new URLSearchParams({
                    user: userAddress,
                    base: baseToken.address.toLowerCase(),
                    quote: quoteToken.address.toLowerCase(),
                    poolIdx: poolIndex.toString(),
                    chainId: chainId,
                }),
        )
            .then((response) => response.json())
            .then((json) => {
                const userPoolPositions = json.data;
                const skipENSFetch = true;

                if (userPoolPositions) {
                    Promise.all(
                        userPoolPositions.map((position: PositionServerIF) => {
                            return getPositionData(
                                position,
                                tokens.tokenUniv,
                                crocEnv,
                                provider,
                                chainId,
                                cachedFetchTokenPrice,
                                cachedQuerySpotPrice,
                                cachedTokenDetails,
                                cachedEnsResolve,
                                skipENSFetch,
                                forceOnchainLiqUpdate,
                            );
                        }),
                    )
                        .then((updatedPositions) => {
                            setUserPositionsByPool({
                                dataReceived: true,
                                positions: updatedPositions,
                            });
                            dataLoadingStatus.setDataLoadingStatus({
                                datasetName:
                                    'isConnectedUserPoolRangeDataLoading',
                                loadingStatus: false,
                            });
                        })
                        .catch(console.error);
                } else {
                    setUserPositionsByPool({
                        dataReceived: false,
                        positions: [],
                    });
                    dataLoadingStatus.setDataLoadingStatus({
                        datasetName: 'isConnectedUserPoolRangeDataLoading',
                        loadingStatus: false,
                    });
                }
            })
            .catch(console.error);
    }, [userAddress, showAllData]);

    // ------------------------------------------------------------------------------------------------------------------------------

    const isLoading = useMemo(
        () =>
            isAccountView && connectedAccountActive
                ? dataLoadingStatus.isConnectedUserRangeDataLoading
                : isAccountView
                  ? dataLoadingStatus.isLookupUserRangeDataLoading
                  : !showAllData
                    ? dataLoadingStatus.isConnectedUserPoolRangeDataLoading
                    : dataLoadingStatus.isPoolRangeDataLoading,
        [
            showAllData,
            isAccountView,
            connectedAccountActive,
            dataLoadingStatus.isConnectedUserRangeDataLoading,
            dataLoadingStatus.isConnectedUserPoolRangeDataLoading,
            dataLoadingStatus.isLookupUserRangeDataLoading,
            dataLoadingStatus.isPoolRangeDataLoading,
        ],
    );

    const [
        sortBy,
        setSortBy,
        reverseSort,
        setReverseSort,
        sortedPositions,
        sortData,
    ] = useSortedPositions('time', rangeData);

    // TODO: Use these as media width constants
    const isSmallScreen = useMediaQuery('(max-width: 768px)');
    const isTabletScreen = useMediaQuery(
        '(min-width: 768px) and (max-width: 1200px)',
    );
    const isLargeScreen = useMediaQuery('(min-width: 2000px)');
    const isLargeScreenAccount = useMediaQuery('(min-width: 1600px)');

    const tableView =
        isSmallScreen ||
        isTabletScreen ||
        (isAccountView &&
            connectedAccountActive &&
            !isLargeScreenAccount &&
            isSidebarOpen)
            ? 'small'
            : !isSmallScreen && !isLargeScreen
              ? 'medium'
              : 'large';

    const filteredSortedPositions = useMemo(() => {
        // filter out empty positions on account view when hideEmptyPositionsOnAccount is true
        return hideEmptyPositionsOnAccount && isAccountView
            ? sortedPositions.filter((position) => position.positionLiq !== 0)
            : sortedPositions;
    }, [hideEmptyPositionsOnAccount, isAccountView, sortedPositions]);

    const _DATA = filteredSortedPositions;
    // , isScreenShort, isScreenTall

    const listRef = useRef<HTMLUListElement>(null);

    const userHasEmptyPositions = useMemo(
        () =>
            positionsByUser.positions.filter(
                (position) => position.positionLiq === 0,
            ).length > 0,
        [positionsByUser.positions],
    );

    const showEmptyToggleButton =
        connectedAccountActive && userHasEmptyPositions;

    const footerDisplay = (
        <FlexContainer
            alignItems='center'
            justifyContent='space-between'
            fullWidth
            flexDirection={isSmallScreen ? 'column' : 'row'}
            margin={isSmallScreen ? '20px auto' : '16px auto'}
        >
            {showEmptyToggleButton && (
                <HideEmptyPositionContainer
                    onClick={() => {
                        localStorage.setItem(
                            LS_KEY_HIDE_EMPTY_POSITIONS_ON_ACCOUNT,
                            String(!hideEmptyPositionsOnAccount),
                        );
                        setHideEmptyPositionsOnAccount(
                            !hideEmptyPositionsOnAccount,
                        );
                    }}
                    style={{ width: '100%' }}
                >
                    <p>Hide Empty Positions</p>

                    <Toggle
                        isOn={hideEmptyPositionsOnAccount}
                        disabled={false}
                        handleToggle={() => {
                            localStorage.setItem(
                                LS_KEY_HIDE_EMPTY_POSITIONS_ON_ACCOUNT,
                                String(!hideEmptyPositionsOnAccount),
                            );
                            setHideEmptyPositionsOnAccount(
                                !hideEmptyPositionsOnAccount,
                            );
                        }}
                        id='toggle_empty_positions_liquidity'
                        aria-label='toggle empty positions'
                    />
                </HideEmptyPositionContainer>
            )}
        </FlexContainer>
    );

    const minMax = (
        <>
            <p>Min</p>
            <p>Max</p>
        </>
    );
    const tokensDisplay = isAccountView ? (
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
            name: 'Wallet',
            className: 'wallet_id',
            show:
                !isAccountView &&
                (tableView === 'medium' || tableView === 'small'),
            slug: 'walletid',
            sortable: !isAccountView,
        },
        {
            name: 'Position ID',
            className: 'position_id',
            show: isAccountView && tableView !== 'small',
            slug: 'positionid',
            sortable: false,
        },
        {
            name: 'Min',
            show: tableView === 'large',
            slug: 'min',
            sortable: false,
            alignRight: true,
        },
        {
            name: 'Max',
            className: 'side',
            show: tableView === 'large',
            slug: 'max',
            sortable: false,
            alignRight: true,
        },
        {
            name: minMax,
            className: 'side_type',
            show: tableView === 'medium',
            slug: 'minMax',
            sortable: false,
            alignRight: true,
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
            name: tokensDisplay,
            className: 'tokens',
            show: tableView === 'medium',
            slug: 'tokens',
            sortable: false,
            alignRight: true,
        },
        {
            name: 'APR',
            className: 'apr',
            show: true,
            slug: 'apr',
            sortable: true,
            alignRight: true,
            rightPadding: 8,
        },
        {
            name: 'Status',
            className: 'status',
            show: true,
            slug: 'status',
            sortable: true,
            leftPadding: 8,
        },

        {
            name: '',
            className: '',
            show: true,
            slug: 'menu',
            sortable: false,
        },
    ];

    const headerColumnsDisplay = (
        <RangeRowStyled size={tableView} account={isAccountView} header>
            {headerColumns.map((header, idx) => (
                <RangeHeader
                    key={idx}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    reverseSort={reverseSort}
                    setReverseSort={setReverseSort}
                    header={header}
                />
            ))}
        </RangeRowStyled>
    );

    // const relevantTransactionsByType = transactionsByType.filter(
    //     (tx) =>
    //         !tx.isRemoved &&
    //         unindexedNonFailedSessionPositionUpdates.some(
    //             (update) => update.txHash === tx.txHash,
    //         ) &&
    //         tx.userAddress.toLowerCase() ===
    //             (userAddress || '').toLowerCase() &&
    //         tx.txDetails?.baseAddress.toLowerCase() ===
    //             baseToken.address.toLowerCase() &&
    //         tx.txDetails?.quoteAddress.toLowerCase() ===
    //             quoteToken.address.toLowerCase() &&
    //         tx.txDetails?.poolIdx === poolIndex,
    // );

    const { mergedData } = useMergeWithPendingTxs({
        type: 'Range',
        data: sortedPositions,
    });

    const shouldDisplayNoTableData = useMemo(
        () =>
            !isLoading &&
            !mergedData.length &&
            pendingRecentlyUpdatedPositions.length === 0,
        [isLoading, mergedData.length, pendingRecentlyUpdatedPositions.length],
    );

    const sortedPositionsToDisplayAccount = useMemo(() => {
        return (
            (mergedData as PositionIF[])
                // .filter((e) => !blackList?.has(e.positionId))
                .filter(
                    (pos) =>
                        (isAccountView && !hideEmptyPositionsOnAccount) ||
                        pos.positionLiq !== 0,
                )
        );
    }, [mergedData]);

    // const pendingPositionsToDisplayPlaceholder = useMemo(() => {
    //     return relevantTransactionsByType.filter((pos) => {
    //         const pendingPosHash = getPositionHash(undefined, {
    //             isPositionTypeAmbient: pos.txDetails?.isAmbient || false,
    //             user: pos.userAddress,
    //             baseAddress: pos.txDetails?.baseAddress || '',
    //             quoteAddress: pos.txDetails?.quoteAddress || '',
    //             poolIdx: pos.txDetails?.poolIdx || 0,
    //             bidTick: pos.txDetails?.lowTick || 0,
    //             askTick: pos.txDetails?.highTick || 0,
    //         });
    //         const matchingPosition = recentlyUpdatedPositions.find(
    //             (unindexedPosition) => {
    //                 return pendingPosHash === unindexedPosition.positionHash;
    //             },
    //         );
    //         return !matchingPosition;
    //     });
    // }, [relevantTransactionsByType, recentlyUpdatedPositions]);

    const handleKeyDownViewRanges = (
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

    const rangeDataOrNull = shouldDisplayNoTableData ? (
        <NoTableData
            type='liquidity'
            isAccountView={isAccountView}
            activeUserPositionsLength={activeUserPositionsInOtherPoolsLength}
            activeUserPositionsByPoolLength={mergedData.length}
            unselectCandle={unselectCandle}
        />
    ) : (
        <div onKeyDown={handleKeyDownViewRanges} style={{ height: '100%' }}>
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
                    pendingRecentlyUpdatedPositions.length > 0 &&
                    pendingRecentlyUpdatedPositions.reverse().map((tx, idx) => (
                        <RangesRowPlaceholder
                            key={idx}
                            transaction={{
                                hash: tx.txByType?.txHash || '',
                                side: tx.txByType?.txAction || '',
                                type: tx.txByType?.txType || '',
                                details: tx.txByType?.txDetails,
                            }}
                            tableView={tableView}
                        />
                    ))}
                {showInfiniteScroll ? (
                    <>
                        <InfiniteScroll
                            type='Range'
                            tableView={tableView}
                            isAccountView={isAccountView}
                            data={sortedPositions.filter(
                                (pos) => pos.positionLiq !== 0,
                            )}
                            dataPerPage={50}
                            fetchCount={200}
                            targetCount={30}
                            sortBy={sortBy}
                            showAllData={showAllData}
                            sortPositions={sortData}
                        />
                    </>
                ) : (
                    <TableRows
                        type='Range'
                        data={sortedPositionsToDisplayAccount}
                        fullData={sortedPositionsToDisplayAccount}
                        isAccountView={isAccountView}
                        tableView={tableView}
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
                    {rangeDataOrNull}
                </div>
            </div>
        );
    return (
        <>
            <FlexContainer
                flexDirection='column'
                style={{
                    height: isSmallScreen
                        ? '97%'
                        : !isAccountView
                          ? // ? '105%' //turned into 100% after moving footer display out of flexcontainer
                            '100%'
                          : '100%',
                    position: 'relative',
                }}
            >
                <div>{headerColumnsDisplay}</div>
                {/* <div key={elIDRef.current} style={{  position: 'absolute', top: 0, right: 0, background: 'var(--dark1)', padding: '.5rem'}}> {moreDataAvailableRef.current ? 'true' : 'false'} | {elIDRef.current}</div> */}

                <div
                    style={{ flex: 1, overflow: 'auto' }}
                    className='custom_scroll_ambient'
                >
                    {isLoading ? (
                        <Spinner size={100} bg='var(--dark1)' centered />
                    ) : (
                        rangeDataOrNull
                    )}
                </div>
                {isAccountView && footerDisplay}
            </FlexContainer>
        </>
    );
}

export default memo(Ranges);
