import { useContext, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
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
import { linkGenMethodsIF, useLinkGen } from '../../utils/hooks/useLinkGen';

export function useSendInit() {
    const dispatch = useAppDispatch();
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    const [isInitPending, setIsInitPending] = useState(false);
    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const {
        tradeData: { baseToken, quoteToken },
    } = useAppSelector((state) => state);
    const sendInit = (initialPriceInBaseDenom: number | undefined) => {
        if (initialPriceInBaseDenom) {
            (async () => {
                let tx;
                try {
                    setIsInitPending(true);
                    tx = await crocEnv
                        ?.pool(baseToken.address, quoteToken.address)
                        .initPool(initialPriceInBaseDenom);

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
                        // The user used 'speed up' or something similar
                        // in their client, but we now have the updated info
                        if (isTransactionReplacedError(error)) {
                            IS_LOCAL_ENV && console.debug('repriced');
                            dispatch(removePendingTx(error.hash));

                            const newTransactionHash = error.replacement.hash;
                            dispatch(addPendingTx(newTransactionHash));

                            //    setNewSwapTransactionHash(newTransactionHash);
                            dispatch(
                                updateTransactionHash({
                                    oldHash: error.hash,
                                    newHash: error.replacement.hash,
                                }),
                            );
                            IS_LOCAL_ENV &&
                                console.debug({ newTransactionHash });
                            receipt = error.receipt;
                        } else if (isTransactionFailedError(error)) {
                            receipt = error.receipt;
                        }
                    }
                    if (receipt) {
                        dispatch(addReceipt(JSON.stringify(receipt)));
                        dispatch(removePendingTx(receipt.transactionHash));
                        linkGenPool.navigate({
                            chain: chainId,
                            tokenA: baseToken.address,
                            tokenB: quoteToken.address,
                        });
                    }
                } catch (error) {
                    if (
                        error.reason ===
                        'sending a transaction requires a signer'
                    ) {
                        location.reload();
                    }
                    console.error({ error });
                } finally {
                    setIsInitPending(false);
                }
            })();
        }
    };
    return { sendInit, isInitPending };
}
