export function fetchTimeout(url: string, timeout = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
        fetch(url).then(resolve).catch(reject);

        setTimeout(() => {
            throw new Error('request timed out');
            resolve({ error: 'request timed out' });
        }, timeout);
    });
}
