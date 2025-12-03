import {
    AllPoolStatsServerParamsIF,
    CandleDataServerIF,
    TransactionServerIF,
    PositionServerIF,
    LimitOrderServerIF,
    PoolStatsServerIF,
    PoolStatsServerParamsIF,
    ChainStatsServerIF,
    ChainStatsServerParamsIF,
    LimitOrderStatsServerParamsIF,
    LiquidityCurveServerIF,
    LiquidityCurveServerParamsIF,
    ListableQueryParamsIF,
    PoolCandleParamsServerIF,
    PoolLimitOrdersServerParamsIF,
    PoolPositionServerParamsIF,
    PoolTransactionsServerParamsIF,
    PositionStatsServerParamsIF,
    UserBalanceTokensServerIF,
    UserBalanceTokensServerParamsIF,
    UserLimitOrdersServerParamsIF,
    UserPoolLimitOrdersServerParamsIF,
    UserPoolPositionServerParamsIF,
    UserPoolTransactionsServerParamsIF,
    UserPositionServerParamsIF,
    UserTransactionServerParamsIF,
} from '../ambient-utils/types';

type CachedResponse = {
    response: any;
    cachedAt: Date;
};

export class GcgoProvider {
    gcgoUrls: string[];
    network: number;
    cachedCalls: Map<string, CachedResponse>;
    cacheOptions: {
        // All responses are cached for this long
        generalCacheMsec: number;
        // If an error occurs, we can serve a stale response for this long
        staleIfErrorCacheMsec: number;
    };
    goodGcgoIndex: number;
    lastGcgoReset: number;
    // Timeout before trying the next GCGO URL
    gcgoSingleTimeoutMsec: number;
    // Timeout before giving up
    gcgoFullTimeoutMsec: number;
    constructor(urls: string[], network: number) {
        this.gcgoUrls = urls.map((u) => u.replace(/\/+$/, '')); // remove traling slash
        this.network = network;

        this.cachedCalls = new Map();
        this.cacheOptions = {
            generalCacheMsec: 1000,
            staleIfErrorCacheMsec: 120_000,
        };

        this.goodGcgoIndex = 0;
        this.lastGcgoReset = Date.now();
        this.gcgoSingleTimeoutMsec = 5000;
        this.gcgoFullTimeoutMsec = 30_000;
    }

    async allPoolStats(
        params: AllPoolStatsServerParamsIF,
    ): Promise<PoolStatsServerIF[]> {
        const endpoint = '/all_pool_stats?';
        let urlParams: any = {
            chainId: params.chainId.toLowerCase(),
        };
        if (params.histTime !== undefined)
            urlParams.histTime = params.histTime.toString();
        if (params.with24hPrices) urlParams.with24hPrices = 'true';

        const query = endpoint + new URLSearchParams(urlParams);
        return (await this.fetch(query)) as PoolStatsServerIF[];
    }

    async poolStats(
        params: PoolStatsServerParamsIF,
    ): Promise<PoolStatsServerIF> {
        const endpoint = '/pool_stats?';
        let urlParams: any = {
            chainId: params.chainId.toLowerCase(),
            base: params.base.toLowerCase(),
            quote: params.quote.toLowerCase(),
            poolIdx: params.poolIdx.toString(),
        };
        if (params.histTime !== undefined)
            urlParams.histTime = params.histTime.toString();

        const query = endpoint + new URLSearchParams(urlParams);
        return (await this.fetch(query)) as PoolStatsServerIF;
    }

    async chainStats(
        params: ChainStatsServerParamsIF,
    ): Promise<ChainStatsServerIF[]> {
        const endpoint = '/chain_stats?';
        let urlParams: any = {
            chainId: params.chainId.toLowerCase(),
            n: params.tokenCount.toString(),
        };
        const query = endpoint + new URLSearchParams(urlParams);
        return (await this.fetch(query)) as ChainStatsServerIF[];
    }

    async userTxs(
        params: UserTransactionServerParamsIF,
    ): Promise<TransactionServerIF[]> {
        return await this.listableQuery('/user_txs?', params);
    }

    async userPositions(
        params: UserPositionServerParamsIF,
    ): Promise<PositionServerIF[]> {
        return await this.listableQuery('/user_positions?', params);
    }

    async userLimitOrders(
        params: UserLimitOrdersServerParamsIF,
    ): Promise<LimitOrderServerIF[]> {
        return await this.listableQuery('/user_limit_orders?', params);
    }

