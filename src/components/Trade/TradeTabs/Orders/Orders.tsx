/* eslint-disable no-irregular-whitespace */
// START: Import React and Dongles
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState,
    memo,
} from 'react';

// START: Import JSX Elements
import styles from './Orders.module.css';

// START: Import Local Files
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { CandleData } from '../../../../utils/state/graphDataSlice';
import { ChainSpec } from '@crocswap-libs/sdk';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import OrderHeader from './OrderTable/OrderHeader';
import OrderRow from './OrderTable/OrderRow';
import TableSkeletons from '../TableSkeletons/TableSkeletons';
import { useSortedLimits } from '../useSortedLimits';
import { LimitOrderIF } from '../../../../utils/interfaces/exports';
import useDebounce from '../../../../App/hooks/useDebounce';
import NoTableData from '../NoTableData/NoTableData';
import { diffHashSig } from '../../../../utils/functions/diffHashSig';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { RowsPerPageDropdown } from '../../../Global/Pagination/RowsPerPageDropdown';
import usePagination from '../../../Global/Pagination/usePagination';
import { Pagination } from '@mui/material';

// import OrderAccordions from './OrderAccordions/OrderAccordions';

// interface for props for react functional component
interface propsIF {
    activeAccountLimitOrderData?: LimitOrderIF[];
    connectedAccountActive?: boolean;
    expandTradeTable: boolean;
    chainData: ChainSpec;
    account: string;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled?: Dispatch<SetStateAction<boolean>>;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    isOnPortfolioPage: boolean;
    changeState?: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    lastBlockNumber: number;
    handlePulseAnimation?: (type: string) => void;
    isAccountView: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}

