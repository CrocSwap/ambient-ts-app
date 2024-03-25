// a utility function to retrieve data from context to display in chat

import { TransactionIF } from '../../types';
import { getMoneynessRankByAddr } from './getMoneynessRank';

type TransactionData = {
    txHash: string;
    entityType: string;
    tx: TransactionIF;
    poolSymbolsDisplay: string;
};

export const getTxSummary = async (
    txHash: string,
    transactionsByUser: Array<TransactionIF>,
    userTransactionsByPool: Array<TransactionIF>,
    transactionsByPool: Array<TransactionIF>,
): Promise<TransactionData | undefined> => {
    if (!txHash) return;
    let txData: TransactionIF | undefined;
    // return the transaction data if it exists in any of the arrays
    if (userTransactionsByPool.some((t) => t.txHash === txHash)) {
        txData = userTransactionsByPool.find((t) => t.txHash === txHash);
    } else if (transactionsByUser.some((t) => t.txHash === txHash)) {
        txData = transactionsByUser.find((t) => t.txHash === txHash);
    } else if (transactionsByPool.some((t) => t.txHash === txHash)) {
        txData = transactionsByPool.find((t) => t.txHash === txHash);
    }

    const baseTokenMoneyness = getMoneynessRankByAddr(txData?.base || '');
    const quoteTokenMoneyness = getMoneynessRankByAddr(txData?.quote || '');

    const isBaseTokenMoneynessGreaterOrEqual =
        baseTokenMoneyness >= quoteTokenMoneyness;

    if (txData?.entityType === 'swap') {
        return {
            txHash: txHash,
            tx: txData,
            entityType: 'swap',
            poolSymbolsDisplay: isBaseTokenMoneynessGreaterOrEqual
                ? `${txData.quoteSymbol} / ${txData.baseSymbol}`
                : `${txData.baseSymbol} / ${txData.quoteSymbol}`,
        };
    }
};
