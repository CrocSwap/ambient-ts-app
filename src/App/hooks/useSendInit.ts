import { useContext } from 'react';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';

import { IS_LOCAL_ENV } from '../../ambient-utils/constants';
import { waitForTransaction } from '../../ambient-utils/dataLayer';
import { AppStateContext } from '../../contexts';
import { ReceiptContext } from '../../contexts/ReceiptContext';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import { UserDataContext } from '../../contexts/UserDataContext';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';
export function useSendInit(
    setNewInitTransactionHash: React.Dispatch<
        React.SetStateAction<string | undefined>
    >,
    setIsInitPending: React.Dispatch<React.SetStateAction<boolean>>,
    setIsTxCompletedInit: React.Dispatch<React.SetStateAction<boolean>>,
    setTxError: React.Dispatch<React.SetStateAction<Error | undefined>>,
    resetConfirmation: () => void, // Include resetConfirmation as an argument
) {
    const { crocEnv, provider } = useContext(CrocEnvContext);
    const { baseToken, quoteToken } = useContext(TradeDataContext);
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        removePendingTx,
        updateTransactionHash,
    } = useContext(ReceiptContext);
    const { userAddress } = useContext(UserDataContext);

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
                if (tx) {
                    addPendingTx(tx?.hash);

                    addTransactionByType({
                        chainId: chainId,
                        userAddress: userAddress || '',
                        txHash: tx.hash,
                        txType: 'Init',
                        txDescription: `Pool Initialization of ${quoteToken.symbol} / ${baseToken.symbol}`,
                    });
                    let receipt;
                    try {
                        receipt = await waitForTransaction(
                            provider,
                            tx.hash,
                            1,
                        );
                    } catch (e) {
                        const error = e as TransactionError;
                        console.error({ error });
                        if (isTransactionReplacedError(error)) {
                            IS_LOCAL_ENV && console.debug('repriced');
                            removePendingTx(error.hash);

                            const newTransactionHash = error.replacement.hash;
                            addPendingTx(newTransactionHash);

                            updateTransactionHash(
                                error.hash,
                                error.replacement.hash,
                            );
                            setNewInitTransactionHash(newTransactionHash);

                            IS_LOCAL_ENV &&
                                console.debug({ newTransactionHash });
                            receipt = error.receipt;
                        } else if (isTransactionFailedError(error)) {
                            receipt = error.receipt;
                        }
                    }
                    if (receipt) {
                        addReceipt(receipt);
                        removePendingTx(receipt.hash);
                        if (cb) cb();
                        setIsTxCompletedInit(true);
                    }
                }
            } catch (error) {
                console.error({ error });
                setTxError(error);
            } finally {
                setIsInitPending(false);
            }
        }
    };

    return { sendInit };
}
