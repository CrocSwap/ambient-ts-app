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
// import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { useSortedTransactions } from '../useSortedTxs';
// import TransactionAccordions from './TransactionAccordions/TransactionAccordions';
interface TransactionsProps {
    importedTokens: TokenIF[];
    isTokenABase: boolean;
    activeAccountTransactionData?: ITransaction[];
    connectedAccountActive?: boolean;
    isShowAllEnabled: boolean;
    portfolio?: boolean;
    tokenMap: Map<string, TokenIF>;
    changesInSelectedCandle: ITransaction[] | undefined;
    graphData: graphData;
    chainData: ChainSpec;
    blockExplorer?: string;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    account: string;
    expandTradeTable: boolean;

    isCandleSelected: boolean | undefined;
    filter?: CandleData | undefined;

    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
    showSidebar: boolean;

    isOnPortfolioPage: boolean;

    // setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}
export default function Transactions(props: TransactionsProps) {
    const {
        importedTokens,
        isTokenABase,
        activeAccountTransactionData,
        // connectedAccountActive,
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
        closeGlobalModal,
        isOnPortfolioPage,
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

    const changesByUserWithoutFills = changesByUser.filter((tx) => {
        if (tx.changeType !== 'fill') {
            return true;
        } else {
            return false;
        }
    });

    const changesByPoolWithoutFills = changesByPool.filter((tx) => {
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

    const [transactionData, setTransactionData] = useState(
        isOnPortfolioPage ? activeAccountTransactionData || [] : changesByPoolWithoutFills,
    );

    // console.log({ transactionData });

    useEffect(() => {
        // console.log({ isOnPortfolioPage });
        if (isOnPortfolioPage && activeAccountTransactionData?.length) {
            // console.log({ activeAccountTransactionData });
            setTransactionData(activeAccountTransactionData);
            setDataToDisplay(true);
        }
    }, [isOnPortfolioPage, activeAccountTransactionData]);

    // const [responseReceived, setResponseReceived] = useState(false);
    // todoJr: Finish this loading logic
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataToDisplay, setDataToDisplay] = useState(false);

    // console.log({ transactionData });

    const [debouncedIsShowAllEnabled, setDebouncedIsShowAllEnabled] = useState(false);

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedTransactions] =
        useSortedTransactions(
            'time',
            isShowAllEnabled ? changesByPoolWithoutFills : transactionData,
        );

    // check to see if data is received
    // if it is, set data is loading to false
    // check to see if we have items to display
    // if we do, set data to display to true
    // else set data to display to false
    // else set data is loading to true

    // 0x0000000000000000000000000000000000000000
    // 0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60

    function handleResponseReceived() {
        if (transactionData.length) {
            setDataToDisplay(true);
        } else {
            setDataToDisplay(false);
        }
        setIsDataLoading(false);
    }
    function handleUserSelected() {
        // console.log({ changesByUserMatchingSelectedTokens });
        // if (!isOnPortfolioPage) {
        setTransactionData(changesByUserMatchingSelectedTokens);
        setIsDataLoading(!dataReceivedByUser);
        setDataToDisplay(changesByUserWithoutFills?.length > 0);
        // }
    }
    function handlePoolSelected() {
        if (!isOnPortfolioPage) {
            // console.log({ changesByPoolWithoutFills });
            setTransactionData(changesByPoolWithoutFills);
            setDataToDisplay(changesByPoolWithoutFills?.length > 0);
            setIsDataLoading(!dataReceivedByPool);
        }
    }
    // console.log({ isCandleSelected });
    useEffect(() => {
        // console.log({ changesInSelectedCandle });
        if (isCandleSelected) {
            if (changesInSelectedCandle?.length) {
                setTransactionData(changesInSelectedCandle);
                setDataToDisplay(true);
            } else {
                setDataToDisplay(false);
            }
            setIsDataLoading(false);
        } else if (isShowAllEnabled) {
            handlePoolSelected();
        } else {
            handleUserSelected();
        }
        // isCandleSelected && changesInSelectedCandle
        //     ? setTransactionData(changesInSelectedCandle)
        //     : !isShowAllEnabled
        //     ? handleUserSelected()
        //     : handlePoolSelected();
    }, [
        isShowAllEnabled,
        isCandleSelected,
        filter,
        changesInSelectedCandle,
        JSON.stringify(changesByUserMatchingSelectedTokens),
        JSON.stringify(changesByPoolWithoutFills),
    ]);

    useEffect(() => {
        // console.log({ dataReceived });
        // console.log({ isDataLoading });
        if (!isDataLoading) {
            handleResponseReceived();
        }
        // dataReceived ? handleResponseReceived() : setIsDataLoading(true);
    }, [isDataLoading]);
    // }, [graphData, transactionData, isDataLoading]);

    // const isDenomBase = tradeData.isDenomBase;

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
    const currentTransactions = sortedTransactions?.slice(
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

    const usePaginateDataOrNull = expandTradeTable ? currentTransactions : sortedTransactions;

    // console.log({ transactionData });

    // wait 5 seconds to open a subscription to pool changes
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedIsShowAllEnabled(isShowAllEnabled), 5000);
        return () => clearTimeout(handler);
    }, [isShowAllEnabled]);

