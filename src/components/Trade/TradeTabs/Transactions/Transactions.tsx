/* eslint-disable no-irregular-whitespace */
import styles from './Transactions.module.css';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import {
    CandleData,
    setDataLoadingStatus,
} from '../../../../utils/state/graphDataSlice';
import { TransactionIF } from '../../../../utils/interfaces/exports';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import {
    Dispatch,
    SetStateAction,
    useState,
    useEffect,
    useRef,
    useContext,
    memo,
} from 'react';

import TransactionsSkeletons from '../TableSkeletons/TableSkeletons';
import Pagination from '../../../Global/Pagination/Pagination';
import { ChainSpec } from '@crocswap-libs/sdk';
import TransactionHeader from './TransactionsTable/TransactionHeader';
import TransactionRow from './TransactionsTable/TransactionRow';
import { useSortedTransactions } from '../useSortedTxs';
import useDebounce from '../../../../App/hooks/useDebounce';
import NoTableData from '../NoTableData/NoTableData';
import useWindowDimensions from '../../../../utils/hooks/useWindowDimensions';
import { diffHashSigTxs } from '../../../../utils/functions/diffHashSig';
import { AppStateContext } from '../../../../contexts/AppStateContext';

interface propsIF {
    isTokenABase: boolean;
    activeAccountTransactionData?: TransactionIF[];
    connectedAccountActive?: boolean;
    isShowAllEnabled: boolean;
    portfolio?: boolean;
    changesInSelectedCandle: TransactionIF[] | undefined;
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
    changeState?: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    handlePulseAnimation?: (type: string) => void;
    isOnPortfolioPage: boolean;
    setSelectedDate?: Dispatch<Date | undefined>;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
}
function Transactions(props: propsIF) {
    const {
        isTokenABase,
        activeAccountTransactionData,
        connectedAccountActive,
        isShowAllEnabled,
        account,
        changesInSelectedCandle,
        chainData,
        blockExplorer,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        expandTradeTable,
        isCandleSelected,
        isOnPortfolioPage,
        handlePulseAnimation,
        setIsShowAllEnabled,
        changeState,
        setSelectedDate,
        setExpandTradeTable,
        setSimpleRangeWidth,
        isAccountView,
    } = props;

    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(AppStateContext);

    const NUM_TRANSACTIONS_WHEN_COLLAPSED = isAccountView ? 13 : 10; // Number of transactions we show when the table is collapsed (i.e. half page)
    // NOTE: this is done to improve rendering speed for this page.

    const dispatch = useAppDispatch();

    const graphData = useAppSelector((state) => state?.graphData);
    const tradeData = useAppSelector((state) => state.tradeData);

    const changesByUser = graphData?.changesByUser?.changes;
    const changesByPool = graphData?.changesByPool?.changes;
    const dataLoadingStatus = graphData?.dataLoadingStatus;

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
    }, [isOnPortfolioPage, diffHashSigTxs(activeAccountTransactionData)]);

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
            } else if (isShowAllEnabled) {
                handlePoolSelected();
            } else {
                handleUserSelected();
            }
        }
    }, [
        isOnPortfolioPage,
        isCandleSelected,
        isCandleSelected ? diffHashSigTxs(changesInSelectedCandle) : '',
        changesByPoolWithoutFills.length,
        changesByPoolWithoutFills.at(0)?.poolHash,
        changesByUserMatchingSelectedTokens.length,
        changesByUserMatchingSelectedTokens.at(0)?.user,
    ]);

    const ipadView = useMediaQuery('(max-width: 580px)');
    const showPair = useMediaQuery('(min-width: 768px)') || !isSidebarOpen;
    const max1400px = useMediaQuery('(max-width: 1400px)');
    const max1700px = useMediaQuery('(max-width: 1700px)');

    const showColumns =
        (max1400px && !isSidebarOpen) || (max1700px && isSidebarOpen);
    const view2 = useMediaQuery('(max-width: 1568px)');

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;

    const [currentPage, setCurrentPage] = useState(1);

    const { height } = useWindowDimensions();

    const showColumnTransactionItems = showColumns
        ? Math.round((height - (isAccountView ? 400 : 250)) / 50)
        : Math.round((height - (isAccountView ? 400 : 250)) / 38);
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

    const tradePageCheck = expandTradeTable && transactionData.length > 30;
    const footerDisplay = (
        <div className={styles.footer}>
            {transactionsPerPage > 0 &&
                ((isAccountView && transactionData.length > 10) ||
                    (!isAccountView && tradePageCheck)) && (
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
            isShowAllEnabled={isShowAllEnabled}
            ipadView={ipadView}
            showColumns={showColumns}
            view2={view2}
            showPair={showPair}
            blockExplorer={blockExplorer}
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
            isShowAllEnabled={isShowAllEnabled}
            ipadView={ipadView}
            showColumns={showColumns}
            view2={view2}
            showPair={showPair}
            blockExplorer={blockExplorer}
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
            <ul ref={listRef}>{currentRowItemContent}</ul>

            {/* Show a 'View More' button at the end of the table when collapsed (half-page) and it's not a /account render */}
            {!expandTradeTable &&
                !isAccountView &&
                sortedRowItemContent.length >
                    NUM_TRANSACTIONS_WHEN_COLLAPSED && (
                    <div className={styles.view_more_container}>
                        <button
                            className={styles.view_more_button}
                            onClick={() => setExpandTradeTable(true)}
                        >
                            View More
                        </button>
                    </div>
                )}
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

export default memo(Transactions);
