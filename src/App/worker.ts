// Worker that executes slow requests
import { ChainSpec } from '@crocswap-libs/sdk';
import { TokenIF } from '../utils/interfaces/TokenIF';
import {
    TvlSeriesByPoolTimeAndResolution,
    VolumeSeriesByPoolTimeAndResolution,
} from '../utils/state/graphDataSlice';
import { fetchPoolRecentChanges } from './functions/fetchPoolRecentChanges';
import { getLiquidityFee } from './functions/getLiquidityFee';
import { getTvlSeries } from './functions/getTvlSeries';
import { getVolumeSeries } from './functions/getVolumeSeries';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = self as any;

export interface messageSendIF {
    type: 'tables';
    sortedTokens: [string, string];
    chainData: ChainSpec;
    httpGraphCacheServerDomain: string;
    searchableTokens: TokenIF[];
}

export interface messageReceiveIF {
    type: 'tables';
    liquidityFeeNum: number | undefined;
    tvlSeries: TvlSeriesByPoolTimeAndResolution | undefined;
    volumeSeries: VolumeSeriesByPoolTimeAndResolution | undefined;
}

export interface PoolPositionsIF {
    type: 'positions';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    poolPositions: any;
}

export interface LeaderBoardIF {
    type: 'leaderboard';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    leaderboardPositions: any;
}

export interface LimitOrderIF {
    type: 'limits';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    poolLimitOrderStates: any;
}

ctx.addEventListener('message', (event: MessageEvent) => {
    if (event.data.type === 'tables') {
        const {
            sortedTokens,
            chainData,
            httpGraphCacheServerDomain,
            searchableTokens,
        } = event.data;

        const allPositionsCacheEndpoint =
            httpGraphCacheServerDomain + '/pool_positions?';
        const poolPositionsCacheEndpoint =
            httpGraphCacheServerDomain + '/annotated_pool_positions?';
        const poolLimitOrderStatesCacheEndpoint =
            httpGraphCacheServerDomain + '/pool_limit_order_states?';

        Promise.all([
            getLiquidityFee(
                sortedTokens[0],
                sortedTokens[1],
                chainData.poolIndex,
                chainData.chainId,
            ),
            getTvlSeries(
                sortedTokens[0],
                sortedTokens[1],
                chainData.poolIndex,
                chainData.chainId,
                600, // 10 minute resolution
            ),
            getVolumeSeries(
                sortedTokens[0],
                sortedTokens[1],
                chainData.poolIndex,
                chainData.chainId,
                600, // 10 minute resolution
            ),
            fetchPoolRecentChanges({
                tokenList: searchableTokens,
                base: sortedTokens[0],
                quote: sortedTokens[1],
                poolIdx: chainData.poolIndex,
                chainId: chainData.chainId,
                annotate: true,
                addValue: true,
                simpleCalc: true,
                annotateMEV: false,
                ensResolution: true,
                n: 100,
            }),
            fetch(
                allPositionsCacheEndpoint +
                    new URLSearchParams({
                        base: sortedTokens[0].toLowerCase(),
                        quote: sortedTokens[1].toLowerCase(),
                        poolIdx: chainData.poolIndex.toString(),
                        chainId: chainData.chainId,
                        annotate: 'true',
                        ensResolution: 'true',
                        omitEmpty: 'true',
                        omitKnockout: 'true',
                        addValue: 'true',
                    }),
            )
                .then((response) => response.json())
                .then((json) => {
                    const poolPositions = json.data;
                    ctx.postMessage({
                        type: 'positions',
                        poolPositions: poolPositions,
                    } as PoolPositionsIF);
                })
                .catch(console.error),

            fetch(
                poolPositionsCacheEndpoint +
                    new URLSearchParams({
                        base: sortedTokens[0].toLowerCase(),
                        quote: sortedTokens[1].toLowerCase(),
                        poolIdx: chainData.poolIndex.toString(),
                        chainId: chainData.chainId,
                        ensResolution: 'true',
                        omitEmpty: 'true',
                        omitKnockout: 'true',
                        addValue: 'true',
                        sortByAPY: 'true',
                        n: '50',
                        minPosAge: '86400', // restrict leaderboard to position > 1 day old
                    }),
            )
                .then((response) => response.json())
                .then((json) => {
                    const leaderboardPositions = json.data;
                    ctx.postMessage({
                        type: 'leaderboard',
                        leaderboardPositions: leaderboardPositions,
                    } as LeaderBoardIF);
                })
                .catch(console.error),

            fetch(
                poolLimitOrderStatesCacheEndpoint +
                    new URLSearchParams({
                        base: sortedTokens[0].toLowerCase(),
                        quote: sortedTokens[1].toLowerCase(),
                        poolIdx: chainData.poolIndex.toString(),
                        chainId: chainData.chainId,
                        ensResolution: 'true',
                        omitEmpty: 'true',
                    }),
            )
                .then((response) => response.json())
                .then((json) => {
                    const poolLimitOrderStates = json.data;
                    ctx.postMessage({
                        type: 'limits',
                        poolLimitOrderStates: poolLimitOrderStates,
                    } as LimitOrderIF);
                })
                .catch(console.error),
        ])
            .then((result) => {
                ctx.postMessage({
                    type: 'tables',
                    liquidityFeeNum: result[0],
                    tvlSeries: result[1],
                    volumeSeries: result[2],
                    recentChanges: result[3],
                });
            })
            .catch(console.error);
    } else if (event.data.type === 'candles') {
        const {
            chainData,
            httpGraphCacheServerDomain,
            mainnetBaseTokenAddress,
            mainnetQuoteTokenAddress,
            candleTimeLocal,
            baseTokenAddress,
            quoteTokenAddress,
            candleData,
        } = event.data;

        const candleSeriesCacheEndpoint =
            httpGraphCacheServerDomain + '/candle_series?';

        fetch(
            candleSeriesCacheEndpoint +
                new URLSearchParams({
                    base: mainnetBaseTokenAddress.toLowerCase(),
                    quote: mainnetQuoteTokenAddress.toLowerCase(),
                    poolIdx: chainData.poolIndex.toString(),
                    period: candleTimeLocal.toString(),
                    // time: '1657833300', // optional
                    n: '200', // positive integer
                    // page: '0', // nonnegative integer
                    chainId: '0x1',
                    dex: 'all',
                    poolStats: 'true',
                    concise: 'true',
                    poolStatsChainIdOverride: '0x5',
                    poolStatsBaseOverride: baseTokenAddress.toLowerCase(),
                    poolStatsQuoteOverride: quoteTokenAddress.toLowerCase(),
                    poolStatsPoolIdxOverride: chainData.poolIndex.toString(),
                }),
        )
            .then((response) => response?.json())
            .then((json) => {
                const candles = json?.data;
                if (candles?.length === 0) {
                    ctx.postMessage({
                        type: 'candles',
                        candleData: null,
                    });
                } else if (
                    JSON.stringify(candleData) !== JSON.stringify(candles)
                ) {
                    ctx.postMessage({
                        type: 'candles',
                        candleData: {
                            pool: {
                                baseAddress: baseTokenAddress.toLowerCase(),
                                quoteAddress: quoteTokenAddress.toLowerCase(),
                                poolIdx: chainData.poolIndex,
                                network: chainData.chainId,
                            },
                            duration: candleTimeLocal,
                            candles: candles,
                        },
                    });
                }
            })
            .catch(console.error);
    }
});
