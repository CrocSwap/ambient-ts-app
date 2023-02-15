import Animation from '../../Global/Animation/Animation';
import styles from './BypassConfirmSwapButton.module.css';
import loading from '../../../assets/animations/loading4.json';
import failed from '../../../assets/animations/failedButton.json';
import success from '../../../assets/animations/successButton.json';
import { RiErrorWarningLine, RiArrowDownSLine } from 'react-icons/ri';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { useState } from 'react';
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
    // setShowConfirmation: Dispatch<SetStateAction<boolean>>;
    resetConfirmation: () => void;
    slippageTolerancePercentage: number;
    effectivePrice: number;
    isSellTokenBase: boolean;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
    sellQtyString: string;
    buyQtyString: string;
}
export default function BypassConfirmSwapButton(props: propsIF) {
    const { newSwapTransactionHash, txErrorCode, sellQtyString, buyQtyString, tokenPair } = props;

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

    const resetConfirmation = () => console.log('yes');

    const transactionDenied = <TransactionDenied resetConfirmation={resetConfirmation} />;
    const transactionException = <TransactionException resetConfirmation={resetConfirmation} />;

    const transactionSubmitted = (
        <TransactionSubmitted
            hash={newSwapTransactionHash}
            tokenBSymbol={buyTokenData.symbol}
            tokenBAddress={buyTokenData.address}
            tokenBDecimals={buyTokenData.decimals}
            tokenBImage={buyTokenData.logoURI}
        />
    );
    const confirmationDisplay =
        isTransactionException || isGasLimitException || isInsufficientFundsException
            ? transactionException
            : isTransactionDenied
            ? transactionDenied
            : transactionApproved
            ? transactionSubmitted
            : confirmSendMessage;

    const animationDisplay =
        isTransactionException || isGasLimitException || isInsufficientFundsException ? (
            <CircleLoaderFailed size='30px' />
        ) : isTransactionDenied ? (
            <CircleLoaderFailed size='30px' />
        ) : <CircleLoaderCompleted size='30px' /> ? (
            <CircleLoader size='30px' />
        ) : (
            <CircleLoader size='30px' />
        );

    const buttonText =
        isTransactionException || isGasLimitException || isInsufficientFundsException
            ? 'Transaction Exception'
            : isTransactionDenied
            ? 'Transaction Denied'
            : transactionApproved
            ? `Swapping ${sellQtyString} ${sellTokenData.symbol} for ${buyQtyString} ${buyTokenData.symbol}`
            : `Swapping ${sellQtyString} ${sellTokenData.symbol} for ${buyQtyString} ${buyTokenData.symbol}`;

    const [isLoading, setIsLoading] = useState(true);
    const [isFailed, setIsFailed] = useState(false);
    const [isGood, setIsGood] = useState(false);
    const [showExtraInfo, setShowExtraInfo] = useState(false);

    const handleFailed = () => {
        setIsLoading(false);
        setIsGood(true);
        setIsFailed(true);
    };

    const handleSuccess = () => {
        setIsLoading(false);
        setIsFailed(false);
        setIsGood(true);
    };

    return (
        <>
            <div className={styles.button_container}>
                <button
                    className={styles.button_content}
                    onClick={() => setShowExtraInfo(!showExtraInfo)}
                >
                    <div>
                        {animationDisplay}
                        {buttonText}
                    </div>

                    <RiArrowDownSLine size={20} />
                </button>

                {showExtraInfo && (
                    <section className={styles.extra_info_container}>{confirmationDisplay}</section>
                )}
            </div>
            <button onClick={handleFailed}>Failed</button>
            <button onClick={handleSuccess}> Success</button>
        </>
    );
}
