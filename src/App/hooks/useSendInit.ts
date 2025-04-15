import { useContext } from 'react';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';

import { waitForTransaction } from '../../ambient-utils/dataLayer';
import { AppStateContext } from '../../contexts';
import { ReceiptContext } from '../../contexts/ReceiptContext';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import { UserDataContext } from '../../contexts/UserDataContext';
export function useSendInit(
    setNewInitTransactionHash: React.Dispatch<React.SetStateAction<string>>,
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

                if (tx) {
                    setNewInitTransactionHash(tx.hash);
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
                            removePendingTx,
                            addPendingTx,
                            updateTransactionHash,
                            setNewInitTransactionHash,
                        );
                    } catch (e) {
                        console.error({ e });
                    }
                    if (receipt) {
                        addReceipt(receipt);
                        removePendingTx(receipt.hash);
                        if (cb) {
                            // wait for 1 second to avoid race condition
                            setTimeout(cb, 1000);
                        }
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
