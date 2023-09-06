// START: Import React and Dongles
import { useContext, useEffect, useState, memo } from 'react';

// START: Import Local Files
import Pagination from '../../../Global/Pagination/Pagination';

import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useSortedPositions } from '../useSortedPositions';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import RangeHeader from './RangesTable/RangeHeader';
import RangesRow from './RangesTable/RangesRow';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { ChartContext } from '../../../../contexts/ChartContext';
import { RangeRow as RangeRowStyled } from '../../../../styled/Components/TransactionTable';
import { FlexContainer } from '../../../../styled/Common';

// react functional component
function Leaderboard() {
    const { showAllData } = useContext(TradeTableContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);

    const { tradeTableState } = useContext(ChartContext);

    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state?.userData,
    );
    const graphData = useAppSelector((state) => state?.graphData);
    const tradeData = useAppSelector((state) => state.tradeData);

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;

    const positionsByApy: string[] =
        [...graphData?.leaderboardByPool?.positions]
            .sort((a, b) => b.apy - a.apy)
            .map((pos) => pos.positionId) ?? [];

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions] =
        useSortedPositions('apr', graphData?.leaderboardByPool?.positions);

    // ---------------------
    const [currentPage, setCurrentPage] = useState(1);
    const [rangesPerPage] = useState(20);

    useEffect(() => {
        setCurrentPage(1);
    }, [userAddress, showAllData, baseTokenAddress + quoteTokenAddress]);

    // Get current tranges
    const indexOfLastRanges = currentPage * rangesPerPage;
    const indexOfFirstRanges = indexOfLastRanges - rangesPerPage;
    const currentRangess = sortedPositions?.slice(
        indexOfFirstRanges,
        indexOfLastRanges,
    );
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const usePaginateDataOrNull =
        tradeTableState === 'Expanded' ? currentRangess : sortedPositions;

    // TODO: Use these as media width constants
    const isSmallScreen = useMediaQuery('(max-width: 600px)');
    const isLargeScreen = useMediaQuery('(min-width: 1600px)');

    const tableView = isSmallScreen
        ? 'small'
        : !isSmallScreen && !isLargeScreen
        ? 'medium'
        : 'large';

    const footerDisplay = (
        <FlexContainer
            alignItems='center'
            justifyContent='center'
            gap={isSmallScreen ? 4 : 8}
            margin='16px auto'
            background='dark1'
        >
            {tradeTableState === 'Expanded' && sortedPositions.length > 30 && (
                <Pagination
                    itemsPerPage={rangesPerPage}
                    totalItems={sortedPositions.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            )}
        </FlexContainer>
    );

    const quoteTokenSymbol = tradeData.quoteToken?.symbol;
    const baseTokenSymbol = tradeData.baseToken?.symbol;

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
    const tokens = (
        <>
            <p>{`${baseTokenSymbol}`}</p>
            <p>{`${quoteTokenSymbol}`}</p>
        </>
    );
    const headerColumns = [
        {
            name: 'Rank',
            className: 'ID',
            show: tableView === 'large',
            slug: 'id',
            sortable: false,
        },
        {
            name: 'Last Updated',
            className: '',
            show: tableView === 'large',
            slug: 'time',
            sortable: false,
        },
        {
            name: 'Wallet',
            className: 'wallet',
            show: tableView === 'large',
            slug: 'wallet',
            sortable: false,
        },
        {
            name: walID,
            className: 'wallet_id',
            show: tableView !== 'large',
            slug: 'walletid',
            sortable: true,
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
            sortable: false,
            alignRight: true,
        },
        {
            name: `${baseTokenSymbol}`,
            show: tableView === 'large',
            slug: baseTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: `${quoteTokenSymbol}`,
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
            sortable: false,
            alignRight: true,
        },
        {
            name: 'Status',
            className: '',
            show: true,
            slug: 'status',
            sortable: false,
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
        <RangeRowStyled size={tableView} leaderboard header>
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
    const rowItemContent = usePaginateDataOrNull?.map((position, idx) => (
        <RangesRow
            key={idx}
            position={position}
            rank={
                positionsByApy.findIndex(
                    (posId) => posId === position.positionId,
                ) + 1
            }
            isAccountView={false}
            isLeaderboard={true}
            tableView={tableView}
        />
    ));

    return (
        <FlexContainer flexDirection='column' fullHeight>
            <div>{headerColumnsDisplay}</div>
            <div style={{ flex: 1, overflow: 'auto' }}>{rowItemContent}</div>
            <div>{footerDisplay}</div>
        </FlexContainer>
    );
}

export default memo(Leaderboard);
