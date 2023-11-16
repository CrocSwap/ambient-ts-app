// START: Import React and Dongles
import { useContext, useEffect, useState, memo } from 'react';

// START: Import Local Files
import Pagination from '../../../Global/Pagination/Pagination';

import { useSortedPositions } from '../useSortedPositions';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import RangeHeader from './RangesTable/RangeHeader';
import RangesRow from './RangesTable/RangesRow';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { ChartContext } from '../../../../contexts/ChartContext';
import { RangeRow as RangeRowStyled } from '../../../../styled/Components/TransactionTable';
import { FlexContainer } from '../../../../styled/Common';
import { useENSAddresses } from '../../../../contexts/ENSAddressContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';

// react functional component
function Leaderboard() {
    const { showAllData } = useContext(TradeTableContext);

    const { tradeTableState } = useContext(ChartContext);
    const { leaderboardByPool } = useContext(GraphDataContext);

    const { userAddress } = useContext(UserDataContext);

    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const baseTokenAddress = baseToken.address;
    const quoteTokenAddress = quoteToken.address;

    const positionsByApy: string[] =
        [...leaderboardByPool?.positions]
            .sort((a, b) => b.apy - a.apy)
            .map((pos) => pos.positionId) ?? [];

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions] =
        useSortedPositions('apr', leaderboardByPool?.positions);

    // ---------------------
    const [currentPage, setCurrentPage] = useState(1);
    const [rangesPerPage] = useState(20);

    useEffect(() => {
        setCurrentPage(1);
    }, [userAddress, showAllData, baseTokenAddress + quoteTokenAddress]);

    // Get current tranges
    const indexOfLastRanges = currentPage * rangesPerPage;
    const indexOfFirstRanges = indexOfLastRanges - rangesPerPage;
    const currentRanges = sortedPositions?.slice(
        indexOfFirstRanges,
        indexOfLastRanges,
    );
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const usePaginateDataOrNull =
        tradeTableState === 'Expanded' ? currentRanges : sortedPositions;

    // TODO: Use these as media width constants
    const isSmallScreen = useMediaQuery('(max-width: 600px)');
    const isLargeScreen = useMediaQuery('(min-width: 1600px)');

    const tableView = isSmallScreen
        ? 'small'
        : !isSmallScreen && !isLargeScreen
        ? 'medium'
        : 'large';

    const quoteTokenSymbol = quoteToken?.symbol;
    const baseTokenSymbol = baseToken?.symbol;

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

    const { ensAddressMapping, addData } = useENSAddresses();

    useEffect(() => {
        if (usePaginateDataOrNull.length > 0) {
            addData(usePaginateDataOrNull);
        }
    }, [usePaginateDataOrNull]);

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
            fetchedEnsAddress={ensAddressMapping.get(position.user)}
        />
    ));

    // TODO: we can probably severely reduce the number of wrappers in this JSX

    return (
        <FlexContainer flexDirection='column' fullHeight>
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
            <div style={{ flex: 1, overflow: 'auto' }}>{rowItemContent}</div>
            <FlexContainer
                as='footer'
                alignItems='center'
                justifyContent='center'
                gap={isSmallScreen ? 4 : 8}
                margin='0 auto'
                background='dark1'
            >
                {tradeTableState === 'Expanded' &&
                    sortedPositions.length > 30 && (
                        <Pagination
                            itemsPerPage={rangesPerPage}
                            totalItems={sortedPositions.length}
                            paginate={paginate}
                            currentPage={currentPage}
                        />
                    )}
            </FlexContainer>
        </FlexContainer>
    );
}

export default memo(Leaderboard);
