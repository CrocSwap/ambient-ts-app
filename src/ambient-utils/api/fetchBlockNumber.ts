export type RpcNodeStatus = 'unknown' | 'unstable' | 'inactive' | 'active';

export async function fetchBlockNumber(
    nodeUrl: string,
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    timeout: number = 5000,
): Promise<number> {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchPromise = fetch(nodeUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 'app-blockNum-sub', // Arbitrary string (see JSON-RPC spec)
        }),
        signal,
    });

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
            controller.abort();
            reject(new Error('Fetch request timed out'));
        }, timeout),
    );

    const blockNum = await Promise.race([fetchPromise, timeoutPromise])
        .then(async (response) => {
            if (response instanceof Response) {
                return response.json();
            }
            throw new Error('No response');
        })
        .then((json) => json?.result)
        .then(parseInt)
        .catch((error) => {
            console.error('Error fetching block number:', error);
            return -1;
        });

    if (!blockNum || isNaN(blockNum)) {
        return -1;
    }
    return blockNum;
}
