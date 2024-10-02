/* eslint-disable no-irregular-whitespace */
import { useContext, useRef, memo, useMemo, useState, useEffect } from 'react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import OrderHeader from './OrderTable/OrderHeader';
import { useSortedLimits } from '../useSortedLimits';
import { LimitOrderIF } from '../../../../ambient-utils/types';
import NoTableData from '../NoTableData/NoTableData';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';

import Spinner from '../../../Global/Spinner/Spinner';
import { OrderRowPlaceholder } from './OrderTable/OrderRowPlaceholder';
import {
    CrocEnvContext,
    CrocEnvContextIF,
} from '../../../../contexts/CrocEnvContext';
import { OrderRow as OrderRowStyled } from '../../../../styled/Components/TransactionTable';
import { FlexContainer } from '../../../../styled/Common';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { DataLoadingContext } from '../../../../contexts/DataLoadingContext';
import { GraphDataContext, LimitOrdersByPool } from '../../../../contexts/GraphDataContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import TableRows from '../TableRows';
import { fetchPoolLimitOrders } from '../../../../ambient-utils/api/fetchPoolLimitOrders';
import { TokenContextIF, TokenContext } from '../../../../contexts/TokenContext';
import { CachedDataIF, CachedDataContext } from '../../../../contexts/CachedDataContext';
import TableRowsInfiniteScroll from '../TableRowsInfiniteScroll';
import { PageDataCountIF } from '../../../Chat/ChatIFs';

interface propsIF {
    activeAccountLimitOrderData?: LimitOrderIF[];
    connectedAccountActive?: boolean;
    isAccountView: boolean;
}

