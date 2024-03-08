// START: Import React and Dongles
import { useEffect, useState, useContext, memo, useRef, useMemo } from 'react';

// START: Import Local Files
import { Pagination } from '@mui/material';
import { useSortedPositions } from '../useSortedPositions';
import { PositionIF } from '../../../../ambient-utils/types';
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
} from '@crocswap-libs/sdk';
import { getFormattedNumber } from '../../../../ambient-utils/dataLayer';

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

    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const { setCurrentRangeInReposition } = useContext(RangeContext);
    const { tradeTableState } = useContext(ChartContext);
    const {
        crocEnv,
        chainData: { chainId, poolIndex },
    } = useContext(CrocEnvContext);

    const { cachedQuerySpotPrice } = useContext(CachedDataContext);

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
            name: tokens,
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
        console.log({ updatedPendingPositions });
    }, [updatedPendingPositions]);

    useEffect(() => {
        (async () => {
            console.log({ relevantTransactionsByType });
            if (relevantTransactionsByType.length === 0) {
                setUpdatedPendingPositions([]);
            }
            const newPositions = await Promise.all(
                relevantTransactionsByType.map(async (pendingPosition) => {
                    if (!crocEnv || !pendingPosition.txDetails)
                        return {} as PositionIF;
                    const pos = crocEnv.positions(
                        pendingPosition.txDetails.baseAddress,
                        pendingPosition.txDetails.quoteAddress,
                        pendingPosition.userAddress,
                    );

                    const poolPriceNonDisplay = cachedQuerySpotPrice(
                        crocEnv,
                        baseTokenAddress,
                        quoteTokenAddress,
                        chainId,
                        lastBlockNumber,
                    );

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
                    const liqNum = liqBigNum.toNumber();
                    if (pendingPosition.txDetails.isAmbient) {
                        positionLiqBase =
                            liqNum * Math.sqrt(await poolPriceNonDisplay);
                        positionLiqQuote =
                            liqNum / Math.sqrt(await poolPriceNonDisplay);
                    } else {
                        positionLiqBase = bigNumToFloat(
                            baseTokenForConcLiq(
                                await poolPriceNonDisplay,
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
                                await poolPriceNonDisplay,
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
                    const liqBaseDecimalCorrected =
                        positionLiqBase /
                        Math.pow(
                            10,
                            pendingPosition.txDetails.baseTokenDecimals || 0,
                        );
                    const liqQuoteDecimalCorrected =
                        positionLiqQuote /
                        Math.pow(
                            10,
                            pendingPosition.txDetails.quoteTokenDecimals || 0,
                        );

                    const positionLiqBaseTruncated = getFormattedNumber({
                        value: liqBaseDecimalCorrected,
                        zeroDisplay: '0',
                    });
                    const positionLiqQuoteTruncated = getFormattedNumber({
                        value: liqQuoteDecimalCorrected,
                        zeroDisplay: '0',
                    });

                    console.log({
                        positionLiqBaseTruncated,
                        positionLiqQuoteTruncated,
                    });
                    const onChainPosition: PositionIF = {
                        chainId: '0xaa36a7',
                        base: '0x0000000000000000000000000000000000000000',
                        quote: '0x60bba138a74c5e7326885de5090700626950d509',
                        poolIdx: 36000,
                        bidTick: 192880,
                        askTick: 194896,
                        isBid: false,
                        user: '0xa86dabfbb529a4c8186bdd52bd226ac81757e090',
                        timeFirstMint: 1709845452,
                        latestUpdateTime: 1709845452,
                        lastMintTx:
                            '0x7f830ba5cc254554543003f1087d787d69db03fcca71330075bf0935dbc1a245',
                        firstMintTx:
                            '0x7f830ba5cc254554543003f1087d787d69db03fcca71330075bf0935dbc1a245',
                        positionType: 'concentrated',
                        ambientLiq: 0,
                        concLiq: 1261875634176,
                        rewardLiq: 0,
                        liqRefreshTime: 1709845559,
                        aprDuration: 218,
                        aprPostLiq: 1261875634176,
                        aprContributedLiq: 1261875634176,
                        // aprEst: 0,
                        poolPriceInTicks: 193882.26311152513,
                        isPositionInRange: true,
                        baseDecimals: 18,
                        quoteDecimals: 6,
                        baseSymbol: 'ETH',
                        quoteSymbol: 'USDC',
                        baseName: 'Native Ether',
                        quoteName: 'USDCoin',
                        lowRangeDisplayInBase: '3,437.14',
                        highRangeDisplayInBase: '4,204.81',
                        lowRangeDisplayInQuote: '0.000238',
                        highRangeDisplayInQuote: '0.000291',
                        lowRangeShortDisplayInBase: '3,437',
                        lowRangeShortDisplayInQuote: '0.000238',
                        highRangeShortDisplayInBase: '4,205',
                        highRangeShortDisplayInQuote: '0.000291',
                        bidTickPriceDecimalCorrected: 0.00023782262110302573,
                        bidTickInvPriceDecimalCorrected: 3437.141793336572,
                        askTickPriceDecimalCorrected: 0.0002909394084173815,
                        askTickInvPriceDecimalCorrected: 4204.8144762764005,
                        positionLiq: 1261875634176,
                        positionLiqBase: 999999999959011,
                        positionLiqQuote: 3846283,
                        feesLiqBase: 0,
                        feesLiqQuote: 0,
                        feesLiqBaseDecimalCorrected: 0,
                        feesLiqQuoteDecimalCorrected: 0,
                        positionLiqBaseDecimalCorrected: 0,
                        positionLiqQuoteDecimalCorrected: 0,
                        positionLiqBaseTruncated: '...',
                        positionLiqQuoteTruncated: '...',
                        totalValueUSD: 0,
                        apy: 0,
                        serverPositionId:
                            'pos_e3f2bc533b364a14af1fb331dbf344944dbd4f63307dee3c8a0e80c3f0975508',
                    } as PositionIF;

                    onChainPosition.positionLiqBaseDecimalCorrected =
                        liqBaseDecimalCorrected;

                    onChainPosition.positionLiqQuoteDecimalCorrected =
                        liqQuoteDecimalCorrected;

                    onChainPosition.positionLiqBaseTruncated =
                        positionLiqBaseTruncated;

                    onChainPosition.positionLiqQuoteTruncated =
                        positionLiqQuoteTruncated;
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
            console.log({ definedPositions });
            if (definedPositions.length)
                setUpdatedPendingPositions(definedPositions);
        })();
    }, [JSON.stringify(relevantTransactionsByType), lastBlockNumber]);

    const shouldDisplayNoTableData =
        !isLoading &&
        !rangeData.length &&
        unindexedNonFailedSessionPositionUpdates.length === 0;

    const rangeDataOrNull = !shouldDisplayNoTableData ? (
        <div>
            <ul ref={listRef} id='current_row_scroll'>
                {!isAccountView &&
                    relevantTransactionsByType.length > 0 &&
                    relevantTransactionsByType.reverse().map((tx, idx) => (
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
                    data={updatedPendingPositions}
                    fullData={fullData}
                    isAccountView={isAccountView}
                    tableView={tableView}
                />
                <TableRows
                    type='Range'
                    data={_DATA.currentData}
                    fullData={fullData}
                    isAccountView={isAccountView}
                    tableView={tableView}
                />
            </ul>
            {
                // Show a 'View More' button at the end of the table when collapsed (half-page) and it's not a /account render
                // TODO (#1804): we should instead be adding results to RTK
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
