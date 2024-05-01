// attribution: https://github.com/element-fi/react-query-typechain/blob/main/src/base/TransactionError.ts
// license: https://github.com/element-fi/react-query-typechain/commit/5815d460d14909e8382690c150186e95ad65ab25

import { ContractReceipt, ContractTransaction } from 'ethers';
import { Logger } from 'ethers/lib/utils';

// union type of TransactionError's that we can grow.
export type TransactionError =
    | TransactionReplacedError
    | TransactionFailedError;

export interface TransactionReplacedError extends Error {
    code: 'TRANSACTION_REPLACED';
    hash: string;
    // The reason why the transaction was replaced
    // - "repriced" is generally nothing of concern, the
    //   only difference in the transaction is the gasPrice
    // - "cancelled" means the `to` has been set to the `from`,
    //   the data has been set to `0x` and value set to 0
    // - "replaced" means that the transaction is unrelated to
    //   the original transaction
    reason: 'repriced' | 'cancelled' | 'replaced';
    // This is a short-hand property as the effects of either a
    // "cancelled" or "replaced" tx are effectively cancelled
    cancelled: boolean;
    // The TransactionResponse which replaced the original
    replacement: ContractTransaction;
    // The TransactionReceipt of the replacement transaction
    receipt: ContractReceipt;
}

export function isTransactionReplacedError(
    error: TransactionError,
): error is TransactionReplacedError {
    if (error.code === Logger.errors.TRANSACTION_REPLACED) {
        return true;
    }
    return false;
}

export interface TransactionFailedError {
    code: number;
    message: string;
    stack: string;
    receipt: ContractReceipt;
}

export function isTransactionFailedError(
    error: TransactionError,
): error is TransactionError {
    if (error?.message?.includes('transaction failed')) {
        // if (error?.message?.includes('-32000')) {
        return true;
    }

    return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseErrorMessage(error: any): string {
    const errorMessage =
        error?.error?.data?.message ||
        error?.error?.message ||
        error?.data?.message ||
        error?.response?.data?.message ||
        error?.details ||
        error?.shortMessage ||
        error?.message ||
        error;

    if (typeof errorMessage === 'object') {
        try {
            return JSON.stringify(errorMessage);
        } catch {
            return String(errorMessage);
        }
    }

    return String(errorMessage);
}
