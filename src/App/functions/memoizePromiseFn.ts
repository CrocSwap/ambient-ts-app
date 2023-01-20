import { CrocEnv } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function memoizePromiseFn(fn: any) {
    const cache = new Map();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (...args: any[]) => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        cache.set(
            key,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fn(...args).catch((error: any) => {
                // Delete cache entry if api call fails
                cache.delete(key);
                return Promise.reject(error);
            }),
        );

        return cache.get(key);
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const memoizeProviderFn = (fn: any) => {
    const cache = new Map();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (provider: ethers.providers.Provider, ...args: any[]) => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        cache.set(
            key,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fn(provider, ...args).catch((error: any) => {
                // Delete cache entry if api call fails
                cache.delete(key);
                return Promise.reject(error);
            }),
        );

        return cache.get(key);
    };
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const memoizeCrocEnvFn = (fn: any) => {
    const cache = new Map();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (crocEnv: CrocEnv, ...args: any[]) => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        cache.set(
            key,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fn(crocEnv, ...args).catch((error: any) => {
                // Delete cache entry if api call fails
                cache.delete(key);
                return Promise.reject(error);
            }),
        );

        return cache.get(key);
    };
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const memoizeCacheQueryFn = (fn: any) => {
    const cache = new Map();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (...args: any[]) => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        cache.set(
            key,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fn(...args).catch((error: any) => {
                // Delete cache entry if api call fails
                cache.delete(key);
                return Promise.reject(error);
            }),
        );

        return cache.get(key);
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function memoizeTransactionGraphFn(fn: any) {
    const cache = new Map();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (...args: any[]) => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        cache.set(
            key,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fn(...args).catch((error: any) => {
                // Delete cache entry if api call fails
                cache.delete(key);
                return Promise.reject(error);
            }),
        );

        return cache.get(key);
    };
}
