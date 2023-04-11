import styles from './BypassConfirmRangeButton.module.css';

import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';

import { useState, Dispatch, SetStateAction } from 'react';

import {
    CircleLoader,
    CircleLoaderCompleted,
    CircleLoaderFailed,
} from '../../../Global/LoadingAnimations/CircleLoader/CircleLoader';
import { TokenPairIF } from '../../../../utils/interfaces/TokenPairIF';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionDenied from '../../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../../Global/TransactionException/TransactionException';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import TransactionFailed from '../../../Global/TransactionFailed/TransactionFailed';

interface propsIF {
    newRangeTransactionHash: string;
    txErrorCode: string;
    tokenPair: TokenPairIF;
    resetConfirmation: () => void;
    setShowBypassConfirmButton: Dispatch<SetStateAction<boolean>>;
    sendTransaction: () => Promise<void>;
}
export default function BypassConfirmRangeButton(props: propsIF) {
    const receiptData = useAppSelector((state) => state.receiptData);

    const {
        newRangeTransactionHash,
        txErrorCode,
        tokenPair,
        resetConfirmation,
        setShowBypassConfirmButton,
        sendTransaction,
    } = props;

    const transactionApproved = newRangeTransactionHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    const tokenA = tokenPair.dataTokenA;
    const tokenB = tokenPair.dataTokenB;

    const tokenAQty = (
        document.getElementById('A-range-quantity') as HTMLInputElement
    )?.value;
    const tokenBQty = (
        document.getElementById('B-range-quantity') as HTMLInputElement
    )?.value;

    const confirmSendMessage = (
        <WaitingConfirmation
            noAnimation
            content={`Minting a Position with ${tokenAQty ? tokenAQty : '0'} ${
                tokenA.symbol
            } and ${tokenBQty ? tokenBQty : '0'} ${tokenB.symbol}.`}
        />
    );

    function handleReset() {
        resetConfirmation();
        setShowExtraInfo(false);
    }

    const transactionDenied = (
        <TransactionDenied
            resetConfirmation={handleReset}
            initiateTx={sendTransaction}
            noAnimation
        />
    );
    const transactionFailed = (
        <TransactionFailed
            noAnimation
            resetConfirmation={handleReset}
            initiateTx={sendTransaction}
        />
    );
    const transactionException = (
        <TransactionException
            resetConfirmation={handleReset}
            initiateTx={sendTransaction}
            noAnimation
        />
    );

    const lastReceipt =
        receiptData?.sessionReceipts.length > 0
            ? JSON.parse(
                  receiptData.sessionReceipts[
                      receiptData.sessionReceipts.length - 1
                  ],
              )
            : null;

    const isLastReceiptSuccess = lastReceipt?.status === 1;

    const transactionSubmitted = (
        <TransactionSubmitted
            hash={newRangeTransactionHash}
            tokenBSymbol={tokenA.symbol}
            tokenBAddress={tokenA.address}
            tokenBDecimals={tokenA.decimals}
            tokenBImage={tokenA.logoURI}
            chainId={tokenA.chainId}
            noAnimation
        />
    );
    const confirmationDisplay = isTransactionException
        ? transactionException
        : isTransactionDenied
        ? transactionDenied
        : transactionApproved
        ? transactionSubmitted
        : lastReceipt && !isLastReceiptSuccess
        ? transactionFailed
        : confirmSendMessage;

    const buttonColor = isTransactionException
        ? 'orange'
        : isTransactionDenied || (lastReceipt && !isLastReceiptSuccess)
        ? 'var(--negative)'
        : transactionApproved
        ? 'var(--positive)'
        : 'var(--text-highlight-dark)';

    const animationDisplay = isTransactionException ? (
        <CircleLoaderFailed size='30px' />
    ) : isTransactionDenied || (lastReceipt && !isLastReceiptSuccess) ? (
        <CircleLoaderFailed size='30px' />
    ) : transactionApproved ? (
        <CircleLoaderCompleted size='30px' />
    ) : (
        <CircleLoader size='30px' />
    );

    const buttonText = isTransactionException
        ? 'Transaction Exception'
        : isTransactionDenied
        ? 'Transaction Denied'
        : lastReceipt && !isLastReceiptSuccess
        ? 'Transaction Failed'
        : transactionApproved
        ? 'Transaction Submitted'
        : `Minting a Position with ${tokenAQty ? tokenAQty : '0'} ${
              tokenA.symbol
          } and ${tokenBQty ? tokenBQty : '0'} ${tokenB.symbol}`;

    const [showExtraInfo, setShowExtraInfo] = useState(false);

    return (
        <section className={styles.container}>
            <div className={styles.button_container}>
                <button
                    className={styles.button_content}
                    onClick={() => setShowExtraInfo(!showExtraInfo)}
                >
                    <div style={{ color: buttonColor }}>
                        {animationDisplay}
                        {buttonText}
                    </div>
                    {showExtraInfo ? (
                        <RiArrowUpSLine size={20} />
                    ) : (
                        <RiArrowDownSLine size={20} />
                    )}
                </button>

                {showExtraInfo && (
                    <section className={styles.extra_info_container}>
                        {confirmationDisplay}
                    </section>
                )}
                <span className={styles.close_icon_container}>
                    <button onClick={() => setShowBypassConfirmButton(false)}>
                        Submit another transaction
                    </button>
                </span>
            </div>
        </section>
    );
}

// setShowBypassConfirmButton => True => Render the new button(tx denied)
// setShowBypassConfirmButton => False => Render Open Confirmation button

// For users with skip this confirmation
// Click swap now button => initiates swap and renders new button => setShowBypassConfirmButton(true)
// When receipt is successful, we render the old button => setShowBypassConfirmButton(false)
