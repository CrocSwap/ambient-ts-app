import { useContext } from 'react';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';

import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
    parseErrorMessage,
} from '../../utils/TransactionError';
import { IS_LOCAL_ENV } from '../../ambient-utils/constants';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import { ReceiptContext } from '../../contexts/ReceiptContext';
import { UserDataContext } from '../../contexts/UserDataContext';
export function useSendInit(
    setNewInitTransactionHash: React.Dispatch<
        React.SetStateAction<string | undefined>
    >,
    setIsInitPending: React.Dispatch<React.SetStateAction<boolean>>,
    setIsTxCompletedInit: React.Dispatch<React.SetStateAction<boolean>>,
    setTxErrorCode: React.Dispatch<React.SetStateAction<string>>,
    setTxErrorMessage: React.Dispatch<React.SetStateAction<string>>,
    setTxErrorJSON: React.Dispatch<React.SetStateAction<string>>,
    resetConfirmation: () => void, // Include resetConfirmation as an argument
) {
    const { crocEnv } = useContext(CrocEnvContext);
    const { baseToken, quoteToken } = useContext(TradeDataContext);
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
                if (tx) addPendingTx(tx?.hash);
                if (tx?.hash)
                    addTransactionByType({
                        userAddress: userAddress || '',
                        txHash: tx.hash,
                        txType: 'Init',
                        txDescription: `Pool Initialization of ${quoteToken.symbol} / ${baseToken.symbol}`,
                    });
                let receipt;
                try {
                    if (tx) receipt = await tx.wait();
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

                        IS_LOCAL_ENV && console.debug({ newTransactionHash });
                        receipt = error.receipt;
                    } else if (isTransactionFailedError(error)) {
                        receipt = error.receipt;
                    }
                }
                if (receipt) {
                    addReceipt(JSON.stringify(receipt));
                    removePendingTx(receipt.transactionHash);
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
                setTxErrorMessage(parseErrorMessage(error));
                setTxErrorJSON(JSON.stringify(error));
            } finally {
                setIsInitPending(false);
            }
        }
    };

    return { sendInit };
}
