import styles from './BypassConfirmSwapButton.module.css';

import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';

import { Dispatch, SetStateAction } from 'react';
import { CrocImpact } from '@crocswap-libs/sdk';

import {
    CircleLoader,
    CircleLoaderCompleted,
    CircleLoaderFailed,
} from '../../Global/LoadingAnimations/CircleLoader/CircleLoader';
import { TokenPairIF } from '../../../utils/interfaces/TokenPairIF';
import WaitingConfirmation from '../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionDenied from '../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../Global/TransactionException/TransactionException';
import TransactionSubmitted from '../../Global/TransactionSubmitted/TransactionSubmitted';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import TransactionFailed from '../../Global/TransactionFailed/TransactionFailed';

interface propsIF {
    initiateSwapMethod: () => void;
    poolPriceDisplay: number | undefined;
    isDenomBase: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    priceImpact: CrocImpact | undefined;
    onClose: () => void;
    newSwapTransactionHash: string;
    tokenPair: TokenPairIF;
    txErrorCode: string;
    txErrorMessage: string;
    showConfirmation: boolean;
    setShowBypassConfirm: Dispatch<SetStateAction<boolean>>;
    resetConfirmation: () => void;
    slippageTolerancePercentage: number;
    effectivePrice: number;
    isSellTokenBase: boolean;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
    sellQtyString: string;
    buyQtyString: string;
    setNewSwapTransactionHash: Dispatch<SetStateAction<string>>;
    showBypassConfirm: boolean;
    showExtraInfo: boolean;
    setShowExtraInfo: Dispatch<SetStateAction<boolean>>;
}
export default function BypassConfirmSwapButton(props: propsIF) {
    const receiptData = useAppSelector((state) => state.receiptData);

    const {
        initiateSwapMethod,
        newSwapTransactionHash,
        setNewSwapTransactionHash,
        txErrorCode,
        sellQtyString,
        buyQtyString,
        tokenPair,
        resetConfirmation,
        setShowBypassConfirm,
        showExtraInfo,
        setShowExtraInfo,
    } = props;

    const transactionApproved = newSwapTransactionHash !== '';
    // console.log({ txErrorCode });
    // console.log({ txErrorMessage });
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode === 'CALL_EXCEPTION';
    const isGasLimitException = txErrorCode === 'UNPREDICTABLE_GAS_LIMIT';
    const isInsufficientFundsException = txErrorCode === 'INSUFFICIENT_FUNDS';

    const sellTokenData = tokenPair.dataTokenA;

    const buyTokenData = tokenPair.dataTokenB;

    const confirmSendMessage = (
        <WaitingConfirmation
            noAnimation
            content={`Swapping ${sellQtyString} ${sellTokenData.symbol} for ${buyQtyString} ${
                buyTokenData.symbol
            }. Please check the ${'Metamask'} extension in your browser for notifications.
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
            initiateTx={initiateSwapMethod}
        />
    );
    const transactionFailed = (
        <TransactionFailed
            noAnimation
            resetConfirmation={handleReset}
            initiateTx={initiateSwapMethod}
        />
    );
    const transactionException = (
        <TransactionException
            noAnimation
            resetConfirmation={handleReset}
            initiateTx={initiateSwapMethod}
        />
    );

    const lastReceipt =
        receiptData?.sessionReceipts.length > 0
            ? JSON.parse(receiptData.sessionReceipts[receiptData.sessionReceipts.length - 1])
            : null;

    const isLastReceiptSuccess = lastReceipt?.status === 1;

    const transactionSubmitted = (
        <TransactionSubmitted
            hash={newSwapTransactionHash}
            tokenBSymbol={buyTokenData.symbol}
            tokenBAddress={buyTokenData.address}
            tokenBDecimals={buyTokenData.decimals}
            tokenBImage={buyTokenData.logoURI}
            noAnimation
        />
    );
    const confirmationDisplay =
        isTransactionException || isGasLimitException || isInsufficientFundsException
            ? transactionException
            : isTransactionDenied
            ? transactionDenied
            : transactionApproved
            ? transactionSubmitted
            : lastReceipt && !isLastReceiptSuccess
            ? transactionFailed
            : confirmSendMessage;

    const buttonColor =
        isTransactionException || isGasLimitException || isInsufficientFundsException
            ? 'orange'
            : isTransactionDenied || (lastReceipt && !isLastReceiptSuccess)
            ? 'var(--negative)'
            : transactionApproved
            ? 'var(--positive)'
            : 'var(--text-highlight-dark)';

    const animationDisplay =
        isTransactionException || isGasLimitException || isInsufficientFundsException ? (
            <CircleLoaderFailed size='30px' />
        ) : isTransactionDenied || (lastReceipt && !isLastReceiptSuccess) ? (
            <CircleLoaderFailed size='30px' />
        ) : transactionApproved ? (
            <CircleLoaderCompleted size='30px' />
        ) : (
            <CircleLoader size='30px' />
        );

    const buttonText =
        isTransactionException || isGasLimitException || isInsufficientFundsException
            ? 'Transaction Exception'
            : isTransactionDenied
            ? 'Transaction Denied'
            : lastReceipt && !isLastReceiptSuccess
            ? 'Transaction Failed'
            : transactionApproved
            ? 'Transaction Submitted'
            : `Swapping ${sellQtyString} ${sellTokenData.symbol} for ${buyQtyString} ${buyTokenData.symbol}`;

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
                    {showExtraInfo ? <RiArrowUpSLine size={20} /> : <RiArrowDownSLine size={20} />}
                </button>

                {showExtraInfo && (
                    <section className={styles.extra_info_container}>{confirmationDisplay}</section>
                )}
                <span className={styles.close_icon_container}>
                    <button
                        onClick={() => {
                            resetConfirmation();
                            setShowBypassConfirm(false);
                            setNewSwapTransactionHash('');
                        }}
                    >
                        Submit another transaction
                    </button>
                </span>
            </div>
        </section>
    );
}

// setShowBypassConfirm => True => Render the new button(tx denied)
// setShowBypassConfirm => False => Render Open Confirmation button

// For users with skip this confirmation
// Click swap now button => initiates swap and renders new button => setShowBypassConfirm(true)
// When receipt is successful, we render the old button => setShowBypassConfirm(false)
