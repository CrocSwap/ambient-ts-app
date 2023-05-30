/* eslint-disable no-irregular-whitespace */
// todo: Commented out code were commented out on 10/14/2022 for a new refactor. If not uncommented by 12/14/2022, they can be safely removed from the file. -Jr

// START: Import React and Dongles
import { useEffect, useState, useMemo, useContext, memo, useRef } from 'react';

// START: Import JSX Components

// START: Import Local Files
import styles from './Ranges.module.css';
import {
    addPositionsByPool,
    addPositionsByUser,
} from '../../../../utils/state/graphDataSlice';
import { Pagination } from '@mui/material';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { useSortedPositions } from '../useSortedPositions';
import { PositionIF } from '../../../../utils/interfaces/exports';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import RangeHeader from './RangesTable/RangeHeader';
import RangesRow from './RangesTable/RangesRow';
import useDebounce from '../../../../App/hooks/useDebounce';
import NoTableData from '../NoTableData/NoTableData';
import { diffHashSig } from '../../../../utils/functions/diffHashSig';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import usePagination from '../../../Global/Pagination/usePagination';
import { RowsPerPageDropdown } from '../../../Global/Pagination/RowsPerPageDropdown';
import { memoizePositionUpdate } from '../../../../App/functions/getPositionData';
import Spinner from '../../../Global/Spinner/Spinner';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';

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

    const {
        chainData: { chainId, poolIndex },
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const {
        showAllData: showAllDataSelection,
        expandTradeTable: expandTradeTableSelection,
        setExpandTradeTable,
    } = useContext(TradeTableContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);

    const cachedPositionUpdateQuery = memoizePositionUpdate();

    // only show all data when on trade tabs page
    const showAllData = !isAccountView && showAllDataSelection;
    const expandTradeTable = !isAccountView && expandTradeTableSelection;

    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );
    const graphData = useAppSelector((state) => state?.graphData);
    const tradeData = useAppSelector((state) => state.tradeData);

    const dataLoadingStatus = graphData?.dataLoadingStatus;

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;

    const baseTokenAddressLowerCase = tradeData.baseToken.address.toLowerCase();
    const quoteTokenAddressLowerCase =
        tradeData.quoteToken.address.toLowerCase();

    const isConnectedUserRangeDataLoading =
        dataLoadingStatus?.isConnectedUserRangeDataLoading;
    const isLookupUserRangeDataLoading =
        dataLoadingStatus?.isLookupUserRangeDataLoading;
    const isPoolRangeDataLoading = dataLoadingStatus?.isPoolRangeDataLoading;

    const isRangeDataLoadingForPortfolio =
        (connectedAccountActive && isConnectedUserRangeDataLoading) ||
        (!connectedAccountActive && isLookupUserRangeDataLoading);

    const isRangeDataLoadingForTradeTable =
        (showAllData && isPoolRangeDataLoading) ||
        (!showAllData && isConnectedUserRangeDataLoading);

    const shouldDisplayLoadingAnimation =
        (isAccountView && isRangeDataLoadingForPortfolio) ||
        (!isAccountView && isRangeDataLoadingForTradeTable);

    const debouncedShouldDisplayLoadingAnimation = useDebounce(
        shouldDisplayLoadingAnimation,
        1000,
    ); // debounce 1/4 second

    const positionsByPool = graphData.positionsByPool?.positions;

    const [rangeData, setRangeData] = useState(
        isAccountView ? activeAccountPositionData || [] : positionsByPool,
    );

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions] =
        useSortedPositions('time', rangeData);

    const positionsByUserMatchingSelectedTokens =
        graphData?.positionsByUser?.positions.filter((position) => {
            if (
                position.base.toLowerCase() === baseTokenAddressLowerCase &&
                position.quote.toLowerCase() === quoteTokenAddressLowerCase
            ) {
                return true;
            } else {
                return false;
            }
        });

    const userPositionsToDisplayOnTrade =
        positionsByUserMatchingSelectedTokens.filter(
            (position) => position.positionLiq !== '0',
        );

    const sumHashActiveAccountPositionData = useMemo(
        () => diffHashSig(activeAccountPositionData),
        [activeAccountPositionData],
    );

    const sumHashRangeData = useMemo(() => diffHashSig(rangeData), [rangeData]);

    const sumHashUserPositionsToDisplayOnTrade = useMemo(
        () => diffHashSig(userPositionsToDisplayOnTrade),
        [userPositionsToDisplayOnTrade],
    );

    const sumHashPositionsByPool = useMemo(
        () => diffHashSig(positionsByPool),
        [positionsByPool],
    );

    const updateRangeData = () => {
        if (
            isAccountView &&
            activeAccountPositionData &&
            sumHashActiveAccountPositionData !== sumHashRangeData
        ) {
            setRangeData(activeAccountPositionData);
        } else if (!showAllData && !isAccountView) {
            setRangeData(userPositionsToDisplayOnTrade);
        } else if (positionsByPool && !isAccountView) {
            setRangeData(positionsByPool);
        }
    };

    useEffect(() => {
        updateRangeData();
    }, [
        isAccountView,
        showAllData,
        connectedAccountActive,
        sumHashActiveAccountPositionData,
        sumHashUserPositionsToDisplayOnTrade,
        sumHashPositionsByPool,
    ]);

    const dispatch = useAppDispatch();

    const NUM_ROWS_TO_SYNC = 5;
    const CACHE_WINDOW_MS = 10000;

    // synchronously query top positions periodically but prevent fetching more than
    // once every CACHE_WINDOW_MS
    const currentTimeForPositionUpdateCaching = Math.floor(
        Date.now() / CACHE_WINDOW_MS,
    );
    const topPositions = sortedPositions.slice(0, NUM_ROWS_TO_SYNC);

    // Debounce the heavy weight networking operation of refreshing the top positions
    // so users clicking like a maniac on the column header don't spam the network
    const REFRESH_TOP_DELAY = 1000;
    const sumHashTopPositions = useDebounce(
        diffHashSig(topPositions.map((p) => p.positionId)),
        REFRESH_TOP_DELAY,
    );

    useEffect(() => {
        if (topPositions.length) {
            Promise.all(
                topPositions.map((position: PositionIF) => {
                    return cachedPositionUpdateQuery(
                        position,
                        currentTimeForPositionUpdateCaching,
                    );
                }),
            )
                .then((updatedPositions) => {
                    if (!isAccountView) {
                        if (showAllData) {
                            const updatedPositionsMatchingPool =
                                updatedPositions.filter(
                                    (position) =>
                                        position.base.toLowerCase() ===
                                            baseTokenAddress.toLowerCase() &&
                                        position.quote.toLowerCase() ===
                                            quoteTokenAddress.toLowerCase() &&
                                        position.poolIdx === poolIndex &&
                                        position.chainId === chainId,
                                );
                            if (updatedPositionsMatchingPool.length) {
                                dispatch(
                                    addPositionsByPool(
                                        updatedPositionsMatchingPool,
                                    ),
                                );
                            }
                        } else {
                            const updatedPositionsMatchingUser =
                                updatedPositions.filter(
                                    (position) =>
                                        position.user.toLowerCase() ===
                                        userAddress?.toLowerCase(),
                                );
                            if (updatedPositionsMatchingUser.length)
                                dispatch(
                                    addPositionsByUser(
                                        updatedPositionsMatchingUser,
                                    ),
                                );
                        }
                    } else {
                        const newArray = updatedPositions.concat(
                            sortedPositions.slice(NUM_ROWS_TO_SYNC),
                        );
                        setRangeData(newArray);
                    }
                })
                .catch(console.error);
        }
    }, [sumHashTopPositions, showAllData, isAccountView, lastBlockNumber]);

    // ---------------------
    // transactions per page media queries
    const showColumns = useMediaQuery('(max-width: 1900px)');

    const phoneScreen = useMediaQuery('(max-width: 500px)');

    useEffect(() => {
        setCurrentPage(1);
    }, [userAddress, showAllData, baseTokenAddress + quoteTokenAddress]);

    const [page, setPage] = useState(1);
    const resetPageToFirst = () => setPage(1);

    const isScreenShort =
        (isAccountView && useMediaQuery('(max-height: 900px)')) ||
        (!isAccountView && useMediaQuery('(max-height: 700px)'));

    const isScreenTall =
        (isAccountView && useMediaQuery('(min-height: 1100px)')) ||
        (!isAccountView && useMediaQuery('(min-height: 1000px)'));

    const [rowsPerPage, setRowsPerPage] = useState(
        isScreenShort ? 5 : isScreenTall ? 20 : 10,
    );

    const count = Math.ceil(sortedPositions.length / rowsPerPage);
    const _DATA = usePagination(sortedPositions, rowsPerPage);

    const { showingFrom, showingTo, totalItems, setCurrentPage } = _DATA;
    const handleChange = (e: React.ChangeEvent<unknown>, p: number) => {
        setPage(p);
        _DATA.jump(p);
    };

    const handleChangeRowsPerPage = (
        event:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | React.ChangeEvent<HTMLSelectElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
    };
    const tradePageCheck = expandTradeTable && rangeData.length > 10;

    const listRef = useRef<HTMLUListElement>(null);
    const sPagination = useMediaQuery('(max-width: 800px)');

    const footerDisplay = rowsPerPage > 0 &&
        ((isAccountView && rangeData.length > 10) ||
            (!isAccountView && tradePageCheck)) && (
            <div className={styles.footer}>
                <div className={styles.footer_content}>
                    <RowsPerPageDropdown
                        value={rowsPerPage}
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
                    <p
                        className={styles.showing_text}
                    >{`showing ${showingFrom} - ${showingTo} of ${totalItems}`}</p>
                </div>
            </div>
        );

    const ipadView = useMediaQuery('(max-width: 580px)');
    const showPair = useMediaQuery('(min-width: 768px)') || !isSidebarOpen;

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
            show: showPair,
            slug: 'time',
            sortable: true,
        },
        {
            name: 'Pair',
            className: '',
            show: isAccountView && showPair,
            slug: 'pool',
            sortable: true,
        },
        {
            name: 'ID',
            className: 'ID',
            show: !showColumns,
            slug: 'id',
            sortable: false,
        },
        {
            name: 'Wallet',
            className: 'wallet',
            show: !showColumns && !isAccountView,
            slug: 'wallet',
            sortable: showAllData,
        },
        {
            name: walID,
            className: 'wallet_id',
            show: showColumns,
            slug: 'walletid',
            sortable: showAllData,
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
            sortable: true,
            alignRight: true,
        },
        {
            name: isAccountView ? '' : `${baseTokenSymbol}`,

            show: !showColumns,
            slug: baseTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: isAccountView ? '' : `${quoteTokenSymbol}`,

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
            sortable: true,
            alignRight: true,
        },
        {
            name: 'Status',
            className: 'status',
            show: true,
            slug: 'status',
            sortable: true,
        },

        {
            name: '',
            className: '',
            show: true,
            slug: 'menu',
            sortable: false,
        },
    ];

    const headerStyle = isAccountView
        ? styles.portfolio_header
        : styles.trade_header;

    const headerColumnsDisplay = (
        <ul className={`${styles.header} ${headerStyle}`}>
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
    const sortedRowItemContent = sortedPositions.map((position, idx) => (
        <RangesRow
            key={idx}
            position={position}
            ipadView={ipadView}
            showColumns={showColumns}
            isAccountView={isAccountView}
            showPair={showPair}
        />
    ));

    const currentRowItemContent = _DATA.currentData.map((position, idx) => (
        <RangesRow
            key={idx}
            position={position}
            ipadView={ipadView}
            showColumns={showColumns}
            isAccountView={isAccountView}
            showPair={showPair}
        />
    ));
    const mobileView = useMediaQuery('(max-width: 1200px)');

    useEffect(() => {
        if (mobileView) {
            setExpandTradeTable(true);
        }
    }, [mobileView]);

    const mobileViewHeight = mobileView ? '70vh' : '260px';

    const expandStyle = expandTradeTable
        ? mobileView
            ? 'calc(100vh - 15rem) '
            : 'calc(100vh - 9rem)'
        : mobileViewHeight;
    const portfolioPageStyle = props.isAccountView
        ? 'calc(100vh - 19.5rem)'
        : expandStyle;
    const rangeDataOrNull = rangeData.length ? (
        <div>
            <ul ref={listRef}>{currentRowItemContent}</ul>
            {
                // Show a 'View More' button at the end of the table when collapsed (half-page) and it's not a /account render
                // TODO (#1804): we should instead be adding results to RTK
                !expandTradeTable &&
                    !props.isAccountView &&
                    sortedRowItemContent.length > NUM_RANGES_WHEN_COLLAPSED && (
                        <div className={styles.view_more_container}>
                            <button
                                className={styles.view_more_button}
                                onClick={() => {
                                    setExpandTradeTable(true);
                                }}
                            >
                                View More
                            </button>
                        </div>
                    )
            }
        </div>
    ) : (
        <NoTableData type='ranges' isAccountView={isAccountView} />
    );

    const portfolioPageFooter = props.isAccountView ? '1rem 0' : '';

    return (
        <section
            className={`${styles.main_list_container} ${
                expandTradeTable && styles.main_list_expanded
            }`}
            style={{ height: portfolioPageStyle }}
        >
            <div>{headerColumnsDisplay}</div>

            <div className={styles.table_content}>
                {debouncedShouldDisplayLoadingAnimation ? (
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Spinner size={100} bg='var(--dark1)' />
                    </div>
                ) : (
                    rangeDataOrNull
                )}
            </div>

            <div style={{ margin: portfolioPageFooter }}>{footerDisplay}</div>
        </section>
    );
}

export default memo(Ranges);
