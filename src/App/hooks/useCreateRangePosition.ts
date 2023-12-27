import { useContext } from 'react';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';

import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';
import { IS_LOCAL_ENV } from '../../ambient-utils/constants';
import { TradeTokenContext } from '../../contexts/TradeTokenContext';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import { RangeContext } from '../../contexts/RangeContext';
import { createRangePositionTx } from '../../ambient-utils/dataLayer/transactions/range';
import { ReceiptContext } from '../../contexts/ReceiptContext';

export function useCreateRangePosition() {
    const {
        crocEnv,
        chainData: { gridSize, poolIndex },
    } = useContext(CrocEnvContext);

    const {
        baseToken: { address: baseTokenAddress },
    } = useContext(TradeTokenContext);

    const { tokenA, tokenB, baseToken, quoteToken } =
        useContext(TradeDataContext);
    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        removePendingTx,
        updateTransactionHash,
    } = useContext(ReceiptContext);
    const { isTokenAPrimaryRange } = useContext(RangeContext);

    const isTokenABase = tokenA.address === baseTokenAddress;
    const tokenADecimals = tokenA.decimals;
    const tokenBDecimals = tokenB.decimals;
    const baseTokenDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteTokenDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const createRangePosition = async (params: {
        slippageTolerancePercentage: number;
        isAmbient: boolean;
        tokenAInputQty: number;
        tokenBInputQty: number;
        isWithdrawTokenAFromDexChecked: boolean;
        isWithdrawTokenBFromDexChecked: boolean;
        defaultLowTick: number;
        defaultHighTick: number;
        isAdd: boolean;
        setNewRangeTransactionHash: (s: string) => void;
        setTxErrorCode: (s: string) => void;
        setTxErrorMessage: (s: string) => void;
        resetConfirmation: () => void;
        setIsTxCompletedRange?: React.Dispatch<React.SetStateAction<boolean>>;
    }) => {
        const {
            slippageTolerancePercentage,
            isAmbient,
            tokenAInputQty,
            tokenBInputQty,
            isWithdrawTokenAFromDexChecked,
            isWithdrawTokenBFromDexChecked,
            defaultLowTick,
            defaultHighTick,
            isAdd,
            setNewRangeTransactionHash,
            setTxErrorCode,
            setTxErrorMessage,
            setIsTxCompletedRange,
        } = params;

        if (!crocEnv) return;

        let tx;

        try {
            tx = await createRangePositionTx({
                crocEnv,
                isAmbient,
                slippageTolerancePercentage,
                tokenA: {
                    address: tokenA.address,
                    qty: tokenAInputQty,
                    isWithdrawFromDexChecked: isWithdrawTokenAFromDexChecked,
                },
                tokenB: {
                    address: tokenB.address,
                    qty: tokenBInputQty,
                    isWithdrawFromDexChecked: isWithdrawTokenBFromDexChecked,
                },
                isTokenAPrimaryRange,
                tick: { low: defaultLowTick, high: defaultHighTick },
            });

            setNewRangeTransactionHash(tx?.hash);
            addPendingTx(tx?.hash);
            if (tx?.hash)
                addTransactionByType({
                    txHash: tx.hash,
                    txAction: 'Add',
                    txType: 'Range',
                    txDescription: isAdd
                        ? `Add to Range ${tokenA.symbol}+${tokenB.symbol}`
                        : `Create Range ${tokenA.symbol}+${tokenB.symbol}`,
                    txDetails: {
                        baseAddress: baseToken.address,
                        quoteAddress: quoteToken.address,
                        poolIdx: poolIndex,
                        baseSymbol: baseToken.symbol,
                        quoteSymbol: quoteToken.symbol,
                        baseTokenDecimals: baseTokenDecimals,
                        quoteTokenDecimals: quoteTokenDecimals,
                        isAmbient: isAmbient,
                        lowTick: defaultLowTick,
                        highTick: defaultHighTick,
                        gridSize: gridSize,
                    },
                });
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.error({ error });
            setTxErrorCode(error?.code);
            setTxErrorMessage(error?.data?.message);
        }

        let receipt;
        try {
            if (tx) receipt = await tx.wait();
        } catch (e) {
            const error = e as TransactionError;
            console.error({ error });
            // The user used "speed up" or something similar
            // in their client, but we now have the updated info
            if (isTransactionReplacedError(error)) {
                IS_LOCAL_ENV && console.debug('repriced');
                removePendingTx(error.hash);
                const newTransactionHash = error.replacement.hash;
                addPendingTx(newTransactionHash);

                updateTransactionHash(error.hash, error.replacement.hash);
                setNewRangeTransactionHash(newTransactionHash);
            } else if (isTransactionFailedError(error)) {
                receipt = error.receipt;
            }
        }
        if (receipt) {
            addReceipt(JSON.stringify(receipt));
            removePendingTx(receipt.transactionHash);
            if (setIsTxCompletedRange) {
                setIsTxCompletedRange(true);
            }
        }
    };

    return { createRangePosition };
}
