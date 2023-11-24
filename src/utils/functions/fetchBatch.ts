/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any  */
// ^ ...(JG) (╯°□°)╯︵ ┻━┻
import {
    ANALYTICS_URL,
    BATCH_ENS_CACHE_EXPIRY,
    BATCH_SIZE,
    BATCH_SIZE_DELAY,
} from '../../constants';
import { fetchTimeout } from './fetchTimeout';

export type ENSRequestBodyType = { config_path: string; address: string };
export type PriceRequestBodyType = {
    config_path: string;
    chain_id: string;
    token_address: string;
};

export type ENSResponse = {
    ens_address: string | null;
};

export type PriceResponse = {
    value: {
        usdPrice: number;
        usdPriceFormatted: number;
    };
};

type RequestTypeMap = {
    ens_address: ENSRequestBodyType;
    price: PriceRequestBodyType;
};

type RequestKeys = keyof RequestTypeMap;

interface RequestResponseMap {
    ens_address: { request: ENSRequestBodyType; response: ENSResponse };
    price: { request: PriceRequestBodyType; response: PriceResponse };
}

interface RequestData<K extends keyof RequestResponseMap> {
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

// [x] TODO - Test, to make sure if we spam the batch interface, it can use the nonce value to prevent duplicate requests
// [x] TODO - Test, make sure old requests are cleaned out via the manage function
// [ ] TODO - Test sending invalid requests. Analytics server should be able to handle a mix of poortly formatted requests along side well formatted requests
// [ ] TODO - Harden the response parser with typing. Ensure it makes a best effort to process the valid responses, and does not let a bad response ruin the batch
// [ ] TODO - Add in Timeout support, so individual requests can expire and not block the whole app.

class AnalyticsBatchRequestManager {
    static pendingRequests: Record<
        string,
        RequestData<keyof RequestResponseMap>
    > = {};
    static sendFrequency = 10000;
    static sentBatches = 0;
    static parsedBatches = 0;
    static intervalHandle: ReturnType<typeof setInterval> | null = null;
    static BATCH_ANALYTICS_URL =
        ANALYTICS_URL +
        new URLSearchParams({
            service: 'run',
            config_path: 'batch_requests',
            include_data: '0',
        });

    static async sendBatch(): Promise<void> {
        const requests = AnalyticsBatchRequestManager.pendingRequests;
        let sendableNonce: string[] = [];

        for (const nonce in requests) {
            const request = requests[nonce];
            if (
                !request.timestamp ||
                Date.now() - request.timestamp > request.expiry
            ) {
                sendableNonce.push(nonce);
                // Send requests in batches of BATCH_SIZE
                if (sendableNonce.length >= BATCH_SIZE) {
                    await AnalyticsBatchRequestManager.send(sendableNonce);
                    sendableNonce = [];
                    // Wait for a specific amount of time before the next batch
                    await new Promise((resolve) =>
                        setTimeout(resolve, BATCH_SIZE_DELAY),
                    );
                }
            }
        }

        // Send any remaining requests
        if (sendableNonce.length > 0) {
            await AnalyticsBatchRequestManager.send(sendableNonce);
        }
    }

    static async send(nonces: string[]): Promise<void> {
        const queryBody = JSON.stringify({
            service: 'run',
            config_path: 'batch_requests',
            include_data: '0',
            data: {
                req: nonces.map((nonce) => {
                    const request =
                        AnalyticsBatchRequestManager.pendingRequests[nonce];
                    return {
                        config_path: request.body['config_path'],
                        req_id: nonce,
                        args: request.body,
                    };
                }),
            },
        });

        const requests = AnalyticsBatchRequestManager.pendingRequests;

        try {
            AnalyticsBatchRequestManager.sentBatches =
                AnalyticsBatchRequestManager.sentBatches + 1;

            const response = await fetchTimeout(
                AnalyticsBatchRequestManager.BATCH_ANALYTICS_URL,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: queryBody,
                },
                AnalyticsBatchRequestManager.sendFrequency + 3000,
            );

            if (!response.ok) {
                throw new Error(
                    `Error: ${response.status}: ${response.statusText}`,
                );
            }

            const jsonResponse = await response.json();
            const innerResponse = jsonResponse.value.data;
            innerResponse.forEach((resp: any) => {
                const req = requests[resp.req_id];
                if (req && req.resolve) {
                    // TODO: check for an error field with a successful response from the server
                    req.timestamp = Date.now(); // Updating the timestamp
                    req.resolve(resp.results); // Resolving the promise with the response
                    req.response = resp.results;
                }
            });

            AnalyticsBatchRequestManager.parsedBatches =
                AnalyticsBatchRequestManager.parsedBatches + 1;
            console.log('successfully retrieved and parsed batch request');
        } catch (error) {
            console.log('request failed for: ', nonces);
            nonces.forEach((nonce) => {
                const req = requests[nonce];
                if (req && !req.response && req.reject) {
                    req.timestamp = Date.now(); // Updating the timestamp
                    req.reject(error); // Rejecting the promise with the error
                    // TODO: expiry for requests that received an error should be lower than default expiry
                    req.expiry = 1000 * 60 * 5; // 5 minutes
                }
            });
        }
    }

