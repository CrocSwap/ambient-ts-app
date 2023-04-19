/* eslint-disable no-irregular-whitespace */
// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import sum from 'hash-sum';

// START: Import JSX Elements
import styles from './Orders.module.css';

// START: Import Local Files
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import {
    CandleData,
    graphData,
    // setDataLoadingStatus,
    // setLimitOrdersByPool,
} from '../../../../utils/state/graphDataSlice';
// import { fetchPoolLimitOrderStates } from '../../../../App/functions/fetchPoolLimitOrderStates';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import OrderHeader from './OrderTable/OrderHeader';
import OrderRow from './OrderTable/OrderRow';
import TableSkeletons from '../TableSkeletons/TableSkeletons';
import { useSortedLimits } from '../useSortedLimits';
import { LimitOrderIF, TokenIF } from '../../../../utils/interfaces/exports';
import useDebounce from '../../../../App/hooks/useDebounce';
import NoTableData from '../NoTableData/NoTableData';
import Pagination from '../../../Global/Pagination/Pagination';
import useWindowDimensions from '../../../../utils/hooks/useWindowDimensions';

// import OrderAccordions from './OrderAccordions/OrderAccordions';

// interface for props for react functional component
interface propsIF {
    activeAccountLimitOrderData?: LimitOrderIF[];
    searchableTokens: TokenIF[];
    connectedAccountActive?: boolean;
    crocEnv: CrocEnv | undefined;
    expandTradeTable: boolean;
    chainData: ChainSpec;
    account: string;
    graphData: graphData;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled?: Dispatch<SetStateAction<boolean>>;
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    isOnPortfolioPage: boolean;
    changeState?: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    lastBlockNumber: number;
    showSidebar: boolean;
    handlePulseAnimation?: (type: string) => void;
}

// main react functional component
export default function Orders(props: propsIF) {
    const {
        activeAccountLimitOrderData,
        connectedAccountActive,
        crocEnv,
        chainData,
        expandTradeTable,
        account,
        graphData,
        isShowAllEnabled,
        setCurrentPositionActive,
        currentPositionActive,
        showSidebar,
        isOnPortfolioPage,
        handlePulseAnimation,
        setIsShowAllEnabled,
        changeState,
        lastBlockNumber,
    } = props;

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
        sum(activeAccountLimitOrderData),
        sum(ordersByUserMatchingSelectedTokens),
        sum(limitOrdersByPool),
    ]);

    const nonEmptyOrders = isShowAllEnabled
        ? limitOrdersByPool.filter(
              (limitOrder) => limitOrder.totalValueUSD !== 0,
          )
        : limitOrderData.filter((limitOrder) => limitOrder.totalValueUSD !== 0);

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedLimits] =
        useSortedLimits('time', nonEmptyOrders);

    const ipadView = useMediaQuery('(max-width: 580px)');
    const showPair = useMediaQuery('(min-width: 768px)') || !showSidebar;
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
        // {
        //     name: '',
        //     className: '',
        //     show: isOnPortfolioPage,
        //     slug: 'token_images',
        //     sortable: false,
        // },
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
    const [currentPage, setCurrentPage] = useState(1);
    // orders per page media queries

    const { height } = useWindowDimensions();

    // const ordersPerPage = Math.round(((0.7 * height) / 33) )
    // height => current height of the viewport
    // 250 => Navbar, header, and footer. Everything that adds to the height not including the pagination contents
    // 30 => Height of each paginated row item

    const regularOrdersItems = Math.round((height - 250) / 30);
    const showColumnOrdersItems = Math.round((height - 250) / 50);
    const ordersPerPage = showColumns
        ? showColumnOrdersItems
        : regularOrdersItems;

    useEffect(() => {
        setCurrentPage(1);
    }, [account, isShowAllEnabled, baseTokenAddress + quoteTokenAddress]);

    // Get current tranges
    const indexOfLastRanges = currentPage * ordersPerPage;
    const indexOfFirstRanges = indexOfLastRanges - ordersPerPage;
    const currentRangess = sortedLimits?.slice(
        indexOfFirstRanges,
        indexOfLastRanges,
    );
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };
    const largeScreenView = useMediaQuery('(min-width: 1200px)');

    const usePaginateDataOrNull =
        expandTradeTable && largeScreenView ? currentRangess : sortedLimits;

    const footerDisplay = (
        <div className={styles.footer}>
            {expandTradeTable && sortedLimits.length > 30 && (
                <Pagination
                    itemsPerPage={ordersPerPage}
                    totalItems={sortedLimits.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            )}
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

    const rowItemContent = usePaginateDataOrNull?.map((order, idx) => (
        <OrderRow
            crocEnv={crocEnv}
            chainData={chainData}
            tradeData={tradeData}
            expandTradeTable={expandTradeTable}
            showPair={showPair}
            showSidebar={showSidebar}
            showColumns={showColumns}
            ipadView={ipadView}
            view2={view2}
            key={idx}
            limitOrder={order}
            openGlobalModal={props.openGlobalModal}
            closeGlobalModal={props.closeGlobalModal}
            currentPositionActive={currentPositionActive}
            setCurrentPositionActive={setCurrentPositionActive}
            isShowAllEnabled={isShowAllEnabled}
            isOnPortfolioPage={isOnPortfolioPage}
            handlePulseAnimation={handlePulseAnimation}
            lastBlockNumber={lastBlockNumber}
            account={account}
        />
    ));

    const orderDataOrNull = rowItemContent.length ? (
        rowItemContent
    ) : (
        <NoTableData
            isShowAllEnabled={isShowAllEnabled}
            type='orders'
            setIsShowAllEnabled={setIsShowAllEnabled}
            changeState={changeState}
            isOnPortfolioPage={isOnPortfolioPage}
            // setIsCandleSelected={setIsCandleSelected}
        />
    );

    const mobileView = useMediaQuery('(max-width: 1200px)');

    const mobileViewHeight = mobileView ? '70vh' : '250px';

    const expandStyle = expandTradeTable
        ? 'calc(100vh - 10rem)'
        : mobileViewHeight;

    const portfolioPageStyle = props.isOnPortfolioPage
        ? 'calc(100vh - 19.5rem)'
        : expandStyle;

    return (
        <section
            className={styles.main_list_container}
            style={{ height: portfolioPageStyle }}
        >
            {headerColumnsDisplay}
            {debouncedShouldDisplayLoadingAnimation ? (
                <TableSkeletons />
            ) : (
                orderDataOrNull
            )}
            {footerDisplay}
        </section>
    );
}
