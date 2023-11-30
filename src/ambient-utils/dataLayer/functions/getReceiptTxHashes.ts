export const getReceiptTxHashes = (sessionReceipts: string[]) => {
    return sessionReceipts.map(
        (receipt) => JSON.parse(receipt).transactionHash,
    );
};
