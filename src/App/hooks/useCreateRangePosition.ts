import { MutableRefObject, useContext } from 'react';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';

import {
    isTransactionFailedError,
    isTransactionReplacedError,
    parseErrorMessage,
    TransactionError,
} from '../../utils/TransactionError';
import { IS_LOCAL_ENV } from '../../ambient-utils/constants';
import { TradeTokenContext } from '../../contexts/TradeTokenContext';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import { RangeContext } from '../../contexts/RangeContext';
import { createRangePositionTx } from '../../ambient-utils/dataLayer/transactions/range';
import { ReceiptContext } from '../../contexts/ReceiptContext';
import { getPositionHash } from '../../ambient-utils/dataLayer/functions/getPositionHash';
import { UserDataContext } from '../../contexts/UserDataContext';

export function useCreateRangePosition() {
    const {
        crocEnv,
        chainData: { gridSize, poolIndex },
    } = useContext(CrocEnvContext);

    const { userAddress } = useContext(UserDataContext);

    const {
        baseToken: { address: baseTokenAddress },
    } = useContext(TradeTokenContext);

    const { tokenA, tokenB, baseToken, quoteToken } =
        useContext(TradeDataContext);
    const {
        addPendingTx,
        addReceipt,
        addPositionUpdate,
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
        activeRangeTxHash: MutableRefObject<string>;
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
            activeRangeTxHash,
        } = params;

        if (!crocEnv) return;

        let tx;

        const posHash = getPositionHash(undefined, {
            isPositionTypeAmbient: isAmbient,
            user: userAddress ?? '',
            baseAddress: baseToken.address,
            quoteAddress: quoteToken.address,
            poolIdx: poolIndex,
            bidTick: defaultLowTick,
            askTick: defaultHighTick,
        });

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
            activeRangeTxHash.current = tx?.hash;

            if (tx?.hash)
                addTransactionByType({
                    userAddress: userAddress || '',
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

            addPositionUpdate({
                txHash: tx.hash,
                positionID: posHash,
                isLimit: false,
                unixTimeAdded: Math.floor(Date.now() / 1000),
            });
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.error({ error });
            setTxErrorCode(error?.code);
            setTxErrorMessage(parseErrorMessage(error));
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
                activeRangeTxHash.current = newTransactionHash;
                addPositionUpdate({
                    txHash: newTransactionHash,
                    positionID: posHash,
                    isLimit: false,
                    unixTimeAdded: Math.floor(Date.now() / 1000),
                });
                updateTransactionHash(error.hash, error.replacement.hash);
                setNewRangeTransactionHash(newTransactionHash);
            } else if (isTransactionFailedError(error)) {
                activeRangeTxHash.current = '';
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
