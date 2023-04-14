/* eslint-disable no-irregular-whitespace */
import styles from './Transactions.module.css';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import {
    addChangesByPool,
    CandleData,
    graphData,
    setChangesByPool,
    setDataLoadingStatus,
} from '../../../../utils/state/graphDataSlice';
import { TokenIF, TransactionIF } from '../../../../utils/interfaces/exports';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import {
    Dispatch,
    SetStateAction,
    useState,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import sum from 'hash-sum';

import TransactionsSkeletons from '../TableSkeletons/TableSkeletons';
import Pagination from '../../../Global/Pagination/Pagination';
import { ChainSpec } from '@crocswap-libs/sdk';
import useWebSocket from 'react-use-websocket';
import { fetchPoolRecentChanges } from '../../../../App/functions/fetchPoolRecentChanges';
import TransactionHeader from './TransactionsTable/TransactionHeader';
import TransactionRow from './TransactionsTable/TransactionRow';
import { useSortedTransactions } from '../useSortedTxs';
import useDebounce from '../../../../App/hooks/useDebounce';
import NoTableData from '../NoTableData/NoTableData';
import { getTransactionData } from '../../../../App/functions/getTransactionData';
import useWindowDimensions from '../../../../utils/hooks/useWindowDimensions';
import { IS_LOCAL_ENV } from '../../../../constants';

const NUM_TRANSACTIONS_WHEN_COLLAPSED = 10; // Number of transactions we show when the table is collapsed (i.e. half page)
// NOTE: this is done to improve rendering speed for this page.

interface propsIF {
    isTokenABase: boolean;
    activeAccountTransactionData?: TransactionIF[];
    connectedAccountActive?: boolean;
    isShowAllEnabled: boolean;
    portfolio?: boolean;
    tokenList: TokenIF[];
    changesInSelectedCandle: TransactionIF[] | undefined;
    graphData: graphData;
    chainData: ChainSpec;
    blockExplorer?: string;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled?: Dispatch<SetStateAction<boolean>>;
    account: string;
    expandTradeTable: boolean; // when viewing /trade: expanded (paginated) or collapsed (view more) views
    isAccountView: boolean; // when viewing from /account: fullscreen and not paginated
    setIsCandleSelected?: Dispatch<SetStateAction<boolean | undefined>>;
    isCandleSelected: boolean | undefined;
    filter?: CandleData | undefined;
    changeState?: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
    handlePulseAnimation?: (type: string) => void;
    showSidebar: boolean;
    isOnPortfolioPage: boolean;
    setSelectedDate?: Dispatch<Date | undefined>;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
}
export default function Transactions(props: propsIF) {
    const {
        isTokenABase,
        activeAccountTransactionData,
        connectedAccountActive,
        isShowAllEnabled,
        account,
        changesInSelectedCandle,
        graphData,
        tokenList,
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
        changeState,
        setSelectedDate,
        setExpandTradeTable,
        setSimpleRangeWidth,
        isAccountView,
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
    const quoteTokenAddressLowerCase =
        tradeData.quoteToken.address.toLowerCase();

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
        isOnPortfolioPage
            ? activeAccountTransactionData || []
            : changesByPoolWithoutFills,
    );

    const isConnectedUserTxDataLoading =
        dataLoadingStatus?.isConnectedUserTxDataLoading;
    const isLookupUserTxDataLoading =
        dataLoadingStatus?.isLookupUserTxDataLoading;
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

    const debouncedShouldDisplayLoadingAnimation = useDebounce(
        shouldDisplayLoadingAnimation,
        2000,
    ); // debounce 1 second
    const debouncedShouldDisplayNoTableData = useDebounce(
        shouldDisplayNoTableData,
        1000,
    ); // debounce 1 second

    const [debouncedIsShowAllEnabled, setDebouncedIsShowAllEnabled] =
        useState(false);

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedTransactions] =
        useSortedTransactions(
            'time',
            isShowAllEnabled && !isCandleSelected
                ? changesByPoolWithoutFills
                : transactionData,
        );

    function handleUserSelected() {
        setTransactionData(changesByUserMatchingSelectedTokens);
    }
    function handlePoolSelected() {
        if (!isOnPortfolioPage) {
            setTransactionData(changesByPoolWithoutFills);
        }
    }

    useEffect(() => {
        if (isOnPortfolioPage && activeAccountTransactionData) {
            setTransactionData(activeAccountTransactionData);
        }
    }, [isOnPortfolioPage, sum(activeAccountTransactionData)]);

    // update tx table content when candle selected or underlying data changes
    useEffect(() => {
        if (!isOnPortfolioPage) {
            if (isCandleSelected) {
                if (changesInSelectedCandle !== undefined) {
                    setTransactionData(changesInSelectedCandle);
                    dispatch(
                        setDataLoadingStatus({
                            datasetName: 'candleData',
                            loadingStatus: false,
                        }),
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
        sum(changesInSelectedCandle),
        sum(changesByUserMatchingSelectedTokens),
        sum(changesByPoolWithoutFills),
    ]);

    const ipadView = useMediaQuery('(max-width: 580px)');
    const showPair = useMediaQuery('(min-width: 768px)') || !showSidebar;
    const max1400px = useMediaQuery('(max-width: 1400px)');
    const max1700px = useMediaQuery('(max-width: 1700px)');

    const showColumns =
        (max1400px && !showSidebar) || (max1700px && showSidebar);
    const view2 = useMediaQuery('(max-width: 1568px)');

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;

    const [currentPage, setCurrentPage] = useState(1);

    const { height } = useWindowDimensions();

    const showColumnTransactionItems = showColumns
        ? Math.round((height - 250) / 50)
        : Math.round((height - 250) / 38);
    const transactionsPerPage = showColumnTransactionItems;

    useEffect(() => {
        setCurrentPage(1);
    }, [account, isShowAllEnabled, baseTokenAddress + quoteTokenAddress]);

    // Get current transactions
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction =
        indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = sortedTransactions?.slice(
        indexOfFirstTransaction,
        indexOfLastTransaction,
    );

    // Change page
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const largeScreenView = useMediaQuery('(min-width: 1200px)');

    // wait 5 seconds to open a subscription to pool changes
    useEffect(() => {
        const handler = setTimeout(
            () => setDebouncedIsShowAllEnabled(isShowAllEnabled),
            5000,
        );
        return () => clearTimeout(handler);
    }, [isShowAllEnabled]);

    useEffect(() => {
        if (isServerEnabled && isShowAllEnabled) {
            fetchPoolRecentChanges({
                tokenList: tokenList,
                base: baseTokenAddress,
                quote: quoteTokenAddress,
                poolIdx: chainData.poolIndex,
                chainId: chainData.chainId,
                annotate: true,
                addValue: true,
                simpleCalc: true,
                annotateMEV: false,
                ensResolution: true,
                n: 80,
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
                        setDataLoadingStatus({
                            datasetName: 'poolTxData',
                            loadingStatus: false,
                        }),
                    );
                })
                .catch(console.error);
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
                addValue: 'true',
            }),
        [
            baseTokenAddress,
            quoteTokenAddress,
            chainData.chainId,
            chainData.poolIndex,
        ],
    );

    const { lastMessage: lastPoolChangeMessage } = useWebSocket(
        poolRecentChangesCacheSubscriptionEndpoint,
        {
            // share:  true,
            onOpen: () => {
                IS_LOCAL_ENV &&
                    console.debug('pool recent changes subscription opened');
            },
            onClose: (event: CloseEvent) => {
                IS_LOCAL_ENV && console.debug({ event });
            },
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => true,
        },
        // only connect if user is viewing pool changes
        isServerEnabled && debouncedIsShowAllEnabled,
    );

    useEffect(() => {
        if (lastPoolChangeMessage !== null) {
            const lastMessageData = JSON.parse(lastPoolChangeMessage.data).data;
            if (lastMessageData) {
                Promise.all(
                    lastMessageData.map((tx: TransactionIF) => {
                        return getTransactionData(tx, tokenList);
                    }),
                )
                    .then((updatedTransactions) => {
                        dispatch(addChangesByPool(updatedTransactions));
                    })
                    .catch(console.error);
            }
        }
    }, [lastPoolChangeMessage]);

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

    const headerColumns = [
        {
            name: 'Timestamp',
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
            alignCenter: false,
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

            show: !showColumns,
            slug: baseTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: isOnPortfolioPage ? <></> : `${quoteTokenSymbol}ㅤㅤ`, // invisible character added

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

    const headerStyle = isOnPortfolioPage
        ? styles.portfolio_header
        : styles.trade_header;

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

    const currentRowItemContent = currentTransactions.map((tx, idx) => (
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
            showPair={showPair}
            showSidebar={showSidebar}
            blockExplorer={blockExplorer}
            closeGlobalModal={closeGlobalModal}
            isOnPortfolioPage={isOnPortfolioPage}
            handlePulseAnimation={handlePulseAnimation}
            setSimpleRangeWidth={setSimpleRangeWidth}
            chainData={chainData}
        />
    ));
    const sortedRowItemContent = sortedTransactions.map((tx, idx) => (
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
            showPair={showPair}
            showSidebar={showSidebar}
            blockExplorer={blockExplorer}
            closeGlobalModal={closeGlobalModal}
            isOnPortfolioPage={isOnPortfolioPage}
            handlePulseAnimation={handlePulseAnimation}
            setSimpleRangeWidth={setSimpleRangeWidth}
            chainData={chainData}
        />
    ));
    const listRef = useRef<HTMLUListElement>(null);
    const handleKeyDownViewTransaction = (
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

    const transactionDataOrNull = debouncedShouldDisplayNoTableData ? (
        <NoTableData
            isShowAllEnabled={isShowAllEnabled}
            setIsShowAllEnabled={setIsShowAllEnabled}
            setSelectedDate={setSelectedDate}
            changeState={changeState}
            type='transactions'
            isOnPortfolioPage={isOnPortfolioPage}
        />
    ) : (
        <div onKeyDown={handleKeyDownViewTransaction}>
            <ul ref={listRef}>
                {expandTradeTable && largeScreenView
                    ? currentRowItemContent
                    : isAccountView
                    ? // NOTE: the account view of this content should not be paginated
                      sortedRowItemContent
                    : sortedRowItemContent.slice(
                          0,
                          NUM_TRANSACTIONS_WHEN_COLLAPSED,
                      )}
            </ul>
            {
                // Show a 'View More' button at the end of the table when collapsed (half-page) and it's not a /account render
                // TODO (#1804): we should instead be adding results to RTK
                !expandTradeTable &&
                    !isAccountView &&
                    sortedRowItemContent.length >
                        NUM_TRANSACTIONS_WHEN_COLLAPSED && (
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
                <TransactionsSkeletons />
            ) : (
                transactionDataOrNull
            )}
            {footerDisplay}
        </section>
    );
}