    async userPoolTxs(
        params: UserPoolTransactionsServerParamsIF,
    ): Promise<TransactionServerIF[]> {
        return await this.listableQuery('/user_pool_txs?', params);
    }

    async userPoolPositions(
        params: UserPoolPositionServerParamsIF,
    ): Promise<PositionServerIF[]> {
        return await this.listableQuery('/user_pool_positions?', params);
    }

    async userPoolLimitOrders(
        params: UserPoolLimitOrdersServerParamsIF,
    ): Promise<LimitOrderServerIF[]> {
        return await this.listableQuery('/user_pool_limit_orders?', params);
    }

    async poolTxs(
        params: PoolTransactionsServerParamsIF,
    ): Promise<TransactionServerIF[]> {
        return await this.listableQuery('/pool_txs?', params);
    }

    async poolPositions(
        params: PoolPositionServerParamsIF,
    ): Promise<PositionServerIF[]> {
        return await this.listableQuery('/pool_positions?', params);
    }

    async poolLimitOrders(
        params: PoolLimitOrdersServerParamsIF,
    ): Promise<LimitOrderServerIF[]> {
        return await this.listableQuery('/pool_limit_orders?', params);
    }

    async listableQuery(
        endpoint: string,
        params: ListableQueryParamsIF,
    ): Promise<any[]> {
        let urlParams: any = {
            chainId: params.chainId.toLowerCase(),
            n: params.count.toString(),
        };
        if ('base' in params && 'quote' in params && 'poolIdx' in params) {
            urlParams.base = params.base.toLowerCase();
            urlParams.quote = params.quote.toLowerCase();
            urlParams.poolIdx = params.poolIdx.toString();
        }
        if ('user' in params) urlParams.user = params.user.toLowerCase();
        if (params.time !== undefined) urlParams.time = params.time.toString();
        if (params.timeBefore !== undefined)
            urlParams.timeBefore = params.timeBefore.toString();
        if (params.period !== undefined)
            urlParams.period = params.period.toString();

        const query = endpoint + new URLSearchParams(urlParams);
        return await this.fetch(query);
    }

    async userBalanceTokens(
        params: UserBalanceTokensServerParamsIF,
    ): Promise<UserBalanceTokensServerIF> {
        const endpoint = '/user_balance_tokens?';
        let urlParams: any = {
            user: params.user.toLowerCase(),
            chainId: params.chainId.toLowerCase(),
        };

        const query = endpoint + new URLSearchParams(urlParams);
        return await this.fetch(query);
    }

    async poolLiqCurve(
        params: LiquidityCurveServerParamsIF,
    ): Promise<LiquidityCurveServerIF> {
        const endpoint = '/pool_liq_curve?';
        let urlParams: any = {
            chainId: params.chainId.toLowerCase(),
            base: params.base.toLowerCase(),
            quote: params.quote.toLowerCase(),
            poolIdx: params.poolIdx.toString(),
        };

        const query = endpoint + new URLSearchParams(urlParams);
        return await this.fetch(query);
    }

    async poolCandles(
        params: PoolCandleParamsServerIF,
    ): Promise<CandleDataServerIF[]> {
        const endpoint = '/pool_candles?';
        let urlParams: any = {
            chainId: params.chainId.toLowerCase(),
            base: params.base.toLowerCase(),
            quote: params.quote.toLowerCase(),
            poolIdx: params.poolIdx.toString(),
            period: params.period.toString(),
            n: params.n.toString(),
            time: params.time.toString(),
        };

        const query = endpoint + new URLSearchParams(urlParams);
        return await this.fetch(query);
    }

    async positionStats(
        params: PositionStatsServerParamsIF,
    ): Promise<PositionServerIF> {
        const endpoint = '/position_stats?';
        let urlParams: any = {
            chainId: params.chainId.toLowerCase(),
            base: params.base.toLowerCase(),
            quote: params.quote.toLowerCase(),
            poolIdx: params.poolIdx.toString(),
            user: params.user.toLowerCase(),
            bidTick: params.bidTick.toString(),
            askTick: params.askTick.toString(),
        };

        const query = endpoint + new URLSearchParams(urlParams);
        return await this.fetch(query);
    }

    async limitStats(
        params: LimitOrderStatsServerParamsIF,
    ): Promise<LimitOrderServerIF> {
        const endpoint = '/limit_stats?';
        let urlParams: any = {
            chainId: params.chainId.toLowerCase(),
            base: params.base.toLowerCase(),
            quote: params.quote.toLowerCase(),
            poolIdx: params.poolIdx.toString(),
            user: params.user.toLowerCase(),
            bidTick: params.bidTick.toString(),
            askTick: params.askTick.toString(),
            isBid: params.isBid ? 'true' : 'false',
            pivotTime: params.pivotTime.toString(),
        };

        const query = endpoint + new URLSearchParams(urlParams);
        return await this.fetch(query);
    }

