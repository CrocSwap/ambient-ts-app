import { TransactionResponse } from '@ethersproject/providers';

export async function getSwapTxReceipt(tx: TransactionResponse) {
    const receipt = await tx.wait();
    return receipt;
}
