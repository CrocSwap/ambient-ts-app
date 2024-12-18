import { TransactionReceipt } from 'ethers';

export const getReceiptTxHashes = (sessionReceipts: TransactionReceipt[]) => {
    return sessionReceipts.map((receipt) => receipt.hash);
};
