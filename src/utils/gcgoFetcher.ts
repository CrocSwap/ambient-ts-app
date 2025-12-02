type CachedResponse = {
    response: any;
    cachedAt: Date;
};

export class GcgoFetcher {
    urls: string[];
    network: number;
    cachedCalls: Map<string, CachedResponse>;
    cacheOptions: {
        generalCacheMsec: number;
        staleIfErrorCacheMsec: number;
    };
    goodGcgoIndex: number;
    lastGcgoReset: number;
    gcgoTimeoutMsec: number;
    constructor(urls: string[], network: number) {
        this.urls = urls;
        for (let i = 0; i < this.urls.length; i++)
            urls[i] = urls[i].replace(/\/*$/, ''); // remove traling slash
        this.network = network;

        this.cachedCalls = new Map();
        this.cacheOptions = {
            generalCacheMsec: 1000,
            staleIfErrorCacheMsec: 120_000,
        };

        this.goodGcgoIndex = 0;
        this.lastGcgoReset = Date.now();
        this.gcgoTimeoutMsec = 5000;
    }

    async fetch(query: string): Promise<any> {
        const cachedResponse = this.getFromCache(
            query,
            this.cacheOptions.generalCacheMsec,
        );
        if (cachedResponse) return cachedResponse;

        // Periodically reset the gcgo endpoint to the highest priority one
        if (Date.now() - this.lastGcgoReset > 30_000) {
            this.lastGcgoReset = Date.now();
            this.goodGcgoIndex = 0;
        }
        let gcgoIndex = this.goodGcgoIndex;
        let error = null;
        for (let i = 0; i < this.urls.length; i++) {
            try {
                const response = await Promise.race([
                    this.sendFetch(this.urls[gcgoIndex], query),
                    new Promise((_, reject) =>
                        setTimeout(
                            () => reject(new Error('gcgo.sendFetch timed out')),
                            this.gcgoTimeoutMsec,
                        ),
                    ),
                ]);
                console.log('got resp', gcgoIndex, query, response);
                if (response.error) throw new Error(response.error);
                this.goodGcgoIndex = gcgoIndex;
                this.saveInCache(query, response);
                return response;
            } catch (e) {
                error = e;
                console.warn('Error in gcgo.fetch:', gcgoIndex, e);
                gcgoIndex = (gcgoIndex + 1) % this.urls.length;
            }
        }
        if (error) {
            const staleResponse = this.getFromCache(
                query,
                this.cacheOptions.staleIfErrorCacheMsec,
            );
            if (staleResponse) {
                console.warn('Serving stale response for:', query);
                return staleResponse;
            }
            throw error;
        }
    }

    async sendFetch(url: string, query: string): Promise<any> {
        query = query.replace(/^\//, ''); // remove beginning slash
        const response = await fetch(url + '/' + query, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        if (!response.ok)
            throw new Error(
                `GCGO HTTP error! status: ${response.status} ${response.statusText}`,
            );
        const data = await response.json();
        if (data.data == undefined)
            throw new Error(`No data in GCGO GET response: ${data}`);
        return data.data;
    }

    getFromCache(query: string, ttlMsec: number): any | undefined {
        const cacheKey = JSON.stringify({ query });
        const cachedResponse = this.cachedCalls.get(cacheKey);
        if (
            cachedResponse &&
            cachedResponse.cachedAt < new Date(Date.now() - ttlMsec)
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
