import { useContext, useState } from 'react';
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

export function useApprove() {
    const dispatch = useAppDispatch();

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
            if (tx) dispatch(addPendingTx(tx?.hash));
            if (tx?.hash)
                dispatch(
                    addTransactionByType({
                        txHash: tx.hash,
                        txType: 'Approve',
                        txDescription: `Approval of ${tokenSymbol}`,
                    }),
                );
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
                    dispatch(removePendingTx(error.hash));

                    const newTransactionHash = error.replacement.hash;
                    dispatch(addPendingTx(newTransactionHash));

                    dispatch(
                        updateTransactionHash({
                            oldHash: error.hash,
                            newHash: error.replacement.hash,
                        }),
                    );
                    IS_LOCAL_ENV && console.debug({ newTransactionHash });
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    console.error({ error });
                    receipt = error.receipt;
                }
            }
            if (receipt) {
                dispatch(addReceipt(JSON.stringify(receipt)));
                dispatch(removePendingTx(receipt.transactionHash));
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