    static startManagingRequests(): void {
        console.log('starting to manage requests');
        AnalyticsBatchRequestManager.intervalHandle = setInterval(async () => {
            await AnalyticsBatchRequestManager.sendBatch();
            AnalyticsBatchRequestManager.clean();
        }, AnalyticsBatchRequestManager.sendFrequency);
    }

    static stopManagingRequests(): void {
        if (AnalyticsBatchRequestManager.intervalHandle != null) {
            clearInterval(AnalyticsBatchRequestManager.intervalHandle);
            AnalyticsBatchRequestManager.intervalHandle = null;
        }
    }

    static clean(): void {
        const requests = AnalyticsBatchRequestManager.pendingRequests;

        Object.keys(requests).forEach((nonce) => {
            const request = requests[nonce];
            if (
                request.timestamp &&
                Date.now() - request.timestamp > request.expiry
            ) {
                delete requests[nonce];
            }
        });
    }

    static async register<K extends RequestKeys>(
        body: RequestResponseMap[K]['request'],
        nonce: string,
    ): Promise<RequestResponseMap[K]['response']> {
        if (!AnalyticsBatchRequestManager.pendingRequests[nonce]) {
            AnalyticsBatchRequestManager.pendingRequests[nonce] = {
                body,
                timestamp: null, // This should get updated with each send()
                promise: null, // This will hold the promise itself
                resolve: null, // Store the resolve function
                reject: null, // Store the reject function
                response: null,
                expiry: BATCH_ENS_CACHE_EXPIRY, // Expire in BATCH_ENS_CACHE_EXPIRY ms
            };
            AnalyticsBatchRequestManager.pendingRequests[nonce].promise =
                new Promise((resolve, reject) => {
                    AnalyticsBatchRequestManager.pendingRequests[
                        nonce
                    ].resolve = resolve;
                    AnalyticsBatchRequestManager.pendingRequests[nonce].reject =
                        reject;
                });
            if (AnalyticsBatchRequestManager.intervalHandle == null) {
                AnalyticsBatchRequestManager.startManagingRequests();
            }
        }
        return AnalyticsBatchRequestManager.pendingRequests[nonce]
            .promise as Promise<RequestResponseMap[K]['response']>;
    }
}

function simpleHash(json: { [key: string]: any }): string {
    const str = JSON.stringify(json);
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return 'hash_' + Math.abs(hash).toString(16);
}

export async function cleanupBatchManager() {
    AnalyticsBatchRequestManager.stopManagingRequests();
}

export async function fetchBatch<K extends keyof RequestResponseMap>(
    requestBody: RequestResponseMap[K]['request'],
    nonce?: string,
): Promise<RequestResponseMap[K]['response']> {
    const requestNonce = nonce || simpleHash(requestBody);
    const request = AnalyticsBatchRequestManager.pendingRequests[requestNonce];
    if (
        request &&
        request.timestamp &&
        Date.now() - request.timestamp <= request.expiry
    ) {
        return request.promise as Promise<RequestResponseMap[K]['response']>;
    }
    return AnalyticsBatchRequestManager.register<K>(requestBody, requestNonce);
}

// TODO: find a new home for tests to live

