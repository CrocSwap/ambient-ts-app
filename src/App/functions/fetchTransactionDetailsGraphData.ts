import { ChainSpec } from '@crocswap-libs/sdk';
import { GRAPHCACHE_URL, IS_LOCAL_ENV } from '../../constants';
import { memoizeTransactionGraphFn } from './memoizePromiseFn';

const httpGraphCacheServerDomain = GRAPHCACHE_URL;

export const fetchTransactionGraphData = async (
    isFetchEnabled: boolean,
    mainnetBaseTokenAddress: string,
    mainnetQuoteTokenAddress: string,
    chainData: ChainSpec,
    period: number,
    baseTokenAddress: string,
    quoteTokenAddress: string,
    time: string,
    candleNeeded: string,
) => {
    IS_LOCAL_ENV && console.debug('fetching transaction details graph data ');

    if (isFetchEnabled) {
        try {
            if (httpGraphCacheServerDomain) {
                const candleSeriesCacheEndpoint =
                    httpGraphCacheServerDomain + '/candle_series?';

                return fetch(
                    candleSeriesCacheEndpoint +
                        new URLSearchParams({
                            base: mainnetBaseTokenAddress.toLowerCase(),
                            quote: mainnetQuoteTokenAddress.toLowerCase(),
                            poolIdx: chainData.poolIndex.toString(),
                            period: period.toString(),
                            time: time, // optional
                            n: candleNeeded, // positive integer
                            chainId: '0x1',
                            dex: 'all',
                            poolStats: 'true',
                            concise: 'true',
                            poolStatsChainIdOverride: chainData.chainId,
                            poolStatsBaseOverride:
                                baseTokenAddress.toLowerCase(),
                            poolStatsQuoteOverride:
                                quoteTokenAddress.toLowerCase(),
                            poolStatsPoolIdxOverride:
                                chainData.poolIndex.toString(),
                        }),
                )
                    .then((response) => response?.json())
                    .then((json) => {
                        const candles = json?.data;
                        if (candles) {
                            return {
                                duration: period,
                                candles: candles,
                            };
                        }
                    })
                    .catch(console.error);
            }
        } catch (error) {
            console.error({ error });
        }
    }
};

export type TransactionGraphDataFn = (
    isFetchEnabled: boolean,
    mainnetBaseTokenAddress: string,
    mainnetQuoteTokenAddress: string,
    chainData: ChainSpec,
    period: number,
    baseTokenAddress: string,
    quoteTokenAddress: string,
    time: string,
    candleNeeded: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

export function memoizeFetchTransactionGraphData(): TransactionGraphDataFn {
    return memoizeTransactionGraphFn(
        fetchTransactionGraphData,
    ) as TransactionGraphDataFn;
}
