// START: Import React and Dongles
import { Dispatch, SetStateAction } from 'react';
import { CrocImpact } from '@crocswap-libs/sdk';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';

// START: Import JSX Components
// import TransactionFailed from '../../Global/TransactionFailed/TransactionFailed';
import WaitingConfirmation from '../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionDenied from '../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../Global/TransactionException/TransactionException';
import TransactionSubmitted from '../../Global/TransactionSubmitted/TransactionSubmitted';
import {
    CircleLoader,
    CircleLoaderCompleted,
    CircleLoaderFailed,
} from '../../Global/LoadingAnimations/CircleLoader/CircleLoader';

// START: Import Other Local Files
import styles from './BypassConfirmSwapButton.module.css';
import { TokenPairIF } from '../../../utils/interfaces/TokenPairIF';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../../utils/interfaces/exports';

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
    sellQtyString: string;
    buyQtyString: string;
    setNewSwapTransactionHash: Dispatch<SetStateAction<string>>;
    showBypassConfirm: boolean;
    showExtraInfo: boolean;
    setShowExtraInfo: Dispatch<SetStateAction<boolean>>;
}

export default function BypassConfirmSwapButton(props: propsIF) {
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

    const receiptData = useAppSelector((state) => state.receiptData);

    const transactionApproved = newSwapTransactionHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    const sellTokenData: TokenIF = tokenPair.dataTokenA;
    const buyTokenData: TokenIF = tokenPair.dataTokenB;

    const confirmSendMessage = (
        <WaitingConfirmation
            noAnimation
            content={`Swapping ${sellQtyString} ${sellTokenData.symbol} for ${buyQtyString} ${buyTokenData.symbol} 
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

    const transactionException = (
        <TransactionException
            noAnimation
            resetConfirmation={handleReset}
            initiateTx={initiateSwapMethod}
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
            hash={newSwapTransactionHash}
            tokenBSymbol={buyTokenData.symbol}
            tokenBAddress={buyTokenData.address}
            tokenBDecimals={buyTokenData.decimals}
            tokenBImage={buyTokenData.logoURI}
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
                <span className={styles.close_icon_container}>
                    <button
                        tabIndex={0}
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
