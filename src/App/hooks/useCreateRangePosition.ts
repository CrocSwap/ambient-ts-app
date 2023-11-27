import { useContext } from 'react';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';

import {
    addPendingTx,
    addReceipt,
    addTransactionByType,
    removePendingTx,
    updateTransactionHash,
} from '../../utils/state/receiptDataSlice';

import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';
import { IS_LOCAL_ENV } from '../../constants';
import { TradeTokenContext } from '../../contexts/TradeTokenContext';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import { RangeContext } from '../../contexts/RangeContext';

export function useCreateRangePosition() {
    const dispatch = useAppDispatch();

    const {
        crocEnv,
        chainData: { gridSize, poolIndex },
    } = useContext(CrocEnvContext);

    const {
        baseToken: { address: baseTokenAddress },
    } = useContext(TradeTokenContext);

    const { tokenA, tokenB, baseToken, quoteToken } =
        useContext(TradeDataContext);
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

        const pool = crocEnv.pool(tokenA.address, tokenB.address);

        const poolPrice = await pool.displayPrice();

        const minPrice = poolPrice * (1 - slippageTolerancePercentage / 100);
        const maxPrice = poolPrice * (1 + slippageTolerancePercentage / 100);

        let tx;
        try {
            tx = await (isAmbient
                ? isTokenAPrimaryRange
                    ? pool.mintAmbientQuote(
                          tokenAInputQty, // TODO: implementation should disable or not
                          //   isTokenAInputDisabled ? 0 : tokenAInputQty,

                          [minPrice, maxPrice],
                          {
                              surplus: [
                                  isWithdrawTokenAFromDexChecked,
                                  isWithdrawTokenBFromDexChecked,
                              ],
                          },
                      )
                    : pool.mintAmbientBase(
                          tokenBInputQty,
                          //   isTokenBInputDisabled ? 0 : tokenBInputQty,
                          [minPrice, maxPrice],
                          {
                              surplus: [
                                  isWithdrawTokenAFromDexChecked,
                                  isWithdrawTokenBFromDexChecked,
                              ],
                          },
                      )
                : isTokenAPrimaryRange
                ? pool.mintRangeQuote(
                      tokenAInputQty,
                      //   isTokenAInputDisabled ? 0 : tokenAInputQty,
                      [defaultLowTick, defaultHighTick],
                      [minPrice, maxPrice],
                      {
                          surplus: [
                              isWithdrawTokenAFromDexChecked,
                              isWithdrawTokenBFromDexChecked,
                          ],
                      },
                  )
                : pool.mintRangeBase(
                      tokenBInputQty,
                      //   isTokenBInputDisabled ? 0 : tokenBInputQty,
                      [defaultLowTick, defaultHighTick],
                      [minPrice, maxPrice],
                      {
                          surplus: [
                              isWithdrawTokenAFromDexChecked,
                              isWithdrawTokenBFromDexChecked,
                          ],
                      },
                  ));
            setNewRangeTransactionHash(tx?.hash);
            dispatch(addPendingTx(tx?.hash));
            if (tx?.hash)
                dispatch(
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
                    }),
                );
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
                dispatch(removePendingTx(error.hash));
                const newTransactionHash = error.replacement.hash;
                dispatch(addPendingTx(newTransactionHash));
                dispatch(
                    updateTransactionHash({
                        oldHash: error.hash,
                        newHash: error.replacement.hash,
                    }),
                );
                setNewRangeTransactionHash(newTransactionHash);
            } else if (isTransactionFailedError(error)) {
                receipt = error.receipt;
            }
        }
        if (receipt) {
            dispatch(addReceipt(JSON.stringify(receipt)));
            dispatch(removePendingTx(receipt.transactionHash));
            if (setIsTxCompletedRange) {
                setIsTxCompletedRange(true);
            }
        }
    };

    return { createRangePosition };
}
