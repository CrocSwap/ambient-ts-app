import { useContext, useState } from 'react';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';

import { IS_LOCAL_ENV } from '../../ambient-utils/constants';
import {
    AllVaultsServerIF,
    TokenIF,
    VaultStrategy,
} from '../../ambient-utils/types';
import { AppStateContext } from '../../contexts';
import { ReceiptContext } from '../../contexts/ReceiptContext';
import { TradeTokenContext } from '../../contexts/TradeTokenContext';
import { UserDataContext } from '../../contexts/UserDataContext';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';

export function useApprove() {
    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        removePendingTx,
        updateTransactionHash,
    } = useContext(ReceiptContext);
    const { userAddress } = useContext(UserDataContext);
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

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
        tokenQuantity?: bigint,
    ) => {
        if (!crocEnv) return;
        try {
            setIsApprovalPending(true);
            const tx = await crocEnv
                .token(tokenAddress)
                .approve(tokenQuantity || undefined);
            if (tx) addPendingTx(tx?.hash);
            if (tx?.hash)
                addTransactionByType({
                    chainId: chainId,
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

                    const newTransactionHash = error.receipt.hash;
                    addPendingTx(newTransactionHash);

                    updateTransactionHash(error.hash, error.receipt.hash);
                    IS_LOCAL_ENV && console.debug({ newTransactionHash });
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    console.error({ error });
                    receipt = error.receipt;
                }
            }
            if (receipt) {
                addReceipt(JSON.stringify(receipt));
                removePendingTx(receipt.hash);
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

    const approveVault = async (
        vault: AllVaultsServerIF,
        mainAsset: TokenIF,
        secondaryAsset: TokenIF,
        strategy: VaultStrategy,
        cb?: (b: boolean) => void,
        tokenQuantity?: bigint,
    ) => {
        if (!crocEnv) return;
        try {
            setIsApprovalPending(true);
            const tx = await crocEnv
                .tempestVault(vault.address, vault.mainAsset, strategy)
                .approve(tokenQuantity || undefined)
                .catch(console.error);

            if (tx) addPendingTx(tx?.hash);
            if (tx?.hash)
                addTransactionByType({
                    chainId: chainId,
                    userAddress: userAddress || '',
                    txHash: tx.hash,
                    txType: 'Approve',
                    txDescription: `Approve ${mainAsset.symbol}/${secondaryAsset.symbol}`,
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

                    const newTransactionHash = error.receipt.hash;
                    addPendingTx(newTransactionHash);

                    updateTransactionHash(error.hash, error.receipt.hash);
                    IS_LOCAL_ENV && console.debug({ newTransactionHash });
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    console.error({ error });
                    receipt = error.receipt;
                }
            }
            if (receipt) {
                addReceipt(JSON.stringify(receipt));
                removePendingTx(receipt.hash);
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

    return { approve, approveVault, isApprovalPending };
}
