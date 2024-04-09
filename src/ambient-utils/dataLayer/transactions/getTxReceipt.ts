import { PublicClient, TransactionReceipt } from 'viem';

export async function getTxReceipt(
    hash: `0x${string}`,
    client: PublicClient,
): Promise<TransactionReceipt> {
    const receipt = await client.waitForTransactionReceipt({ hash });
    return receipt;
}
