/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any  */

// TODO: data-layer: make a folder/re-organize

/** Request Types */
export type ENSRequestBodyType = { config_path: string; address: string };

export type PriceRequestBodyType = {
    config_path: string;
    chain_id: string;
    token_address: string;
};

/** Response Types */
export type ENSResponse = {
    ens_address: string | null;
};

export type PriceResponse = {
    value: {
        usdPrice: number;
        usdPriceFormatted: number;
    };
};

export type RequestTypeMap = {
    ens_address: ENSRequestBodyType;
    price: PriceRequestBodyType;
};

export type RequestKeys = keyof RequestTypeMap;

/** Response : Request Type Map */
export interface RequestResponseMap {
    ens_address: { request: ENSRequestBodyType; response: ENSResponse };
    price: { request: PriceRequestBodyType; response: PriceResponse };
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
}

export interface FetchBatchOptions {
    nonce?: string;
    expiry?: number;
}
