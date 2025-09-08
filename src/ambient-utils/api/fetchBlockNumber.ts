import { JsonRpcProvider } from 'ethers';

export type RpcNodeStatus = 'unknown' | 'unstable' | 'inactive' | 'active';

export async function fetchBlockNumber(
    provider: JsonRpcProvider,
    timeout: number = 5000,
): Promise<number> {
    const fetchPromise = provider.getBlockNumber();

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
            reject(new Error('Fetch request timed out'));
        }, timeout),
    );

    const blockNum = await Promise.race([fetchPromise, timeoutPromise])
        .then(async (response) => {
            if (typeof response === 'number') {
                return response;
            }
            throw new Error('No response');
        })
        .catch((error) => {
            console.error('Error fetching block number:', error);
            return -1;
        });

    if (!blockNum || isNaN(blockNum)) {
        return -1;
    }
    return blockNum;
}
