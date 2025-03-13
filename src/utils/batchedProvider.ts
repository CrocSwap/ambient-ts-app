/* eslint-disable @typescript-eslint/no-explicit-any */
import { Contract, JsonRpcProvider } from 'ethers';

export const MULTICALL_ABI = [
    {
        name: 'aggregate3',
        inputs: [
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'target',
                        type: 'address',
                    },
                    {
                        internalType: 'bool',
                        name: 'allowFailure',
                        type: 'bool',
                    },
                    {
                        internalType: 'bytes',
                        name: 'callData',
                        type: 'bytes',
                    },
                ],
                internalType: 'struct Multicall3.Call3[]',
                name: 'calls',
                type: 'tuple[]',
            },
        ],
        outputs: [
            {
                components: [
                    {
                        internalType: 'bool',
                        name: 'success',
                        type: 'bool',
                    },
                    {
                        internalType: 'bytes',
                        name: 'returnData',
                        type: 'bytes',
                    },
                ],
                internalType: 'struct Multicall3.Result[]',
                name: 'returnData',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'payable',
        type: 'function',
    },
];

const MULTICALL_ADDRESSES: Map<number, string> = new Map([
    [1, '0xca11bde05977b3631167028862be2a173976ca11'], // ethereum mainnet
    [11155111, '0xca11bde05977b3631167028862be2a173976ca11'], // ethereum testnet (sepolia)
    [7700, '0xca11bde05977b3631167028862be2a173976ca11'], // canto mainnet
    [7701, '0xca11bde05977b3631167028862be2a173976ca11'], // canto testnet
    [81457, '0xca11bde05977b3631167028862be2a173976ca11'], // blast mainnet
    [168587773, '0xca11bde05977b3631167028862be2a173976ca11'], // blast testnet
    [534352, '0xca11bde05977b3631167028862be2a173976ca11'], // scroll mainnet
    [534351, '0xca11bde05977b3631167028862be2a173976ca11'], // scroll testnet
    [1923, '0xca11bde05977b3631167028862be2a173976ca11'], // swell mainnet
    [1924, '0xca11bde05977b3631167028862be2a173976ca11'], // swell testnet
    [98865, '0xca11bde05977b3631167028862be2a173976ca11'], // plume mainnet
    [98864, '0xca11bde05977b3631167028862be2a173976ca11'], // plume testnet
    [84532, '0xca11bde05977b3631167028862be2a173976ca11'], // base testnet
    [10143, '0xca11bde05977b3631167028862be2a173976ca11'], // monad testnet
]);

export type JsonRpcPayload = {
    id: number;
    method: string;
    params: EthCallWithBlockTag;
    jsonrpc: '2.0';
};

type EthCallParams = {
    to: string;
    data: string;
};

type EthCallWithBlockTag = [EthCallParams, string];

export type JsonRpcResult = {
    id: number;
    result: any;
};
type ResolveFunc = (result: JsonRpcResult) => void;
type RejectFunc = (error: Error) => void;
type Payload = {
    payload: JsonRpcPayload;
    ttlMsec: number;
    resolve: ResolveFunc;
    reject: RejectFunc;
};
type Timer = ReturnType<typeof setTimeout>;

type CachedResponse = {
    response: any;
    validUntil: Date;
};

export class BatchedJsonRpcProvider extends JsonRpcProvider {
    multicall: Multicall;
    payloads: Array<Payload>;
    drainTimer: null | Timer;
    nextId: number;
    batchOptions: {
        batchMaxCount: number;
        batchMaxSizeBytes: number;
        batchStallTimeMs: number;
    };
    cachedCalls: Map<string, CachedResponse>;
    cacheOptions: {
        ethCallTtlMsec: number;
        otherCallTtlMsec: number;
        foreverMethods: string[];
        foreverContractMethods: string[];
    };
    constructor(url: string, network?: number, options?: any) {
        super(url, network, options);
        this.multicall = new Multicall(this);
        this.payloads = [];
        this.drainTimer = null;
        this.nextId = 0;
        this.batchOptions = {
            batchMaxCount: 40,
            batchMaxSizeBytes: 1000000,
            batchStallTimeMs: 50,
        };
        this.cachedCalls = new Map();
        this.cacheOptions = {
            ethCallTtlMsec: 3000,
            otherCallTtlMsec: 3000,
            foreverMethods: ['eth_chainId', 'eth_accounts'],
            foreverContractMethods: [
                '0x313ce567',
                '0x06fdde03',
                '0x95d89b41',
                '0x18160ddd',
            ], // ERC20 methods: decimals, name, symbol, totalSupply
        };
    }

