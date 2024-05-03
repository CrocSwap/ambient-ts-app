// START: Import React and Dongles
import { useEffect, useState, useContext, memo, useRef, useMemo } from 'react';

// START: Import Local Files
import { Pagination } from '@mui/material';
import { useSortedPositions } from '../useSortedPositions';
import { PositionIF, PositionServerIF } from '../../../../ambient-utils/types';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import RangeHeader from './RangesTable/RangeHeader';
import NoTableData from '../NoTableData/NoTableData';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import usePagination from '../../../Global/Pagination/usePagination';
import { RowsPerPageDropdown } from '../../../Global/Pagination/RowsPerPageDropdown';
import Spinner from '../../../Global/Spinner/Spinner';
import { useLocation } from 'react-router-dom';
import { RangeContext } from '../../../../contexts/RangeContext';
import { ChartContext } from '../../../../contexts/ChartContext';
import { RangesRowPlaceholder } from './RangesTable/RangesRowPlaceholder';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import {
    RangeRow as RangeRowStyled,
    ViewMoreButton,
} from '../../../../styled/Components/TransactionTable';
import { FlexContainer, Text } from '../../../../styled/Common';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { DataLoadingContext } from '../../../../contexts/DataLoadingContext';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import TableRows from '../TableRows';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import {
    bigNumToFloat,
    baseTokenForConcLiq,
    tickToPrice,
    quoteTokenForConcLiq,
    priceToTick,
} from '@crocswap-libs/sdk';
import { getPositionData } from '../../../../ambient-utils/dataLayer';
import { TokenContext } from '../../../../contexts/TokenContext';
import { getPositionHash } from '../../../../ambient-utils/dataLayer/functions/getPositionHash';

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

    const { showAllData: showAllDataSelection, toggleTradeTable } =
        useContext(TradeTableContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { tokens } = useContext(TokenContext);

    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const { setCurrentRangeInReposition } = useContext(RangeContext);
    const { tradeTableState } = useContext(ChartContext);
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
    const isTradeTableExpanded =
        !isAccountView && tradeTableState === 'Expanded';

    const { userAddress } = useContext(UserDataContext);

    const {
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

    const rangeData = useMemo(
        () =>
            isAccountView
                ? activeAccountPositionData || []
                : !showAllData
                ? userPositionsByPool?.positions
                : positionsByPool.positions.filter(
                      (position) => position.positionLiq != 0,
                  ),
        [
            showAllData,
            isAccountView,
            activeAccountPositionData,
            positionsByPool,
            userPositionsByPool,
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
    const isSmallScreen = useMediaQuery('(max-width: 700px)');
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

    useEffect(() => {
        setCurrentPage(1);
    }, [userAddress, showAllData, baseTokenAddress + quoteTokenAddress]);

    const [page, setPage] = useState(1);
    const resetPageToFirst = () => setPage(1);

    // const isScreenShort =
    //     (isAccountView && useMediaQuery('(max-height: 900px)')) ||
    //     (!isAccountView && useMediaQuery('(max-height: 700px)'));

    // const isScreenTall =
    //     (isAccountView && useMediaQuery('(min-height: 1100px)')) ||
    //     (!isAccountView && useMediaQuery('(min-height: 1000px)'));

    const _DATA = usePagination(
        sortedPositions,
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
    const tradePageCheck = isTradeTableExpanded && rangeData.length > 10;

    const listRef = useRef<HTMLUListElement>(null);
    const sPagination = useMediaQuery('(max-width: 800px)');

    const footerDisplay = rowsPerPage > 0 &&
        ((isAccountView && rangeData.length > 10) ||
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
                    itemCount={sortedPositions.length}
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
            show: tableView !== 'large',
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

    useEffect(() => {
        if (_DATA.currentData.length && !isTradeTableExpanded) {
            setCurrentPage(1);
            const mockEvent = {} as React.ChangeEvent<unknown>;
            handleChange(mockEvent, 1);
        }
    }, [isTradeTableExpanded]);

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
                        ? await pos.queryAmbient()
                        : await pos.queryRangePos(
                              pendingPositionUpdate.txDetails.lowTick || 0,
                              pendingPositionUpdate.txDetails.highTick || 0,
                          );
                    const poolPriceInTicks = priceToTick(poolPriceNonDisplay);

                    let positionLiqBase, positionLiqQuote;

                    if (!pendingPositionUpdate.txDetails)
                        return {} as PositionIF;
                    const liqBigNum = pendingPositionUpdate.txDetails.isAmbient
                        ? position.seeds
                        : position.liq;
                    const liqNum = bigNumToFloat(liqBigNum);
                    if (pendingPositionUpdate.txDetails.isAmbient) {
                        positionLiqBase =
                            liqNum * Math.sqrt(poolPriceNonDisplay);
                        positionLiqQuote =
                            liqNum / Math.sqrt(poolPriceNonDisplay);
                    } else {
                        positionLiqBase = bigNumToFloat(
                            baseTokenForConcLiq(
                                poolPriceNonDisplay,
                                liqBigNum,
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
                        positionLiqQuote = bigNumToFloat(
                            quoteTokenForConcLiq(
                                poolPriceNonDisplay,
                                liqBigNum,
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
                        timeFirstMint: position.timestamp, // from on-chain call (not updated for removes?)
                        latestUpdateTime: position.timestamp, // from on-chain call (not updated for removes?)
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
        unindexedNonFailedSessionPositionUpdates.length === 0;

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

    const rangeDataOrNull = !shouldDisplayNoTableData ? (
        <div>
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
                        _DATA.currentData
                            .filter(
                                (pos) =>
                                    // remove existing row for adds
                                    !unindexedUpdatedPositionHashes.includes(
                                        pos.positionId,
                                    ),
                            )
                            // only show empty positions on account view
                            .filter(
                                (pos) => isAccountView || pos.positionLiq !== 0,
                            ),
                    )}
                    fullData={unindexedUpdatedPositions.concat(fullData)}
                    isAccountView={isAccountView}
                    tableView={tableView}
                />
            </ul>
            {
                // Show a 'View More' button at the end of the table when collapsed (half-page) and it's not a /account render
                !isTradeTableExpanded &&
                    !props.isAccountView &&
                    sortedPositions.length > rowsPerPage && (
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
    ) : (
        <NoTableData type='liquidity' isAccountView={isAccountView} />
    );

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
                    rangeDataOrNull
                )}
            </div>

            {footerDisplay}
        </FlexContainer>
    );
}

export default memo(Ranges);
