// START: Import React and Dongles
import { useEffect, useState, useContext, memo, useRef } from 'react';

// START: Import Local Files
import styles from './Ranges.module.css';
import { Pagination } from '@mui/material';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useSortedPositions } from '../useSortedPositions';
import { PositionIF } from '../../../../utils/interfaces/exports';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import RangeHeader from './RangesTable/RangeHeader';
import RangesRow from './RangesTable/RangesRow';
import NoTableData from '../NoTableData/NoTableData';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import usePagination from '../../../Global/Pagination/usePagination';
import { RowsPerPageDropdown } from '../../../Global/Pagination/RowsPerPageDropdown';
import Spinner from '../../../Global/Spinner/Spinner';
import { useLocation } from 'react-router-dom';
import { RangeContext } from '../../../../contexts/RangeContext';
import { ChartContext } from '../../../../contexts/ChartContext';

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
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const { setCurrentRangeInReposition } = useContext(RangeContext);
    const { tradeTableState } = useContext(ChartContext);
    // only show all data when on trade tabs page
    const showAllData = !isAccountView && showAllDataSelection;
    const isTradeTableExpanded =
        !isAccountView && tradeTableState === 'Expanded';

    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );
    const graphData = useAppSelector((state) => state?.graphData);
    const tradeData = useAppSelector((state) => state.tradeData);

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;

    const [rangeData, setRangeData] = useState<PositionIF[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const path = useLocation().pathname;

    if (!path.includes('reposition')) {
        setCurrentRangeInReposition('');
    }

    useEffect(() => {
        if (isAccountView) setRangeData(activeAccountPositionData || []);
        else if (!showAllData)
            setRangeData(
                graphData?.userPositionsByPool?.positions.filter(
                    (position) =>
                        position.base.toLowerCase() ===
                            baseTokenAddress.toLowerCase() &&
                        position.quote.toLowerCase() ===
                            quoteTokenAddress.toLowerCase() &&
                        position.positionLiq != 0,
                ),
            );
        else {
            setRangeData(graphData?.positionsByPool.positions);
        }
    }, [
        showAllData,
        isAccountView,
        activeAccountPositionData,
        graphData?.positionsByPool,
        graphData?.userPositionsByPool,
    ]);

    useEffect(() => {
        if (isAccountView && connectedAccountActive)
            setIsLoading(
                graphData?.dataLoadingStatus.isConnectedUserRangeDataLoading,
            );
        else if (isAccountView)
            setIsLoading(
                graphData?.dataLoadingStatus.isLookupUserRangeDataLoading,
            );
        else if (!showAllData)
            setIsLoading(
                graphData?.dataLoadingStatus
                    .isConnectedUserPoolRangeDataLoading,
            );
        else setIsLoading(graphData?.dataLoadingStatus.isPoolRangeDataLoading);
    }, [
        showAllData,
        isAccountView,
        connectedAccountActive,
        graphData?.dataLoadingStatus.isConnectedUserRangeDataLoading,
        graphData?.dataLoadingStatus.isConnectedUserPoolRangeDataLoading,
        graphData?.dataLoadingStatus.isLookupUserRangeDataLoading,
        graphData?.dataLoadingStatus.isPoolRangeDataLoading,
    ]);

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions] =
        useSortedPositions('time', rangeData);

    // ---------------------
    // transactions per page media queries
    const showColumns = useMediaQuery('(max-width: 1599px)');

    const phoneScreen = useMediaQuery('(max-width: 600px)');

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

    const _DATA = usePagination(sortedPositions, isScreenShort, isScreenTall);

    const {
        showingFrom,
        showingTo,
        totalItems,
        setCurrentPage,
        rowsPerPage,
        changeRowsPerPage,
        count,
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
            <div className={styles.footer}>
                <div className={styles.footer_content}>
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
                    <p
                        className={styles.showing_text}
                    >{`showing ${showingFrom} - ${showingTo} of ${totalItems}`}</p>
                </div>
            </div>
        );

    const ipadView = useMediaQuery('(max-width: 600px)');
    const showPair = useMediaQuery('(min-width: 768px)') || !isSidebarOpen;
    const showTimestamp = useMediaQuery('(min-width: 1200px)');

    const quoteTokenSymbol = tradeData.quoteToken?.symbol;
    const baseTokenSymbol = tradeData.baseToken?.symbol;

    // Changed this to have the sort icon be inline with the last row rather than under it
    const walID = (
        <>
            <p>ID</p>
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
            show: showPair && showTimestamp,
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
            sortable: !isAccountView,
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
            showTimestamp={showTimestamp}
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
            showTimestamp={showTimestamp}
            showPair={showPair}
        />
    ));

    useEffect(() => {
        if (_DATA.currentData.length && !isTradeTableExpanded) {
            setCurrentPage(1);
            const mockEvent = {} as React.ChangeEvent<unknown>;
            handleChange(mockEvent, 1);
        }
    }, [isTradeTableExpanded]);

    const shouldDisplayNoTableData = !isLoading && !rangeData.length;

    const rangeDataOrNull = !shouldDisplayNoTableData ? (
        <div>
            <ul ref={listRef}>{currentRowItemContent}</ul>
            {
                // Show a 'View More' button at the end of the table when collapsed (half-page) and it's not a /account render
                // TODO (#1804): we should instead be adding results to RTK
                !isTradeTableExpanded &&
                    !props.isAccountView &&
                    sortedRowItemContent.length > NUM_RANGES_WHEN_COLLAPSED && (
                        <div className={styles.view_more_container}>
                            <button
                                className={styles.view_more_button}
                                onClick={() => {
                                    toggleTradeTable();
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
                isTradeTableExpanded && styles.main_list_expanded
            }`}
        >
            <div>{headerColumnsDisplay}</div>

            <div className={styles.table_content}>
                {isLoading ? (
                    <Spinner size={100} bg='var(--dark1)' centered />
                ) : (
                    rangeDataOrNull
                )}
            </div>

            <div style={{ margin: portfolioPageFooter }}>{footerDisplay}</div>
        </section>
    );
}

export default memo(Ranges);