    async send(method: string, params: any[]): Promise<any> {
        if (!this.multicall.initialized) {
            this.multicall.initialize();
        }
        if (
            method == 'eth_chainId' ||
            method == 'eth_accounts' ||
            method != 'eth_call' ||
            !this.multicall.ready
        ) {
            return this.sendCached(
                method,
                params,
                this.pickTTL(method, params),
            );
        } else {
            const callParams = params as EthCallWithBlockTag;
            if (
                callParams[1] != 'latest' ||
                callParams[0].to == this.multicall.contractAddress
            ) {
                return super.send(method, params);
            }
            return this.scheduleForBatch(
                callParams,
                this.pickTTL(method, params),
            );
        }
    }

    scheduleForBatch(call: EthCallWithBlockTag, ttlMsec: number): Promise<any> {
        return new Promise((resolve, reject) => {
            const cached = this.getFromCache('eth_call', call);
            if (cached) {
                resolve(cached);
                return;
            }
            const payload: JsonRpcPayload = {
                id: this.nextId++,
                method: 'eth_call',
                params: call,
                jsonrpc: '2.0',
            };
            this.payloads.push({
                payload,
                ttlMsec,
                resolve,
                reject: (_) => {
                    // attempt to call directly if multicall fails
                    super
                        .send(payload.method, payload.params)
                        .then((result) => {
                            this.saveInCache(
                                payload.method,
                                payload.params,
                                result,
                                ttlMsec,
                            );
                            resolve(result);
                        })
                        .catch(reject);
                },
            });
            this.scheduleDrain();
        });
    }

    async sendCached(
        method: string,
        params: any[],
        ttlMsec: number,
    ): Promise<any> {
        const cachedResponse = this.getFromCache(method, params);
        if (cachedResponse) return cachedResponse;
        const response = await super.send(method, params);
        this.saveInCache(method, params, response, ttlMsec);
        return response;
    }

    getFromCache(method: string, params: any[]): any | undefined {
        const cacheKey = JSON.stringify({ method, params });
        const cachedResponse = this.cachedCalls.get(cacheKey);
        if (cachedResponse && cachedResponse.validUntil > new Date()) {
            return cachedResponse.response;
        }
        return undefined;
    }

    saveInCache(
        method: string,
        params: any[],
        response: any,
        ttlMsec: number,
    ): void {
        if (ttlMsec === 0) {
            return;
        }
        const cacheKey = JSON.stringify({ method, params });
        this.cachedCalls.set(cacheKey, {
            response,
            validUntil: new Date(Date.now() + ttlMsec),
        });
    }

    pickTTL(method: string, params: any[]): number {
        if (this.cacheOptions.foreverMethods.includes(method)) {
            return 999999999;
        } else if (method == 'eth_call') {
            if (
                this.cacheOptions.foreverContractMethods.some((m) =>
                    params[0].data.startsWith(m),
                )
            )
                return 999999999;
            else return this.cacheOptions.ethCallTtlMsec;
        } else {
            return this.cacheOptions.otherCallTtlMsec;
        }
    }

