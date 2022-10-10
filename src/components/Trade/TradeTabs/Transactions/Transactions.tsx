import styles from './Transactions.module.css';
import TransactionCard from './TransactionCard';
import TransactionCardHeader from './TransactionCardHeader';
import {
    addChangesByPool,
    CandleData,
    graphData,
    ITransaction,
    setChangesByPool,
} from '../../../../utils/state/graphDataSlice';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { Dispatch, SetStateAction, useState, useEffect, useMemo } from 'react';
import TransactionsSkeletons from './TransactionsSkeletons/TransactionsSkeletons';
import Pagination from '../../../Global/Pagination/Pagination';
import { ChainSpec } from '@crocswap-libs/sdk';
import useWebSocket from 'react-use-websocket';
// import useDebounce from '../../../../App/hooks/useDebounce';
import { fetchPoolRecentChanges } from '../../../../App/functions/fetchPoolRecentChanges';
// import TransactionAccordions from './TransactionAccordions/TransactionAccordions';

interface TransactionsProps {
    isShowAllEnabled: boolean;
    portfolio?: boolean;
    tokenMap: Map<string, TokenIF>;
    changesInSelectedCandle: ITransaction[];
    graphData: graphData;
    chainData: ChainSpec;
    blockExplorer?: string;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    account: string;
    expandTradeTable: boolean;

    isCandleSelected: boolean | undefined;
    filter: CandleData | undefined;

    openGlobalModal: (content: React.ReactNode) => void;
    // setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}
export default function Transactions(props: TransactionsProps) {
    const {
        isShowAllEnabled,
        account,
        changesInSelectedCandle,
        graphData,
        tokenMap,
        chainData,
        blockExplorer,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        expandTradeTable,
        isCandleSelected,
        filter,
        // setExpandTradeTable,
    } = props;

    const changesByUser = graphData?.changesByUser?.changes;
    const changesByPool = graphData?.changesByPool?.changes;

    const tradeData = useAppSelector((state) => state.tradeData);

    const baseTokenAddressLowerCase = tradeData.baseToken.address.toLowerCase();
    const quoteTokenAddressLowerCase = tradeData.quoteToken.address.toLowerCase();

    const changesByUserMatchingSelectedTokens = changesByUser.filter((tx) => {
        if (
            tx.base.toLowerCase() === baseTokenAddressLowerCase &&
            tx.quote.toLowerCase() === quoteTokenAddressLowerCase
        ) {
            return true;
        } else {
            return false;
        }
    });

    const changesByPoolMatchingSelectedTokens = changesByPool.filter((tx) => {
        if (
            tx.base.toLowerCase() === baseTokenAddressLowerCase &&
            tx.quote.toLowerCase() === quoteTokenAddressLowerCase
        ) {
            return true;
        } else {
            return false;
        }
    });

    // console.log(changesByPool);

    const dataReceivedByUser = graphData?.changesByUser?.dataReceived;
    const dataReceivedByPool = graphData?.changesByPool?.dataReceived;

    const [transactionData, setTransactionData] = useState(changesByPoolMatchingSelectedTokens);
    const [dataReceived, setDataReceived] = useState(dataReceivedByPool);
    // todoJr: Finish this loading logic
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataToDisplay, setDataToDisplay] = useState(false);

    const [debouncedIsShowAllEnabled, setDebouncedIsShowAllEnabled] = useState(false);

    // check to see if data is received
    // if it is, set data is loading to false
    // check to see if we have items to display
    // if we do, set data to display to true
    // else set data to display to false
    // else set data is loading to true

    // 0x0000000000000000000000000000000000000000
    // 0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60

    function handleDataReceived() {
        setIsDataLoading(false);
        transactionData.length ? setDataToDisplay(true) : setDataToDisplay(false);
    }
    function handleUserSelected() {
        setTransactionData(changesByUserMatchingSelectedTokens);
        setDataReceived(dataReceivedByUser);
    }
    function handlePoolSelected() {
        setTransactionData(changesByPoolMatchingSelectedTokens);
        setDataReceived(dataReceivedByPool);
    }
    // console.log({ isCandleSelected });
    useEffect(() => {
        isCandleSelected
            ? setTransactionData(changesInSelectedCandle)
            : // ? setTransactionData(
            //       changesByPool.filter((data) => {
            //           filter?.allSwaps?.includes(data.id);
            //       }),
            //   )
            !isShowAllEnabled
            ? handleUserSelected()
            : handlePoolSelected();
    }, [
        isShowAllEnabled,
        isCandleSelected,
        filter,
        changesInSelectedCandle,
        JSON.stringify(changesByUserMatchingSelectedTokens),
        JSON.stringify(changesByPoolMatchingSelectedTokens),
    ]);

    useEffect(() => {
        // console.log({ dataReceived });
        // console.log({ isDataLoading });
        dataReceived ? handleDataReceived() : setIsDataLoading(true);
    }, [graphData, transactionData, dataReceived]);

    const isDenomBase = tradeData.isDenomBase;

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;
    // console.log(changesByPool);

    // const [transactions] = useState(transactionData);
    const [currentPage, setCurrentPage] = useState(1);
    const [transactionsPerPage] = useState(30);

    useEffect(() => {
        setCurrentPage(1);
    }, [isShowAllEnabled]);

