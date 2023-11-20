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
import { TradeDataContext } from '../../contexts/TradeDataContext';
export function useSendInit(
    setNewInitTransactionHash: React.Dispatch<
        React.SetStateAction<string | undefined>
    >,
    setIsInitPending: React.Dispatch<React.SetStateAction<boolean>>,
    setIsTxCompletedInit: React.Dispatch<React.SetStateAction<boolean>>,
    setTxErrorCode: React.Dispatch<React.SetStateAction<string>>,
    resetConfirmation: () => void, // Include resetConfirmation as an argument
) {
    const dispatch = useAppDispatch();
    const { crocEnv } = useContext(CrocEnvContext);
    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const sendInit = async (
        initialPriceInBaseDenom: number | undefined,
        cb?: () => void,
    ) => {
        resetConfirmation();

        if (initialPriceInBaseDenom) {
            let tx;
            try {
                setIsInitPending(true);
                tx = await crocEnv
                    ?.pool(baseToken.address, quoteToken.address)
                    .initPool(initialPriceInBaseDenom);

                setNewInitTransactionHash(tx?.hash);
                if (tx) dispatch(addPendingTx(tx?.hash));
                if (tx?.hash)
                    dispatch(
                        addTransactionByType({
                            txHash: tx.hash,
                            txType: 'Init',
                            txDescription: `Pool Initialization of ${quoteToken.symbol} / ${baseToken.symbol}`,
                        }),
                    );
                let receipt;
                try {
                    if (tx) receipt = await tx.wait();
                } catch (e) {
                    const error = e as TransactionError;
                    console.error({ error });
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
                        setNewInitTransactionHash(newTransactionHash);

                        IS_LOCAL_ENV && console.debug({ newTransactionHash });
                        receipt = error.receipt;
                    } else if (isTransactionFailedError(error)) {
                        receipt = error.receipt;
                    }
                }
                if (receipt) {
                    dispatch(addReceipt(JSON.stringify(receipt)));
                    dispatch(removePendingTx(receipt.transactionHash));
                    if (cb) cb();
                    setIsTxCompletedInit(true);
                }
            } catch (error) {
                if (
                    error.reason === 'sending a transaction requires a signer'
                ) {
                    location.reload();
                }
                console.error({ error });
                setTxErrorCode(error?.code);
            } finally {
                setIsInitPending(false);
            }
        }
    };

    return { sendInit };
}