    scheduleDrain() {
        if (this.drainTimer) {
            return;
        }
        const stallTime =
            this.batchOptions.batchMaxCount === 1
                ? 0
                : this.batchOptions.batchStallTimeMs;

        this.drainTimer = setTimeout(async () => {
            this.drainTimer = null;

            const payloads = this.payloads;
            this.payloads = [];

            while (payloads.length) {
                const batch = [payloads.shift() as Payload];
                while (payloads.length) {
                    if (batch.length === this.batchOptions.batchMaxCount) {
                        break;
                    }
                    batch.push(payloads.shift() as Payload);
                    const bytes = JSON.stringify(batch.map((p) => p.payload));
                    if (bytes.length > this.batchOptions.batchMaxSizeBytes) {
                        payloads.unshift(batch.pop() as Payload);
                        break;
                    }
                }
                await (async () => {
                    if (batch.length === 1) {
                        super
                            .send(
                                batch[0].payload.method,
                                batch[0].payload.params,
                            )
                            .then((result) => {
                                this.saveInCache(
                                    batch[0].payload.method,
                                    batch[0].payload.params,
                                    result,
                                    batch[0].ttlMsec,
                                );
                                batch[0].resolve(result);
                            })
                            .catch(batch[0].reject);
                        return;
                    }

                    const payload = batch.map((p) => p.payload);

                    try {
                        const results =
                            await this.multicall.sendMulticall(payload);
                        for (const {
                            resolve,
                            reject,
                            payload,
                            ttlMsec,
                        } of batch) {
                            const resp = results.filter(
                                (r: any) => r.id === payload.id,
                            )[0];

                            if (resp == null || resp == undefined) {
                                console.error('missing batched resp');
                                reject(
                                    new Error('missing response for request'),
                                );
                                continue;
                            }

                            if ('error' in resp) {
                                console.error(
                                    'error in batched response',
                                    resp.error,
                                );
                                reject(new Error(resp.error));
                                continue;
                            }

                            this.saveInCache(
                                payload.method,
                                payload.params,
                                resp.result,
                                ttlMsec,
                            );
                            resolve(resp.result);
                        }
                    } catch (error) {
                        for (const { reject } of batch) {
                            console.error('error in batched catch', error);
                            reject(error);
                        }
                    }
                })();
            }
        }, stallTime);
    }
}

class Multicall {
    provider: JsonRpcProvider;
    contract: Contract | null | undefined;
    contractAddress: string | null | undefined;
    constructor(provider: JsonRpcProvider) {
        this.provider = provider;
        this.contract = undefined;
        this.contractAddress = undefined;
    }

    async initialize() {
        if (this.contract === undefined) {
            try {
                const chainId = Number(
                    (await this.provider.getNetwork()).chainId,
                );
                if (this.contract === undefined && chainId) {
                    const multicallAddress = MULTICALL_ADDRESSES.get(chainId);
                    if (multicallAddress) {
                        this.contractAddress = multicallAddress;
                        this.contract = new Contract(
                            multicallAddress,
                            MULTICALL_ABI,
                            this.provider,
                        );
                    } else {
                        this.contract = null;
                        console.warn(
                            'No multicall address found for chainId:',
                            chainId,
                        );
                    }
                }
            } catch (e) {
                this.contract = null;
                console.error('Error initializing multicall contract:', e);
            }
        }
    }

    async sendMulticall(payload: Array<JsonRpcPayload>): Promise<any[]> {
        if (!this.contract) {
            throw new Error('Multicall contract not ready');
        }

        const calls = payload.map((p) => {
            return {
                target: p.params[0].to,
                callData: p.params[0].data,
            };
        });

        const preparedCalls = calls.map((c) => {
            return [c.target, true, c.callData];
        });
        const rawResults =
            await this.contract.aggregate3.staticCall(preparedCalls);
        const results = rawResults.map((r: any, i: number) => {
            return {
                id: payload[i].id,
                result: r.success ? r.returnData : undefined,
            };
        });

        return results;
    }

    get initialized(): boolean {
        return this.contract !== undefined;
    }

    get ready(): boolean {
        return this.contract !== undefined && this.contract !== null;
    }
}