// main react functional component
function Orders(props: propsIF) {
    const {
        activeAccountLimitOrderData,
        connectedAccountActive,
        chainData,
        expandTradeTable,
        account,
        isShowAllEnabled,
        setCurrentPositionActive,
        currentPositionActive,
        isOnPortfolioPage,
        handlePulseAnimation,
        setIsShowAllEnabled,
        changeState,
        lastBlockNumber,
        isAccountView,
        setExpandTradeTable,
    } = props;

    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(AppStateContext);

    const graphData = useAppSelector((state) => state?.graphData);

    const limitOrdersByUser = graphData.limitOrdersByUser.limitOrders.filter(
        (x) => x.chainId === chainData.chainId,
    );
    const limitOrdersByPool = graphData.limitOrdersByPool.limitOrders.filter(
        (x) => x.chainId === chainData.chainId,
    );
    const dataLoadingStatus = graphData?.dataLoadingStatus;

    const tradeData = useAppSelector((state) => state.tradeData);

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;

    const baseTokenAddressLowerCase = tradeData.baseToken.address.toLowerCase();
    const quoteTokenAddressLowerCase =
        tradeData.quoteToken.address.toLowerCase();

    const isConnectedUserOrderDataLoading =
        dataLoadingStatus?.isConnectedUserOrderDataLoading;
    const isLookupUserOrderDataLoading =
        dataLoadingStatus?.isLookupUserOrderDataLoading;
    const isPoolOrderDataLoading = dataLoadingStatus?.isPoolOrderDataLoading;

    const isOrderDataLoadingForPortfolio =
        (connectedAccountActive && isConnectedUserOrderDataLoading) ||
        (!connectedAccountActive && isLookupUserOrderDataLoading);

    const isOrderDataLoadingForTradeTable =
        (isShowAllEnabled && isPoolOrderDataLoading) ||
        (!isShowAllEnabled && isConnectedUserOrderDataLoading);

    const shouldDisplayLoadingAnimation =
        (isOnPortfolioPage && isOrderDataLoadingForPortfolio) ||
        (!isOnPortfolioPage && isOrderDataLoadingForTradeTable);

    const debouncedShouldDisplayLoadingAnimation = useDebounce(
        shouldDisplayLoadingAnimation,
        1000,
    ); // debounce 1/4 second

    const ordersByUserMatchingSelectedTokens = limitOrdersByUser.filter(
        (tx) => {
            if (
                tx.base.toLowerCase() === baseTokenAddressLowerCase &&
                tx.quote.toLowerCase() === quoteTokenAddressLowerCase
            ) {
                return true;
            } else {
                return false;
            }
        },
    );

    // const isDenomBase = tradeData.isDenomBase;

    const [limitOrderData, setLimitOrderData] = useState(
        isOnPortfolioPage
            ? activeAccountLimitOrderData || []
            : limitOrdersByPool,
    );
    const shouldDisplayNoTableData = !limitOrderData.length;

    const debouncedShouldDisplayNoTableData = useDebounce(
        shouldDisplayNoTableData,
        1000,
    ); // debounce 1 second

    useEffect(() => {
        if (isOnPortfolioPage) {
            setLimitOrderData(activeAccountLimitOrderData || []);
        } else if (!isShowAllEnabled) {
            setLimitOrderData(ordersByUserMatchingSelectedTokens);
        } else if (limitOrdersByPool) {
            setLimitOrderData(limitOrdersByPool);
        }
    }, [
        isShowAllEnabled,
        connectedAccountActive,
        diffHashSig(activeAccountLimitOrderData),
        diffHashSig(ordersByUserMatchingSelectedTokens),
        diffHashSig(limitOrdersByPool),
    ]);

    const nonEmptyOrders = isShowAllEnabled
        ? limitOrdersByPool.filter(
              (limitOrder) => limitOrder.totalValueUSD !== 0,
          )
        : limitOrderData.filter((limitOrder) => limitOrder.totalValueUSD !== 0);

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedLimits] =
        useSortedLimits('time', nonEmptyOrders);

    const ipadView = useMediaQuery('(max-width: 580px)');
    const showPair = useMediaQuery('(min-width: 768px)') || !isSidebarOpen;
    const view2 = useMediaQuery('(max-width: 1568px)');
    const showColumns = useMediaQuery('(max-width: 1800px)');

    const quoteTokenSymbol = tradeData.quoteToken?.symbol;
    const baseTokenSymbol = tradeData.baseToken?.symbol;

    const walID = (
        <>
            <p>ID</p>
            <p>Wallet</p>
        </>
    );
    const sideType = (
        <>
            <p>Type</p>
            <p>Side</p>
        </>
    );
    const tokens = isOnPortfolioPage ? (
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
            show: !showColumns,
            slug: 'time',
            sortable: true,
        },
        {
            name: 'Pair',
            className: '',
            show: isOnPortfolioPage && showPair,
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
            show: !isOnPortfolioPage && !showColumns,
            slug: 'wallet',
            sortable: isShowAllEnabled,
        },
        {
            name: walID,
            className: 'wallet_it',
            show: showColumns,
            slug: 'walletid',
            sortable: false,
        },
        {
            name: 'Limit Price',

            show: !ipadView,
            slug: 'price',
            sortable: true,
            alignRight: true,
        },
        {
            name: 'Side',
            className: 'side',
            show: !showColumns,
            slug: 'side',
            sortable: true,
            alignCenter: true,
        },
        {
            name: 'Type',
            className: 'type',
            show: !showColumns,
            slug: 'type',
            sortable: true,
            alignCenter: true,
        },
        {
            name: sideType,
            className: 'side_type',
            show: showColumns && !ipadView,
            slug: 'sidetype',
            sortable: false,
            alignCenter: true,
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
            name: isOnPortfolioPage ? '' : `${baseTokenSymbol}`,

            show: !showColumns,
            slug: baseTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: isOnPortfolioPage ? '' : `${quoteTokenSymbol}`,

            show: !showColumns,
            slug: quoteTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: tokens,
            className: 'tokens',
            show: showColumns,
            slug: 'tokens',
            sortable: false,
            alignRight: true,
        },
        {
            name: 'Claimable',
            // name: ' ',
            className: '',
            show: !ipadView,
            slug: 'status',
            sortable: false,
            alignCenter: true,
        },

        {
            name: '',
            className: '',
            show: true,
            slug: 'menu',
            sortable: false,
        },
    ];
    const headerStyle = isOnPortfolioPage
        ? styles.portfolio_header
        : styles.trade_header;

    // ---------------------
    // orders per page media queries
    const NUM_RANGES_WHEN_COLLAPSED = 10; // Number of ranges we show when the table is collapsed (i.e. half page)

    useEffect(() => {
        setCurrentPage(1);
    }, [account, isShowAllEnabled, baseTokenAddress + quoteTokenAddress]);

    // Get current tranges

    const [page, setPage] = useState(1);
    const resetPageToFirst = () => setPage(1);

    const [rowsPerPage, setRowsPerPage] = useState(showColumns ? 5 : 10);

    const count = Math.ceil(sortedLimits.length / rowsPerPage);
    const _DATA = usePagination(sortedLimits, rowsPerPage);

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

    const tradePageCheck = expandTradeTable && limitOrderData.length > 10;

    const listRef = useRef<HTMLUListElement>(null);
    const sPagination = useMediaQuery('(max-width: 800px)');

    const footerDisplay = rowsPerPage > 0 &&
        ((isAccountView && limitOrderData.length > 10) ||
            (!isAccountView && tradePageCheck)) && (
            <div className={styles.footer}>
                <div className={styles.footer_content}>
                    <RowsPerPageDropdown
                        value={rowsPerPage}
                        onChange={handleChangeRowsPerPage}
                        itemCount={sortedLimits.length}
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
                    >{` ${showingFrom} - ${showingTo} of ${totalItems}`}</p>
                </div>
            </div>
        );

    // ----------------------

    const headerColumnsDisplay = (
        <ul className={`${styles.header} ${headerStyle}`}>
            {headerColumns.map((header, idx) => (
                <OrderHeader
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

    const currentRowItemContent = _DATA.currentData.map((order, idx) => (
        <OrderRow
            chainData={chainData}
            tradeData={tradeData}
            expandTradeTable={expandTradeTable}
            showPair={showPair}
            showColumns={showColumns}
            ipadView={ipadView}
            view2={view2}
            key={idx}
            limitOrder={order}
            currentPositionActive={currentPositionActive}
            setCurrentPositionActive={setCurrentPositionActive}
            isShowAllEnabled={isShowAllEnabled}
            isOnPortfolioPage={isOnPortfolioPage}
            handlePulseAnimation={handlePulseAnimation}
            lastBlockNumber={lastBlockNumber}
            account={account}
        />
    ));

    const sortedRowItemContent = sortedLimits.map((order, idx) => (
        <OrderRow
            chainData={chainData}
            tradeData={tradeData}
            expandTradeTable={expandTradeTable}
            showPair={showPair}
            showColumns={showColumns}
            ipadView={ipadView}
            view2={view2}
            key={idx}
            limitOrder={order}
            currentPositionActive={currentPositionActive}
            setCurrentPositionActive={setCurrentPositionActive}
            isShowAllEnabled={isShowAllEnabled}
            isOnPortfolioPage={isOnPortfolioPage}
            handlePulseAnimation={handlePulseAnimation}
            lastBlockNumber={lastBlockNumber}
            account={account}
        />
    ));

    const handleKeyDownViewOrder = (
        event: React.KeyboardEvent<HTMLUListElement | HTMLDivElement>,
    ) => {
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
    const orderDataOrNull = debouncedShouldDisplayNoTableData ? (
        <NoTableData
            isShowAllEnabled={isShowAllEnabled}
            type='orders'
            setIsShowAllEnabled={setIsShowAllEnabled}
            changeState={changeState}
            isOnPortfolioPage={isOnPortfolioPage}
        />
    ) : (
        <div onKeyDown={handleKeyDownViewOrder}>
            <ul ref={listRef}>{currentRowItemContent}</ul>
            {
                // Show a 'View More' button at the end of the table when collapsed (half-page) and it's not a /account render
                // TODO (#1804): we should instead be adding results to RTK
                !expandTradeTable &&
                    !isAccountView &&
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
    );

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

    const portfolioPageStyle = props.isOnPortfolioPage
        ? 'calc(100vh - 19.5rem)'
        : expandStyle;

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
                    <TableSkeletons />
                ) : (
                    orderDataOrNull
                )}
            </div>

            <div>{footerDisplay}</div>
        </section>
    );
}

export default memo(Orders);
