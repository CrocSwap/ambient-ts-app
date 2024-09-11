// START: Import React and Dongles
import { useEffect, useState, useContext, memo, useRef, useMemo } from 'react';

// START: Import Local Files
import { useSortedPositions } from '../useSortedPositions';
import { PositionIF, PositionServerIF } from '../../../../ambient-utils/types';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import RangeHeader from './RangesTable/RangeHeader';
import NoTableData from '../NoTableData/NoTableData';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import Spinner from '../../../Global/Spinner/Spinner';
import { useLocation } from 'react-router-dom';
import { RangeContext } from '../../../../contexts/RangeContext';
import { RangesRowPlaceholder } from './RangesTable/RangesRowPlaceholder';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import {
    HideEmptyPositionContainer,
    RangeRow as RangeRowStyled,
} from '../../../../styled/Components/TransactionTable';
import { FlexContainer } from '../../../../styled/Common';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { DataLoadingContext } from '../../../../contexts/DataLoadingContext';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import TableRows from '../TableRows';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import {
    bigIntToFloat,
    baseTokenForConcLiq,
    tickToPrice,
    quoteTokenForConcLiq,
    priceToTick,
} from '@crocswap-libs/sdk';
import { getPositionData } from '../../../../ambient-utils/dataLayer';
import { TokenContext } from '../../../../contexts/TokenContext';
import { getPositionHash } from '../../../../ambient-utils/dataLayer/functions/getPositionHash';
import { LS_KEY_HIDE_EMPTY_POSITIONS_ON_ACCOUNT } from '../../../../ambient-utils/constants';
import Toggle from '../../../Form/Toggle';

// interface for props
interface propsIF {
    activeAccountPositionData?: PositionIF[];
    connectedAccountActive?: boolean;
    isAccountView: boolean;
}

