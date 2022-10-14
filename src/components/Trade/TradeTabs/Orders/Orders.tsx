// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

// START: Import JSX Elements
import styles from './Orders.module.css';

// START: Import Local Files
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import {
    addLimitOrderChangesByPool,
    graphData,
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

// import OrderAccordions from './OrderAccordions/OrderAccordions';

// interface for props for react functional component
interface propsIF {
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

    showSidebar: boolean;
}

// main react functional component
export default function Orders(props: propsIF) {
    const {
        crocEnv,
        chainData,
        expandTradeTable,
        account,
        graphData,
        isShowAllEnabled,
        setCurrentPositionActive,
        currentPositionActive,
        showSidebar,
    } = props;

    const limitOrdersByUser = graphData.limitOrdersByUser.limitOrders;
    const limitOrdersByPool = graphData.limitOrdersByPool.limitOrders;

    const tradeData = useAppSelector((state) => state.tradeData);
    const dispatch = useAppDispatch();
    const isDenomBase = tradeData.isDenomBase;

    // const selectedBaseToken = tradeData.baseToken.address.toLowerCase();
    // const selectedQuoteToken = tradeData.quoteToken.address.toLowerCase();

    // const isDenomBase = tradeData.isDenomBase;

    // const columnHeaders = [
    //     {
    //         name: 'ID',
    //         sortable: true,
    //         className: '',
    //     },
    //     {
    //         name: 'Wallet',
    //         sortable: true,
    //         className: 'wallet',
    //     },
    //     {
    //         name: 'Price',
    //         sortable: true,
    //         className: 'price',
    //     },
    //     {
    //         name: 'Side',
    //         sortable: true,
    //         className: 'side',
    //     },
    //     {
    //         name: 'Type',
    //         sortable: true,
    //         className: 'type',
    //     },
    //     {
    //         name: 'Value',
    //         sortable: true,
    //         className: '',
    //     },
    //     {
    //         name: tradeData.baseToken.symbol,
    //         sortable: false,
    //         className: 'token',
    //     },
    //     {
    //         name: tradeData.quoteToken.symbol,
    //         sortable: false,
    //         className: 'token',
    //     },
    // ];

    // TODO:   currently the values to determine sort order are not
    // TODO:   ... being used productively because there is only
    // TODO:   ... placeholder data, we will revisit this later on

    const [sortBy, setSortBy] = useState('default');
    const [reverseSort, setReverseSort] = useState(false);

    const [debouncedIsShowAllEnabled, setDebouncedIsShowAllEnabled] = useState(false);

    // wait 5 seconds to open a subscription to pool changes
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedIsShowAllEnabled(isShowAllEnabled), 5000);
        return () => clearTimeout(handler);
    }, [isShowAllEnabled]);

    useEffect(() => {
        if (isShowAllEnabled) {
            fetchPoolLimitOrderStates({
                chainId: chainData.chainId,
                base: tradeData.baseToken.address,
                quote: tradeData.quoteToken.address,
                poolIdx: chainData.poolIndex,
                ensResolution: true,
            })
                .then((poolChangesJsonData) => {
                    if (poolChangesJsonData) {
                        dispatch(
                            setLimitOrdersByPool({
                                dataReceived: true,
                                limitOrders: poolChangesJsonData,
                            }),
                        );
                    }
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

    const showAllOrUserPositions = isShowAllEnabled ? limitOrdersByPool : limitOrdersByUser;
    // const [expanded, setExpanded] = useState<false | number>(false);
    // const ItemContent = (
    //     <div className={styles.desktop_transaction_display_container}>
    //         {showAllOrUserPositions.map((order, idx) => (
    //             <OrderCard
    //                 key={idx}
    //                 account={account}
    //                 limitOrder={order}
    //                 isDenomBase={isDenomBase}
    //                 selectedBaseToken={selectedBaseToken}
    //                 selectedQuoteToken={selectedQuoteToken}
    //                 openGlobalModal={props.openGlobalModal}
    //                 closeGlobalModal={props.closeGlobalModal}
    //                 currentPositionActive={currentPositionActive}
    //                 setCurrentPositionActive={setCurrentPositionActive}
    //             />
    //         ))}
    //     </div>
    // );

    // const mobileAccordionDisplay = (
    //     <div className={styles.accordion_display_container}>

    //         <p>Mobile Accordion here: Disabled for now</p>
    //     </div>
    // );

    // const olderReturnData = (
    //        <div className={styles.container}>

    //          <OrderCardHeader
    //              sortBy={sortBy}
    //              setSortBy={setSortBy}
    //              reverseSort={reverseSort}
    //              setReverseSort={setReverseSort}
    //              columnHeaders={columnHeaders}
    //          />
    //          <div
    //              className={styles.item_container}
    //              style={{ height: expandTradeTable ? '100%' : '170px' }}
    //          >
    //              {ItemContent}
    //              {mobileAccordionDisplay}
    //          </div>
    //      </div>
    // )

    // -----------------------------
    const dataReceivedByPool = graphData?.changesByPool?.dataReceived;

    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataToDisplay, setDataToDisplay] = useState(false);
    const [dataReceived] = useState(dataReceivedByPool);

    function handleDataReceived() {
        setIsDataLoading(false);
        showAllOrUserPositions.length ? setDataToDisplay(true) : setDataToDisplay(false);
    }

    useEffect(() => {
        // console.log({ dataReceived });
        // console.log({ isDataLoading });
        dataReceived ? handleDataReceived() : setIsDataLoading(true);
    }, [graphData, showAllOrUserPositions, dataReceived]);

    // -----------------------------

    const sidebarOpen = false;

    const ipadView = useMediaQuery('(max-width: 480px)');
    const desktopView = useMediaQuery('(max-width: 768px)');

    const showColumns = sidebarOpen || desktopView;

    const quoteTokenSymbol = tradeData.quoteToken?.symbol;
    const baseTokenSymbol = tradeData.baseToken?.symbol;

    const baseTokenCharacter = baseTokenSymbol ? getUnicodeCharacter(baseTokenSymbol) : '';
    const quoteTokenCharacter = quoteTokenSymbol ? getUnicodeCharacter(quoteTokenSymbol) : '';

    const priceCharacter = isDenomBase ? quoteTokenCharacter : baseTokenCharacter;

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
            <p>{`${baseTokenSymbol} (${baseTokenCharacter})`}</p>
            <p>{`${quoteTokenSymbol} (${quoteTokenCharacter})`}</p>
        </>
    );
    const headerColumns = [
        {
            name: 'ID',
            className: 'ID',
            show: !showColumns,
            slug: 'id',
            sortable: true,
        },
        {
            name: 'Wallet',
            className: 'wallet',
            show: !showColumns,
            slug: 'wallet',
            sortable: true,
        },
        {
            name: walID,
            className: 'wallet_it',
            show: showColumns,
            slug: 'walletid',
            sortable: false,
        },
        {
            name: `Price(${priceCharacter})`,

            show: !ipadView,
            slug: 'price',
            sortable: true,
        },
        {
            name: 'Side',
            className: 'side',
            show: !showColumns,
            slug: 'side',
            sortable: true,
        },
        {
            name: 'Type',
            className: 'type',
            show: !showColumns,
            slug: 'type',
            sortable: true,
        },
        {
            name: sideType,
            className: 'side_type',
            show: showColumns && !ipadView,
            slug: 'sidetype',
            sortable: false,
        },
        {
            name: 'Value($)',
            className: 'value',
            show: true,
            slug: 'value',
            sortable: true,
        },
        {
            name: `${baseTokenSymbol} (${baseTokenCharacter})`,

            show: !showColumns,
            slug: baseTokenSymbol,
            sortable: false,
        },
        {
            name: `${quoteTokenSymbol} (${quoteTokenCharacter})`,

            show: !showColumns,
            slug: quoteTokenSymbol,
            sortable: false,
        },
        {
            name: tokens,
            className: 'tokens',
            show: showColumns,
            slug: 'tokens',
            sortable: false,
        },
        {
            name: 'Status',
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

    const headerColumnsDisplay = (
        <ul className={styles.header}>
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

    const rowItemContent = showAllOrUserPositions.map((order, idx) => (
        <OrderRow
            crocEnv={crocEnv}
            expandTradeTable={expandTradeTable}
            showSidebar={showSidebar}
            showColumns={showColumns}
            ipadView={ipadView}
            key={idx}
            limitOrder={order}
            openGlobalModal={props.openGlobalModal}
            closeGlobalModal={props.closeGlobalModal}
            currentPositionActive={currentPositionActive}
            setCurrentPositionActive={setCurrentPositionActive}
            isShowAllEnabled={isShowAllEnabled}
        />
    ));

    const orderDataOrNull = dataToDisplay ? rowItemContent : 'noData';

    return (
        <main
            className={styles.main_list_container}
            style={{ height: expandTradeTable ? '100%' : '170px' }}
        >
            {/* {header} */}
            {headerColumnsDisplay}
            {isDataLoading ? <TableSkeletons /> : orderDataOrNull}
            {/* {rowItemContent} */}
        </main>
    );
}
