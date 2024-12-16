import { Provider, TransactionResponse } from 'ethers';
import { PositionUpdateIF } from '../../../contexts/ReceiptContext';

export async function waitForTransaction(
    provider: Provider,
    txHash: string,
    confirmations = 1,
    removePendingTx: (pendingTx: string) => void,
    addPendingTx: (tx: string) => void,
    updateTransactionHash: (oldHash: string, newHash: string) => void,
    setLocalTxHash?: (value: React.SetStateAction<string>) => void,
    posHash?: string,
    addPositionUpdate?: (positionUpdate: PositionUpdateIF) => void,
) {
    const interval = 1000; // Poll every 1 second
    let receipt, originalNonce, fromAccount, newTxHash;

    while (!receipt) {
        // Fetch the original transaction
        const originalTx = await provider.getTransaction(txHash);

        if (originalTx) {
            fromAccount = originalTx.from;
            originalNonce = originalTx.nonce;
        } else {
            console.log(
                `Transaction with hash ${txHash} was dropped or replaced.`,
            );
            removePendingTx(txHash);

            if (!fromAccount) return;
            // Check if the nonce has been used for another transaction
            const latestNonce = await provider.getTransactionCount(
                fromAccount,
                'latest',
            );

            console.log({ originalNonce, latestNonce });

            if (originalNonce && latestNonce > originalNonce) {
                console.warn(
                    'Transaction replaced. Searching for the new transaction...',
                );

                // Find the replacement transaction
                const newTx = await findReplacementTransaction(
                    provider,
                    fromAccount,
                    originalNonce,
                );
                console.log({ newTx });

                if (newTx) {
                    console.log('Replacement transaction found:', newTx.hash);
                    newTxHash = newTx.hash; // Update txHash to the new transaction hash
                    addPendingTx(newTxHash);
                    updateTransactionHash(txHash, newTxHash);
                    setLocalTxHash && setLocalTxHash(newTxHash);
                    if (posHash && addPositionUpdate) {
                        addPositionUpdate({
                            txHash: newTxHash,
                            positionID: posHash,
                            isLimit: false,
                            unixTimeAdded: Math.floor(Date.now() / 1000),
                        });
                    }
                } else {
                    throw new Error(
                        `Transaction with nonce ${originalNonce} was replaced, but no replacement found.`,
                    );
                }
            }
        }

        // Fetch the receipt for the current transaction hash
        receipt = await provider.getTransactionReceipt(newTxHash ?? txHash);
        console.log({ receipt });
        // If receipt exists and confirmations are met
        if (receipt && (await receipt.confirmations()) >= confirmations) {
            return receipt;
        }

        await new Promise((resolve) => setTimeout(resolve, interval)); // Delay
    }
}

// Helper function to find replacement transaction
async function findReplacementTransaction(
    provider: Provider,
    sender: string,
    nonce: number,
): Promise<TransactionResponse | null> {
    const latestBlock = await provider.getBlockNumber();

    for (let i = latestBlock; i >= latestBlock - 50 && i >= 0; i--) {
        const block = await provider.getBlock(i);
        if (!block) return null;
        const txs: (TransactionResponse | null)[] = await Promise.all(
            block.transactions.map((txHash: string) =>
                provider.getTransaction(txHash),
            ),
        );

        const replacementTx = txs.find(
            (tx) => tx?.from === sender && tx.nonce === nonce,
        );

        if (replacementTx) {
            return replacementTx; // Return the replacement transaction
        }
    }

    return null; // No replacement transaction found
}
