import { useContext, useState } from 'react';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';

import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';
import { IS_LOCAL_ENV } from '../../ambient-utils/constants';
import { TradeTokenContext } from '../../contexts/TradeTokenContext';
import { ReceiptContext } from '../../contexts/ReceiptContext';
import { UserDataContext } from '../../contexts/UserDataContext';

export function useApprove() {
    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        removePendingTx,
        updateTransactionHash,
    } = useContext(ReceiptContext);
    const { userAddress } = useContext(UserDataContext);

    const { crocEnv } = useContext(CrocEnvContext);
    // TODO: useTokenBalancesAndAllowances replaces this in the init page branch
    // const {
    //     tradeData: { baseToken, quoteToken },
    // } = useAppSelector((state) => state);
    const { setRecheckTokenAApproval, setRecheckTokenBApproval } =
        useContext(TradeTokenContext);
    const [isApprovalPending, setIsApprovalPending] = useState(false);

    const approve = async (
        tokenAddress: string,
        tokenSymbol: string,
        cb?: (b: boolean) => void,
    ) => {
        if (!crocEnv) return;
        try {
            setIsApprovalPending(true);
            const tx = await crocEnv.token(tokenAddress).approve();
            if (tx) addPendingTx(tx?.hash);
            if (tx?.hash)
                addTransactionByType({
                    userAddress: userAddress || '',
                    txHash: tx.hash,
                    txType: 'Approve',
                    txDescription: `Approval of ${tokenSymbol}`,
                });

            let receipt;
            try {
                if (tx) receipt = await tx.wait();
            } catch (e) {
                const error = e as TransactionError;
                console.error({ error });
                // The user used 'speed up' or something similar
                // in their client, but we now have the updated info
                if (isTransactionReplacedError(error)) {
                    IS_LOCAL_ENV && console.debug('repriced');
                    removePendingTx(error.hash);

                    const newTransactionHash = error.replacement.hash;
                    addPendingTx(newTransactionHash);

                    updateTransactionHash(error.hash, error.replacement.hash);
                    IS_LOCAL_ENV && console.debug({ newTransactionHash });
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    console.error({ error });
                    receipt = error.receipt;
                }
            }
            if (receipt) {
                addReceipt(JSON.stringify(receipt));
                removePendingTx(receipt.transactionHash);
            }
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.error({ error });
        } finally {
            setIsApprovalPending(false);
            setRecheckTokenAApproval(true);
            setRecheckTokenBApproval(true);
            cb && cb(true);
        }
    };

    return { approve, isApprovalPending };
}
