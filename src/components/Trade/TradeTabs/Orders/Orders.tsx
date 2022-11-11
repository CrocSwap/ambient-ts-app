/* eslint-disable no-irregular-whitespace */
// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

// START: Import JSX Elements
import styles from './Orders.module.css';

// START: Import Local Files
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import {
    addLimitOrderChangesByPool,
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
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    isOnPortfolioPage: boolean;

    showSidebar: boolean;
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
    } = props;

    const limitOrdersByUser = graphData.limitOrdersByUser.limitOrders;
    const limitOrdersByPool = graphData.limitOrdersByPool.limitOrders;
    const dataLoadingStatus = graphData?.dataLoadingStatus;

    const tradeData = useAppSelector((state) => state.tradeData);

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

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedLimits] = useSortedLimits(
        'lastUpdate',
        isShowAllEnabled ? limitOrdersByPool : limitOrderData,
    );
    useEffect(() => {
        if (isShowAllEnabled) {
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
    }, [isShowAllEnabled]);

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

                // repeat fetch with the interval of 30 seconds
                const timerId = setInterval(() => {
                    fetchPoolLimitOrderStates({
                        chainId: chainData.chainId,
                        base: tradeData.baseToken.address,
                        quote: tradeData.quoteToken.address,
                        poolIdx: chainData.poolIndex,
                        ensResolution: true,
                    })
                        .then((poolChangesJsonData) => {
                            if (poolChangesJsonData) {
                                // console.log({ poolChangesJsonData });
                                dispatch(addLimitOrderChangesByPool(poolChangesJsonData));
                            }
                        })
                        .catch(console.log);
                }, 30000);

                // after 90 seconds stop
                setTimeout(() => {
                    clearInterval(timerId);
                }, 90000);
            },
            onClose: (event: CloseEvent) => console.log({ event }),
            // onClose: () => console.log('allPositions websocket connection closed'),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => true,
        },
        // only connect if user is viewing pool changes
        debouncedIsShowAllEnabled,
    );

    useEffect(() => {
        if (lastPoolLimitOrderChangeMessage !== null) {
            const lastMessageData = JSON.parse(lastPoolLimitOrderChangeMessage.data).data;
            // console.log({ lastMessageData });
            if (lastMessageData) dispatch(addLimitOrderChangesByPool(lastMessageData));
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
    const desktopView = useMediaQuery('(max-width: 768px)');
    const view2 = useMediaQuery('(max-width: 1568px)');

    const showColumns = desktopView;

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
            <p>Side</p>
            <p>Type</p>
        </>
    );
    const tokens = (
        <>
            <p>{`${baseTokenSymbol} ( ${baseTokenCharacter} )`}</p>
            <p>{`${quoteTokenSymbol} ( ${quoteTokenCharacter} )`}</p>
        </>
    );
    const headerColumns = [
        {
            name: 'Date',
            className: '',
            show:
                !showColumns &&
                !view2 &&
                // && !showSidebar
                !isOnPortfolioPage,
            slug: 'date',
            sortable: true,
        },
        {
            name: '',
            className: '',
            show: isOnPortfolioPage,
            slug: 'token_images',
            sortable: false,
        },
        {
            name: 'Pool',
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
            name: 'Price',

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
            name: isOnPortfolioPage ? 'Qty A' : `${baseTokenSymbol}`,

            show: !showColumns,
            slug: baseTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: isOnPortfolioPage ? 'Qty B' : `${quoteTokenSymbol}`,

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
            name: ' ',
            className: '',
            show: !ipadView,
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
    const headerStyle = isOnPortfolioPage ? styles.portfolio_header : styles.trade_header;

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

    const rowItemContent = sortedLimits.map((order, idx) => (
        <OrderRow
            crocEnv={crocEnv}
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
        />
    ));

    const noData = <div className={styles.no_data}>No Data to Display</div>;

    const orderDataOrNull = limitOrderData.length ? rowItemContent : noData;

    const expandStyle = expandTradeTable ? 'calc(100vh - 10rem)' : '250px';

    const portfolioPageStyle = props.isOnPortfolioPage ? 'calc(100vh - 19.5rem)' : expandStyle;

    return (
        <main className={styles.main_list_container} style={{ height: portfolioPageStyle }}>
            {headerColumnsDisplay}
            {debouncedShouldDisplayLoadingAnimation ? <TableSkeletons /> : orderDataOrNull}
            {/* {isDataLoading ? <TableSkeletons /> : orderDataOrNull} */}
        </main>
    );
}
