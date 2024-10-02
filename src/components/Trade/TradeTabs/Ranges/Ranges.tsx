// START: Import React and Dongles
import { useEffect, useState, useContext, memo, useRef, useMemo } from 'react';

// START: Import Local Files
import { useSortedPositions } from '../useSortedPositions';
import { PositionIF, PositionServerIF } from '../../../../ambient-utils/types';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import RangeHeader from './RangesTable/RangeHeader';
import NoTableData from '../NoTableData/NoTableData';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import Spinner from '../../../Global/Spinner/Spinner';
import { useLocation } from 'react-router-dom';
import { RangeContext } from '../../../../contexts/RangeContext';
import { RangesRowPlaceholder } from './RangesTable/RangesRowPlaceholder';
import { CrocEnvContext, CrocEnvContextIF } from '../../../../contexts/CrocEnvContext';
import {
    HideEmptyPositionContainer,
    RangeRow as RangeRowStyled,
} from '../../../../styled/Components/TransactionTable';
import { FlexContainer } from '../../../../styled/Common';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { DataLoadingContext } from '../../../../contexts/DataLoadingContext';
import { GraphDataContext, PositionsByPool } from '../../../../contexts/GraphDataContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import TableRows from '../TableRows';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import {
    bigIntToFloat,
    baseTokenForConcLiq,
    tickToPrice,
    quoteTokenForConcLiq,
    priceToTick,
} from '@crocswap-libs/sdk';
import { getPositionData } from '../../../../ambient-utils/dataLayer';
import { TokenContextIF, TokenContext } from '../../../../contexts/TokenContext';
import { getPositionHash } from '../../../../ambient-utils/dataLayer/functions/getPositionHash';
import { LS_KEY_HIDE_EMPTY_POSITIONS_ON_ACCOUNT } from '../../../../ambient-utils/constants';
import Toggle from '../../../Form/Toggle';
import { PageDataCountIF } from '../../../Chat/ChatIFs';
import { fetchPoolPositions } from '../../../../ambient-utils/api/fetchPoolPositions';
import TableRowsInfiniteScroll from '../TableRowsInfiniteScroll';

// interface for props
interface propsIF {
    activeAccountPositionData?: PositionIF[];
    connectedAccountActive?: boolean;
    isAccountView: boolean;
}