    async fetch(query: string): Promise<any> {
        const start = Date.now();
        const cachedResponse = this.getFromCache(
            query,
            this.cacheOptions.generalCacheMsec,
        );
        if (cachedResponse !== undefined) return cachedResponse;

        // Periodically reset the GCGO URL to the highest priority one
        if (Date.now() - this.lastGcgoReset >= 30_000) {
            this.lastGcgoReset = Date.now();
            this.goodGcgoIndex = 0;
        }

        let gcgoIndex = this.goodGcgoIndex;
        const abortControllers: AbortController[] = [];
        const activeRequests: Promise<{ response: any; index: number }>[] = [];

        const cleanup = () => {
            abortControllers.forEach((controller) => controller.abort());
        };

        const makeRequest = (
            index: number,
        ): Promise<{ response: any; index: number }> => {
            const controller = new AbortController();
            abortControllers.push(controller);

            return (async () => {
                try {
                    const response = await this.sendFetch(
                        this.gcgoUrls[index],
                        query,
                        controller.signal,
                    );
                    if (response === undefined) {
                        throw new Error('No data in GCGO GET response');
                    }
                    return { response, index };
                } catch (e) {
                    if (!e.message.includes('operation was aborted'))
                        console.warn('Error in gcgo.fetch:', index, e);
                    throw e;
                }
            })();
        };

        // Start with the first request
        let nextUpstreamIndex = 0;
        activeRequests.push(
            makeRequest((gcgoIndex + nextUpstreamIndex) % this.gcgoUrls.length),
        );
        nextUpstreamIndex++;

        while (true) {
            try {
                // Wait for either the first successful response or for an error/timeout to send more requests
                const result = await Promise.race([
                    Promise.any(activeRequests),
                    new Promise<never>((_, reject) =>
                        setTimeout(
                            () => reject(new Error('gcgo.sendFetch Timeout')),
                            this.gcgoSingleTimeoutMsec,
                        ),
                    ),
                ]);

                cleanup();
                this.goodGcgoIndex = result.index;
                this.saveInCache(query, result.response);
                return result.response;
            } catch (e) {
                // If we still have upstreams left, send another request to the next one
                if (nextUpstreamIndex < this.gcgoUrls.length) {
                    activeRequests.push(
                        makeRequest(
                            (gcgoIndex + nextUpstreamIndex) %
                                this.gcgoUrls.length,
                        ),
                    );
                    nextUpstreamIndex++;
                } else {
                    if (
                        e.message === 'gcgo.sendFetch Timeout' &&
                        Date.now() - start < this.gcgoFullTimeoutMsec
                    ) {
                        // If we have not reached the full timeout, continue waiting
                        continue;
                    }
                    cleanup();
                    const staleResponse = this.getFromCache(
                        query,
                        this.cacheOptions.staleIfErrorCacheMsec,
                    );
                    if (staleResponse) {
                        console.warn('Serving stale response for:', query);
                        return staleResponse;
                    }
                    throw e;
                }
            }
        }
    }

    async sendFetch(
        url: string,
        query: string,
        signal: AbortSignal,
    ): Promise<any> {
        query = query.replace(/^\//, ''); // remove beginning slash
        const response = await fetch(url + '/' + query, {
            method: 'GET',
            signal: signal,
        });
        if (!response.ok)
            throw new Error(
                `GCGO HTTP error! status: ${response.status} ${response.statusText}`,
            );
        const data = await response.json();
        if (data.data === undefined)
            throw new Error(`No data in GCGO GET response: ${data}`);
        return data.data;
    }

    getFromCache(query: string, ttlMsec: number): any | undefined {
        const cacheKey = JSON.stringify({ query });
        const cachedResponse = this.cachedCalls.get(cacheKey);
        if (
            cachedResponse !== undefined &&
            cachedResponse.cachedAt > new Date(Date.now() - ttlMsec)
        ) {
            return cachedResponse.response;
        }
        return undefined;
    }

    saveInCache(query: string, response: any): void {
        const cacheKey = JSON.stringify({ query });
        this.cachedCalls.set(cacheKey, {
            response,
            cachedAt: new Date(Date.now()),
        });
    }
}
