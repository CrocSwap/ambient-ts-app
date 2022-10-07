// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

// START: Import JSX Elements
import styles from './Orders.module.css';
import OrderCard from './OrderCard';
import OrderCardHeader from './OrderCardHeader';

// START: Import Local Files
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import {
    addLimitOrderChangesByPool,
    graphData,
    setLimitOrdersByPool,
} from '../../../../utils/state/graphDataSlice';
import { fetchPoolLimitOrderStates } from '../../../../App/functions/fetchPoolLimitOrderStates';
import { ChainSpec } from '@crocswap-libs/sdk';
import useWebSocket from 'react-use-websocket';
// import OrderAccordions from './OrderAccordions/OrderAccordions';

// interface for props for react functional component
interface propsIF {
    expandTradeTable: boolean;
    chainData: ChainSpec;
    account: string;
    graphData: graphData;
    isShowAllEnabled: boolean;
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
}

// main react functional component
export default function Orders(props: propsIF) {
    const {
        chainData,
        expandTradeTable,
        account,
        graphData,
        isShowAllEnabled,
        setCurrentPositionActive,
        currentPositionActive,
    } = props;

    const limitOrdersByUser = graphData.limitOrdersByUser.limitOrders;
    const limitOrdersByPool = graphData.limitOrdersByPool.limitOrders;

    const tradeData = useAppSelector((state) => state.tradeData);
    const dispatch = useAppDispatch();

    const selectedBaseToken = tradeData.baseToken.address.toLowerCase();
    const selectedQuoteToken = tradeData.quoteToken.address.toLowerCase();

    const isDenomBase = tradeData.isDenomBase;

    const columnHeaders = [
        {
            name: 'ID',
            sortable: true,
            className: '',
        },
        {
            name: 'Wallet',
            sortable: true,
            className: 'wallet',
        },
        {
            name: 'Price',
            sortable: true,
            className: 'price',
        },
        {
            name: 'Side',
            sortable: true,
            className: 'side',
        },
        {
            name: 'Type',
            sortable: true,
            className: 'type',
        },
        {
            name: 'Value',
            sortable: true,
            className: '',
        },
        {
            name: tradeData.baseToken.symbol,
            sortable: false,
            className: 'token',
        },
        {
            name: tradeData.quoteToken.symbol,
            sortable: false,
            className: 'token',
        },
    ];

    // TODO:   currently the values to determine sort order are not
    // TODO:   ... being used productively because there is only
    // TODO:   ... placeholder data, we will revisit this later on

    const [sortBy, setSortBy] = useState('default');
    const [reverseSort, setReverseSort] = useState(false);

    // useEffect(() => {
    //     console.log({ sortBy, reverseSort });
    // }, [sortBy, reverseSort]);

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
    const ItemContent = (
        <div className={styles.desktop_transaction_display_container}>
            {showAllOrUserPositions.map((order, idx) => (
                <OrderCard
                    key={idx}
                    account={account}
                    limitOrder={order}
                    isDenomBase={isDenomBase}
                    selectedBaseToken={selectedBaseToken}
                    selectedQuoteToken={selectedQuoteToken}
                    openGlobalModal={props.openGlobalModal}
                    closeGlobalModal={props.closeGlobalModal}
                    currentPositionActive={currentPositionActive}
                    setCurrentPositionActive={setCurrentPositionActive}
                />
            ))}
        </div>
    );

    const mobileAccordionDisplay = (
        <div className={styles.accordion_display_container}>
            {/* {showAllOrUserPositions.map((order, idx) => (
                <OrderAccordions
                    key={idx}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    i={idx}
                    limitOrder={order}
                />
            ))} */}
            <p>Mobile Accordion here: Disabled for now</p>
        </div>
    );

    return (
        <div className={styles.container}>
            {/* <header >
                {columnHeaders.map((header) => (
                    <OrderCardHeader
                        key={`orderDataHeaderField${header.name}`}
                        data={header}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        reverseSort={reverseSort}
                        setReverseSort={setReverseSort}
                        columnHeaders={columnHeaders}
                    />
                ))}
            </header> */}
            <OrderCardHeader
                sortBy={sortBy}
                setSortBy={setSortBy}
                reverseSort={reverseSort}
                setReverseSort={setReverseSort}
                columnHeaders={columnHeaders}
            />
            <div
                className={styles.item_container}
                style={{ height: expandTradeTable ? '100%' : '170px' }}
            >
                {ItemContent}
                {mobileAccordionDisplay}
            </div>
        </div>
    );
}