// react functional component
function Ranges(props: propsIF) {
    const { activeAccountPositionData, connectedAccountActive, isAccountView } =
        props;

    const {
        showAllData: showAllDataSelection,
        hideEmptyPositionsOnAccount,
        setHideEmptyPositionsOnAccount,
    } = useContext(TradeTableContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { tokens } = useContext(TokenContext);

    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const { setCurrentRangeInReposition } = useContext(RangeContext);
    
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
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);

    // only show all data when on trade tabs page
    const showAllData = !isAccountView && showAllDataSelection;

    const { userAddress } = useContext(UserDataContext);

    const {
        positionsByUser,
        userPositionsByPool,
        positionsByPool,
        unindexedNonFailedSessionPositionUpdates,
    } = useContext(GraphDataContext);
    const dataLoadingStatus = useContext(DataLoadingContext);

    const { transactionsByType } = useContext(ReceiptContext);

    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const baseTokenSymbol = baseToken.symbol;
    const quoteTokenSymbol = quoteToken.symbol;
    const baseTokenAddress = baseToken.address;
    const quoteTokenAddress = quoteToken.address;

    const path = useLocation().pathname;

    if (!path.includes('reposition')) {
        setCurrentRangeInReposition('');
    }

    const activeUserPositionsLength = useMemo(
        () =>
            isAccountView
                ? activeAccountPositionData
                    ? activeAccountPositionData.filter(
                          (position) => position.positionLiq != 0,
                      ).length
                    : 0
                : positionsByUser.positions.filter(
                      (position) => position.positionLiq != 0,
                  ).length,
        [activeAccountPositionData, positionsByUser, isAccountView],
    );

    const activeUserPositionsByPool = useMemo(
        () =>
            userPositionsByPool?.positions.filter(
                (position) => position.positionLiq != 0,
            ),
        [userPositionsByPool],
    );

          
    // infinite scroll props, methods ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    
    
    const [fetchedTransactions, setFetchedTransactions] = useState<PositionsByPool>({
        dataReceived: false,
    positions: [...positionsByPool.positions.filter(e=>e.positionLiq !== 0)],
});

const fetchedTransactionsRef = useRef<PositionsByPool>();
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
    
    const data = positionsByPool.positions.filter(e=>e.positionLiq !== 0);
    let counts;
    if(data.length == 0){
        counts = [0, 0];
    }
    if(data.length / dataPerPage < 2){
        counts = [Math.ceil(data.length / 2), 
            Math.floor(data.length / 2)];
    }
    else{
        counts = [data.length > dataPerPage ? dataPerPage : data.length , 
            data.length / dataPerPage  == 2 ? dataPerPage : data.length - dataPerPage];
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
    if(positionsByPool.positions.length > 0){
        return (positionsByPool.positions[0].base + positionsByPool.positions[0].quote).toLowerCase();
    }else{
        return '';
    }
}

useEffect(() => {
    // clear fetched transactions when switching pools
    if (positionsByPool.positions.length === 0) {
        setFetchedTransactions({
            dataReceived: true,
            positions: [],
        });
    }
    else{
        const existingChanges = new Set(
            fetchedTransactions.positions.map(
                // (change) => change.positionHash || change.positionId,
                (change) => change.positionId,
            ),
        ); // Adjust if using a different unique identifier

        const uniqueChanges = positionsByPool.positions.filter(
            // (change) => !existingChanges.has(change.positionHash || change.positionId),
            (change) => !existingChanges.has(change.positionId) && change.positionLiq !== 0,
        );

        if (uniqueChanges.length > 0) {
            setFetchedTransactions((prev) => {
                return {
                    dataReceived: true,
                    positions: [...uniqueChanges, ...prev.positions],
                };
            });
        }

        
    }
}, [positionsByPool]);




useEffect(() => {
    
    if(pageDataCountShouldReset && pageDataCountRef.current?.pair !== getCurrentDataPair() && fetchedTransactions.positions.length > 0){
        setPagesVisible([0, 1]);
        setPageDataCount(getInitialDataPageCounts());
        setPageDataCountShouldReset(false);
    }
}, [fetchedTransactions])




const fetchNewData = async(OLDEST_TIME:number):Promise<PositionIF[]> => {
    return new Promise(resolve => {
        if(!crocEnv || !provider) resolve([]);
        else{
            fetchPoolPositions({
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
                        // resolve(poolChangesJsonData as PositionIF[]);
                        resolve((poolChangesJsonData as PositionIF[]).filter(e=>e.positionLiq !== 0));
                    }else{
                        resolve([]);
                    }
                });
        }
    });
}

const dataDiffCheck = (dirty: PositionIF[]):PositionIF[] => {
    const txs = fetchedTransactionsRef.current ? fetchedTransactionsRef.current.positions : fetchedTransactions.positions;

    const existingChanges = new Set(
        txs.map(
            (change) => change.positionId,
        ),
    ); 

    const ret = dirty.filter(
        (change) =>
            !existingChanges.has(
                change.positionId,
            ),
    );

    return ret;
    
}

