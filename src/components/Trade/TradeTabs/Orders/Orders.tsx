/* eslint-disable no-irregular-whitespace */
// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

// START: Import JSX Elements
import styles from './Orders.module.css';

// START: Import Local Files
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import {
    addLimitOrderChangesByPool,
    CandleData,
    graphData,
    setDataLoadingStatus,
    setLimitOrdersByPool,
} from '../../../../utils/state/graphDataSlice';
import { fetchPoolLimitOrderStates } from '../../../../App/functions/fetchPoolLimitOrderStates';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import useWebSocket from 'react-use-websocket';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import OrderHeader from './OrderTable/OrderHeader';
import OrderRow from './OrderTable/OrderRow';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import TableSkeletons from '../TableSkeletons/TableSkeletons';
import { useSortedLimits } from '../useSortedLimits';
import { LimitOrderIF, TokenIF } from '../../../../utils/interfaces/exports';
import { getLimitOrderData } from '../../../../App/functions/getLimitOrderData';
import useDebounce from '../../../../App/hooks/useDebounce';
import NoTableData from '../NoTableData/NoTableData';
import Pagination from '../../../Global/Pagination/Pagination';

// import OrderAccordions from './OrderAccordions/OrderAccordions';

// interface for props for react functional component
interface propsIF {
    activeAccountLimitOrderData?: LimitOrderIF[];
    importedTokens: TokenIF[];
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
    changeState?: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    lastBlockNumber: number;
    showSidebar: boolean;
    handlePulseAnimation?: (type: string) => void;
}

