import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';
import { mktDataChainId } from '../../utils/data/chains';
import { diffHashSig } from '../../utils/functions/diffHashSig';
import isJsonString from '../../utils/functions/isJsonString';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { LimitOrderIF } from '../../utils/interfaces/LimitOrderIF';
import { PositionIF } from '../../utils/interfaces/PositionIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { TransactionIF } from '../../utils/interfaces/TransactionIF';
import {
    addChangesByPool,
    addChangesByUser,
    addLimitOrderChangesByPool,
    addLimitOrderChangesByUser,
    addPositionsByPool,
    addPositionsByUser,
    CandleData,
    CandlesByPoolAndDuration,
} from '../../utils/state/graphDataSlice';
import { getLimitOrderData } from '../functions/getLimitOrderData';
import { getPositionData } from '../functions/getPositionData';
import { getTransactionData } from '../functions/getTransactionData';

export interface WebSockerPropsIF {
    crocEnv?: CrocEnv;
    wssGraphCacheServerDomain: string;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    mainnetBaseTokenAddress: string; // Mainnet equivalent addresses to pull chandle data
    mainnetQuoteTokenAddress: string;
    isServerEnabled: boolean;
    shouldNonCandleSubscriptionsReconnect: boolean;
    areSubscriptionsEnabled: boolean;
    tokenUniv: TokenIF[];
    chainData: ChainSpec;
    lastBlockNumber: number;
    candleTimeLocal: number;
    userAddress: `0x${string}` | undefined;
    shouldCandleSubscriptionsReconnect: boolean;
    candleData?: CandlesByPoolAndDuration; // State for pool current chandle
    setCandleData: Dispatch<
        SetStateAction<CandlesByPoolAndDuration | undefined>
    >; // Should update the candleData state hook from above
}

