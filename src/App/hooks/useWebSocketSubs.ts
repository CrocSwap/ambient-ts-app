import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';
import { OVERRIDE_CANDLE_POOL_ID } from '../../constants';
import { mktDataChainId } from '../../utils/data/chains';
import { diffHashSig } from '../../utils/functions/diffHashSig';
import isJsonString from '../../utils/functions/isJsonString';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import {
    CandleData,
    CandlesByPoolAndDuration,
} from '../../utils/state/graphDataSlice';

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
    const candleSubscriptionEndpoint = useMemo(
        () =>
            props.wssGraphCacheServerDomain +
            '/subscribe_candles?' +
            new URLSearchParams({
                base: props.mainnetBaseTokenAddress.toLowerCase(),
                quote: props.mainnetQuoteTokenAddress.toLowerCase(),
                poolIdx: (
                    OVERRIDE_CANDLE_POOL_ID || props.chainData.poolIndex
                ).toString(),
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
