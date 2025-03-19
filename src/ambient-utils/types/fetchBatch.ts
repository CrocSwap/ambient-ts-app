/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any  */

// TODO: data-layer: make a folder/re-organize

/** Request Types */
export type ENSRequestBodyType = { config_path: string; address: string };

export type PriceRequestBodyType = {
    config_path: string;
    asset_platform: string;
    token_address: string;
};

export type AnalyticsServerError = {
    error: string;
};

/** Response Types */
export type ENSSuccessfulResponse = {
    ens_address: string | null;
};
export type ENSResponse = ENSSuccessfulResponse | AnalyticsServerError;

export type PriceSuccessfulResponse = {
    value: {
        usdPrice: number;
        usdPriceFormatted: number;
        source: string;
    };
};
export type PriceResponse = PriceSuccessfulResponse | AnalyticsServerError;

export type RequestTypeMap = {
    ens_address: ENSRequestBodyType;
    price: PriceRequestBodyType;
};

export type RequestKeys = keyof RequestTypeMap;

/** Response : Request Type Map */
export interface RequestResponseMap {
    ens_address: {
        request: ENSRequestBodyType;
        response: ENSResponse;
        success: ENSSuccessfulResponse;
    };
    price: {
        request: PriceRequestBodyType;
        response: PriceResponse;
        success: PriceSuccessfulResponse;
    };
}

export interface RequestData<K extends keyof RequestResponseMap> {
    body: RequestResponseMap[K]['request'];
    timestamp: number | null;
    promise: Promise<RequestResponseMap[K]['response']> | null;
    resolve:
        | ((
              value:
                  | RequestResponseMap[K]['response']
                  | PromiseLike<RequestResponseMap[K]['response']>,
          ) => void)
        | null;
    reject: ((reason?: any) => void) | null;
    response: RequestResponseMap[K]['response'] | null;
    expiry: number;
    retryCount: number | null;
}

export interface FetchBatchOptions {
    nonce?: string;
    expiry?: number;
}