// main react functional component
export default function Orders(props: propsIF) {
    const {
        activeAccountLimitOrderData,
        importedTokens,
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

    const limitOrdersByUser = graphData.limitOrdersByUser.limitOrders;
    const limitOrdersByPool = graphData.limitOrdersByPool.limitOrders;
    const dataLoadingStatus = graphData?.dataLoadingStatus;

    // allow a local environment variable to be defined in [app_repo]/.env.local to turn off connections to the cache server
    const isServerEnabled =
        process.env.REACT_APP_CACHE_SERVER_IS_ENABLED !== undefined
            ? process.env.REACT_APP_CACHE_SERVER_IS_ENABLED === 'true'
            : true;

    // const poolSwapsCacheEndpoint = httpGraphCacheServerDomain + '/pool_recent_changes?';

    const tradeData = useAppSelector((state) => state.tradeData);

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;

    const baseTokenAddressLowerCase = tradeData.baseToken.address.toLowerCase();
    const quoteTokenAddressLowerCase = tradeData.quoteToken.address.toLowerCase();

    const isConnectedUserOrderDataLoading = dataLoadingStatus?.isConnectedUserOrderDataLoading;
    const isLookupUserOrderDataLoading = dataLoadingStatus?.isLookupUserOrderDataLoading;
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

    const debouncedShouldDisplayLoadingAnimation = useDebounce(shouldDisplayLoadingAnimation, 1000); // debounce 1/4 second

    const ordersByUserMatchingSelectedTokens = limitOrdersByUser.filter((tx) => {
        if (
            tx.base.toLowerCase() === baseTokenAddressLowerCase &&
            tx.quote.toLowerCase() === quoteTokenAddressLowerCase
        ) {
            return true;
        } else {
            return false;
        }
    });

    const dispatch = useAppDispatch();

    // const isDenomBase = tradeData.isDenomBase;

    const [limitOrderData, setLimitOrderData] = useState(
        isOnPortfolioPage ? activeAccountLimitOrderData || [] : limitOrdersByPool,
    );

    const [debouncedIsShowAllEnabled, setDebouncedIsShowAllEnabled] = useState(false);

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
        JSON.stringify(activeAccountLimitOrderData),
        JSON.stringify(ordersByUserMatchingSelectedTokens),
        JSON.stringify(limitOrdersByPool),
    ]);

    // wait 5 seconds to open a subscription to pool changes
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedIsShowAllEnabled(isShowAllEnabled), 5000);
        return () => clearTimeout(handler);
    }, [isShowAllEnabled]);

    const nonEmptyOrders = isShowAllEnabled
        ? limitOrdersByPool.filter((limitOrder) => limitOrder.totalValueUSD !== 0)
        : limitOrderData.filter((limitOrder) => limitOrder.totalValueUSD !== 0);

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedLimits] = useSortedLimits(
        'time',
        nonEmptyOrders,
    );
    useEffect(() => {
        if (isServerEnabled && isShowAllEnabled) {
            fetchPoolLimitOrderStates({
                chainId: chainData.chainId,
                base: tradeData.baseToken.address,
                quote: tradeData.quoteToken.address,
                poolIdx: chainData.poolIndex,
                ensResolution: true,
            })
                .then((orderJsonData) => {
                    if (orderJsonData) {
                        Promise.all(
                            orderJsonData.map((limitOrder: LimitOrderIF) => {
                                return getLimitOrderData(limitOrder, importedTokens);
                            }),
                        ).then((updatedLimitOrderStates) => {
                            dispatch(
                                setLimitOrdersByPool({
                                    dataReceived: true,
                                    limitOrders: updatedLimitOrderStates,
                                }),
                            );
                        });
                    }
                    dispatch(
                        setDataLoadingStatus({
                            datasetName: 'poolOrderData',
                            loadingStatus: false,
                        }),
                    );
                })
                .catch(console.log);
        }
    }, [isServerEnabled, isShowAllEnabled]);

    const wssGraphCacheServerDomain = 'wss://809821320828123.de:5000';

    const poolLimitOrderChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_pool_recent_changes?' +
            new URLSearchParams({
                chainId: chainData.chainId,
                base: tradeData.baseToken.address,
                quote: tradeData.quoteToken.address,
                poolIdx: chainData.poolIndex.toString(),
                ensResolution: 'true',
            }),
        [
            chainData.chainId,
            account,
            tradeData.baseToken.address,
            tradeData.quoteToken.address,
            chainData.poolIndex,
        ],
    );

    const {
        //  sendMessage,
        lastMessage: lastPoolLimitOrderChangeMessage,
        //  readyState
    } = useWebSocket(
        poolLimitOrderChangesCacheSubscriptionEndpoint,
        {
            // share:  true,
            onOpen: () => {
                console.log('pool limit orders subscription opened');

                // // repeat fetch with the interval of 30 seconds
                // const timerId = setInterval(() => {
                //     fetchPoolLimitOrderStates({
                //         chainId: chainData.chainId,
                //         base: tradeData.baseToken.address,
                //         quote: tradeData.quoteToken.address,
                //         poolIdx: chainData.poolIndex,
                //         ensResolution: true,
                //     })
                //         .then((poolChangesJsonData) => {
                //             if (poolChangesJsonData) {
                //                 // console.log({ poolChangesJsonData });
                //                 dispatch(addLimitOrderChangesByPool(poolChangesJsonData));
                //             }
                //         })
                //         .catch(console.log);
                // }, 30000);

                // // after 90 seconds stop
                // setTimeout(() => {
                //     clearInterval(timerId);
                // }, 90000);
            },
            onClose: (event: CloseEvent) => console.log({ event }),
            // onClose: () => console.log('allPositions websocket connection closed'),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => true,
        },
        // only connect if user is viewing pool changes
        isServerEnabled && debouncedIsShowAllEnabled,
    );

    useEffect(() => {
        if (lastPoolLimitOrderChangeMessage !== null) {
            const lastMessageData = JSON.parse(lastPoolLimitOrderChangeMessage.data).data;
            // console.log({ lastMessageData });
            if (lastMessageData) {
                console.log({ lastMessageData });
                Promise.all(
                    lastMessageData.map((limitOrder: LimitOrderIF) => {
                        return getLimitOrderData(limitOrder, importedTokens);
                    }),
                ).then((updatedLimitOrderStates) => {
                    dispatch(addLimitOrderChangesByPool(updatedLimitOrderStates));
                });
            }
        }
    }, [lastPoolLimitOrderChangeMessage]);

    // console.log({ limitOrderData });

    // -----------------------------
    // const dataReceivedByPool = graphData?.changesByPool?.dataReceived;
    // const [isDataLoading, setIsDataLoading] = useState(true);
    // const [dataToDisplay, setDataToDisplay] = useState(false);
    // const [dataReceived] = useState(limitOrderData.length > 0);

    // function handleDataReceived() {
    //     setIsDataLoading(false);
    //     limitOrderData.length ? setDataToDisplay(true) : setDataToDisplay(false);
    // }

    // useEffect(() => {
    //     dataReceived ? handleDataReceived() : setIsDataLoading(true);
    // }, [graphData, limitOrderData, dataReceived]);

    // -----------------------------

    const ipadView = useMediaQuery('(max-width: 480px)');
    // const desktopView = useMediaQuery('(max-width: 768px)');
    const view2 = useMediaQuery('(max-width: 1568px)');
    const showColumns = useMediaQuery('(max-width: 1440px)');

    // const showColumns = desktopView;

    const quoteTokenSymbol = tradeData.quoteToken?.symbol;
    const baseTokenSymbol = tradeData.baseToken?.symbol;

    const baseTokenCharacter = baseTokenSymbol ? getUnicodeCharacter(baseTokenSymbol) : '';
    const quoteTokenCharacter = quoteTokenSymbol ? getUnicodeCharacter(quoteTokenSymbol) : '';

    // const priceCharacter = isDenomBase ? quoteTokenCharacter : baseTokenCharacter;

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
            <p>{`${baseTokenSymbol} ( ${baseTokenCharacter} )`}</p>
            <p>{`${quoteTokenSymbol} ( ${quoteTokenCharacter} )`}</p>
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
            show: isOnPortfolioPage && !showSidebar,
            slug: 'pool',
            sortable: false,
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
            show: !showColumns,
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
    const headerStyle = isOnPortfolioPage ? styles.portfolio_header : styles.trade_header;

    // ---------------------
    const [currentPage, setCurrentPage] = useState(1);
    // transactions per page media queries
    const txView1 = useMediaQuery('(max-width: 480px)');
    const txView2 = useMediaQuery('(max-width: 720px)');
    const txView3 = useMediaQuery('(max-width: 1200px)');
    const txView4 = useMediaQuery('(max-width: 1800px)');
    // const txView4 = useMediaQuery('(min-width: 2400px)');

    const ordersPerPage = txView1 ? 3 : txView2 ? 10 : txView3 ? 12 : txView4 ? 15 : 20;

    useEffect(() => {
        setCurrentPage(1);
    }, [account, isShowAllEnabled, JSON.stringify({ baseTokenAddress, quoteTokenAddress })]);

    // Get current tranges
    const indexOfLastRanges = currentPage * ordersPerPage;
    const indexOfFirstRanges = indexOfLastRanges - ordersPerPage;
    const currentRangess = sortedLimits?.slice(indexOfFirstRanges, indexOfLastRanges);
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const usePaginateDataOrNull = expandTradeTable ? currentRangess : sortedLimits;

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
    const expandStyle = expandTradeTable ? 'calc(100vh - 10rem)' : '250px';

    const portfolioPageStyle = props.isOnPortfolioPage ? 'calc(100vh - 19.5rem)' : expandStyle;

    return (
        <section className={styles.main_list_container} style={{ height: portfolioPageStyle }}>
            {headerColumnsDisplay}
            {debouncedShouldDisplayLoadingAnimation ? <TableSkeletons /> : orderDataOrNull}
            {footerDisplay}

            {/* {isDataLoading ? <TableSkeletons /> : orderDataOrNull} */}
        </section>
    );
}
