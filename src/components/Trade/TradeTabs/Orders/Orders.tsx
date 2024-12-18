/* eslint-disable no-irregular-whitespace */
import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    LimitOrderIF,
    LimitOrderServerIF,
} from '../../../../ambient-utils/types';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import NoTableData from '../NoTableData/NoTableData';
import { useSortedLimits } from '../useSortedLimits';
import OrderHeader from './OrderTable/OrderHeader';

import { fetchPoolLimitOrders } from '../../../../ambient-utils/api/fetchPoolLimitOrders';
import { AppStateContext, ChainDataContext } from '../../../../contexts';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { DataLoadingContext } from '../../../../contexts/DataLoadingContext';
import {
    GraphDataContext,
    LimitOrdersByPool,
} from '../../../../contexts/GraphDataContext';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import { TokenContext } from '../../../../contexts/TokenContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FlexContainer } from '../../../../styled/Common';
import { OrderRow as OrderRowStyled } from '../../../../styled/Components/TransactionTable';
import { PageDataCountIF } from '../../../Chat/ChatIFs';
import Spinner from '../../../Global/Spinner/Spinner';
import TableRows from '../TableRows';
import TableRowsInfiniteScroll from '../TableRowsInfiniteScroll';
import { OrderRowPlaceholder } from './OrderTable/OrderRowPlaceholder';
import { getLimitOrderData } from '../../../../ambient-utils/dataLayer';
import { getPositionHash } from '../../../../ambient-utils/dataLayer/functions/getPositionHash';
import {
    baseTokenForConcLiq,
    bigIntToFloat,
    quoteTokenForConcLiq,
    tickToPrice,
} from '@crocswap-libs/sdk';

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

    const { crocEnv, provider } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);

    const {
        activeNetwork: { chainId, poolIndex, GCGO_URL },
    } = useContext(AppStateContext);

    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);

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

    const [fetchedTransactions, setFetchedTransactions] =
        useState<LimitOrdersByPool>({
            dataReceived: false,
            limitOrders: [...limitOrdersByPool.limitOrders],
        });

    const fetchedTransactionsRef = useRef<LimitOrdersByPool>();
    fetchedTransactionsRef.current = fetchedTransactions;

    const [hotTransactions, setHotTransactions] = useState<LimitOrderIF[]>([]);

    const {
        tokens: { tokenUniv: tokenList },
    } = useContext(TokenContext);

    const [extraPagesAvailable, setExtraPagesAvailable] = useState<number>(0);

    const [moreDataAvailable, setMoreDataAvailable] = useState<boolean>(true);
    const moreDataAvailableRef = useRef<boolean>();
    moreDataAvailableRef.current = moreDataAvailable;

    const [lastFetchedCount, setLastFetchedCount] = useState<number>(0);

    const [moreDataLoading, setMoreDataLoading] = useState<boolean>(false);

    const selectedBaseAddress: string = baseToken.address;
    const selectedQuoteAddress: string = quoteToken.address;

    const prevBaseQuoteAddressRef = useRef<string>(
        selectedBaseAddress + selectedQuoteAddress,
    );

    const [showInfiniteScroll, setShowInfiniteScroll] = useState<boolean>(
        !isAccountView && showAllData,
    );

    useEffect(() => {
        setShowInfiniteScroll(!isAccountView && showAllData);
    }, [isAccountView, showAllData]);

    useEffect(() => {
        if (
            prevBaseQuoteAddressRef.current !==
            selectedBaseAddress + selectedQuoteAddress
        ) {
            setPagesVisible([0, 1]);
            setPageDataCountShouldReset(true);
            setExtraPagesAvailable(0);
            setMoreDataAvailable(true);
            setTimeout(() => {
                setMoreDataAvailable(true);
            }, 1000);
            setLastFetchedCount(0);
            setHotTransactions([]);
        }

        prevBaseQuoteAddressRef.current =
            selectedBaseAddress + selectedQuoteAddress;
    }, [selectedBaseAddress + selectedQuoteAddress]);

    const [pageDataCountShouldReset, setPageDataCountShouldReset] =
        useState(false);

    const getInitialDataPageCounts = () => {
        let counts;
        if (limitOrdersByPool.limitOrders.length == 0) {
            counts = [0, 0];
        }
        if (limitOrdersByPool.limitOrders.length / dataPerPage < 2) {
            counts = [
                Math.ceil(limitOrdersByPool.limitOrders.length / 2),
                Math.floor(limitOrdersByPool.limitOrders.length / 2),
            ];
        } else {
            counts = [
                limitOrdersByPool.limitOrders.length > dataPerPage
                    ? dataPerPage
                    : limitOrdersByPool.limitOrders.length,
                limitOrdersByPool.limitOrders.length / dataPerPage == 2
                    ? dataPerPage
                    : limitOrdersByPool.limitOrders.length - dataPerPage,
            ];
        }

        return {
            pair: (selectedBaseAddress + selectedQuoteAddress).toLowerCase(),
            counts: counts,
        };
    };

    const updatePageDataCount = (dataCount: number) => {
        setPageDataCount((prev) => {
            return {
                pair: prev.pair,
                counts: [...prev.counts, dataCount],
            };
        });
    };

    const dataPerPage = 50;
    const [pagesVisible, setPagesVisible] = useState<[number, number]>([0, 1]);
    const [pageDataCount, setPageDataCount] = useState<PageDataCountIF>(
        getInitialDataPageCounts(),
    );

    const pageDataCountRef = useRef<PageDataCountIF>();
    pageDataCountRef.current = pageDataCount;

    const getIndexForPages = (start: boolean, offset = 0) => {
        const pageDataCountVal = (
            pageDataCountRef.current ? pageDataCountRef.current : pageDataCount
        ).counts;
        let ret = 0;
        if (start) {
            for (let i = 0; i < pagesVisible[0]; i++) {
                ret += pageDataCountVal[i];
            }
        } else {
            for (let i = 0; i <= pagesVisible[1]; i++) {
                ret += pageDataCountVal[i];
                if (pagesVisible[1] === 1 && offset > 0) {
                    ret += offset;
                }
            }
        }

        return ret;
    };

    const getCurrentDataPair = () => {
        if (limitOrdersByPool.limitOrders.length > 0) {
            return (
                limitOrdersByPool.limitOrders[0].base +
                limitOrdersByPool.limitOrders[0].quote
            ).toLowerCase();
        } else {
            return '';
        }
    };

    const updateHotTransactions = (changes: LimitOrderIF[]) => {
        const existingChanges = new Set(
            hotTransactions.map((change) => change.limitOrderId),
        );

        const uniqueChanges = changes.filter(
            (change) => !existingChanges.has(change.limitOrderId),
        );

        setHotTransactions((prev) => [...uniqueChanges, ...prev]);
    };

    const mergePageDataCountValues = (hotTxsCount: number) => {
        const counts = pageDataCountRef.current?.counts || pageDataCount.counts;
        const newCounts = counts.map((e) => {
            if (e < dataPerPage && hotTxsCount > 0) {
                const gap = dataPerPage - e;
                if (hotTxsCount > gap) {
                    e += gap;
                    hotTxsCount -= gap;
                } else {
                    e += hotTxsCount;
                    hotTxsCount = 0;
                }
            }
            return e;
        });

        if (hotTxsCount > 0) {
            for (let i = 0; i < hotTxsCount / dataPerPage - 1; i++) {
                newCounts.push(dataPerPage);
            }
            newCounts.push(hotTxsCount % dataPerPage);
        }

        setPageDataCount((prev) => {
            return {
                pair: prev.pair,
                counts: newCounts,
            };
        });
    };

    useEffect(() => {
        if (pagesVisible[0] === 0 && hotTransactions.length > 0) {
            setFetchedTransactions((prev) => {
                return {
                    dataReceived: true,
                    limitOrders: [...hotTransactions, ...prev.limitOrders],
                };
            });
            mergePageDataCountValues(hotTransactions.length);
            setHotTransactions([]);
        }
    }, [pagesVisible[0]]);

    useEffect(() => {
        // clear fetched transactions when switching pools
        if (limitOrdersByPool.limitOrders.length === 0) {
            setFetchedTransactions({
                dataReceived: true,
                limitOrders: [],
            });
        } else {
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
                if (pagesVisible[0] === 0) {
                    setFetchedTransactions((prev) => {
                        return {
                            dataReceived: true,
                            limitOrders: [
                                ...uniqueChanges,
                                ...prev.limitOrders,
                            ],
                        };
                    });
                } else {
                    updateHotTransactions(uniqueChanges);
                }
            }
        }
    }, [limitOrdersByPool]);

    useEffect(() => {
        if (
            pageDataCountShouldReset &&
            pageDataCountRef.current?.pair !== getCurrentDataPair() &&
            fetchedTransactions.limitOrders.length > 0
        ) {
            setPagesVisible([0, 1]);
            setPageDataCount(getInitialDataPageCounts());
            setPageDataCountShouldReset(false);
        }

        if (
            pageDataCountRef.current?.counts[0] == 0 &&
            fetchedTransactions.limitOrders.length > 0
        ) {
            setPageDataCount(getInitialDataPageCounts());
        }
    }, [fetchedTransactions]);

    const fetchNewData = async (
        OLDEST_TIME: number,
    ): Promise<LimitOrderIF[]> => {
        return new Promise((resolve) => {
            if (!crocEnv || !provider) resolve([]);
            else {
                fetchPoolLimitOrders({
                    tokenList: tokenList,
                    base: baseToken.address,
                    quote: quoteToken.address,
                    poolIdx: poolIndex,
                    chainId: chainId,
                    n: dataPerPage,
                    timeBefore: OLDEST_TIME,
                    crocEnv: crocEnv,
                    GCGO_URL: GCGO_URL,
                    provider: provider,
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                    cachedEnsResolve: cachedEnsResolve,
                }).then((poolChangesJsonData) => {
                    if (poolChangesJsonData && poolChangesJsonData.length > 0) {
                        resolve(poolChangesJsonData as LimitOrderIF[]);
                    } else {
                        resolve([]);
                    }
                });
            }
        });
    };

    const dataDiffCheck = (dirty: LimitOrderIF[]): LimitOrderIF[] => {
        const txs = fetchedTransactionsRef.current
            ? fetchedTransactionsRef.current.limitOrders
            : fetchedTransactions.limitOrders;

        const existingChanges = new Set(
            txs.map((change) => change.limitOrderId),
        );

        const ret = dirty.filter(
            (change) => !existingChanges.has(change.limitOrderId),
        );

        return ret;
    };

    const getOldestTime = (data: LimitOrderIF[]): number => {
        let oldestTime = 0;
        if (data.length > 0) {
            oldestTime = data.reduce((min, order) => {
                return order.latestUpdateTime < min
                    ? order.latestUpdateTime
                    : min;
            }, data[0].latestUpdateTime);
        }
        return oldestTime;
    };

    const addMoreData = async () => {
        setMoreDataLoading(true);
        const targetCount = 30;
        let addedDataCount = 0;

        const newTxData: LimitOrderIF[] = [];
        let oldestTimeParam = oldestTxTime;
        while (addedDataCount < targetCount) {
            // fetch data
            const dirtyData = await fetchNewData(oldestTimeParam);
            if (dirtyData.length == 0) {
                break;
            }
            // check diff
            const cleanData = dataDiffCheck(dirtyData);
            if (cleanData.length == 0) {
                break;
            } else {
                addedDataCount += cleanData.length;
                newTxData.push(...cleanData);
                const oldestTimeTemp = getOldestTime(newTxData);
                oldestTimeParam =
                    oldestTimeTemp < oldestTimeParam
                        ? oldestTimeTemp
                        : oldestTimeParam;
            }
        }
        if (addedDataCount > 0) {
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
            });
            setLastFetchedCount(addedDataCount);
            updatePageDataCount(addedDataCount);
            setExtraPagesAvailable((prev) => prev + 1);
            setPagesVisible((prev) => [prev[0] + 1, prev[1] + 1]);
        } else {
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
                  : fetchedTransactions.limitOrders,
        [
            showAllData,
            isAccountView,
            activeAccountLimitOrderData,
            activeUserLimitOrdersByPool,
            fetchedTransactions.limitOrders, // infinite scroll
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
            !tx.isRemoved &&
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

    type RecentlyUpdatedPosition = {
        positionHash: string;
        timestamp: number;
        order: LimitOrderIF;
        type: string;
        action: string;
    };

    // list of recently updated positions
    const [listOfRecentlyUpdatedOrders, setListOfRecentlyUpdatedOrders] =
        useState<RecentlyUpdatedPosition[]>([]);

    const addRecentlyUpdatedOrder = (
        type: string,
        action: string,
        order: LimitOrderIF,
        timestamp: number,
    ) => {
        setListOfRecentlyUpdatedOrders((prev) => {
            return [
                ...prev.filter((e) => e.positionHash !== order.positionHash),
                {
                    positionHash: order.positionHash,
                    timestamp: timestamp,
                    order: order,
                    type: type,
                    action: action,
                },
            ];
        });
    };

    useEffect(() => {
        (async () => {
            // if (relevantTransactionsByType.length === 0) {
            //     setUnindexedUpdatedOrders([]);
            // }

            const pendingOrders = relevantTransactionsByType.filter((tx) => {
                return tx.txType === 'Limit';
            });

            await Promise.all(
                pendingOrders.map(async (pendingOrder) => {
                    if (!crocEnv || !pendingOrder.txDetails)
                        return {} as LimitOrderIF;

                    const pos = crocEnv.positions(
                        pendingOrder.txDetails.quoteAddress,
                        pendingOrder.txDetails.baseAddress,
                        pendingOrder.userAddress,
                    );

                    const poolPriceNonDisplay = await cachedQuerySpotPrice(
                        crocEnv,
                        pendingOrder.txDetails.baseAddress,
                        pendingOrder.txDetails.quoteAddress,
                        chainId,
                        lastBlockNumber,
                    );

                    const position = await pos.queryKnockoutLivePos(
                        pendingOrder.txAction === 'Buy',
                        pendingOrder.txDetails.lowTick || 0,
                        pendingOrder.txDetails.highTick || 0,
                        // lastBlockNumber
                    );
                    if (!pendingOrder.txDetails) {
                        return {} as LimitOrderIF;
                    }

                    const liqBigInt = position.liq;
                    const liqNum = bigIntToFloat(liqBigInt);

                    const highTickPrice = tickToPrice(
                        pendingOrder.txDetails.highTick || 0,
                    );

                    const usdValue = pendingOrder.txDetails.isBid
                        ? (1 / poolPriceNonDisplay) *
                          parseFloat(pendingOrder.txDetails.baseTokenQty || '1')
                        : (1 / highTickPrice) *
                          parseFloat(
                              pendingOrder.txDetails.baseTokenQty || '1',
                          );

                    const positionLiqBase = bigIntToFloat(
                        baseTokenForConcLiq(
                            poolPriceNonDisplay,
                            liqBigInt,
                            tickToPrice(pendingOrder.txDetails.lowTick || 0),
                            tickToPrice(pendingOrder.txDetails.highTick || 0),
                        ),
                    );
                    const positionLiqQuote = bigIntToFloat(
                        quoteTokenForConcLiq(
                            poolPriceNonDisplay,
                            liqBigInt,
                            tickToPrice(pendingOrder.txDetails.lowTick || 0),
                            tickToPrice(pendingOrder.txDetails.highTick || 0),
                        ),
                    );

                    const positionHash = getPositionHash(undefined, {
                        isPositionTypeAmbient: false,
                        user: pendingOrder.userAddress,
                        baseAddress: pendingOrder.txDetails.baseAddress,
                        quoteAddress: pendingOrder.txDetails.quoteAddress,
                        poolIdx: pendingOrder.txDetails.poolIdx,
                        bidTick: pendingOrder.txDetails.lowTick || 0,
                        askTick: pendingOrder.txDetails.highTick || 0,
                    });

                    const mockServerOrder: LimitOrderServerIF = {
                        chainId: chainId,
                        limitOrderId: positionHash,
                        pivotTime: 0,
                        askTick: pendingOrder.txDetails.highTick || 0,
                        bidTick: pendingOrder.txDetails.lowTick || 0,
                        isBid: pendingOrder.txAction === 'Buy',
                        poolIdx: poolIndex,
                        base: pendingOrder.txDetails.baseAddress,
                        quote: pendingOrder.txDetails.quoteAddress,
                        user: pendingOrder.userAddress,
                        concLiq: liqNum,
                        rewardLiq: 0,
                        claimableLiq: 0,
                        crossTime: 0,
                        latestUpdateTime: Math.floor(Date.now() / 1000),
                    };

                    const limitOrderData = await getLimitOrderData(
                        mockServerOrder,
                        tokenList,
                        crocEnv,
                        provider,
                        chainId,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                        cachedEnsResolve,
                    );

                    const totalValueUSD = limitOrderData.totalValueUSD;

                    console.log('>>>> usdValue', usdValue);

                    const onChainOrder: LimitOrderIF = {
                        positionLiq: liqNum,
                        positionLiqBase: positionLiqBase,
                        positionLiqQuote: positionLiqQuote,
                        totalValueUSD:
                            usdValue + (totalValueUSD ? totalValueUSD : 0) ||
                            totalValueUSD
                                ? totalValueUSD
                                : 0,
                        base: pendingOrder.txDetails.baseAddress,
                        quote: pendingOrder.txDetails.quoteAddress,
                        baseDecimals:
                            pendingOrder.txDetails.baseTokenDecimals || 0,
                        quoteDecimals:
                            pendingOrder.txDetails.quoteTokenDecimals || 0,
                        baseSymbol: pendingOrder.txDetails.baseSymbol || '',
                        quoteSymbol: pendingOrder.txDetails.quoteSymbol || '',
                        baseName: limitOrderData.baseName,
                        quoteName: limitOrderData.quoteName,
                        poolIdx: limitOrderData.poolIdx,
                        bidTick: limitOrderData.bidTick,
                        user: limitOrderData.user,
                        askTick: limitOrderData.askTick,
                        isBid: limitOrderData.isBid,
                        timeFirstMint: limitOrderData.timeFirstMint,
                        latestUpdateTime: limitOrderData.latestUpdateTime,
                        concLiq: limitOrderData.concLiq,
                        rewardLiq: limitOrderData.rewardLiq,
                        id: limitOrderData.id,

                        limitOrderId: limitOrderData.limitOrderId,
                        positionHash: limitOrderData.positionHash,
                        pivotTime: limitOrderData.pivotTime,
                        crossTime: limitOrderData.crossTime,
                        curentPoolPriceDisplayNum:
                            limitOrderData.curentPoolPriceDisplayNum,
                        askTickInvPriceDecimalCorrected:
                            limitOrderData.askTickInvPriceDecimalCorrected,
                        askTickPriceDecimalCorrected:
                            limitOrderData.askTickPriceDecimalCorrected,
                        bidTickInvPriceDecimalCorrected:
                            limitOrderData.bidTickInvPriceDecimalCorrected,
                        bidTickPriceDecimalCorrected:
                            limitOrderData.bidTickPriceDecimalCorrected,
                        originalPositionLiqBase:
                            limitOrderData.originalPositionLiqBase,
                        originalPositionLiqQuote:
                            limitOrderData.originalPositionLiqQuote,
                        expectedPositionLiqBase:
                            limitOrderData.expectedPositionLiqBase,
                        expectedPositionLiqQuote:
                            limitOrderData.expectedPositionLiqQuote,
                        positionLiqBaseDecimalCorrected:
                            limitOrderData.positionLiqBaseDecimalCorrected,
                        positionLiqQuoteDecimalCorrected:
                            limitOrderData.positionLiqQuoteDecimalCorrected,
                        originalPositionLiqBaseDecimalCorrected:
                            limitOrderData.originalPositionLiqBaseDecimalCorrected,
                        originalPositionLiqQuoteDecimalCorrected:
                            limitOrderData.originalPositionLiqQuoteDecimalCorrected,
                        expectedPositionLiqBaseDecimalCorrected:
                            limitOrderData.expectedPositionLiqBaseDecimalCorrected,
                        expectedPositionLiqQuoteDecimalCorrected:
                            limitOrderData.expectedPositionLiqQuoteDecimalCorrected,
                        claimableLiq: limitOrderData.claimableLiq,
                        claimableLiqPivotTimes:
                            limitOrderData.claimableLiqPivotTimes,
                        claimableLiqBase: limitOrderData.claimableLiqBase,
                        claimableLiqQuote: limitOrderData.claimableLiqQuote,
                        claimableLiqBaseDecimalCorrected:
                            limitOrderData.claimableLiqBaseDecimalCorrected,
                        claimableLiqQuoteDecimalCorrected:
                            limitOrderData.claimableLiqQuoteDecimalCorrected,
                        baseTokenLogoURI: limitOrderData.baseTokenLogoURI,
                        quoteTokenLogoURI: limitOrderData.quoteTokenLogoURI,
                        limitPrice: limitOrderData.limitPrice,
                        invLimitPrice: limitOrderData.invLimitPrice,
                        limitPriceDecimalCorrected:
                            limitOrderData.limitPriceDecimalCorrected,
                        invLimitPriceDecimalCorrected:
                            limitOrderData.invLimitPriceDecimalCorrected,
                        baseUsdPrice: limitOrderData.baseUsdPrice,
                        quoteUsdPrice: limitOrderData.quoteUsdPrice,
                        isBaseTokenMoneynessGreaterOrEqual:
                            limitOrderData.isBaseTokenMoneynessGreaterOrEqual,
                        ensResolution: limitOrderData.ensResolution,
                        chainId: limitOrderData.chainId,
                    };

                    addRecentlyUpdatedOrder(
                        pendingOrder.txType || '',
                        pendingOrder.txAction || '',
                        onChainOrder,
                        Date.now(),
                    );

                    return onChainOrder;
                }),
            );

            // setUnindexedUpdatedOrders([...updatedOrders]);
        })();
    }, [JSON.stringify(relevantTransactionsByType), lastBlockNumber]);

    const pendingPositionsToDisplayPlaceholder = useMemo(() => {
        return relevantTransactionsByType.filter((pos) => {
            const pendingPosHash = getPositionHash(undefined, {
                isPositionTypeAmbient: false,
                user: pos.userAddress,
                baseAddress: pos.txDetails?.baseAddress || '',
                quoteAddress: pos.txDetails?.quoteAddress || '',
                poolIdx: pos.txDetails?.poolIdx || 0,
                bidTick: pos.txDetails?.lowTick || 0,
                askTick: pos.txDetails?.highTick || 0,
            });

            const matchingPosition = listOfRecentlyUpdatedOrders.find(
                (recentlyUpdatedOrder) => {
                    return pendingPosHash === recentlyUpdatedOrder.positionHash;
                },
            );
            return !matchingPosition;
        });
    }, [relevantTransactionsByType, listOfRecentlyUpdatedOrders]);

    const shouldDisplayNoTableData =
        !isLoading &&
        !limitOrderData.length &&
        relevantTransactionsByType.length === 0;

    const [
        sortBy,
        setSortBy,
        reverseSort,
        setReverseSort,
        sortedLimits,
        sortData,
    ] = useSortedLimits('time', limitOrderData);

    // infinite scroll ------------------------------------------------------------------------------------------------------------------------------

    const sortedLimitDataToDisplay = useMemo<LimitOrderIF[]>(() => {
        // merge with recently updated data
        const updatedHashes = new Set();
        const recentlyUpdatedToShow: LimitOrderIF[] = [];

        listOfRecentlyUpdatedOrders.forEach((e) => {
            const isFresh =
                Math.floor(e.timestamp / 1000) - Math.floor(Date.now() / 1000) <
                60;
            // if(e.action !== 'Remove' && e.timestamp < Date.now() / 1000 - 60) {
            if (isFresh) {
                if (e.action !== 'Remove') {
                    recentlyUpdatedToShow.push(e.order);
                }
                updatedHashes.add(e.positionHash);
            }
        });

        const mergedList: LimitOrderIF[] = [
            ...recentlyUpdatedToShow.reverse(),
            ...sortedLimits.filter((e) => !updatedHashes.has(e.positionHash)),
        ];

        // ----------------------------
        return isAccountView
            ? mergedList
            : mergedList.slice(
                  getIndexForPages(true),
                  getIndexForPages(false, recentlyUpdatedToShow.length),
              );
    }, [
        sortedLimits,
        pagesVisible,
        isAccountView,
        listOfRecentlyUpdatedOrders,
    ]);

    // -----------------------------------------------------------------------------------------------------------------------------

    // TODO: Use these as media width constants
    const isSmallScreen = useMediaQuery('(max-width: 768px)');
    const isTabletScreen = useMediaQuery(
        '(min-width: 768px) and (max-width: 1200px)',
    );
    const isLargeScreen = useMediaQuery('(min-width: 1600px)');

    const tableView =
        isSmallScreen ||
        isTabletScreen ||
        (isAccountView && !isLargeScreen && isSidebarOpen)
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
                id='current_row_scroll'
                // style={{ height: '100%' }}
                style={
                    isSmallScreen
                        ? isAccountView
                            ? {
                                  maxHeight: 'calc(100svh - 310px)',
                                  overflowY: 'auto',
                              }
                            : {
                                  height: 'calc(100svh - 300px)',
                                  overflowY: 'auto',
                              }
                        : undefined
                }
            >
                {!isAccountView &&
                    pendingPositionsToDisplayPlaceholder.length > 0 &&
                    pendingPositionsToDisplayPlaceholder
                        .reverse()
                        .map((tx, idx) => (
                            <OrderRowPlaceholder
                                key={idx}
                                transaction={{
                                    hash: tx.txHash,
                                    baseSymbol:
                                        tx.txDetails?.baseSymbol ?? '...',
                                    quoteSymbol:
                                        tx.txDetails?.quoteSymbol ?? '...',
                                    side: tx.txAction,
                                    type: tx.txType,
                                    details: tx.txDetails,
                                }}
                                tableView={tableView}
                            />
                        ))}
                {showInfiniteScroll ? (
                    <TableRowsInfiniteScroll
                        type='Order'
                        // data={unindexedUpdatedOrders.concat(
                        //     sortedLimitDataToDisplay,
                        // )}
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
                ) : (
                    <TableRows
                        type='Order'
                        data={sortedLimits}
                        fullData={sortedLimits}
                        tableView={tableView}
                        isAccountView={isAccountView}
                    />
                )}
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
            style={{
                height: isSmallScreen ? '95%' : '100%',
                position: 'relative',
            }}
        >
            {/* <DebugDiv 
            title='unindexed orders'
            left={100}
            top={100}
                >
            {
                unindexedUpdatedOrders.map((tx, idx) => (                 
                    <div key={`unindexed-${idx}`} style={{display: 'block', background: 'var(--dark3)'}}>{tx.positionHash.substring(0,6)} {tx.totalValueUSD}</div>
                ))
            }
            </DebugDiv>

            <DebugDiv title='updated hashes'
            left={500}
            top={100}
            >
                {
                    unindexedUpdatedOrderHashes.map((tx, idx) => (                 
                        <div key={`updated-${idx}`}> {tx.substring(0,6)}</div>
                    ))
                }
            </DebugDiv>

            <DebugDiv title= 'recently updated positions'
            left={700}
            top={100}
            >
                {
                    listOfRecentlyUpdatedOrders.map((tx, idx) => (                 
                        <div key={`updated-${idx}`}> {tx.type} {tx.action} {tx.order.positionHash.substring(0,6)} {tx.order.totalValueUSD} </div>
                    ))
                }
            </DebugDiv> */}
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
