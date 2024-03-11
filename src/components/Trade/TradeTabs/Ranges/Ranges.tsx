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

const NUM_RANGES_WHEN_COLLAPSED = 10; // Number of ranges we show when the table is collapsed (i.e. half page)
// NOTE: this is done to improve rendering speed for this page.

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

    const [updatedPendingPositions, setUpdatedPendingPositions] = useState<
        PositionIF[]
    >([]);

    useEffect(() => {
        (async () => {
            if (relevantTransactionsByType.length === 0) {
                setUpdatedPendingPositions([]);
            }
            const newAdds = relevantTransactionsByType.filter((tx) => {
                return tx.txAction === 'Add';
            });
            const newPositions = await Promise.all(
                newAdds.map(async (pendingPosition) => {
                    if (!crocEnv || !pendingPosition.txDetails)
                        return {} as PositionIF;
                    const pos = crocEnv.positions(
                        pendingPosition.txDetails.baseAddress,
                        pendingPosition.txDetails.quoteAddress,
                        pendingPosition.userAddress,
                    );

                    const poolPriceNonDisplay = await cachedQuerySpotPrice(
                        crocEnv,
                        baseTokenAddress,
                        quoteTokenAddress,
                        chainId,
                        lastBlockNumber,
                    );

                    const poolPriceInTicks = priceToTick(poolPriceNonDisplay);

                    let positionLiqBase, positionLiqQuote;

                    if (!pendingPosition.txDetails) return {} as PositionIF;
                    const liqBigNum = pendingPosition.txDetails.isAmbient
                        ? (await pos.queryAmbient()).seeds
                        : (
                              await pos.queryRangePos(
                                  pendingPosition.txDetails.lowTick || 0,
                                  pendingPosition.txDetails.highTick || 0,
                              )
                          ).liq;
                    const liqNum = bigNumToFloat(liqBigNum);
                    if (pendingPosition.txDetails.isAmbient) {
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
                                    pendingPosition.txDetails.lowTick || 0,
                                ),
                                tickToPrice(
                                    pendingPosition.txDetails.highTick || 0,
                                ),
                            ),
                        );
                        positionLiqQuote = bigNumToFloat(
                            quoteTokenForConcLiq(
                                poolPriceNonDisplay,
                                liqBigNum,
                                tickToPrice(
                                    pendingPosition.txDetails.lowTick || 0,
                                ),
                                tickToPrice(
                                    pendingPosition.txDetails.highTick || 0,
                                ),
                            ),
                        );
                    }

                    const currentTime = Math.floor(Date.now() / 1000);

                    const posHash = getPositionHash(undefined, {
                        isPositionTypeAmbient:
                            pendingPosition.txDetails.isAmbient || false,
                        user: pendingPosition.userAddress,
                        baseAddress: pendingPosition.txDetails.baseAddress,
                        quoteAddress: pendingPosition.txDetails.quoteAddress,
                        poolIdx: pendingPosition.txDetails.poolIdx,
                        bidTick: pendingPosition.txDetails.lowTick || 0,
                        askTick: pendingPosition.txDetails.highTick || 0,
                    });

                    const mockServerPosition: PositionServerIF = {
                        positionId: posHash,
                        chainId: chainId,
                        askTick: pendingPosition.txDetails.highTick || 0,
                        bidTick: pendingPosition.txDetails.lowTick || 0,
                        poolIdx: pendingPosition.txDetails.poolIdx,
                        base: pendingPosition.txDetails.baseAddress,
                        quote: pendingPosition.txDetails.quoteAddress,
                        user: pendingPosition.userAddress,
                        ambientLiq: pendingPosition.txDetails.isAmbient
                            ? liqNum
                            : 0,
                        concLiq: !pendingPosition.txDetails.isAmbient
                            ? liqNum
                            : 0,
                        rewardLiq: 0, // unknown
                        positionType: pendingPosition.txDetails.isAmbient
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
                        lastBlockNumber,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                        cachedEnsResolve,
                        true,
                    );
                    const onChainPosition: PositionIF = {
                        chainId: chainId,
                        base: pendingPosition.txDetails.baseAddress,
                        quote: pendingPosition.txDetails.quoteAddress,
                        poolIdx: pendingPosition.txDetails.poolIdx,
                        bidTick: pendingPosition.txDetails.lowTick,
                        askTick: pendingPosition.txDetails.highTick,
                        isBid: pendingPosition.txDetails.isBid,
                        user: pendingPosition.userAddress,
                        timeFirstMint: currentTime, // unknown
                        latestUpdateTime: currentTime, // unknown
                        lastMintTx: '', // unknown
                        firstMintTx: '', // unknown
                        positionType: pendingPosition.txDetails.isAmbient
                            ? 'ambient'
                            : 'concentrated',
                        ambientLiq: pendingPosition.txDetails.isAmbient
                            ? liqNum
                            : 0,
                        concLiq: !pendingPosition.txDetails.isAmbient
                            ? liqNum
                            : 0,
                        rewardLiq: 0, // unknown
                        liqRefreshTime: 0, // unknown
                        aprDuration: 0, // unknown
                        aprPostLiq: 0,
                        aprContributedLiq: 0,
                        // aprEst: 0,
                        poolPriceInTicks: poolPriceInTicks,
                        isPositionInRange: true, // unknown
                        baseDecimals:
                            pendingPosition.txDetails.baseTokenDecimals,
                        quoteDecimals:
                            pendingPosition.txDetails.quoteTokenDecimals,
                        baseSymbol: pendingPosition.txDetails.baseSymbol,
                        quoteSymbol: pendingPosition.txDetails.quoteSymbol,
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

            const definedPositions: PositionIF[] = newPositions.filter(
                (position) => position !== undefined,
            ) as PositionIF[];
            if (definedPositions.length)
                setUpdatedPendingPositions(definedPositions);
        })();
    }, [JSON.stringify(relevantTransactionsByType), lastBlockNumber]);

    const shouldDisplayNoTableData =
        !isLoading &&
        !rangeData.length &&
        unindexedNonFailedSessionPositionUpdates.length === 0;

    const updatedPositionHashes = updatedPendingPositions.map(
        (pos) => pos.positionId,
    );

    const pendingPositionsToDisplayPlaceholder =
        relevantTransactionsByType.filter(
            (pos) =>
                !updatedPositionHashes.includes(
                    getPositionHash(undefined, {
                        isPositionTypeAmbient:
                            pos.txDetails?.isAmbient || false,
                        user: pos.userAddress,
                        baseAddress: pos.txDetails?.baseAddress || '',
                        quoteAddress: pos.txDetails?.quoteAddress || '',
                        poolIdx: pos.txDetails?.poolIdx || 0,
                        bidTick: pos.txDetails?.lowTick || 0,
                        askTick: pos.txDetails?.highTick || 0,
                    }),
                    // prevent placeholder from disappearing when the update is an add
                ) || pos.txDescription.startsWith('Add to Range'),
        );

    const rangeDataOrNull = !shouldDisplayNoTableData ? (
        <div>
            <ul ref={listRef} id='current_row_scroll'>
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
                    data={updatedPendingPositions.concat(
                        _DATA.currentData.filter(
                            (pos) =>
                                // remove existing row for adds
                                !updatedPositionHashes.includes(pos.positionId),
                        ),
                    )}
                    fullData={updatedPendingPositions.concat(fullData)}
                    isAccountView={isAccountView}
                    tableView={tableView}
                />
            </ul>
            {
                // Show a 'View More' button at the end of the table when collapsed (half-page) and it's not a /account render
                !isTradeTableExpanded &&
                    !props.isAccountView &&
                    sortedPositions.length > NUM_RANGES_WHEN_COLLAPSED && (
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
        <FlexContainer flexDirection='column' fullHeight={!isSmallScreen}>
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
