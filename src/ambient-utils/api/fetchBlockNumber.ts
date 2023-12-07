export async function fetchBlockNumber(nodeUrl: string): Promise<number> {
    const blockNum = await fetch(nodeUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 'app-blockNum-sub', // Arbitary string (see JSON-RPC spec)
        }),
    })
        .then(async (response) => {
            return response?.json();
        })
        .then((json) => json?.result)
        .then(parseInt)
        .catch(console.error);
    if (!blockNum || isNaN(blockNum)) {
        return -1;
    }
    return blockNum;
}