// react functional component
function Ranges(props: propsIF) {
    const { activeAccountPositionData, connectedAccountActive, isAccountView } =
        props;

    const {
        showAllData: showAllDataSelection,
        hideEmptyPositionsOnAccount,
        setHideEmptyPositionsOnAccount,
    } = useContext(TradeTableContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { tokens } = useContext(TokenContext);

    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const { setCurrentRangeInReposition } = useContext(RangeContext);
    const {
        crocEnv,
        provider,
        chainData: { chainId, poolIndex },
    } = useContext(CrocEnvContext);

    const {
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
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
        unindexedNonFailedSessionPositionUpdates,
    } = useContext(GraphDataContext);
    const dataLoadingStatus = useContext(DataLoadingContext);

    const { transactionsByType } = useContext(ReceiptContext);

    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const baseTokenSymbol = baseToken.symbol;
    const quoteTokenSymbol = quoteToken.symbol;
    const baseTokenAddress = baseToken.address;
    const quoteTokenAddress = quoteToken.address;

    const path = useLocation().pathname;

    if (!path.includes('reposition')) {
        setCurrentRangeInReposition('');
    }

    const activeUserPositionsLength = useMemo(
        () =>
            isAccountView
                ? activeAccountPositionData
                    ? activeAccountPositionData.filter(
                          (position) => position.positionLiq != 0,
                      ).length
                    : 0
                : positionsByUser.positions.filter(
                      (position) => position.positionLiq != 0,
                  ).length,
        [activeAccountPositionData, positionsByUser, isAccountView],
    );

    const activeUserPositionsByPool = useMemo(
        () =>
            userPositionsByPool?.positions.filter(
                (position) => position.positionLiq != 0,
            ),
        [userPositionsByPool],
    );

    const rangeData = useMemo(
        () =>
            isAccountView
                ? activeAccountPositionData || []
                : !showAllData
                  ? activeUserPositionsByPool
                  : positionsByPool.positions.filter(
                        (position) => position.positionLiq != 0,
                    ),
        [
            showAllData,
            isAccountView,
            activeAccountPositionData,
            positionsByPool,
            activeUserPositionsByPool,
        ],
    );

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

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions] =
        useSortedPositions('time', rangeData);

    // TODO: Use these as media width constants
    const isSmallScreen = useMediaQuery('(max-width: 768px)');
    const isLargeScreen = useMediaQuery('(min-width: 2000px)');
    const isLargeScreenAccount = useMediaQuery('(min-width: 1600px)');

    const tableView =
        isSmallScreen ||
        (isAccountView &&
            connectedAccountActive &&
            !isLargeScreenAccount &&
            isSidebarOpen)
            ? 'small'
            : (!isSmallScreen && !isLargeScreen) ||
                (isAccountView &&
                    connectedAccountActive &&
                    isLargeScreenAccount &&
                    isSidebarOpen)
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

    // Changed this to have the sort icon be inline with the last row rather than under it
    const walID = (
        <>
            <p>Position ID</p>
            Wallet
        </>
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
            name: walID,
            className: 'wallet_id',
            show:
                tableView === 'medium' ||
                (!isAccountView && tableView === 'small'),
            slug: 'walletid',
            sortable: !isAccountView,
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

    const relevantTransactionsByType = transactionsByType.filter(
        (tx) =>
            unindexedNonFailedSessionPositionUpdates.some(
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

    const [unindexedUpdatedPositions, setUnindexedUpdatedPositions] = useState<
        PositionIF[]
    >([]);

    useEffect(() => {
        (async () => {
            if (relevantTransactionsByType.length === 0) {
                setUnindexedUpdatedPositions([]);
            }
            const pendingPositionUpdates = relevantTransactionsByType.filter(
                (tx) => {
                    return (
                        tx.txAction === 'Add' ||
                        tx.txAction === 'Reposition' ||
                        tx.txAction === 'Remove' ||
                        tx.txAction === 'Harvest'
                    );
                },
            );
            const newlyUpdatedPositions = await Promise.all(
                pendingPositionUpdates.map(async (pendingPositionUpdate) => {
                    if (!crocEnv || !pendingPositionUpdate.txDetails)
                        return {} as PositionIF;
                    const pos = crocEnv.positions(
                        pendingPositionUpdate.txDetails.baseAddress,
                        pendingPositionUpdate.txDetails.quoteAddress,
                        pendingPositionUpdate.userAddress,
                    );

                    const poolPriceNonDisplay = await cachedQuerySpotPrice(
                        crocEnv,
                        baseTokenAddress,
                        quoteTokenAddress,
                        chainId,
                        lastBlockNumber,
                    );

                    const position = pendingPositionUpdate.txDetails.isAmbient
                        ? await pos.queryAmbientPos()
                        : await pos.queryRangePos(
                              pendingPositionUpdate.txDetails.lowTick || 0,
                              pendingPositionUpdate.txDetails.highTick || 0,
                          );
                    const poolPriceInTicks = priceToTick(poolPriceNonDisplay);

                    let positionLiqBase, positionLiqQuote;

                    if (!pendingPositionUpdate.txDetails)
                        return {} as PositionIF;
                    const liqBigInt = position.liq;
                    const liqNum = bigIntToFloat(liqBigInt);
                    if (pendingPositionUpdate.txDetails.isAmbient) {
                        positionLiqBase =
                            liqNum * Math.sqrt(poolPriceNonDisplay);
                        positionLiqQuote =
                            liqNum / Math.sqrt(poolPriceNonDisplay);
                    } else {
                        positionLiqBase = bigIntToFloat(
                            baseTokenForConcLiq(
                                poolPriceNonDisplay,
                                liqBigInt,
                                tickToPrice(
                                    pendingPositionUpdate.txDetails.lowTick ||
                                        0,
                                ),
                                tickToPrice(
                                    pendingPositionUpdate.txDetails.highTick ||
                                        0,
                                ),
                            ),
                        );
                        positionLiqQuote = bigIntToFloat(
                            quoteTokenForConcLiq(
                                poolPriceNonDisplay,
                                liqBigInt,
                                tickToPrice(
                                    pendingPositionUpdate.txDetails.lowTick ||
                                        0,
                                ),
                                tickToPrice(
                                    pendingPositionUpdate.txDetails.highTick ||
                                        0,
                                ),
                            ),
                        );
                    }

                    const currentTime = Math.floor(Date.now() / 1000);

                    const posHash = getPositionHash(undefined, {
                        isPositionTypeAmbient:
                            pendingPositionUpdate.txDetails.isAmbient || false,
                        user: pendingPositionUpdate.userAddress,
                        baseAddress:
                            pendingPositionUpdate.txDetails.baseAddress,
                        quoteAddress:
                            pendingPositionUpdate.txDetails.quoteAddress,
                        poolIdx: pendingPositionUpdate.txDetails.poolIdx,
                        bidTick: pendingPositionUpdate.txDetails.lowTick || 0,
                        askTick: pendingPositionUpdate.txDetails.highTick || 0,
                    });

                    const mockServerPosition: PositionServerIF = {
                        positionId: posHash,
                        chainId: chainId,
                        askTick: pendingPositionUpdate.txDetails.highTick || 0,
                        bidTick: pendingPositionUpdate.txDetails.lowTick || 0,
                        poolIdx: pendingPositionUpdate.txDetails.poolIdx,
                        base: pendingPositionUpdate.txDetails.baseAddress,
                        quote: pendingPositionUpdate.txDetails.quoteAddress,
                        user: pendingPositionUpdate.userAddress,
                        ambientLiq: pendingPositionUpdate.txDetails.isAmbient
                            ? liqNum
                            : 0,
                        concLiq: !pendingPositionUpdate.txDetails.isAmbient
                            ? liqNum
                            : 0,
                        rewardLiq: 0, // unknown
                        positionType: pendingPositionUpdate.txDetails.isAmbient
                            ? 'ambient'
                            : 'concentrated',
                        timeFirstMint: currentTime, // unknown
                        lastMintTx: '', // unknown
                        firstMintTx: '', // unknown
                        aprEst: 0, // unknown
                    };
                    const positionData = await getPositionData(
                        mockServerPosition,
                        tokens.tokenUniv,
                        crocEnv,
                        provider,
                        chainId,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                        cachedEnsResolve,
                        true,
                    );
                    const onChainPosition: PositionIF = {
                        chainId: chainId,
                        base: pendingPositionUpdate.txDetails.baseAddress,
                        quote: pendingPositionUpdate.txDetails.quoteAddress,
                        poolIdx: pendingPositionUpdate.txDetails.poolIdx,
                        bidTick: pendingPositionUpdate.txDetails.lowTick,
                        askTick: pendingPositionUpdate.txDetails.highTick,
                        isBid: pendingPositionUpdate.txDetails.isBid,
                        user: pendingPositionUpdate.userAddress,
                        timeFirstMint: Number(position.timestamp), // from on-chain call (not updated for removes?)
                        latestUpdateTime: Number(position.timestamp), // from on-chain call (not updated for removes?)
                        lastMintTx: '', // unknown
                        firstMintTx: '', // unknown
                        positionType: pendingPositionUpdate.txDetails.isAmbient
                            ? 'ambient'
                            : 'concentrated',
                        ambientLiq: pendingPositionUpdate.txDetails.isAmbient
                            ? liqNum
                            : 0,
                        concLiq: !pendingPositionUpdate.txDetails.isAmbient
                            ? liqNum
                            : 0,
                        rewardLiq: 0, // unknown
                        liqRefreshTime: currentTime, // unknown
                        aprDuration: 0, // unknown
                        aprPostLiq: 0,
                        aprContributedLiq: 0,
                        // aprEst: 0,
                        poolPriceInTicks: poolPriceInTicks,
                        isPositionInRange: true, // unknown
                        baseDecimals:
                            pendingPositionUpdate.txDetails.baseTokenDecimals,
                        quoteDecimals:
                            pendingPositionUpdate.txDetails.quoteTokenDecimals,
                        baseSymbol: pendingPositionUpdate.txDetails.baseSymbol,
                        quoteSymbol:
                            pendingPositionUpdate.txDetails.quoteSymbol,
                        baseName: '',
                        quoteName: '',
                        lowRangeDisplayInBase:
                            positionData.lowRangeDisplayInBase,
                        highRangeDisplayInBase:
                            positionData.highRangeDisplayInBase,
                        lowRangeDisplayInQuote:
                            positionData.lowRangeDisplayInQuote,
                        highRangeDisplayInQuote:
                            positionData.highRangeDisplayInQuote,
                        lowRangeShortDisplayInBase:
                            positionData.lowRangeShortDisplayInBase,
                        lowRangeShortDisplayInQuote:
                            positionData.lowRangeShortDisplayInQuote,
                        highRangeShortDisplayInBase:
                            positionData.highRangeShortDisplayInBase,
                        highRangeShortDisplayInQuote:
                            positionData.highRangeShortDisplayInQuote,
                        bidTickPriceDecimalCorrected:
                            positionData.bidTickPriceDecimalCorrected,
                        bidTickInvPriceDecimalCorrected:
                            positionData.bidTickInvPriceDecimalCorrected,
                        askTickPriceDecimalCorrected:
                            positionData.askTickPriceDecimalCorrected,
                        askTickInvPriceDecimalCorrected:
                            positionData.askTickInvPriceDecimalCorrected,
                        positionLiq: liqNum,
                        positionLiqBase: positionLiqBase,
                        positionLiqQuote: positionLiqQuote,
                        feesLiqBase: positionData.feesLiqBase,
                        feesLiqQuote: positionData.feesLiqQuote,
                        feesLiqBaseDecimalCorrected:
                            positionData.feesLiqBaseDecimalCorrected,
                        feesLiqQuoteDecimalCorrected:
                            positionData.feesLiqQuoteDecimalCorrected,
                        positionLiqBaseDecimalCorrected:
                            positionData.positionLiqBaseDecimalCorrected,
                        positionLiqQuoteDecimalCorrected:
                            positionData.positionLiqQuoteDecimalCorrected,
                        positionLiqBaseTruncated:
                            positionData.positionLiqBaseTruncated,
                        positionLiqQuoteTruncated:
                            positionData.positionLiqQuoteTruncated,
                        totalValueUSD: positionData.totalValueUSD,
                        apy: positionData.apy,
                        positionId: positionData.positionId,
                        onChainConstructedPosition: true,
                    } as PositionIF;

                    if (
                        onChainPosition.positionLiqBaseDecimalCorrected !== 0 ||
                        onChainPosition.positionLiqQuoteDecimalCorrected !== 0
                    ) {
                        return onChainPosition;
                    } else {
                        return undefined;
                    }
                }),
            );

            const definedUpdatedPositions: PositionIF[] =
                newlyUpdatedPositions.filter(
                    (position) => position !== undefined,
                ) as PositionIF[];
            if (definedUpdatedPositions.length)
                setUnindexedUpdatedPositions(definedUpdatedPositions);
        })();
    }, [JSON.stringify(relevantTransactionsByType), lastBlockNumber]);

    const shouldDisplayNoTableData =
        !isLoading &&
        !rangeData.length &&
        relevantTransactionsByType.length === 0;

    const unindexedUpdatedPositionHashes = unindexedUpdatedPositions.map(
        (pos) => pos.positionId,
    );

    const pendingPositionsToDisplayPlaceholder =
        relevantTransactionsByType.filter((pos) => {
            const pendingPosHash = getPositionHash(undefined, {
                isPositionTypeAmbient: pos.txDetails?.isAmbient || false,
                user: pos.userAddress,
                baseAddress: pos.txDetails?.baseAddress || '',
                quoteAddress: pos.txDetails?.quoteAddress || '',
                poolIdx: pos.txDetails?.poolIdx || 0,
                bidTick: pos.txDetails?.lowTick || 0,
                askTick: pos.txDetails?.highTick || 0,
            });
            const matchingPosition = unindexedUpdatedPositions.find(
                (unindexedPosition) => {
                    return pendingPosHash === unindexedPosition.positionId;
                },
            );
            const matchingPositionUpdatedInLastMinute =
                (matchingPosition?.liqRefreshTime || 0) -
                    (matchingPosition?.latestUpdateTime || 0) <
                60;
            // identify completed adds when update time in last minute (does not work for removes)
            return (
                !unindexedUpdatedPositionHashes.includes(pendingPosHash) ||
                (matchingPosition && !matchingPositionUpdatedInLastMinute)
                // show pulsing placeholder until existing position is updated
            );
        });

   

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
            activeUserPositionsLength={activeUserPositionsLength}
            activeUserPositionsByPoolLength={activeUserPositionsByPool.length}
        />
    ) : (
        <div onKeyDown={handleKeyDownViewRanges} style={{ height: '100%'}}>
            <ul
                ref={listRef}
                // id='current_row_scroll'
                style={{height: '100%'}}
            >
                {!isAccountView &&
                    pendingPositionsToDisplayPlaceholder.length > 0 &&
                    pendingPositionsToDisplayPlaceholder
                        .reverse()
                        .map((tx, idx) => (
                            <RangesRowPlaceholder
                                key={idx}
                                transaction={{
                                    hash: tx.txHash,
                                    side: tx.txAction,
                                    type: tx.txType,
                                    details: tx.txDetails,
                                }}
                                tableView={tableView}
                            />
                        ))}

                <TableRows
                    type='Range'
                    data={unindexedUpdatedPositions.concat(
                        filteredSortedPositions
                            .filter(
                                (pos) =>
                                    // remove existing row for adds
                                    !unindexedUpdatedPositionHashes.includes(
                                        pos.positionId,
                                    ),
                            )
                            // only show empty positions on account view
                            .filter(
                                (pos) =>
                                    (isAccountView &&
                                        !hideEmptyPositionsOnAccount) ||
                                    pos.positionLiq !== 0,
                            ),
                    )}
                    fullData={unindexedUpdatedPositions.concat(
                        filteredSortedPositions,
                    )}
                    isAccountView={isAccountView}
                    tableView={tableView}
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
                
            {rangeDataOrNull}   
</div>
        </div>
    )
    return (
        <FlexContainer
            flexDirection='column'
            style={{
                height: isSmallScreen
                    ? '97%'
                    : !isAccountView
                      ? '105%'
                      : '100%',
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
                    rangeDataOrNull
                )}
            </div>

            {footerDisplay}
        </FlexContainer>
    );
}

export default memo(Ranges);
