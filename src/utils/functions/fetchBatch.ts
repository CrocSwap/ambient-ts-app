/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any  */
// ^ ...(JG) (╯°□°)╯︵ ┻━┻
import { ANALYTICS_URL, BATCH_ENS_CACHE_EXPIRY } from '../../constants';
import { fetchTimeout } from './fetchTimeout';

type SupportedBatchRequests = 'fetchTokenPrice' | 'fetchENSAddresses';

interface RequestData {
    requestId: SupportedBatchRequests;
    body: any;
    timestamp: number;
    promise: Promise<Response> | null;
    // resolve: (data:any) => void | null; // TODO add more typing
    // reject: (data:any) => void | null; // TODO add more typing
    resolve: any;
    reject: any;
    response: Response | null;
    expiry: number;
}
// [x] TODO - Test, to make sure if we spam the batch interface, it can use the nonce value to prevent duplicate requests
// [x] TODO - Test, make sure old requests are cleaned out via the manage function
// [ ] TODO - Test sending invalid requests. Analytics server should be able to handle a mix of poortly formatted requests along side well formatted requests
// [ ] TODO - Harden the response parser with typing. Ensure it makes a best effort to process the valid responses, and does not let a bad response ruin the batch
// [ ] TODO - Add in Timeout support, so individual requests can expire and not block the whole app.

// TODO: cleanup all the retry_delay logic  (use expiry instead) tbd resolve/reject and experiment with wrapping the fetchensaddresses call in a memoizefn

class BatchRequestManager {
    static pendingRequests: Record<string, RequestData> = {};
    static sendFrequency = 10000;
    static sentBatches = 0;
    static parsedBatches = 0;
    static intervalHandle: ReturnType<typeof setInterval> | null = null;

    static async send(): Promise<void> {
        const requests = BatchRequestManager.pendingRequests;
        const sendableNonce: string[] = [];

        // Iterating through requests to find eligible nonces
        Object.keys(requests).forEach((nonce) => {
            const request = requests[nonce];
            if (
                !request.response ||
                Date.now() - request.timestamp > request.expiry
            ) {
                sendableNonce.push(nonce);
            }
        });

        if (sendableNonce.length === 0) return;

        const addressQueryBody = JSON.stringify({
            service: 'run',
            config_path: 'batch_requests',
            include_data: '0',
            data: {
                req: sendableNonce.map((nonce) => {
                    const request = requests[nonce];
                    return {
                        config_path: request.body['config_path'],
                        req_id: nonce,
                        args: request.body,
                    };
                }),
            },
        });

        try {
            BatchRequestManager.sentBatches =
                BatchRequestManager.sentBatches + 1;
            const response = await fetchTimeout(
                ANALYTICS_URL,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: addressQueryBody,
                },
                BatchRequestManager.sendFrequency + 3000,
            );

            if (!response.ok) {
                throw new Error(
                    `Error: ${response.status}: ${response.statusText}`,
                );
            }

            const jsonResponse = await response.json();
            const innerResponse = jsonResponse.value.data;
            innerResponse.forEach((resp: any) => {
                if (requests[resp.req_id]) {
                    requests[resp.req_id].timestamp = Date.now(); // Updating the timestamp
                    requests[resp.req_id].resolve(resp.results); // Resolving the promise with the response
                    requests[resp.req_id].response = resp.results;
                }
            });
            BatchRequestManager.parsedBatches =
                BatchRequestManager.parsedBatches + 1;

            console.log('successfully retrieved and parsed batch request');
        } catch (error) {
            console.log('request failed with: ', sendableNonce);
            Object.keys(requests).forEach((nonce) => {
                if (!requests[nonce].response) {
                    requests[nonce].timestamp = Date.now(); // Updating the timestamp
                    requests[nonce].reject(error); // Rejecting the promise with the error
                    requests[nonce].response = new Response(); // Default response
                }
            });
        }
    }

    static startManagingRequests(): void {
        console.log('starting to manage requests');
        BatchRequestManager.intervalHandle = setInterval(async () => {
            await BatchRequestManager.send();
            BatchRequestManager.clean();
        }, BatchRequestManager.sendFrequency);
    }

    // TODO: return this from a App useEffect for cleanup
    static stopManagingRequests(): void {
        if (BatchRequestManager.intervalHandle != null) {
            clearInterval(BatchRequestManager.intervalHandle);
            BatchRequestManager.intervalHandle = null;
        }
    }

    static clean(): void {
        const requests = BatchRequestManager.pendingRequests;
        Object.keys(requests).forEach((nonce) => {
            const request = requests[nonce];
            if (
                request.response &&
                Date.now() - request.timestamp > request.expiry
            ) {
                delete requests[nonce];
            }
        });
        console.log('num cached requests:', Object.keys(requests)?.length);
    }

    static async register(
        requestId: SupportedBatchRequests,
        body: any,
        nonce: string,
    ): Promise<any> {
        BatchRequestManager.pendingRequests[nonce] = {
            requestId: requestId,
            body: body,
            timestamp: Date.now(), // This should get updated with each send()
            promise: null, // This will hold the promise itself
            resolve: null, // Store the resolve function
            reject: null, // Store the reject function
            response: null,
            expiry: BATCH_ENS_CACHE_EXPIRY, // Expire in BATCH_ENS_CACHE_EXPIRY ms
        };
        BatchRequestManager.pendingRequests[nonce].promise = new Promise(
            (resolve, reject) => {
                BatchRequestManager.pendingRequests[nonce].resolve = resolve;
                BatchRequestManager.pendingRequests[nonce].reject = reject;
            },
        );
        if (BatchRequestManager.intervalHandle == null) {
            BatchRequestManager.startManagingRequests();
        }
        return BatchRequestManager.pendingRequests[nonce].promise;
    }
}

