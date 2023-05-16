// START: Import React and Dongles
import { Dispatch, memo, SetStateAction } from 'react';
// import { CrocImpact } from '@crocswap-libs/sdk';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';

// START: Import JSX Components
// import TransactionFailed from '../../Global/TransactionFailed/TransactionFailed';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionDenied from '../../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../../Global/TransactionException/TransactionException';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import {
    CircleLoader,
    CircleLoaderCompleted,
    CircleLoaderFailed,
} from '../../../Global/LoadingAnimations/CircleLoader/CircleLoader';

// START: Import Other Local Files
import styles from './BypassConfirmRepositionButton.module.css';
import { TokenPairIF } from '../../../../utils/interfaces/TokenPairIF';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../../../utils/interfaces/exports';

interface propsIF {
    tokenPair: TokenPairIF;
    txErrorCode: string;
    resetConfirmation: () => void;
    onSend: () => void;
    newRepositionTransactionHash: string;
    setNewRepositionTransactionHash: Dispatch<SetStateAction<string>>;
    showBypassConfirm: boolean;
    setShowBypassConfirm: Dispatch<SetStateAction<boolean>>;
    showExtraInfo: boolean;
    setShowExtraInfo: Dispatch<SetStateAction<boolean>>;
}

function BypassConfirmRepositionButton(props: propsIF) {
    const {
        newRepositionTransactionHash,
        txErrorCode,
        tokenPair,
        onSend,
        resetConfirmation,
        showExtraInfo,
        setShowExtraInfo,

        // showBypassConfirm,
        // setShowBypassConfirm,
        // setNewRepositionTransactionHash,
    } = props;

    const receiptData = useAppSelector((state) => state.receiptData);

    const transactionApproved = newRepositionTransactionHash !== '';
    const isTransactionDenied: boolean = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    const sellTokenData: TokenIF = tokenPair.dataTokenA;
    const buyTokenData: TokenIF = tokenPair.dataTokenB;

    const transactionSubmitted = (
        <TransactionSubmitted
            hash={newRepositionTransactionHash}
            tokenBSymbol={buyTokenData.symbol}
            tokenBAddress={buyTokenData.address}
            tokenBDecimals={buyTokenData.decimals}
            tokenBImage={buyTokenData.logoURI}
            chainId={buyTokenData.chainId}
            noAnimation
            reposition
        />
    );

    const confirmSendMessage = (
        <WaitingConfirmation
            noAnimation
            content={`Repositioning transaction with ${sellTokenData.symbol} and  ${buyTokenData.symbol}. 
            `}
        />
    );

    function handleReset() {
        resetConfirmation();
        setShowExtraInfo(false);
    }

    const transactionDenied = (
        <TransactionDenied
            noAnimation
            resetConfirmation={handleReset}
            initiateTx={onSend}
        />
    );

    // const transactionFailed = (
    //     <TransactionFailed
    //         noAnimation
    //         resetConfirmation={handleReset}
    //         initiateTx={initiateSwapMethod}
    //     />
    // );
    const transactionException = (
        <TransactionException
            noAnimation
            resetConfirmation={handleReset}
            initiateTx={onSend}
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

    const confirmationDisplay = isTransactionException
        ? transactionException
        : isTransactionDenied
        ? transactionDenied
        : transactionApproved
        ? transactionSubmitted
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
        ? 'Reposition Exception'
        : isTransactionDenied
        ? 'Reposition Denied'
        : lastReceipt && !isLastReceiptSuccess
        ? 'Reposition Failed'
        : transactionApproved
        ? 'Reposition Submitted'
        : `Repositioning transaction with ${sellTokenData.symbol} and  ${buyTokenData.symbol}. `;

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
                    <section
                        className={styles.extra_info_container}
                        tabIndex={0}
                        aria-live='polite'
                        aria-atomic='true'
                        aria-relevant='additions text'
                    >
                        {confirmationDisplay}
                    </section>
                )}
                {/* <span className={styles.close_icon_container}>
                    <button
                        tabIndex={0}
                        onClick={() => {
                            resetConfirmation();
                            setShowBypassConfirm(false);
                            setNewRepositionTransactionHash('');
                        }}
                    >
                        Submit another transaction
                    </button>
                </span> */}
            </div>
        </section>
    );
}

export default memo(BypassConfirmRepositionButton);
