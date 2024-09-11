// attribution: https://github.com/element-fi/react-query-typechain/blob/main/src/base/TransactionError.ts
// license: https://github.com/element-fi/react-query-typechain/commit/5815d460d14909e8382690c150186e95ad65ab25

import { ContractTransactionReceipt, TransactionReplacedError } from 'ethers';

// union type of TransactionError's that we can grow.
export type TransactionError =
    | TransactionReplacedError
    | TransactionFailedError;

export function isTransactionReplacedError(
    error: TransactionError,
): error is TransactionReplacedError {
    if (error.code == 'TRANSACTION_REPLACED') {
        return true;
    }
    return false;
}

export interface TransactionFailedError {
    code: number;
    message: string;
    stack: string;
    receipt: ContractTransactionReceipt;
}

export function isTransactionFailedError(
    error: TransactionError,
): error is TransactionError {
    if (
        error?.message?.includes('transaction failed') ||
        error.code == 'CALL_EXCEPTION'
    ) {
        // if (error?.message?.includes('-32000')) {
        return true;
    }

    return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTransactionDeniedError(error: any): boolean {
    if (error?.code == 'ACTION_REJECTED' || error?.reason == 'rejected')
        return true;

    const msg = parseErrorMessage(error);
    if (
        msg.includes('rejected') ||
        msg.includes('denied') ||
        msg.includes('disapproved')
    )
        return true;

    return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseErrorMessage(error: any): string {
    const errorMessage =
        error?.info?.error?.data?.message ||
        error?.error?.data?.message ||
        error?.info?.error?.message ||
        error?.error?.message ||
        error?.data?.message ||
        error?.response?.data?.message ||
        error?.details ||
        error?.shortMessage ||
        error?.message ||
        error?.reason ||
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