// export async function testBatchSystem() {
//     // Combined request and expected response data
//     const testData = [
//         {
//             request: {
//                 config_path: 'ens_address',
//                 address: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
//             },
//             expected: { ens_address: 'benwolski.eth' },
//         },
//         {
//             request: {
//                 config_path: 'ens_address',
//                 address: '0x262b58f94055B13f986722498597a43CA9f3BA6D',
//             },
//             expected: { ens_address: 'wuyansong.eth' },
//         },
//         {
//             request: {
//                 config_path: 'ens_address',
//                 address: '0xD94F51053b9817bc2de4DBbaC647D9a784C24406',
//             },
//             expected: { ens_address: null },
//         },
//     ];

//     const promises = testData.map((data) =>
//         fetchBatchENSAddresses(data.request.address),
//     );

//     Promise.all(promises).then((results) => {
//         let matches = 0;
//         results.forEach((result, index) => {
//             if (
//                 JSON.stringify(result) ===
//                 JSON.stringify(testData[index].expected.ens_address)
//             )
//                 matches = matches + 1;
//             console.assert(
//                 JSON.stringify(result) ===
//                     JSON.stringify(testData[index].expected.ens_address),
//                 `Test failed for request ${
//                     index + 1
//                 }: Expected ${JSON.stringify(
//                     testData[index].expected.ens_address,
//                 )}, got ${JSON.stringify(result)}`,
//             );
//         });
//         if (matches == testData.length) console.log('All tests passed!');
//         else console.error('Could not verify batch requests');
//     });
//     //
// }

// let testCount = 0;
// export async function useBatchSystemIrresponsibly() {
//     if (testCount != 0) return;

//     AnalyticsBatchRequestManager.sendFrequency = 10000; // We allow batches every 10 seconds. This is a LITTLE slow. It can be changed dynamically anytime.
//     // Meaning, if the network gets congested, this number can be randomly set, and it will govern all batch network behaviour -- period.
//     console.log('useBatchSystemIrresponsibly running... ');
//     testCount = 1;
//     const sleep = (ms: number) =>
//         new Promise((resolve) => setTimeout(resolve, ms));

//     // Simulate a situation where we send 40 record queries
//     await testBatchSystem();
//     // A simple one off test in the mix

//     console.assert(
//         Object.keys(AnalyticsBatchRequestManager.pendingRequests).length === 3,
//         'Assertion failed: pendingRequests.length should be 3',
//     );
//     await sleep(3000);
//     console.assert(
//         Object.keys(AnalyticsBatchRequestManager.pendingRequests).length === 3,
//         'Assertion failed post 3k sleep: pendingRequests.length should be 3',
//     );
//     await sleep(11000);
//     console.assert(
//         AnalyticsBatchRequestManager.sentBatches === 1,
//         'Assertion failed: sentBatches should be 1',
//     );
//     console.assert(
//         AnalyticsBatchRequestManager.parsedBatches === 1,
//         'Assertion failed: parsedBatches should be 0',
//     );
//     console.assert(
//         Object.keys(AnalyticsBatchRequestManager.pendingRequests).length === 0,
//         'Assertion failed post processing: pendingRequests.length should be 0',
//     );

//     // Repeating testBatchSystem multiple times, in a terrible, terrible, manner
//     testBatchSystem();
//     testBatchSystem();
//     testBatchSystem();
//     testBatchSystem();
//     testBatchSystem();
//     testBatchSystem();
//     testBatchSystem();
//     testBatchSystem();
//     console.log('All tests of tests passed!!');

//     await sleep(11000);
//     console.assert(
//         AnalyticsBatchRequestManager.sentBatches === 2,
//         'Assertion failed: sentBatches should be 1',
//     );
//     console.assert(
//         AnalyticsBatchRequestManager.parsedBatches === 2,
//         'Assertion failed: parsedBatches should be 0',
//     );
//     console.assert(
//         Object.keys(AnalyticsBatchRequestManager.pendingRequests).length === 0,
//         'Assertion failed post processing: pendingRequests.length should be 0',
//     );

//     // Example use:
//     // let res = await fetchBatch({ 'config_path': 'ens_address','address': '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc' });
// }
