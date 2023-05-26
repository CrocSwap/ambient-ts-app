/* eslint-disable no-irregular-whitespace */
// todo: Commented out code were commented out on 10/14/2022 for a new refactor. If not uncommented by 12/14/2022, they can be safely removed from the file. -Jr

// START: Import React and Dongles
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
    memo,
} from 'react';

// START: Import Local Files
import styles from './Ranges.module.css';
import { updateLeaderboard } from '../../../../utils/state/graphDataSlice';
import Pagination from '../../../Global/Pagination/Pagination';

import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { useSortedPositions } from '../useSortedPositions';
import { PositionIF } from '../../../../utils/interfaces/exports';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import RangeHeader from './RangesTable/RangeHeader';
import RangesRow from './RangesTable/RangesRow';
import { SpotPriceFn } from '../../../../App/functions/querySpotPrice';
import { PositionUpdateFn } from '../../../../App/functions/getPositionData';
import { diffHashSig } from '../../../../utils/functions/diffHashSig';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';

// interface for props
interface propsIF {
    notOnTradeRoute?: boolean;
    portfolio?: boolean;
    setLeader?: Dispatch<SetStateAction<string>>;
    setLeaderOwnerId?: Dispatch<SetStateAction<string>>;
}

// react functional component
function Leaderboard(props: propsIF) {
    const { cachedPositionUpdateQuery } = useContext(CachedDataContext);
    const { expandTradeTable, showAllData } = useContext(TradeTableContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);

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

    const topThreePositions = sortedPositions.slice(0, 3);

    const dispatch = useAppDispatch();

    // prevent query from running multiple times for the same position more than once per minute
    const currentTimeForPositionUpdateCaching = Math.floor(Date.now() / 60000);

    useEffect(() => {
        if (topThreePositions) {
            Promise.all(
                topThreePositions.map((position: PositionIF) => {
                    return cachedPositionUpdateQuery(
                        position,
                        currentTimeForPositionUpdateCaching,
                    );
                }),
            )
                .then((updatedPositions) => {
                    if (showAllData) {
                        dispatch(updateLeaderboard(updatedPositions));
                    } else {
                        dispatch(updateLeaderboard(updatedPositions));
                    }
                })
                .catch(console.error);
        }
    }, [
        diffHashSig({
            id0: topThreePositions[0]?.positionId,
            id1: topThreePositions[1]?.positionId,
            id2: topThreePositions[2]?.positionId,
        }),
        currentTimeForPositionUpdateCaching,
        showAllData,
    ]);

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

    const usePaginateDataOrNull = expandTradeTable
        ? currentRangess
        : sortedPositions;

    const footerDisplay = (
        <div className={styles.footer}>
            {expandTradeTable && sortedPositions.length > 30 && (
                <Pagination
                    itemsPerPage={rangesPerPage}
                    totalItems={sortedPositions.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            )}
        </div>
    );

    // ----------------------

    // const sidebarOpen = false;

    const ipadView = useMediaQuery('(max-width: 580px)');
    const showPair = useMediaQuery('(min-width: 768px)') || !isSidebarOpen;

    const showColumns = useMediaQuery('(max-width: 1900px)');
    const phoneScreen = useMediaQuery('(max-width: 500px)');

    // const showColumns = sidebarOpen || desktopView;

    const quoteTokenSymbol = tradeData.quoteToken?.symbol;
    const baseTokenSymbol = tradeData.baseToken?.symbol;

    const walID = (
        <>
            <p>ID</p>
            <p>Wallet</p>
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
            name: 'Last Updated',
            className: '',
            show: showColumns,
            slug: 'time',
            sortable: false,
        },
        {
            name: 'Rank',
            className: 'ID',
            show: !showColumns,
            slug: 'id',
            sortable: false,
        },
        {
            name: 'Last Updated',
            className: '',
            show: !showColumns,
            slug: 'time',
            sortable: false,
        },
        {
            name: 'Wallet',
            className: 'wallet',
            show: !showColumns,
            slug: 'wallet',
            sortable: false,
        },
        {
            name: walID,
            className: 'wallet_id',
            show: showColumns,
            slug: 'walletid',
            sortable: false,
        },
        {
            name: 'Min',
            show: !showColumns,
            slug: 'min',
            sortable: false,
            alignRight: true,
        },
        {
            name: 'Max',
            className: 'side',
            show: !showColumns,
            slug: 'max',
            sortable: false,
            alignRight: true,
        },

        {
            name: minMax,
            className: 'side_type',
            show: showColumns && !ipadView,
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

            show: !showColumns,
            slug: baseTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: `${quoteTokenSymbol}`,

            show: !showColumns,
            slug: quoteTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: tokens,
            className: 'tokens',
            show: showColumns && !phoneScreen,
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
            // name: ' ',
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
        <ul className={styles.header}>
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
        </ul>
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
            ipadView={ipadView}
            showColumns={showColumns}
            isAccountView={false}
            isLeaderboard={true}
            idx={idx + 1}
            showPair={showPair}
        />
    ));
    const mobileView = useMediaQuery('(max-width: 1200px)');

    const mobileViewHeight = mobileView ? '70vh' : '260px';

    const expandStyle = expandTradeTable
        ? mobileView
            ? 'calc(100vh - 15rem) '
            : 'calc(100vh - 9rem)'
        : mobileViewHeight;

    return (
        <section
            className={` ${styles.leaderboard}`}
            style={{ height: expandStyle }}
        >
            <div>{headerColumnsDisplay}</div>
            <div>{rowItemContent}</div>
            <div>{footerDisplay}</div>
        </section>
    );
}

export default memo(Leaderboard);
