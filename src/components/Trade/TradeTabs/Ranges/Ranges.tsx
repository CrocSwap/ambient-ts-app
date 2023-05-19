/* eslint-disable no-irregular-whitespace */
// todo: Commented out code were commented out on 10/14/2022 for a new refactor. If not uncommented by 12/14/2022, they can be safely removed from the file. -Jr

// START: Import React and Dongles
import {
    Dispatch,
    SetStateAction,
    useEffect,
    useState,
    useMemo,
    useContext,
    memo,
    useRef,
} from 'react';
import { ethers } from 'ethers';

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
import { PositionUpdateFn } from '../../../../App/functions/getPositionData';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import RangeHeader from './RangesTable/RangeHeader';
import RangesRow from './RangesTable/RangesRow';
import TableSkeletons from '../TableSkeletons/TableSkeletons';
import useDebounce from '../../../../App/hooks/useDebounce';
import NoTableData from '../NoTableData/NoTableData';
import { SpotPriceFn } from '../../../../App/functions/querySpotPrice';
import { diffHashSig } from '../../../../utils/functions/diffHashSig';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import usePagination from '../../../Global/Pagination/usePagination';
import { RowsPerPageDropdown } from '../../../Global/Pagination/RowsPerPageDropdown';

const NUM_RANGES_WHEN_COLLAPSED = 10; // Number of ranges we show when the table is collapsed (i.e. half page)
// NOTE: this is done to improve rendering speed for this page.

// interface for props
interface propsIF {
    activeAccountPositionData?: PositionIF[];
    connectedAccountActive?: boolean;
    notOnTradeRoute?: boolean;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    portfolio?: boolean;
    setLeader?: Dispatch<SetStateAction<string>>;
    setLeaderOwnerId?: Dispatch<SetStateAction<string>>;
    cachedQuerySpotPrice: SpotPriceFn;
    cachedPositionUpdateQuery: PositionUpdateFn;
    isAccountView: boolean;
}

// react functional component
function Ranges(props: propsIF) {
    const {
        activeAccountPositionData,
        connectedAccountActive,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        cachedQuerySpotPrice,
        cachedPositionUpdateQuery,
        isAccountView,
    } = props;

    const {
        showAllData: showAllDataSelection,
        expandTradeTable: expandTradeTableSelection,
        setExpandTradeTable,
    } = useContext(TradeTableContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);

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
        positionsByUserMatchingSelectedTokens.filter((position) => {
            if (position.positionLiq !== '0' || position.source === 'manual') {
                return true;
            } else {
                return false;
            }
        });

    const [rangeData, setRangeData] = useState(
        isAccountView ? activeAccountPositionData || [] : positionsByPool,
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
        sumHashRangeData,
    ]);

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions] =
        useSortedPositions('time', rangeData);

    const dispatch = useAppDispatch();

    // prevent query from running multiple times for the same position more than once per minute
    const currentTimeForPositionUpdateCaching = Math.floor(Date.now() / 60000);

    useEffect(() => {
        const topThreePositions = sortedPositions.slice(0, 3);

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
                    if (!isAccountView) {
                        if (showAllData) {
                            if (updatedPositions)
                                dispatch(addPositionsByPool(updatedPositions));
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
                            sortedPositions.slice(3),
                        );
                        setRangeData(newArray);
                    }
                })
                .catch(console.error);
        }
    }, [
        diffHashSig({
            id0: sortedPositions[0]?.positionId,
            id1: sortedPositions[1]?.positionId,
            id2: sortedPositions[2]?.positionId,
        }),
        currentTimeForPositionUpdateCaching,
        showAllData,
        isAccountView,
    ]);

    // ---------------------
    // transactions per page media queries
    const showColumns = useMediaQuery('(max-width: 1900px)');

    const phoneScreen = useMediaQuery('(max-width: 500px)');

    useEffect(() => {
        setCurrentPage(1);
    }, [userAddress, showAllData, baseTokenAddress + quoteTokenAddress]);

    // Get current tranges

    const [page, setPage] = useState(1);
    const resetPageToFirst = () => setPage(1);

    const [rowsPerPage, setRowsPerPage] = useState(showColumns ? 5 : 10);

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
    const [isHeightGreaterThanHalf, setIsHeightGreaterThanHalf] =
        useState(false);
    const listRef = useRef<HTMLUListElement>(null);
    const element = listRef.current;
    useEffect(() => {
        if (element) {
            const resizeObserver = new ResizeObserver((entries) => {
                const firstEntry = entries[0];
                const elementHeight = firstEntry.contentRect.height;
                const screenHeight = window.innerHeight;
                const isGreaterThanHalf = elementHeight > screenHeight * 0.5;

                setIsHeightGreaterThanHalf(isGreaterThanHalf);
            });

            resizeObserver.observe(element);

            return () => {
                resizeObserver.unobserve(element);
            };
        }
    }, [element]);

    const footerDisplay = rowsPerPage > 0 &&
        ((isAccountView && rangeData.length > 10) ||
            (!isAccountView && tradePageCheck)) && (
            <div
                className={styles.footer}
                style={{
                    position: isHeightGreaterThanHalf ? 'sticky' : 'absolute',
                }}
            >
                <p
                    className={styles.showing_text}
                >{`showing ${showingFrom} - ${showingTo} of ${totalItems}`}</p>
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
                        size='large'
                        page={page}
                        shape='circular'
                        color='secondary'
                        onChange={handleChange}
                        showFirstButton
                        showLastButton
                    />
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
            cachedQuerySpotPrice={cachedQuerySpotPrice}
            key={idx}
            position={position}
            ipadView={ipadView}
            showColumns={showColumns}
            baseTokenBalance={baseTokenBalance}
            quoteTokenBalance={quoteTokenBalance}
            baseTokenDexBalance={baseTokenDexBalance}
            quoteTokenDexBalance={quoteTokenDexBalance}
            isAccountView={isAccountView}
            idx={idx}
            showPair={showPair}
        />
    ));

    const currentRowItemContent = _DATA.currentData.map((position, idx) => (
        <RangesRow
            cachedQuerySpotPrice={cachedQuerySpotPrice}
            key={idx}
            position={position}
            ipadView={ipadView}
            showColumns={showColumns}
            baseTokenBalance={baseTokenBalance}
            quoteTokenBalance={quoteTokenBalance}
            baseTokenDexBalance={baseTokenDexBalance}
            quoteTokenDexBalance={quoteTokenDexBalance}
            isAccountView={isAccountView}
            idx={idx}
            showPair={showPair}
        />
    ));

    const mobileView = useMediaQuery('(max-width: 1200px)');

    const mobileViewHeight = mobileView ? '70vh' : '250px';

    const expandStyle = expandTradeTable
        ? 'calc(100vh - 10rem)'
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

    return (
        <section
            className={`${styles.main_list_container} `}
            style={{ height: portfolioPageStyle }}
        >
            {headerColumnsDisplay}
            {debouncedShouldDisplayLoadingAnimation ? (
                <TableSkeletons />
            ) : (
                rangeDataOrNull
            )}
            {footerDisplay}
        </section>
    );
}

export default memo(Ranges);
