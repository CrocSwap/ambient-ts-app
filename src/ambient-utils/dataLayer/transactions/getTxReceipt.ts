import { TransactionResponse } from '@ethersproject/providers';

export async function getTxReceipt(tx: TransactionResponse) {
    const receipt = await tx.wait();
    return receipt;
}
