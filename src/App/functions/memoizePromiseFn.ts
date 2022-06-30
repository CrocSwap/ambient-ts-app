// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const memoizePromiseFn = (fn: any) => {
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
