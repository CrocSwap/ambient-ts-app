import { useState } from 'react';
import { RiArrowUpSLine, RiArrowDownSLine } from 'react-icons/ri';
import uriToHttp from '../../../../utils/functions/uriToHttp';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import {
    CircleLoaderFailed,
    CircleLoaderCompleted,
} from '../../../Global/LoadingAnimations/CircleLoader/CircleLoader';
import Spinner from '../../../Global/Spinner/Spinner';
import TransactionDenied from '../../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../../Global/TransactionException/TransactionException';
import TransactionFailed from '../../../Global/TransactionFailed/TransactionFailed';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import styles from './BypassConfirmButton.module.css';

interface propsIF {
    newTransactionHash: string;
    txErrorCode: string;
    resetConfirmation: () => void;
    sendTransaction: () => Promise<void>;
    transactionPendingDisplayString: string;
}
export default function BypassConfirmButton(props: propsIF) {
    const receiptData = useAppSelector((state) => state.receiptData);

    const {
        newTransactionHash,
        txErrorCode,
        resetConfirmation,
        sendTransaction,
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

    const transactionDenied = <TransactionDenied noAnimation />;
    const transactionFailed = (
        <TransactionFailed
            noAnimation
            resetConfirmation={handleReset}
            initiateTx={sendTransaction}
        />
    );
    const transactionException = <TransactionException />;

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

    const buttonColor =
        isTransactionException ||
        isTransactionDenied ||
        (lastReceipt && !isLastReceiptSuccess)
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
        <Spinner size='30' bg='var(--dark2)' />
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
        <section>
            <div className={styles.button_container}>
                <button
                    className={styles.button_content}
                    onClick={() => setShowExtraInfo(!showExtraInfo)}
                >
                    <div>{animationDisplay}</div>
                    <div style={{ color: buttonColor }}>{buttonText}</div>
                    {isTransactionDenied ||
                    transactionApproved ||
                    isTransactionException ? (
                        showExtraInfo ? (
                            <RiArrowUpSLine size={20} />
                        ) : (
                            <RiArrowDownSLine size={20} />
                        )
                    ) : (
                        <div />
                    )}
                </button>

                {showExtraInfo && (
                    <section className={styles.extra_info_container}>
                        {confirmationDisplay}
                    </section>
                )}
                {(isTransactionDenied ||
                    transactionApproved ||
                    isTransactionException) && (
                    <span className={styles.close_icon_container}>
                        <button
                            onClick={() => {
                                resetConfirmation();
                            }}
                        >
                            {!isTransactionDenied && !isTransactionException
                                ? 'Submit another transaction'
                                : 'Retry'}
                        </button>
                    </span>
                )}
            </div>
        </section>
    );
}
