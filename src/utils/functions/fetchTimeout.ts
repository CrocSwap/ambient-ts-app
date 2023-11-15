export function fetchTimeout(url: string, timeout = 3000): Promise<Response> {
    return new Promise((resolve, reject) => {
        const timeoutHandle = setTimeout(() => {
            reject(new Error('utils.functions.fetchTimeout request timed out'));
        }, timeout);

        fetch(url)
            .then(resolve)
            .catch(reject)
            .finally(() => clearTimeout(timeoutHandle));
    });
}
