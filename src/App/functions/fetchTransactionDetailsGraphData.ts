import { ChainSpec } from '@crocswap-libs/sdk';
import { IS_LOCAL_ENV } from '../../constants';
import { memoizeTransactionGraphFn } from './memoizePromiseFn';

const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';
/**

Fetches transaction graph data for the given token pair and period from a cache endpoint.
@param isFetchEnabled - A boolean indicating whether to fetch the transaction graph data or not.
@param mainnetBaseTokenAddress - The address of the base token on the Ethereum mainnet.
@param mainnetQuoteTokenAddress - The address of the quote token on the Ethereum mainnet.
@param chainData - An object containing data about the chain (chainId, poolIndex, etc.).
@param period - The duration of each candlestick in seconds.
@param baseTokenAddress - The address of the base token on the chain.
@param quoteTokenAddress - The address of the quote token on the chain.
@param time - An optional parameter that represents the end time of the graph. If not specified, it will default to the current time.
@param candleNeeded - The number of candles needed.
@returns A Promise that resolves to an object containing the duration of each candlestick in seconds and an array of candlestick data, or undefined if the request fails.
*/
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
    // Fetch the data only if the fetchEnabled flag is true

    if (isFetchEnabled) {
        try {
            // Construct the endpoint URL for the transaction graph cache

            if (httpGraphCacheServerDomain) {
                const candleSeriesCacheEndpoint =
                    httpGraphCacheServerDomain + '/candle_series?';
                // Send a request to the cache endpoint

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
