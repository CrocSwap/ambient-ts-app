import styles from './BypassConfirmButton.module.css';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { useState, Dispatch, SetStateAction } from 'react';
import {
    CircleLoader,
    CircleLoaderCompleted,
    CircleLoaderFailed,
} from '../../../Global/LoadingAnimations/CircleLoader/CircleLoader';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionDenied from '../../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../../Global/TransactionException/TransactionException';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import TransactionFailed from '../../../Global/TransactionFailed/TransactionFailed';
import uriToHttp from '../../../../utils/functions/uriToHttp';

interface propsIF {
    newTransactionHash: string;
    txErrorCode: string;
    resetConfirmation: () => void;
    setShowBypassConfirmButton: Dispatch<SetStateAction<boolean>>;
    sendTransaction: () => Promise<void>;
    setNewTransactionHash: Dispatch<SetStateAction<string>>;
    transactionPendingDisplayString: string;
}
export default function BypassConfirmButton(props: propsIF) {
    const receiptData = useAppSelector((state) => state.receiptData);

    const {
        newTransactionHash,
        txErrorCode,
        resetConfirmation,
        setShowBypassConfirmButton,
        sendTransaction,
        setNewTransactionHash,
        transactionPendingDisplayString,
    } = props;

    const transactionApproved = newTransactionHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);

    const confirmSendMessage = (
        <WaitingConfirmation
            noAnimation
            content={transactionPendingDisplayString}
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
            hash={newTransactionHash}
            tokenBSymbol={tokenA.symbol}
            tokenBAddress={tokenA.address}
            tokenBDecimals={tokenA.decimals}
            tokenBImage={uriToHttp(tokenB.logoURI)}
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
        : 'var(--accent1)';

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
        : transactionPendingDisplayString;

    const [showExtraInfo, setShowExtraInfo] = useState(false);

    return (
        <section className={styles.container}>
            <div className={styles.button_container}>
                <button
                    className={styles.button_content}
                    onClick={() => setShowExtraInfo(!showExtraInfo)}
                >
                    <div style={{ color: buttonColor }}>
                        <div style={{ width: '35px' }}>{animationDisplay}</div>
                        <div>{buttonText}</div>
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
                    <button
                        onClick={() => {
                            resetConfirmation();
                            setShowBypassConfirmButton(false);
                            setNewTransactionHash('');
                        }}
                    >
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