/* Contains React hooks to manage ongoing websocket subscriptions from the backend. */
export default function useWebSocketSubs(props: WebSockerPropsIF) {
    const crocEnv = props.crocEnv;

    const dispatch = useAppDispatch();

    const poolLiqChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            props.wssGraphCacheServerDomain +
            '/subscribe_pool_liqchanges?' +
            new URLSearchParams({
                base: props.baseTokenAddress.toLowerCase(),
                quote: props.quoteTokenAddress.toLowerCase(),
                poolIdx: props.chainData.poolIndex.toString(),
                chainId: props.chainData.chainId,
                ensResolution: 'true',
                annotate: 'true',
                addCachedAPY: 'true',
                omitKnockout: 'true',
                addValue: 'true',
            }),
        [
            props.baseTokenAddress,
            props.quoteTokenAddress,
            props.chainData.chainId,
        ],
    );

    const {
        //  sendMessage,
        lastMessage: lastPoolLiqChangeMessage,
        //  readyState
    } = useWebSocket(
        poolLiqChangesCacheSubscriptionEndpoint,
        {
            // share:  true,
            // onOpen: () => console.debug('pool liqChange subscription opened'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // onClose: (event: any) => console.debug({ event }),
            // onClose: () => console.debug('allPositions websocket connection closed'),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => props.shouldNonCandleSubscriptionsReconnect,
        },
        // only connect if base/quote token addresses are available
        props.isServerEnabled &&
            props.areSubscriptionsEnabled &&
            props.baseTokenAddress !== '' &&
            props.quoteTokenAddress !== '',
    );

    /* Consumes pool liquidity changes from the backend. */
    useEffect(() => {
        if (lastPoolLiqChangeMessage !== null) {
            if (!isJsonString(lastPoolLiqChangeMessage.data)) return;
            const lastMessageData = JSON.parse(
                lastPoolLiqChangeMessage.data,
            ).data;
            if (lastMessageData && crocEnv) {
                Promise.all(
                    lastMessageData.map((position: PositionIF) => {
                        return getPositionData(
                            position,
                            props.tokenUniv,
                            crocEnv,
                            props.chainData.chainId,
                            props.lastBlockNumber,
                        );
                    }),
                ).then((updatedPositions) => {
                    dispatch(addPositionsByPool(updatedPositions));
                });
            }
        }
    }, [lastPoolLiqChangeMessage]);

    const poolRecentChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            props.wssGraphCacheServerDomain +
            '/subscribe_pool_recent_changes?' +
            new URLSearchParams({
                base: props.baseTokenAddress.toLowerCase(),
                quote: props.quoteTokenAddress.toLowerCase(),
                poolIdx: props.chainData.poolIndex.toString(),
                chainId: props.chainData.chainId,
                ensResolution: 'true',
                annotate: 'true',
                addValue: 'true',
            }),
        [
            props.baseTokenAddress,
            props.quoteTokenAddress,
            props.chainData.chainId,
            props.chainData.poolIndex,
        ],
    );

    // Consumes recent pool changes endpoint
    const { lastMessage: lastPoolChangeMessage } = useWebSocket(
        poolRecentChangesCacheSubscriptionEndpoint,
        {
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => true,
        },
        // only connect if base/quote token addresses are available
        props.isServerEnabled &&
            props.areSubscriptionsEnabled &&
            props.baseTokenAddress !== '' &&
            props.quoteTokenAddress !== '',
    );

    // On pool change message, pump the change into RTK slice
    useEffect(() => {
        if (lastPoolChangeMessage !== null) {
            if (!isJsonString(lastPoolChangeMessage.data)) return;
            const lastMessageData = JSON.parse(lastPoolChangeMessage.data).data;
            if (lastMessageData) {
                Promise.all(
                    lastMessageData.map((tx: TransactionIF) => {
                        return getTransactionData(tx, props.tokenUniv);
                    }),
                )
                    .then((updatedTransactions) => {
                        dispatch(addChangesByPool(updatedTransactions));
                    })
                    .catch(console.error);
            }
        }
    }, [lastPoolChangeMessage]);

    // On limit order change, pump the change into the RTK slice
    useEffect(() => {
        if (lastPoolChangeMessage !== null) {
            if (!isJsonString(lastPoolChangeMessage.data)) return;
            const lastMessageData = JSON.parse(lastPoolChangeMessage.data).data;
            if (lastMessageData) {
                Promise.all(
                    lastMessageData.map((limitOrder: LimitOrderIF) => {
                        return getLimitOrderData(limitOrder, props.tokenUniv);
                    }),
                ).then((updatedLimitOrderStates) => {
                    dispatch(
                        addLimitOrderChangesByPool(updatedLimitOrderStates),
                    );
                });
            }
        }
    }, [lastPoolChangeMessage]);

    const userLiqChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            props.wssGraphCacheServerDomain +
            '/subscribe_user_liqchanges?' +
            new URLSearchParams({
                user: props.userAddress || '',
                chainId: props.chainData.chainId,
                annotate: 'true',
                addCachedAPY: 'true',
                omitKnockout: 'true',
                ensResolution: 'true',
                addValue: 'true',
                // user: account || '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            }),
        [props.userAddress, props.chainData.chainId],
    );

    // Consumes from user liquidity change endpoint (i.e. range orders)
    const { lastMessage: lastUserPositionsMessage } = useWebSocket(
        userLiqChangesCacheSubscriptionEndpoint,
        {
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => props.shouldNonCandleSubscriptionsReconnect,
        },
        // only connect is account is available
        props.isServerEnabled &&
            props.areSubscriptionsEnabled &&
            props.userAddress !== null &&
            props.userAddress !== undefined,
    );

    // On new message pump the position/range order message into RTK slice
    useEffect(() => {
        try {
            if (lastUserPositionsMessage !== null) {
                if (!isJsonString(lastUserPositionsMessage.data)) return;

                const lastMessageData = JSON.parse(
                    lastUserPositionsMessage.data,
                ).data;

                if (lastMessageData && crocEnv) {
                    Promise.all(
                        lastMessageData.map((position: PositionIF) => {
                            return getPositionData(
                                position,
                                props.tokenUniv,
                                crocEnv,
                                props.chainData.chainId,
                                props.lastBlockNumber,
                            );
                        }),
                    ).then((updatedPositions) => {
                        dispatch(addPositionsByUser(updatedPositions));
                    });
                }
            }
        } catch (error) {
            console.error(error);
        }
    }, [lastUserPositionsMessage]);

    const userRecentChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            props.wssGraphCacheServerDomain +
            '/subscribe_user_recent_changes?' +
            new URLSearchParams({
                user: props.userAddress || '',
                chainId: props.chainData.chainId,
                addValue: 'true',
                annotate: 'true',
                ensResolution: 'true',
            }),
        [props.userAddress, props.chainData.chainId],
    );

    // Consumes recent changes (i.e. transactions)
    const { lastMessage: lastUserRecentChangesMessage } = useWebSocket(
        userRecentChangesCacheSubscriptionEndpoint,
        {
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => props.shouldNonCandleSubscriptionsReconnect,
        },
        // only connect is account is available
        props.isServerEnabled &&
            props.areSubscriptionsEnabled &&
            props.userAddress !== null &&
            props.userAddress !== undefined,
    );

    // On new message pump into RTK slice
    useEffect(() => {
        if (lastUserRecentChangesMessage !== null) {
            if (!isJsonString(lastUserRecentChangesMessage.data)) return;
            const lastMessageData = JSON.parse(
                lastUserRecentChangesMessage.data,
            ).data;

            if (lastMessageData) {
                Promise.all(
                    lastMessageData.map((tx: TransactionIF) => {
                        return getTransactionData(tx, props.tokenUniv);
                    }),
                )
                    .then((updatedTransactions) => {
                        dispatch(addChangesByUser(updatedTransactions));
                    })
                    .catch(console.error);
            }
        }
    }, [lastUserRecentChangesMessage]);

    const userLimitOrderChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            props.wssGraphCacheServerDomain +
            '/subscribe_user_limit_order_changes?' +
            new URLSearchParams({
                user: props.userAddress || '',
                chainId: props.chainData.chainId,
                addValue: 'true',
                ensResolution: 'true',
            }),
        [props.userAddress, props.chainData.chainId],
    );

    // Consume limit order updates for user
    const { lastMessage: lastUserLimitOrderChangesMessage } = useWebSocket(
        userLimitOrderChangesCacheSubscriptionEndpoint,
        {
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => props.shouldNonCandleSubscriptionsReconnect,
        },
        // only connect is account is available
        props.isServerEnabled &&
            props.areSubscriptionsEnabled &&
            props.userAddress !== null &&
            props.userAddress !== undefined,
    );

    useEffect(() => {
        if (lastUserLimitOrderChangesMessage !== null) {
            if (!isJsonString(lastUserLimitOrderChangesMessage.data)) return;
            const lastMessageData = JSON.parse(
                lastUserLimitOrderChangesMessage.data,
            ).data;

            if (lastMessageData) {
                Promise.all(
                    lastMessageData.map((limitOrder: LimitOrderIF) => {
                        return getLimitOrderData(limitOrder, props.tokenUniv);
                    }),
                ).then((updatedLimitOrderStates) => {
                    dispatch(
                        addLimitOrderChangesByUser(updatedLimitOrderStates),
                    );
                });
            }
        }
    }, [lastUserLimitOrderChangesMessage]);

    const candleSubscriptionEndpoint = useMemo(
        () =>
            props.wssGraphCacheServerDomain +
            '/subscribe_candles?' +
            new URLSearchParams({
                base: props.mainnetBaseTokenAddress.toLowerCase(),
                quote: props.mainnetQuoteTokenAddress.toLowerCase(),
                poolIdx: props.chainData.poolIndex.toString(),
                period: props.candleTimeLocal.toString(),
                chainId: mktDataChainId(props.chainData.chainId),
                dex: 'all',
                poolStats: 'true',
                concise: 'true',
                poolStatsChainIdOverride: props.chainData.chainId,
                poolStatsBaseOverride: props.baseTokenAddress.toLowerCase(),
                poolStatsQuoteOverride: props.quoteTokenAddress.toLowerCase(),
                poolStatsPoolIdxOverride: props.chainData.poolIndex.toString(),
            }),
        [
            props.mainnetBaseTokenAddress,
            props.mainnetQuoteTokenAddress,
            props.chainData.chainId,
            props.chainData.poolIndex,
            props.candleTimeLocal,
        ],
    );

    // Consume from new candle endpoint on the backend
    const { lastMessage: candlesMessage } = useWebSocket(
        candleSubscriptionEndpoint,
        {
            shouldReconnect: () => props.shouldCandleSubscriptionsReconnect,
        },
        // only connect if base/quote token addresses are available
        props.isServerEnabled &&
            props.areSubscriptionsEnabled &&
            props.mainnetBaseTokenAddress !== '' &&
            props.mainnetQuoteTokenAddress !== '',
    );

    // On a new candle update, push into the caller-supplied setCandleData hook
    useEffect(() => {
        if (candlesMessage) {
            if (!isJsonString(candlesMessage.data)) return;
            const lastMessageData = JSON.parse(candlesMessage.data).data;
            if (lastMessageData && props.candleData) {
                const newCandles: CandleData[] = [];
                const updatedCandles: CandleData[] = props.candleData.candles;

                for (let index = 0; index < lastMessageData.length; index++) {
                    const messageCandle = lastMessageData[index];
                    const indexOfExistingCandle =
                        props.candleData.candles.findIndex(
                            (savedCandle) =>
                                savedCandle.time === messageCandle.time,
                        );

                    if (indexOfExistingCandle === -1) {
                        newCandles.push(messageCandle);
                    } else if (
                        diffHashSig(
                            props.candleData.candles[indexOfExistingCandle],
                        ) !== diffHashSig(messageCandle)
                    ) {
                        updatedCandles[indexOfExistingCandle] = messageCandle;
                    }
                }
                const newCandleData: CandlesByPoolAndDuration = {
                    pool: props.candleData.pool,
                    duration: props.candleData.duration,
                    candles: newCandles.concat(updatedCandles),
                };
                props.setCandleData(newCandleData);
            }
        }
    }, [candlesMessage]);
}
