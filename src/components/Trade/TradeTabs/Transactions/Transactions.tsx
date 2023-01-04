/* eslint-disable no-irregular-whitespace */
import styles from './Transactions.module.css';

import useMediaQuery from '../../../../utils/hooks/useMediaQuery';

import {
    addChangesByPool,
    CandleData,
    graphData,
    ITransaction,
    setChangesByPool,
    setDataLoadingStatus,
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
import useDebounce from '../../../../App/hooks/useDebounce';
import NoTableData from '../NoTableData/NoTableData';
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
    setIsShowAllEnabled?: Dispatch<SetStateAction<boolean>>;
    account: string;
    expandTradeTable: boolean;
    setIsCandleSelected?: Dispatch<SetStateAction<boolean | undefined>>;
    isCandleSelected: boolean | undefined;
    filter?: CandleData | undefined;
    changeState?: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
    handlePulseAnimation?: (type: string) => void;
    showSidebar: boolean;
    isOnPortfolioPage: boolean;
    setSelectedDate?: Dispatch<Date | undefined>;
    // setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}
export default function Transactions(props: TransactionsProps) {
    const {
        // importedTokens,
        isTokenABase,
        activeAccountTransactionData,
        connectedAccountActive,
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
        showSidebar,
        openGlobalModal,
        closeGlobalModal,
        isOnPortfolioPage,
        handlePulseAnimation,
        setIsShowAllEnabled,
        // setIsCandleSelected,
        changeState,
        setSelectedDate,
        // setExpandTradeTable,
    } = props;

    const dispatch = useAppDispatch();

    // allow a local environment variable to be defined in [app_repo]/.env.local to turn off connections to the cache server
    const isServerEnabled =
        process.env.REACT_APP_CACHE_SERVER_IS_ENABLED !== undefined
            ? process.env.REACT_APP_CACHE_SERVER_IS_ENABLED === 'true'
            : true;

    const changesByUser = graphData?.changesByUser?.changes;
    const changesByPool = graphData?.changesByPool?.changes;
    const dataLoadingStatus = graphData?.dataLoadingStatus;

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

    // const changesByUserWithoutFills = changesByUser.filter((tx) => {
    //     if (tx.changeType !== 'fill') {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // });

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

    const [transactionData, setTransactionData] = useState(
        isOnPortfolioPage ? activeAccountTransactionData || [] : changesByPoolWithoutFills,
    );

    const isConnectedUserTxDataLoading = dataLoadingStatus?.isConnectedUserTxDataLoading;
    const isLookupUserTxDataLoading = dataLoadingStatus?.isLookupUserTxDataLoading;
    const isPoolTxDataLoading = dataLoadingStatus?.isPoolTxDataLoading;

    const isTxDataLoadingForPortfolio =
        (connectedAccountActive && isConnectedUserTxDataLoading) ||
        (!connectedAccountActive && isLookupUserTxDataLoading);

    const isTxDataLoadingForTradeTable =
        !isCandleSelected &&
        ((isShowAllEnabled && isPoolTxDataLoading) ||
            (!isShowAllEnabled && isConnectedUserTxDataLoading));

    const shouldDisplayLoadingAnimation =
        (isOnPortfolioPage && isTxDataLoadingForPortfolio) ||
        (!isOnPortfolioPage && isTxDataLoadingForTradeTable);

    const shouldDisplayNoTableData = !transactionData.length;

    const debouncedShouldDisplayLoadingAnimation = useDebounce(shouldDisplayLoadingAnimation, 2000); // debounce 1 second
    const debouncedShouldDisplayNoTableData = useDebounce(shouldDisplayNoTableData, 1000); // debounce 1 second

    const [debouncedIsShowAllEnabled, setDebouncedIsShowAllEnabled] = useState(false);

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedTransactions] =
        useSortedTransactions(
            'time',
            isShowAllEnabled ? changesByPoolWithoutFills : transactionData,
        );

    function handleUserSelected() {
        // console.log({ changesByUserMatchingSelectedTokens });
        setTransactionData(changesByUserMatchingSelectedTokens);
        // setDataToDisplay(changesByUserMatchingSelectedTokens?.length > 0);
    }
    function handlePoolSelected() {
        if (!isOnPortfolioPage) {
            // console.log({ changesByPoolWithoutFills });
            setTransactionData(changesByPoolWithoutFills);
            // setDataToDisplay(changesByPoolWithoutFills?.length > 0);
        }
    }

    useEffect(() => {
        if (isOnPortfolioPage && activeAccountTransactionData) {
            setTransactionData(activeAccountTransactionData);
            // setDataToDisplay(true);
        }
    }, [isOnPortfolioPage, JSON.stringify(activeAccountTransactionData)]);

    // update tx table content when candle selected or underlying data changes
    useEffect(() => {
        if (!isOnPortfolioPage) {
            if (isCandleSelected) {
                if (changesInSelectedCandle !== undefined) {
                    setTransactionData(changesInSelectedCandle);
                    dispatch(
                        setDataLoadingStatus({ datasetName: 'candleData', loadingStatus: false }),
                    );
                }
                // setIsDataLoading(false);
            } else if (isShowAllEnabled) {
                handlePoolSelected();
            } else {
                handleUserSelected();
            }
        }
    }, [
        isOnPortfolioPage,
        isShowAllEnabled,
        isCandleSelected,
        filter,
        JSON.stringify(changesInSelectedCandle),
        JSON.stringify(changesByUserMatchingSelectedTokens),
        JSON.stringify(changesByPoolWithoutFills),
    ]);

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;

    const [currentPage, setCurrentPage] = useState(1);

    // transactions per page media queries
    const txView1 = useMediaQuery('(max-width: 480px)');
    const txView2 = useMediaQuery('(max-width: 720px)');
    const txView3 = useMediaQuery('(max-width: 1200px)');
    const txView4 = useMediaQuery('(max-width: 1800px)');
    // const txView4 = useMediaQuery('(min-width: 2400px)');

    const transactionsPerPage = txView1 ? 3 : txView2 ? 10 : txView3 ? 12 : txView4 ? 15 : 20;

    // const [transactionsPerPage] = useState(15);

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

    // Change page
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const usePaginateDataOrNull = expandTradeTable ? currentTransactions : sortedTransactions;

    // wait 5 seconds to open a subscription to pool changes
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedIsShowAllEnabled(isShowAllEnabled), 5000);
        return () => clearTimeout(handler);
    }, [isShowAllEnabled]);

    useEffect(() => {
        if (isServerEnabled && isShowAllEnabled) {
            fetchPoolRecentChanges({
                tokensOnActiveLists: tokenMap,
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
                    dispatch(
                        setDataLoadingStatus({ datasetName: 'poolTxData', loadingStatus: false }),
                    );
                })
                .catch(console.log);
        }
    }, [isServerEnabled, isShowAllEnabled]);

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
                        tokensOnActiveLists: tokenMap,

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
        isServerEnabled && debouncedIsShowAllEnabled,
    );

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
    const showColumns = useMediaQuery('(max-width: 1440px)');
    const view2 = useMediaQuery('(max-width: 1568px)');

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
            <p>Type</p>
            <p>Side</p>
        </>
    );

    const headerColumns = [
        {
            name: 'Timestamp',
            className: '',
            show: !showColumns,
            // && !showSidebar
            //   &&  !isOnPortfolioPage,
            slug: 'time',
            sortable: true,
        },
        {
            name: 'Pair',
            className: '',
            show: isOnPortfolioPage && !desktopView,
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
            alignCenter: true,
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
            name: isOnPortfolioPage ? <></> : `${baseTokenSymbol}ㅤㅤ`,
            // name: isOnPortfolioPage ? 'Qty A' : `${baseTokenSymbol}`,

            show: !showColumns,
            slug: baseTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: isOnPortfolioPage ? <></> : `${quoteTokenSymbol}ㅤㅤ`, // invisible character added
            // name: isOnPortfolioPage ? 'Qty B' : `${quoteTokenSymbol}`,

            show: !showColumns,
            slug: quoteTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: 'Tokensㅤㅤ',

            show: !isOnPortfolioPage && showColumns,

            slug: 'tokens',
            sortable: false,
            alignRight: true,
        },
        {
            name: <>Tokensㅤㅤ</>,

            show: isOnPortfolioPage && showColumns,

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
            account={account}
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
            desktopView={desktopView}
            showSidebar={showSidebar}
            blockExplorer={blockExplorer}
            closeGlobalModal={closeGlobalModal}
            isOnPortfolioPage={isOnPortfolioPage}
            handlePulseAnimation={handlePulseAnimation}
        />
    ));

    const transactionDataOrNull = debouncedShouldDisplayNoTableData ? (
        <NoTableData
            isShowAllEnabled={isShowAllEnabled}
            setIsShowAllEnabled={setIsShowAllEnabled}
            setSelectedDate={setSelectedDate}
            // setIsCandleSelected={setIsCandleSelected}
            changeState={changeState}
            type='transactions'
            isOnPortfolioPage={isOnPortfolioPage}
        />
    ) : (
        rowItemContent
    );

    const expandStyle = expandTradeTable ? 'calc(100vh - 10rem)' : '250px';

    const portfolioPageStyle = props.isOnPortfolioPage ? 'calc(100vh - 19.5rem)' : expandStyle;

    return (
        <section className={styles.main_list_container} style={{ height: portfolioPageStyle }}>
            {headerColumnsDisplay}
            {debouncedShouldDisplayLoadingAnimation ? (
                <TransactionsSkeletons />
            ) : (
                transactionDataOrNull
            )}
            {footerDisplay}
        </section>
    );
}
