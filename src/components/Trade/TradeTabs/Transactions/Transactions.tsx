/* eslint-disable no-irregular-whitespace */
import styles from './Transactions.module.css';

import useMediaQuery from '../../../../utils/hooks/useMediaQuery';

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
import TransactionsSkeletons from '../TableSkeletons/TableSkeletons';
import Pagination from '../../../Global/Pagination/Pagination';
import { ChainSpec } from '@crocswap-libs/sdk';
import useWebSocket from 'react-use-websocket';
// import useDebounce from '../../../../App/hooks/useDebounce';
import { fetchPoolRecentChanges } from '../../../../App/functions/fetchPoolRecentChanges';
import TransactionHeader from './TransactionsTable/TransactionHeader';
import TransactionRow from './TransactionsTable/TransactionRow';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
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
    showSidebar: boolean;
    // setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}
export default function Transactions(props: TransactionsProps) {
    const {
        isShowAllEnabled,
        account,
        changesInSelectedCandle,
        graphData,

        chainData,
        blockExplorer,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        expandTradeTable,
        isCandleSelected,
        filter,
        showSidebar,
        openGlobalModal,
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
            tx.quote.toLowerCase() === quoteTokenAddressLowerCase &&
            tx.changeType !== 'fill'
        ) {
            return true;
        } else {
            return false;
        }
    });

    const changesByPoolMatchingSelectedTokens = changesByPool.filter((tx) => {
        if (
            tx.base.toLowerCase() === baseTokenAddressLowerCase &&
            tx.quote.toLowerCase() === quoteTokenAddressLowerCase &&
            tx.changeType !== 'fill'
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

    // console.log({ transactionData });

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

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;
    // console.log(changesByPool);

    // const [transactions] = useState(transactionData);
    const [currentPage, setCurrentPage] = useState(1);
    const [transactionsPerPage] = useState(20);

    useEffect(() => {
        setCurrentPage(1);
    }, [account, isShowAllEnabled, JSON.stringify({ baseTokenAddress, quoteTokenAddress })]);

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

    // const [expanded, setExpanded] = useState<false | number>(false);

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
            <p>{`${baseTokenSymbol} ( ${baseTokenCharacter} )`}</p>
            <p>{`${quoteTokenSymbol} ( ${quoteTokenCharacter} )`}</p>
        </>
    );
    const headerColumns = [
        {
            name: 'ID',

            show: !showColumns,
            slug: 'id',
            sortable: true,
        },
        {
            name: 'Wallet',

            show: !showColumns,
            slug: 'wallet',
            sortable: true,
        },
        {
            name: walID,

            show: showColumns,
            slug: 'walletid',
            sortable: false,
        },
        {
            name: `Price ( ${priceCharacter} )`,

            show: !ipadView,
            slug: 'price',
            sortable: true,
        },
        {
            name: 'Side',

            show: !showColumns,
            slug: 'side',
            sortable: true,
        },
        {
            name: 'Type',

            show: !showColumns,
            slug: 'type',
            sortable: true,
        },
        {
            name: sideType,

            show: showColumns && !ipadView,
            slug: 'sidetype',
            sortable: false,
        },
        {
            name: 'Value (USD)',

            show: true,
            slug: 'value',
            sortable: true,
        },
        {
            name: `${baseTokenSymbol} ( ${baseTokenCharacter} )`,

            show: !showColumns,
            slug: baseTokenSymbol,
            sortable: false,
        },
        {
            name: `${quoteTokenSymbol} ( ${quoteTokenCharacter} )`,

            show: !showColumns,
            slug: quoteTokenSymbol,
            sortable: false,
        },
        {
            name: tokens,

            show: showColumns,
            slug: 'tokens',
            sortable: false,
        },

        {
            name: '',

            show: true,
            slug: 'menu',
            sortable: false,
        },
    ];

    const [sortBy, setSortBy] = useState('default');
    const [reverseSort, setReverseSort] = useState(false);

    const headerColumnsDisplay = (
        <ul className={styles.header}>
            {headerColumns.map((header, idx) => (
                <TransactionHeader
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

    const footerDisplay = (
        <div className={styles.footer}>
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

    const rowItemContent = usePaginateDataOrNull?.map((tx, idx) => (
        <TransactionRow
            key={idx}
            tx={tx}
            currentTxActiveInTransactions={currentTxActiveInTransactions}
            setCurrentTxActiveInTransactions={setCurrentTxActiveInTransactions}
            openGlobalModal={openGlobalModal}
            isShowAllEnabled={isShowAllEnabled}
            ipadView={ipadView}
            showColumns={showColumns}
            showSidebar={showSidebar}
            blockExplorer={blockExplorer}
        />
    ));

    const noData = <div className={styles.no_data}>No Data to Display</div>;
    const transactionDataOrNull = dataToDisplay ? rowItemContent : noData;

    return (
        <main
            className={`${styles.main_list_container} `}
            style={{ height: expandTradeTable ? 'calc(100vh - 10rem)' : '250px' }}
        >
            {headerColumnsDisplay}
            {isDataLoading ? <TransactionsSkeletons /> : transactionDataOrNull}
            {footerDisplay}
        </main>
    );
}
