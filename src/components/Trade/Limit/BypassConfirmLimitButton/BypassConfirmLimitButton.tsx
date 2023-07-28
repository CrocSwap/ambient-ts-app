import styles from './BypassConfirmLimitButton.module.css';
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
import { useState, Dispatch, SetStateAction, memo } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import TransactionFailed from '../../../Global/TransactionFailed/TransactionFailed';
import uriToHttp from '../../../../utils/functions/uriToHttp';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';

interface propsIF {
    newLimitOrderTransactionHash: string;
    txErrorCode: string;
    tokenAInputQty: string;
    tokenBInputQty: string;
    resetConfirmation: () => void;
    setShowBypassConfirmButton: Dispatch<SetStateAction<boolean>>;
    sendLimitOrder: () => Promise<void>;
    setNewLimitOrderTransactionHash: Dispatch<SetStateAction<string>>;
}
function BypassConfirmLimitButton(props: propsIF) {
    const {
        newLimitOrderTransactionHash,
        txErrorCode,
        tokenAInputQty,
        tokenBInputQty,
        resetConfirmation,
        sendLimitOrder,
        setShowBypassConfirmButton,
        setNewLimitOrderTransactionHash,
    } = props;

    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);
    const receiptData = useAppSelector((state) => state.receiptData);

    const transactionApproved = newLimitOrderTransactionHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    const sellTokenQty = getFormattedNumber({
        value: parseFloat(tokenAInputQty),
    });
    const buyTokenQty = getFormattedNumber({
        value: parseFloat(tokenBInputQty),
    });

    const sellTokenData = tokenA;
    const buyTokenData = tokenB;

    const confirmSendMessage = (
        <WaitingConfirmation
            noAnimation
            content={` Submitting Limit Order to Swap ${sellTokenQty} ${sellTokenData.symbol} for ${buyTokenQty} ${buyTokenData.symbol}. `}
        />
    );

    function handleReset() {
        resetConfirmation();
        setShowExtraInfo(false);
    }

    const transactionDenied = (
        <TransactionDenied
            resetConfirmation={handleReset}
            noAnimation
            initiateTx={sendLimitOrder}
        />
    );
    const transactionFailed = (
        <TransactionFailed
            noAnimation
            resetConfirmation={handleReset}
            initiateTx={sendLimitOrder}
        />
    );
    const transactionException = (
        <TransactionException
            resetConfirmation={handleReset}
            initiateTx={sendLimitOrder}
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
            hash={newLimitOrderTransactionHash}
            tokenBSymbol={buyTokenData.symbol}
            tokenBAddress={buyTokenData.address}
            tokenBDecimals={buyTokenData.decimals}
            tokenBImage={uriToHttp(buyTokenData.logoURI)}
            chainId={buyTokenData.chainId}
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
        : `Submitting Limit Order to Swap ${sellTokenQty} ${sellTokenData.symbol} for ${buyTokenQty} ${buyTokenData.symbol}`;

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
                            setNewLimitOrderTransactionHash('');
                        }}
                    >
                        Submit another transaction
                    </button>
                </span>
            </div>
        </section>
    );
}

export default memo(BypassConfirmLimitButton);
