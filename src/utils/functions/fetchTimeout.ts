export function fetchTimeout(
    url: string,
    options = {},
    timeout = 3000,
): Promise<Response> {
    return new Promise((resolve, reject) => {
        const timeoutHandle = setTimeout(() => {
            reject(new Error('fetchTimeout request timed out'));
        }, timeout);

        fetch(url, options)
            .then(resolve)
            .catch(reject)
            .finally(() => clearTimeout(timeoutHandle));
    });
}