function simpleHash(json: any): string {
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
    BatchRequestManager.stopManagingRequests();
}

export async function fetchBatchENSAddresses(address: string, nonce?: string) {
    try {
        const body = { config_path: 'ens_address', address: address };
        const { ens_address: ensAddress } = await fetchBatch({
            requestId: 'fetchENSAddresses',
            body,
            nonce: nonce || address.toLowerCase(),
        });

        return ensAddress as string;
    } catch (error) {
        return null;
    }
}

type FetchBatchParams = {
    requestId: SupportedBatchRequests;
    body: any;
    nonce?: string;
};

export async function fetchBatch({
    requestId,
    body = {},
    nonce = undefined,
}: FetchBatchParams): Promise<any> {
    const requests = BatchRequestManager.pendingRequests;
    nonce = nonce || simpleHash(body);

    if (
        requests[nonce] &&
        Date.now() - requests[nonce].timestamp > requests[nonce].expiry
    ) {
        return requests[nonce].promise;
    }
    return BatchRequestManager.register(requestId, body, nonce);
}

export async function testBatchSystem() {
    // Combined request and expected response data
    const testData = [
        {
            request: {
                config_path: 'ens_address',
                address: '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            },
            expected: { ens_address: 'benwolski.eth' },
        },
        {
            request: {
                config_path: 'ens_address',
                address: '0x262b58f94055B13f986722498597a43CA9f3BA6D',
            },
            expected: { ens_address: 'wuyansong.eth' },
        },
        {
            request: {
                config_path: 'ens_address',
                address: '0xD94F51053b9817bc2de4DBbaC647D9a784C24406',
            },
            expected: { ens_address: null },
        },
    ];

    const promises = testData.map((data) =>
        fetchBatchENSAddresses(data.request.address),
    );

    Promise.all(promises).then((results) => {
        let matches = 0;
        results.forEach((result, index) => {
            if (
                JSON.stringify(result) ===
                JSON.stringify(testData[index].expected.ens_address)
            )
                matches = matches + 1;
            console.assert(
                JSON.stringify(result) ===
                    JSON.stringify(testData[index].expected.ens_address),
                `Test failed for request ${
                    index + 1
                }: Expected ${JSON.stringify(
                    testData[index].expected.ens_address,
                )}, got ${JSON.stringify(result)}`,
            );
        });
        if (matches == testData.length) console.log('All tests passed!');
        else console.error('Could not verify batch requests');
    });
    //
}

let testCount = 0;
export async function useBatchSystemIrresponsibly() {
    if (testCount != 0) return;

    BatchRequestManager.sendFrequency = 10000; // We allow batches every 10 seconds. This is a LITTLE slow. It can be changed dynamically anytime.
    // Meaning, if the network gets congested, this number can be randomly set, and it will govern all batch network behaviour -- period.
    console.log('useBatchSystemIrresponsibly running... ');
    testCount = 1;
    const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    // Simulate a situation where we send 40 record queries
    await testBatchSystem();
    // A simple one off test in the mix

    console.assert(
        Object.keys(BatchRequestManager.pendingRequests).length === 3,
        'Assertion failed: pendingRequests.length should be 3',
    );
    await sleep(3000);
    console.assert(
        Object.keys(BatchRequestManager.pendingRequests).length === 3,
        'Assertion failed post 3k sleep: pendingRequests.length should be 3',
    );
    await sleep(11000);
    console.assert(
        BatchRequestManager.sentBatches === 1,
        'Assertion failed: sentBatches should be 1',
    );
    console.assert(
        BatchRequestManager.parsedBatches === 1,
        'Assertion failed: parsedBatches should be 0',
    );
    console.assert(
        Object.keys(BatchRequestManager.pendingRequests).length === 0,
        'Assertion failed post processing: pendingRequests.length should be 0',
    );

    // Repeating testBatchSystem multiple times, in a terrible, terrible, manner
    testBatchSystem();
    testBatchSystem();
    testBatchSystem();
    testBatchSystem();
    testBatchSystem();
    testBatchSystem();
    testBatchSystem();
    testBatchSystem();
    console.log('All tests of tests passed!!');

    await sleep(11000);
    console.assert(
        BatchRequestManager.sentBatches === 2,
        'Assertion failed: sentBatches should be 1',
    );
    console.assert(
        BatchRequestManager.parsedBatches === 2,
        'Assertion failed: parsedBatches should be 0',
    );
    console.assert(
        Object.keys(BatchRequestManager.pendingRequests).length === 0,
        'Assertion failed post processing: pendingRequests.length should be 0',
    );

    // Example use:
    // let res = await fetchBatch({ 'config_path': 'ens_address','address': '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc' });
}