function Orders(props: propsIF) {
    const {
        activeAccountLimitOrderData,
        connectedAccountActive,
        isAccountView,
    } = props;
    const { showAllData: showAllDataSelection } = useContext(TradeTableContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);

    const {
         crocEnv,
         activeNetwork,
         provider,
        chainData: {
            chainId,
            poolIndex,
        },
    } = useContext<CrocEnvContextIF>(CrocEnvContext);

    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext<CachedDataIF>(CachedDataContext);

    // only show all data when on trade tabs page
    const showAllData = !isAccountView && showAllDataSelection;

    const {
        limitOrdersByUser,
        userLimitOrdersByPool,
        limitOrdersByPool,
        unindexedNonFailedSessionLimitOrderUpdates,
    } = useContext(GraphDataContext);

    const dataLoadingStatus = useContext(DataLoadingContext);
    const { userAddress } = useContext(UserDataContext);

    const { transactionsByType } = useContext(ReceiptContext);

    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const baseTokenSymbol = baseToken.symbol;
    const quoteTokenSymbol = quoteToken.symbol;

    const activeUserLimitOrdersByPool = useMemo(
        () =>
            userLimitOrdersByPool?.limitOrders.filter(
                (order) => order.positionLiq != 0 || order.claimableLiq !== 0,
            ),
        [userLimitOrdersByPool],
    );
       
    // infinite scroll props, methods ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    
    const [fetchedTransactions, setFetchedTransactions] = useState<LimitOrdersByPool>({
            dataReceived: false,
        limitOrders: [...limitOrdersByPool.limitOrders],
    });

    const fetchedTransactionsRef = useRef<LimitOrdersByPool>();
    fetchedTransactionsRef.current = fetchedTransactions;

    const { tokens: {tokenUniv: tokenList} } = useContext<TokenContextIF>(TokenContext);


    const [extraPagesAvailable, setExtraPagesAvailable] = useState<number>(0);

    const [moreDataAvailable, setMoreDataAvailable] = useState<boolean>(true);
    const moreDataAvailableRef = useRef<boolean>();
    moreDataAvailableRef.current = moreDataAvailable;

    const [lastFetchedCount, setLastFetchedCount] = useState<number>(0);

    const [moreDataLoading, setMoreDataLoading] = useState<boolean>(false);

    const selectedBaseAddress: string = baseToken.address;
    const selectedQuoteAddress: string = quoteToken.address;

    const [showInfiniteScroll, setShowInfiniteScroll] = useState<boolean>(!isAccountView && showAllData);
    
    useEffect(() => {
        setShowInfiniteScroll(!isAccountView && showAllData);
    }, [isAccountView, showAllData]);




    useEffect(() => {
        setPagesVisible([0, 1]);
        setPageDataCountShouldReset(true);
        setExtraPagesAvailable(0);
        setMoreDataAvailable(true);
        setLastFetchedCount(0);
    }, [selectedBaseAddress + selectedQuoteAddress]);

    const [pageDataCountShouldReset, setPageDataCountShouldReset ] = useState(false);

    const getInitialDataPageCounts = () => {
        let counts;
        if(limitOrdersByPool.limitOrders.length == 0){
            counts = [0, 0];
        }
        if(limitOrdersByPool.limitOrders.length / dataPerPage < 2){
            counts = [Math.ceil(limitOrdersByPool.limitOrders.length / 2), 
                Math.floor(limitOrdersByPool.limitOrders.length / 2)];
        }
        else{
            counts = [limitOrdersByPool.limitOrders.length > dataPerPage ? dataPerPage : limitOrdersByPool.limitOrders.length , 
                limitOrdersByPool.limitOrders.length / dataPerPage  == 2 ? dataPerPage : limitOrdersByPool.limitOrders.length - dataPerPage];
        }

        return {
            pair: (selectedBaseAddress + selectedQuoteAddress).toLowerCase(),
            counts: counts
        }

    }

    const updatePageDataCount = (dataCount: number) => {
        setPageDataCount(prev => {
            return {
                pair: prev.pair,
                counts: [...prev.counts, dataCount]
            }
        })
    }
    
    const dataPerPage = 50;
    const [pagesVisible, setPagesVisible] = useState<[number, number]>([0, 1]);
    const [pageDataCount, setPageDataCount] = useState<PageDataCountIF>(getInitialDataPageCounts());
    
    const pageDataCountRef = useRef<PageDataCountIF>();
    pageDataCountRef.current = pageDataCount;
    
    const getIndexForPages = (start: boolean) => {
        const pageDataCountVal = (pageDataCountRef.current ? pageDataCountRef.current : pageDataCount).counts;
        let ret = 0;
        if(start){
            for(let i = 0 ; i < pagesVisible[0]; i++){
                ret += pageDataCountVal[i];
            }
        }else{
            for(let i = 0 ; i <= pagesVisible[1]; i++){
                ret += pageDataCountVal[i];
            }
            ret -= 1;
        }

        return ret;
    }

    const getCurrentDataPair = () => {
        if(limitOrdersByPool.limitOrders.length > 0){
            return (limitOrdersByPool.limitOrders[0].base + limitOrdersByPool.limitOrders[0].quote).toLowerCase();
        }else{
            return '';
        }
    }

    useEffect(() => {
        // clear fetched transactions when switching pools
        if (limitOrdersByPool.limitOrders.length === 0) {
            setFetchedTransactions({
                dataReceived: true,
                limitOrders: [],
            });
        }
        else{
            const existingChanges = new Set(
                fetchedTransactions.limitOrders.map(
                    // (change) => change.positionHash || change.limitOrderId,
                    (change) => change.limitOrderId,
                ),
            ); // Adjust if using a different unique identifier
    
            const uniqueChanges = limitOrdersByPool.limitOrders.filter(
                // (change) => !existingChanges.has(change.positionHash || change.limitOrderId),
                (change) => !existingChanges.has(change.limitOrderId),
            );
    
            if (uniqueChanges.length > 0) {
                setFetchedTransactions((prev) => {
                    return {
                        dataReceived: true,
                        limitOrders: [...uniqueChanges, ...prev.limitOrders],
                    };
                });
            }

            
        }
    }, [limitOrdersByPool]);




    useEffect(() => {
        
        if(pageDataCountShouldReset && pageDataCountRef.current?.pair !== getCurrentDataPair() && fetchedTransactions.limitOrders.length > 0){
            setPagesVisible([0, 1]);
            setPageDataCount(getInitialDataPageCounts());
            setPageDataCountShouldReset(false);
        }
    }, [fetchedTransactions])




    const fetchNewData = async(OLDEST_TIME:number):Promise<LimitOrderIF[]> => {
        return new Promise(resolve => {
            if(!crocEnv || !provider) resolve([]);
            else{
                fetchPoolLimitOrders({
                    tokenList: tokenList,
                    base: baseToken.address,
                    quote: quoteToken.address,
                    poolIdx: poolIndex,
                    chainId: chainId,
                    n: dataPerPage,
                    timeBefore: OLDEST_TIME,
                    crocEnv: crocEnv,
                    graphCacheUrl: activeNetwork.graphCacheUrl,
                    provider: provider,
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                    cachedEnsResolve: cachedEnsResolve,
                })
                    .then((poolChangesJsonData) => {
                        if(poolChangesJsonData && poolChangesJsonData.length > 0){
                            resolve(poolChangesJsonData as LimitOrderIF[]);
                        }else{
                            resolve([]);
                        }
                    });
            }
        });
    }

    const dataDiffCheck = (dirty: LimitOrderIF[]):LimitOrderIF[] => {
        const txs = fetchedTransactionsRef.current ? fetchedTransactionsRef.current.limitOrders : fetchedTransactions.limitOrders;

        const existingChanges = new Set(
            txs.map(
                (change) => change.limitOrderId,
            ),
        ); 

        const ret = dirty.filter(
            (change) =>
                !existingChanges.has(
                    change.limitOrderId,
                ),
        );

        return ret;
        
    }

    const getOldestTime = (data: LimitOrderIF[]):number => {
        let oldestTime = 0;
        if(data.length > 0){
            oldestTime = data.reduce((min, order) => {
                return order.latestUpdateTime < min
                    ? order.latestUpdateTime
                    : min;
            }, data[0].latestUpdateTime);
        }
        return oldestTime;
    }

    const addMoreData = async() => {
            setMoreDataLoading(true);
                const targetCount = 30;
                let addedDataCount = 0;

                const newTxData: LimitOrderIF[] = [];
                let oldestTimeParam = oldestTxTime;
                while((addedDataCount < targetCount)){
                    // fetch data
                    const dirtyData = await fetchNewData(oldestTimeParam);
                    if (dirtyData.length == 0){
                        break;
                    }
                    // check diff
                    const cleanData = dataDiffCheck(dirtyData);
                    if (cleanData.length == 0){
                        break;
                    }
                    else {
                        addedDataCount += cleanData.length;
                        newTxData.push(...cleanData);
                        const oldestTimeTemp = getOldestTime(newTxData);
                        oldestTimeParam = oldestTimeTemp < oldestTimeParam ? oldestTimeTemp : oldestTimeParam;
                    }
                }
                if(addedDataCount > 0){
                     // new data found
                     setFetchedTransactions((prev) => {
                        const sortedData = sortData([
                            ...prev.limitOrders,
                            ...newTxData,
                        ]);
                        return {
                            dataReceived: true,
                            limitOrders: sortedData,
                        };
                    })
                     setLastFetchedCount(addedDataCount);
                     updatePageDataCount(addedDataCount);
                    setExtraPagesAvailable((prev) => prev + 1);
                    setPagesVisible((prev) => [
                        prev[0] + 1,
                        prev[1] + 1,
                    ]);
                }else{
                    setMoreDataAvailable(false);
                }

                setMoreDataLoading(false);

    };

    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const limitOrderData = useMemo<LimitOrderIF[]>(
        () =>
            isAccountView
                ? activeAccountLimitOrderData || []
                : !showAllData
                  ? activeUserLimitOrdersByPool
                //   : limitOrdersByPool.limitOrders.filter(
                //         (order) =>
                //             order.positionLiq != 0 || order.claimableLiq !== 0,
                //     ),
                  : fetchedTransactions.limitOrders,
        [
            showAllData,
            isAccountView,
            activeAccountLimitOrderData,
            limitOrdersByPool,
            activeUserLimitOrdersByPool,
            fetchedTransactions  // infinite scroll
        ],
    );

     // infinite scroll ------------------------------------------------------------------------------------------------------------------------------
    const oldestTxTime = useMemo(
        () =>
            limitOrderData.length > 0
                ? limitOrderData.reduce((min, order) => {
                      return order.latestUpdateTime < min
                          ? order.latestUpdateTime
                          : min;
                  }, limitOrderData[0].latestUpdateTime)
                : 0,
        [limitOrderData],
    );

    // ------------------------------------------------------------------------------------------------------------------------------

    const activeUserLimitOrdersLength = useMemo(
        () =>
            isAccountView
                ? activeAccountLimitOrderData
                    ? activeAccountLimitOrderData.filter(
                          (order) =>
                              order.positionLiq != 0 ||
                              order.claimableLiq !== 0,
                      ).length
                    : 0
                : limitOrdersByUser.limitOrders.filter(
                      (order) =>
                          order.positionLiq != 0 || order.claimableLiq !== 0,
                  ).length,
        [activeAccountLimitOrderData, isAccountView, limitOrdersByUser],
    );

    const isLoading = useMemo(
        () =>
            isAccountView && connectedAccountActive
                ? dataLoadingStatus.isConnectedUserOrderDataLoading
                : isAccountView
                  ? dataLoadingStatus.isLookupUserOrderDataLoading
                  : !showAllData
                    ? dataLoadingStatus.isConnectedUserPoolOrderDataLoading
                    : dataLoadingStatus.isPoolOrderDataLoading,
        [
            isAccountView,
            showAllData,
            connectedAccountActive,
            dataLoadingStatus.isCandleDataLoading,
            dataLoadingStatus.isConnectedUserOrderDataLoading,
            dataLoadingStatus.isConnectedUserPoolOrderDataLoading,
            dataLoadingStatus.isLookupUserOrderDataLoading,
            dataLoadingStatus.isPoolOrderDataLoading,
        ],
    );

    const relevantTransactionsByType = transactionsByType.filter(
        (tx) =>
            unindexedNonFailedSessionLimitOrderUpdates.some(
                (update) => update.txHash === tx.txHash,
            ) &&
            tx.userAddress.toLowerCase() ===
                (userAddress || '').toLowerCase() &&
            tx.txDetails?.baseAddress.toLowerCase() ===
                baseToken.address.toLowerCase() &&
            tx.txDetails?.quoteAddress.toLowerCase() ===
                quoteToken.address.toLowerCase() &&
            tx.txDetails?.poolIdx === poolIndex,
    );

    const shouldDisplayNoTableData =
        !isLoading &&
        !limitOrderData.length &&
        relevantTransactionsByType.length === 0;

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedLimits, sortData] =
        useSortedLimits('time', limitOrderData);

    // infinite scroll ------------------------------------------------------------------------------------------------------------------------------
    const sortedLimitDataToDisplay = useMemo<LimitOrderIF[]>(() => {

        console.log('startIndex', getIndexForPages(true), ' endIndex', getIndexForPages(false));
        console.log('p0', pagesVisible[0], '| p1', pagesVisible[1]);
        console.log('pageDataCountVals', pageDataCountRef.current?.counts);
        console.log('.............................')
        return isAccountView
            ? sortedLimits
            : sortedLimits.slice(
                    getIndexForPages(true),
                    getIndexForPages(false)
                );
    }, [sortedLimits, pagesVisible,  isAccountView]);

    // -----------------------------------------------------------------------------------------------------------------------------

    // TODO: Use these as media width constants
    const isSmallScreen = useMediaQuery('(max-width: 768px)');
    const isLargeScreen = useMediaQuery('(min-width: 1600px)');

    const tableView =
        isSmallScreen || (isAccountView && !isLargeScreen && isSidebarOpen)
            ? 'small'
            : (!isSmallScreen && !isLargeScreen) ||
                (isAccountView &&
                    connectedAccountActive &&
                    isLargeScreen &&
                    isSidebarOpen)
              ? 'medium'
              : 'large';

    const sideType = (
        <>
            <p>Type</p>
            <p>Side</p>
        </>
    );
    const tokens = isAccountView ? (
        <>Tokens</>
    ) : (
        <>
            <p>{`${baseTokenSymbol}`}</p>
            <p>{`${quoteTokenSymbol}`}</p>
        </>
    );

    const headerColumns = [
        {
            name: 'Last Updated',
            className: '',
            show: tableView === 'large',
            slug: 'time',
            sortable: true,
        },
        {
            name: 'Pair',
            className: '',
            show: isAccountView,
            slug: 'pool',
            sortable: true,
        },
        {
            name: 'Position ID',
            className: 'position_id',
            show:
                tableView === 'large' ||
                (tableView === 'medium' && isAccountView),
            slug: 'positionid',
            sortable: false,
        },
        {
            name: 'Wallet',
            className: 'wallet',
            show: !isAccountView,
            slug: 'wallet',
            sortable: showAllData,
        },
        {
            name: 'Limit Price',
            show: tableView !== 'small',
            slug: 'price',
            sortable: true,
            alignRight: true,
        },
        {
            name: 'Side',
            className: 'side',
            show: tableView === 'large',
            slug: 'side',
            sortable: true,
            alignCenter: true,
        },
        {
            name: 'Type',
            className: 'type',
            show: tableView === 'large',
            slug: 'type',
            sortable: false,
            alignCenter: true,
        },
        {
            name: sideType,
            className: 'side_type',
            show: tableView !== 'large',
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
            name: isAccountView ? '' : `${baseTokenSymbol}`,
            show: tableView === 'large',
            slug: baseTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: isAccountView ? '' : `${quoteTokenSymbol}`,
            show: tableView === 'large',
            slug: quoteTokenSymbol,
            sortable: false,
            alignRight: true,
        },
        {
            name: tokens,
            className: 'tokens',
            show: tableView === 'medium',
            slug: 'tokens',
            sortable: false,
            alignRight: true,
        },
        {
            name: 'Claimable',
            // name: ' ',
            className: '',
            show: tableView !== 'small',
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

    const listRef = useRef<HTMLUListElement>(null);

    const headerColumnsDisplay = (
        <OrderRowStyled size={tableView} header account={isAccountView}>
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
        </OrderRowStyled>
    );

    const handleKeyDownViewOrder = (
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

    const orderDataOrNull = shouldDisplayNoTableData ? (
        <NoTableData
            type='limits'
            isAccountView={isAccountView}
            activeUserPositionsLength={activeUserLimitOrdersLength}
            activeUserPositionsByPoolLength={activeUserLimitOrdersByPool.length}
        />
    ) : (
        <div onKeyDown={handleKeyDownViewOrder} style={{ height: '100%' }}>
            <ul
                ref={listRef}
                // id='current_row_scroll'
                style={{ height: '100%' }}
            >
                {!isAccountView &&
                    relevantTransactionsByType.length > 0 &&
                    relevantTransactionsByType.reverse().map((tx, idx) => (
                        <OrderRowPlaceholder
                            key={idx}
                            transaction={{
                                hash: tx.txHash,
                                baseSymbol: tx.txDetails?.baseSymbol ?? '...',
                                quoteSymbol: tx.txDetails?.quoteSymbol ?? '...',
                                side: tx.txAction,
                                type: tx.txType,
                                details: tx.txDetails,
                            }}
                            tableView={tableView}
                        />
                    ))}
                {showInfiniteScroll ? 
                    (
                    <TableRowsInfiniteScroll
                        type='Order'
                        data={sortedLimitDataToDisplay}
                        tableView={tableView}
                        isAccountView={isAccountView}
                        fetcherFunction={addMoreData}
                        sortBy={sortBy}
                        showAllData={showAllData}
                        moreDataAvailable={moreDataAvailableRef.current}
                        pagesVisible={pagesVisible}
                        setPagesVisible={setPagesVisible}
                        extraPagesAvailable={extraPagesAvailable}
                        // setExtraPagesAvailable={setExtraPagesAvailable}
                        tableKey='Orders'
                        dataPerPage={dataPerPage}
                        pageDataCount={pageDataCountRef.current.counts}
                        lastFetchedCount={lastFetchedCount}
                        setLastFetchedCount={setLastFetchedCount}
                        moreDataLoading={moreDataLoading}
                        />
                    )
                    :
                    
                    (<TableRows
                        type='Order'
                        data={sortedLimits}
                        fullData={sortedLimits}
                        tableView={tableView}
                        isAccountView={isAccountView}
                    />)
                    }
            </ul>
        </div>
    );

    if (isSmallScreen)
        return (
            <div style={{ overflow: 'scroll', height: '100%' }}>
                <div
                    style={{
                        position: 'sticky',
                        top: 0,
                        background: 'var(--dark2',
                        zIndex: '1',
                    }}
                >
                    {headerColumnsDisplay}
                </div>
                <div style={{ overflowY: 'scroll', height: '100%' }}>
                    {orderDataOrNull}
                </div>
            </div>
        );

    return (
        <FlexContainer
            flexDirection='column'
            style={{ height: isSmallScreen ? '95%' : '100%' }}
        >
            <div>{headerColumnsDisplay}</div>

            <div
                style={{ flex: 1, overflow: 'auto' }}
                className='custom_scroll_ambient'
            >
                {isLoading ? (
                    <Spinner size={100} bg='var(--dark1)' centered />
                ) : (
                    orderDataOrNull
                )}
            </div>
        </FlexContainer>
    );
}

export default memo(Orders);