    useEffect(() => {
        if (isShowAllEnabled) {
            fetchPoolRecentChanges({
                importedTokens: importedTokens,
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
                        importedTokens: importedTokens,
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

    // const sidebarOpen = false;

    const ipadView = useMediaQuery('(max-width: 480px)');
    const desktopView = useMediaQuery('(max-width: 768px)');
    const view2 = useMediaQuery('(max-width: 1568px)');

    const showColumns = desktopView;

    const quoteTokenSymbol = tradeData.quoteToken?.symbol;
    const baseTokenSymbol = tradeData.baseToken?.symbol;

    // const baseTokenCharacter = baseTokenSymbol ? getUnicodeCharacter(baseTokenSymbol) : '';
    // const quoteTokenCharacter = quoteTokenSymbol ? getUnicodeCharacter(quoteTokenSymbol) : '';

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
    const tokens = <></>;
    // const tokens = (
    //     <>
    //         <p>{`${baseTokenSymbol} ( ${baseTokenCharacter} )`}</p>
    //         <p>{`${quoteTokenSymbol} ( ${quoteTokenCharacter} )`}</p>
    //     </>
    // );

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
            name: 'Pair',
            className: '',
            show: isOnPortfolioPage,
            slug: 'pool',
            sortable: true,
        },
        // {
        //     name: 'Pool',
        //     className: '',
        //     show: isOnPortfolioPage && !showSidebar,
        //     slug: 'pool',
        //     sortable: false,
        // },
        {
            name: 'ID',

            show: !showColumns,
            slug: 'id',
            sortable: false,
        },
        {
            name: 'Wallet',

            show: !showColumns && !isOnPortfolioPage,
            slug: 'wallet',
            sortable: isShowAllEnabled,
        },
        {
            name: walID,

            show: showColumns,
            slug: 'walletid',
            sortable: false,
        },
        {
            name: 'Price',

            show: !ipadView,
            slug: 'price',
            sortable: false,
            alignRight: true,
        },
        {
            name: 'Side',

            show: !showColumns,
            slug: 'side',
            sortable: false,
            alignCenter: true,
        },
        {
            name: 'Type',

            show: !showColumns,
            slug: 'type',
            sortable: false,
            alignCenter: true,
        },
        {
            name: sideType,

            show: showColumns && !ipadView,
            slug: 'sidetype',
            sortable: false,
            alignCenter: true,
        },
        {
            name: 'Value (USD)',

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

            show: showColumns,

            slug: 'tokens',
            sortable: false,
            alignRight: true,
        },

        {
            name: '',

            show: true,
            slug: 'menu',
            sortable: false,
        },
    ];

    const headerStyle = isOnPortfolioPage ? styles.portfolio_header : styles.trade_header;

    const headerColumnsDisplay = (
        <ul className={`${styles.header} ${headerStyle}`}>
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
            tradeData={tradeData}
            isTokenABase={isTokenABase}
            currentTxActiveInTransactions={currentTxActiveInTransactions}
            setCurrentTxActiveInTransactions={setCurrentTxActiveInTransactions}
            openGlobalModal={openGlobalModal}
            isShowAllEnabled={isShowAllEnabled}
            ipadView={ipadView}
            showColumns={showColumns}
            view2={view2}
            showSidebar={showSidebar}
            blockExplorer={blockExplorer}
            closeGlobalModal={closeGlobalModal}
            isOnPortfolioPage={isOnPortfolioPage}
        />
    ));

    const noData = <div className={styles.no_data}>No Data to Display</div>;
    const transactionDataOrNull = dataToDisplay ? rowItemContent : noData;

    const expandStyle = expandTradeTable ? 'calc(100vh - 10rem)' : '250px';

    const portfolioPageStyle = props.isOnPortfolioPage ? 'calc(100vh - 19.5rem)' : expandStyle;

    return (
        <main className={styles.main_list_container} style={{ height: portfolioPageStyle }}>
            {headerColumnsDisplay}
            {isDataLoading ? <TransactionsSkeletons /> : transactionDataOrNull}
            {footerDisplay}
        </main>
    );
}
