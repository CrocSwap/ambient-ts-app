import { Provider, TransactionReceipt } from 'ethers';

export async function waitForTransaction(
    provider: Provider,
    txHash: string,
    confirmations = 1,
) {
    const interval = 1000; // Poll every 1 second
    let receipt: TransactionReceipt | null = null;

    while (!receipt) {
        receipt = await provider.getTransactionReceipt(txHash);
        if (receipt && (await receipt.confirmations()) >= confirmations) {
            return receipt; // Transaction mined and confirmations met
        }
        await new Promise((resolve) => setTimeout(resolve, interval)); // Delay
    }
}