    // Get current transactions
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = transactionData?.slice(
        indexOfFirstTransaction,
        indexOfLastTransaction,
    );

    // console.log({ expandTradeTable });
    // console.log({ currentPage });
    // console.log({ indexOfLastTransaction });
    // console.log({ indexOfFirstTransaction });
    // console.log({ currentTransactions });
    // console.log({ transactionData });

    // Change page
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const usePaginateDataOrNull = expandTradeTable ? currentTransactions : transactionData;

    // console.log({ transactionData });

    // wait 5 seconds to open a subscription to pool changes
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedIsShowAllEnabled(isShowAllEnabled), 5000);
        return () => clearTimeout(handler);
    }, [isShowAllEnabled]);

    useEffect(() => {
        if (isShowAllEnabled) {
            fetchPoolRecentChanges({
                base: baseTokenAddress,
                quote: quoteTokenAddress,
                poolIdx: chainData.poolIndex,
                chainId: chainData.chainId,
                annotate: true,
                addValue: true,
                simpleCalc: true,
                annotateMEV: false,
                ensResolution: true,
                n: 100,
            })
                .then((poolChangesJsonData) => {
                    if (poolChangesJsonData) {
                        dispatch(
                            setChangesByPool({
                                dataReceived: true,
                                changes: poolChangesJsonData,
                            }),
                        );
                    }
                })
                .catch(console.log);
        }
    }, [isShowAllEnabled]);

    const wssGraphCacheServerDomain = 'wss://809821320828123.de:5000';

    const poolRecentChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_pool_recent_changes?' +
            new URLSearchParams({
                base: baseTokenAddress.toLowerCase(),
                quote: quoteTokenAddress.toLowerCase(),
                poolIdx: chainData.poolIndex.toString(),
                chainId: chainData.chainId,
                ensResolution: 'true',
                annotate: 'true',
                //  addCachedAPY: 'true',
                //  omitKnockout: 'true',
                addValue: 'true',
            }),
        [baseTokenAddress, quoteTokenAddress, chainData.chainId, chainData.poolIndex],
    );

    const {
        //  sendMessage,
        lastMessage: lastPoolChangeMessage,
        //  readyState
    } = useWebSocket(
        poolRecentChangesCacheSubscriptionEndpoint,
        {
            // share:  true,
            onOpen: () => {
                console.log('pool recent changes subscription opened');

                // repeat fetch with the interval of 30 seconds
                const timerId = setInterval(() => {
                    fetchPoolRecentChanges({
                        base: baseTokenAddress,
                        quote: quoteTokenAddress,
                        poolIdx: chainData.poolIndex,
                        chainId: chainData.chainId,
                        annotate: true,
                        addValue: true,
                        simpleCalc: true,
                        annotateMEV: false,
                        ensResolution: true,
                        n: 100,
                    })
                        .then((poolChangesJsonData) => {
                            if (poolChangesJsonData) {
                                dispatch(addChangesByPool(poolChangesJsonData));
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

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (lastPoolChangeMessage !== null) {
            const lastMessageData = JSON.parse(lastPoolChangeMessage.data).data;
            // console.log({ lastMessageData });
            if (lastMessageData) dispatch(addChangesByPool(lastMessageData));
        }
    }, [lastPoolChangeMessage]);

    const TransactionsDisplay = (
        <div className={styles.desktop_transaction_display_container}>
            {usePaginateDataOrNull?.map((tx, idx) => (
                <TransactionCard
                    key={idx}
                    tx={tx}
                    tokenMap={tokenMap}
                    chainId={chainData.chainId}
                    blockExplorer={blockExplorer}
                    tokenAAddress={tokenAAddress}
                    tokenBAddress={tokenBAddress}
                    isDenomBase={isDenomBase}
                    account={account}
                    currentTxActiveInTransactions={currentTxActiveInTransactions}
                    setCurrentTxActiveInTransactions={setCurrentTxActiveInTransactions}
                    openGlobalModal={props.openGlobalModal}
                />
            ))}
        </div>
    );
    // const [expanded, setExpanded] = useState<false | number>(false);

    const accordionsDisplay = (
        <div className={styles.accordion_display_container}>
            {/* {usePaginateDataOrNull?.map((tx, idx) => (
                <TransactionAccordions
                    key={idx}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    tx={tx}
                    i={idx}
                />
            ))} */}
            <p>Mobile Accordion here: Disabled for now</p>
        </div>
    );

    const noData = <div className={styles.no_data}>No Data to Display</div>;
    const transactionDataOrNull = dataToDisplay ? TransactionsDisplay : noData;

    return (
        <div className={styles.container}>
            <TransactionCardHeader tradeData={tradeData} />
            <div
                className={`${styles.item_container} ${expandTradeTable && styles.expand_height}`}
                // style={{ height: expandTradeTable ? '100%' : '170px' }}
            >
                {isDataLoading ? <TransactionsSkeletons /> : accordionsDisplay}
                {isDataLoading ? <TransactionsSkeletons /> : transactionDataOrNull}
            </div>
            {expandTradeTable && transactionData.length > 30 && (
                <Pagination
                    itemsPerPage={transactionsPerPage}
                    totalItems={transactionData.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            )}
        </div>
    );
}