const getOldestTime = (data: PositionIF[]):number => {
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

            const newTxData: PositionIF[] = [];
            let oldestTimeParam = oldestTxTime;
            while((addedDataCount < targetCount)){
                // fetch data
                const dirtyData = await fetchNewData(oldestTimeParam);
                if (dirtyData.length == 0){
                    break;
                }
                // check diff
                const cleanData = dataDiffCheck(dirtyData);
                console.log('package: ', cleanData.length)
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
                        ...prev.positions,
                        ...newTxData,
                    ]);
                    return {
                        dataReceived: true,
                        positions: sortedData,
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


    const rangeData = useMemo(
        () =>
            isAccountView
                ? activeAccountPositionData || []
                : !showAllData
                  ? activeUserPositionsByPool
                //   : positionsByPool.positions.filter(
                //         (position) => position.positionLiq != 0,
                //     ),
                : fetchedTransactions.positions,
        [
            showAllData,
            isAccountView,
            activeAccountPositionData,
            positionsByPool,
            activeUserPositionsByPool,
            fetchedTransactions  // infinite scroll
        ],
    );

    // infinite scroll ------------------------------------------------------------------------------------------------------------------------------
    const oldestTxTime = useMemo(
        () =>
            rangeData.length > 0
                ? rangeData.reduce((min, order) => {
                        return order.latestUpdateTime < min
                            ? order.latestUpdateTime
                            : min;
                    }, rangeData[0].latestUpdateTime)
                : 0,
        [rangeData],
    );

    // ------------------------------------------------------------------------------------------------------------------------------
    

    const isLoading = useMemo(
        () =>
            isAccountView && connectedAccountActive
                ? dataLoadingStatus.isConnectedUserRangeDataLoading
                : isAccountView
                  ? dataLoadingStatus.isLookupUserRangeDataLoading
                  : !showAllData
                    ? dataLoadingStatus.isConnectedUserPoolRangeDataLoading
                    : dataLoadingStatus.isPoolRangeDataLoading,
        [
            showAllData,
            isAccountView,
            connectedAccountActive,
            dataLoadingStatus.isConnectedUserRangeDataLoading,
            dataLoadingStatus.isConnectedUserPoolRangeDataLoading,
            dataLoadingStatus.isLookupUserRangeDataLoading,
            dataLoadingStatus.isPoolRangeDataLoading,
        ],
    );

    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions, sortData] =
        useSortedPositions('time', rangeData);

            // infinite scroll ------------------------------------------------------------------------------------------------------------------------------
    const sortedLimitDataToDisplay = useMemo<PositionIF[]>(() => {

        console.log('startIndex', getIndexForPages(true), ' endIndex', getIndexForPages(false));
        console.log('p0', pagesVisible[0], '| p1', pagesVisible[1]);
        console.log('pageDataCountVals', pageDataCountRef.current?.counts);
        console.log('.............................')
        return isAccountView
            ? sortedPositions
            : sortedPositions.slice(
                    getIndexForPages(true),
                    getIndexForPages(false)
                );
    }, [sortedPositions, pagesVisible,  isAccountView]);

    // -----------------------------------------------------------------------------------------------------------------------------


    // TODO: Use these as media width constants
    const isSmallScreen = useMediaQuery('(max-width: 768px)');
    const isLargeScreen = useMediaQuery('(min-width: 2000px)');
    const isLargeScreenAccount = useMediaQuery('(min-width: 1600px)');

    const tableView =
        isSmallScreen ||
        (isAccountView &&
            connectedAccountActive &&
            !isLargeScreenAccount &&
            isSidebarOpen)
            ? 'small'
            : !isSmallScreen && !isLargeScreen
              ? 'medium'
              : 'large';

    const filteredSortedPositions = useMemo(() => {
        // filter out empty positions on account view when hideEmptyPositionsOnAccount is true
        return hideEmptyPositionsOnAccount && isAccountView
            ? sortedPositions.filter((position) => position.positionLiq !== 0)
            : sortedPositions;
    }, [hideEmptyPositionsOnAccount, isAccountView, sortedPositions]);

    const _DATA = filteredSortedPositions;
    // , isScreenShort, isScreenTall

    const listRef = useRef<HTMLUListElement>(null);

    const userHasEmptyPositions = useMemo(
        () =>
            positionsByUser.positions.filter(
                (position) => position.positionLiq === 0,
            ).length > 0,
        [positionsByUser.positions],
    );

    const showEmptyToggleButton =
        connectedAccountActive && userHasEmptyPositions;

    const footerDisplay = (
        <FlexContainer
            alignItems='center'
            justifyContent='space-between'
            fullWidth
            flexDirection={isSmallScreen ? 'column' : 'row'}
            margin={isSmallScreen ? '20px auto' : '16px auto'}
        >
            {showEmptyToggleButton && (
                <HideEmptyPositionContainer
                    onClick={() => {
                        localStorage.setItem(
                            LS_KEY_HIDE_EMPTY_POSITIONS_ON_ACCOUNT,
                            String(!hideEmptyPositionsOnAccount),
                        );
                        setHideEmptyPositionsOnAccount(
                            !hideEmptyPositionsOnAccount,
                        );
                    }}
                    style={{ width: '100%' }}
                >
                    <p>Hide Empty Positions</p>

                    <Toggle
                        isOn={hideEmptyPositionsOnAccount}
                        disabled={false}
                        handleToggle={() => {
                            localStorage.setItem(
                                LS_KEY_HIDE_EMPTY_POSITIONS_ON_ACCOUNT,
                                String(!hideEmptyPositionsOnAccount),
                            );
                            setHideEmptyPositionsOnAccount(
                                !hideEmptyPositionsOnAccount,
                            );
                        }}
                        id='toggle_empty_positions_liquidity'
                        aria-label='toggle empty positions'
                    />
                </HideEmptyPositionContainer>
            )}
        </FlexContainer>
    );

    const minMax = (
        <>
            <p>Min</p>
            <p>Max</p>
        </>
    );
    const tokensDisplay = isAccountView ? (
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
            className: 'ID',
            show: tableView === 'large',
            slug: 'id',
            sortable: false,
        },
        {
            name: 'Wallet',
            className: 'wallet',
            show: tableView === 'large' && !isAccountView,
            slug: 'wallet',
            sortable: showAllData,
        },
        {
            name: 'Wallet',
            className: 'wallet_id',
            show:
                !isAccountView &&
                (tableView === 'medium' || tableView === 'small'),
            slug: 'walletid',
            sortable: !isAccountView,
        },
        {
            name: 'Position ID',
            className: 'position_id',
            show: isAccountView && tableView !== 'small',
            slug: 'positionid',
            sortable: false,
        },
        {
            name: 'Min',
            show: tableView === 'large',
            slug: 'min',
            sortable: false,
            alignRight: true,
        },
        {
            name: 'Max',
            className: 'side',
            show: tableView === 'large',
            slug: 'max',
            sortable: false,
            alignRight: true,
        },
        {
            name: minMax,
            className: 'side_type',
            show: tableView === 'medium',
            slug: 'minMax',
            sortable: false,
            alignRight: true,
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
            name: tokensDisplay,
            className: 'tokens',
            show: tableView === 'medium',
            slug: 'tokens',
            sortable: false,
            alignRight: true,
        },
        {
            name: 'APR',
            className: 'apr',
            show: true,
            slug: 'apr',
            sortable: true,
            alignRight: true,
            rightPadding: 8,
        },
        {
            name: 'Status',
            className: 'status',
            show: true,
            slug: 'status',
            sortable: true,
            leftPadding: 8,
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
        <RangeRowStyled size={tableView} account={isAccountView} header>
            {headerColumns.map((header, idx) => (
                <RangeHeader
                    key={idx}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    reverseSort={reverseSort}
                    setReverseSort={setReverseSort}
                    header={header}
                />
            ))}
        </RangeRowStyled>
    );

    const relevantTransactionsByType = transactionsByType.filter(
        (tx) =>
            unindexedNonFailedSessionPositionUpdates.some(
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

    const [unindexedUpdatedPositions, setUnindexedUpdatedPositions] = useState<
        PositionIF[]
    >([]);

    useEffect(() => {
        (async () => {
            if (relevantTransactionsByType.length === 0) {
                setUnindexedUpdatedPositions([]);
            }
            const pendingPositionUpdates = relevantTransactionsByType.filter(
                (tx) => {
                    return (
                        tx.txAction === 'Add' ||
                        tx.txAction === 'Reposition' ||
                        tx.txAction === 'Remove' ||
                        tx.txAction === 'Harvest'
                    );
                },
            );
            const newlyUpdatedPositions = await Promise.all(
                pendingPositionUpdates.map(async (pendingPositionUpdate) => {
                    if (!crocEnv || !pendingPositionUpdate.txDetails)
                        return {} as PositionIF;
                    const pos = crocEnv.positions(
                        pendingPositionUpdate.txDetails.baseAddress,
                        pendingPositionUpdate.txDetails.quoteAddress,
                        pendingPositionUpdate.userAddress,
                    );

                    const poolPriceNonDisplay = await cachedQuerySpotPrice(
                        crocEnv,
                        baseTokenAddress,
                        quoteTokenAddress,
                        chainId,
                        lastBlockNumber,
                    );

                    const position = pendingPositionUpdate.txDetails.isAmbient
                        ? await pos.queryAmbientPos()
                        : await pos.queryRangePos(
                              pendingPositionUpdate.txDetails.lowTick || 0,
                              pendingPositionUpdate.txDetails.highTick || 0,
                          );
                    const poolPriceInTicks = priceToTick(poolPriceNonDisplay);

                    let positionLiqBase, positionLiqQuote;

                    if (!pendingPositionUpdate.txDetails)
                        return {} as PositionIF;
                    const liqBigInt = position.liq;
                    const liqNum = bigIntToFloat(liqBigInt);
                    if (pendingPositionUpdate.txDetails.isAmbient) {
                        positionLiqBase =
                            liqNum * Math.sqrt(poolPriceNonDisplay);
                        positionLiqQuote =
                            liqNum / Math.sqrt(poolPriceNonDisplay);
                    } else {
                        positionLiqBase = bigIntToFloat(
                            baseTokenForConcLiq(
                                poolPriceNonDisplay,
                                liqBigInt,
                                tickToPrice(
                                    pendingPositionUpdate.txDetails.lowTick ||
                                        0,
                                ),
                                tickToPrice(
                                    pendingPositionUpdate.txDetails.highTick ||
                                        0,
                                ),
                            ),
                        );
                        positionLiqQuote = bigIntToFloat(
                            quoteTokenForConcLiq(
                                poolPriceNonDisplay,
                                liqBigInt,
                                tickToPrice(
                                    pendingPositionUpdate.txDetails.lowTick ||
                                        0,
                                ),
                                tickToPrice(
                                    pendingPositionUpdate.txDetails.highTick ||
                                        0,
                                ),
                            ),
                        );
                    }

                    const currentTime = Math.floor(Date.now() / 1000);

                    const posHash = getPositionHash(undefined, {
                        isPositionTypeAmbient:
                            pendingPositionUpdate.txDetails.isAmbient || false,
                        user: pendingPositionUpdate.userAddress,
                        baseAddress:
                            pendingPositionUpdate.txDetails.baseAddress,
                        quoteAddress:
                            pendingPositionUpdate.txDetails.quoteAddress,
                        poolIdx: pendingPositionUpdate.txDetails.poolIdx,
                        bidTick: pendingPositionUpdate.txDetails.lowTick || 0,
                        askTick: pendingPositionUpdate.txDetails.highTick || 0,
                    });

                    const mockServerPosition: PositionServerIF = {
                        positionId: posHash,
                        chainId: chainId,
                        askTick: pendingPositionUpdate.txDetails.highTick || 0,
                        bidTick: pendingPositionUpdate.txDetails.lowTick || 0,
                        poolIdx: pendingPositionUpdate.txDetails.poolIdx,
                        base: pendingPositionUpdate.txDetails.baseAddress,
                        quote: pendingPositionUpdate.txDetails.quoteAddress,
                        user: pendingPositionUpdate.userAddress,
                        ambientLiq: pendingPositionUpdate.txDetails.isAmbient
                            ? liqNum
                            : 0,
                        concLiq: !pendingPositionUpdate.txDetails.isAmbient
                            ? liqNum
                            : 0,
                        rewardLiq: 0, // unknown
                        positionType: pendingPositionUpdate.txDetails.isAmbient
                            ? 'ambient'
                            : 'concentrated',
                        timeFirstMint: currentTime, // unknown
                        lastMintTx: '', // unknown
                        firstMintTx: '', // unknown
                        aprEst: 0, // unknown
                    };
                    const skipENSFetch = true;

                    const positionData = await getPositionData(
                        mockServerPosition,
                        tokens.tokenUniv,
                        crocEnv,
                        provider,
                        chainId,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                        cachedEnsResolve,
                        skipENSFetch,
                    );
                    const onChainPosition: PositionIF = {
                        chainId: chainId,
                        base: pendingPositionUpdate.txDetails.baseAddress,
                        quote: pendingPositionUpdate.txDetails.quoteAddress,
                        poolIdx: pendingPositionUpdate.txDetails.poolIdx,
                        bidTick: pendingPositionUpdate.txDetails.lowTick,
                        askTick: pendingPositionUpdate.txDetails.highTick,
                        isBid: pendingPositionUpdate.txDetails.isBid,
                        user: pendingPositionUpdate.userAddress,
                        timeFirstMint: Number(position.timestamp), // from on-chain call (not updated for removes?)
                        latestUpdateTime: Number(position.timestamp), // from on-chain call (not updated for removes?)
                        lastMintTx: '', // unknown
                        firstMintTx: '', // unknown
                        positionType: pendingPositionUpdate.txDetails.isAmbient
                            ? 'ambient'
                            : 'concentrated',
                        ambientLiq: pendingPositionUpdate.txDetails.isAmbient
                            ? liqNum
                            : 0,
                        concLiq: !pendingPositionUpdate.txDetails.isAmbient
                            ? liqNum
                            : 0,
                        rewardLiq: 0, // unknown
                        liqRefreshTime: currentTime, // unknown
                        aprDuration: 0, // unknown
                        aprPostLiq: 0,
                        aprContributedLiq: 0,
                        // aprEst: 0,
                        poolPriceInTicks: poolPriceInTicks,
                        isPositionInRange: true, // unknown
                        baseDecimals:
                            pendingPositionUpdate.txDetails.baseTokenDecimals,
                        quoteDecimals:
                            pendingPositionUpdate.txDetails.quoteTokenDecimals,
                        baseSymbol: pendingPositionUpdate.txDetails.baseSymbol,
                        quoteSymbol:
                            pendingPositionUpdate.txDetails.quoteSymbol,
                        baseName: '',
                        quoteName: '',
                        lowRangeDisplayInBase:
                            positionData.lowRangeDisplayInBase,
                        highRangeDisplayInBase:
                            positionData.highRangeDisplayInBase,
                        lowRangeDisplayInQuote:
                            positionData.lowRangeDisplayInQuote,
                        highRangeDisplayInQuote:
                            positionData.highRangeDisplayInQuote,
                        lowRangeShortDisplayInBase:
                            positionData.lowRangeShortDisplayInBase,
                        lowRangeShortDisplayInQuote:
                            positionData.lowRangeShortDisplayInQuote,
                        highRangeShortDisplayInBase:
                            positionData.highRangeShortDisplayInBase,
                        highRangeShortDisplayInQuote:
                            positionData.highRangeShortDisplayInQuote,
                        bidTickPriceDecimalCorrected:
                            positionData.bidTickPriceDecimalCorrected,
                        bidTickInvPriceDecimalCorrected:
                            positionData.bidTickInvPriceDecimalCorrected,
                        askTickPriceDecimalCorrected:
                            positionData.askTickPriceDecimalCorrected,
                        askTickInvPriceDecimalCorrected:
                            positionData.askTickInvPriceDecimalCorrected,
                        positionLiq: liqNum,
                        positionLiqBase: positionLiqBase,
                        positionLiqQuote: positionLiqQuote,
                        feesLiqBase: positionData.feesLiqBase,
                        feesLiqQuote: positionData.feesLiqQuote,
                        feesLiqBaseDecimalCorrected:
                            positionData.feesLiqBaseDecimalCorrected,
                        feesLiqQuoteDecimalCorrected:
                            positionData.feesLiqQuoteDecimalCorrected,
                        positionLiqBaseDecimalCorrected:
                            positionData.positionLiqBaseDecimalCorrected,
                        positionLiqQuoteDecimalCorrected:
                            positionData.positionLiqQuoteDecimalCorrected,
                        positionLiqBaseTruncated:
                            positionData.positionLiqBaseTruncated,
                        positionLiqQuoteTruncated:
                            positionData.positionLiqQuoteTruncated,
                        totalValueUSD: positionData.totalValueUSD,
                        apy: positionData.apy,
                        positionId: positionData.positionId,
                        onChainConstructedPosition: true,
                    } as PositionIF;

                    if (
                        onChainPosition.positionLiqBaseDecimalCorrected !== 0 ||
                        onChainPosition.positionLiqQuoteDecimalCorrected !== 0
                    ) {
                        return onChainPosition;
                    } else {
                        return undefined;
                    }
                }),
            );

            const definedUpdatedPositions: PositionIF[] =
                newlyUpdatedPositions.filter(
                    (position) => position !== undefined,
                ) as PositionIF[];
            if (definedUpdatedPositions.length)
                setUnindexedUpdatedPositions(definedUpdatedPositions);
        })();
    }, [JSON.stringify(relevantTransactionsByType), lastBlockNumber]);

    const shouldDisplayNoTableData =
        !isLoading &&
        !rangeData.length &&
        relevantTransactionsByType.length === 0;

    const unindexedUpdatedPositionHashes = unindexedUpdatedPositions.map(
        (pos) => pos.positionId,
    );

    const pendingPositionsToDisplayPlaceholder =
        relevantTransactionsByType.filter((pos) => {
            const pendingPosHash = getPositionHash(undefined, {
                isPositionTypeAmbient: pos.txDetails?.isAmbient || false,
                user: pos.userAddress,
                baseAddress: pos.txDetails?.baseAddress || '',
                quoteAddress: pos.txDetails?.quoteAddress || '',
                poolIdx: pos.txDetails?.poolIdx || 0,
                bidTick: pos.txDetails?.lowTick || 0,
                askTick: pos.txDetails?.highTick || 0,
            });
            const matchingPosition = unindexedUpdatedPositions.find(
                (unindexedPosition) => {
                    return pendingPosHash === unindexedPosition.positionId;
                },
            );
            const matchingPositionUpdatedInLastMinute =
                (matchingPosition?.liqRefreshTime || 0) -
                    (matchingPosition?.latestUpdateTime || 0) <
                60;
            // identify completed adds when update time in last minute (does not work for removes)
            return (
                !unindexedUpdatedPositionHashes.includes(pendingPosHash) ||
                (matchingPosition && !matchingPositionUpdatedInLastMinute)
                // show pulsing placeholder until existing position is updated
            );
        });

    const handleKeyDownViewRanges = (
        event: React.KeyboardEvent<HTMLUListElement | HTMLDivElement>,
    ): void => {
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

    const rangeDataOrNull = shouldDisplayNoTableData ? (
        <NoTableData
            type='liquidity'
            isAccountView={isAccountView}
            activeUserPositionsLength={activeUserPositionsLength}
            activeUserPositionsByPoolLength={activeUserPositionsByPool.length}
        />
    ) : (
        <div onKeyDown={handleKeyDownViewRanges} style={{ height: '100%' }}>
            <ul
                ref={listRef}
                // id='current_row_scroll'
                style={{ height: '100%' }}
            >
                {!isAccountView &&
                    pendingPositionsToDisplayPlaceholder.length > 0 &&
                    pendingPositionsToDisplayPlaceholder
                        .reverse()
                        .map((tx, idx) => (
                            <RangesRowPlaceholder
                                key={idx}
                                transaction={{
                                    hash: tx.txHash,
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
                        type='Range'
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
                        tableKey='Ranges'
                        dataPerPage={dataPerPage}
                        pageDataCount={pageDataCountRef.current.counts}
                        lastFetchedCount={lastFetchedCount}
                        setLastFetchedCount={setLastFetchedCount}
                        moreDataLoading={moreDataLoading}
                        />
                    )
                    :
                    
                    (<TableRows
                        type='Range'
                        data={unindexedUpdatedPositions.concat(
                            filteredSortedPositions
                                .filter(
                                    (pos) =>
                                        // remove existing row for adds
                                        !unindexedUpdatedPositionHashes.includes(
                                            pos.positionId,
                                        ),
                                )
                                // only show empty positions on account view
                                .filter(
                                    (pos) =>
                                        (isAccountView &&
                                            !hideEmptyPositionsOnAccount) ||
                                        pos.positionLiq !== 0,
                                ),
                        )}
                        fullData={unindexedUpdatedPositions.concat(
                            filteredSortedPositions,
                        )}
                        isAccountView={isAccountView}
                        tableView={tableView}
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
                    {rangeDataOrNull}
                </div>
            </div>
        );
    return (
        <FlexContainer
            flexDirection='column'
            style={{
                height: isSmallScreen
                    ? '97%'
                    : !isAccountView
                      ? '105%'
                      : '100%',
            }}
        >
            <div>{headerColumnsDisplay}</div>

            <div
                style={{ flex: 1, overflow: 'auto' }}
                className='custom_scroll_ambient'
            >
                {isLoading ? (
                    <Spinner size={100} bg='var(--dark1)' centered />
                ) : (
                    rangeDataOrNull
                )}
            </div>

            {footerDisplay}
        </FlexContainer>
    );
}

export default memo(Ranges);
