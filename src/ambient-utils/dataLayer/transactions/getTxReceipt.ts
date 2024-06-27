import { TransactionResponse } from 'ethers';

export async function getTxReceipt(tx: TransactionResponse) {
    const receipt = await tx.wait();
    return receipt;
}
