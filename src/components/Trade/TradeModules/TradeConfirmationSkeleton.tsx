// START: Import React and Dongles
import { Dispatch, SetStateAction, useContext, useState } from 'react';

// START: Import JSX Components
import WaitingConfirmation from '../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../Global/TransactionSubmitted/TransactionSubmitted';
import TransactionDenied from '../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../Global/TransactionException/TransactionException';
import Button from '../../Global/Button/Button';

// START: Import Other Local Files
import styles from './TradeConfirmationSkeleton.module.css';
import { TokenIF } from '../../../utils/interfaces/exports';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import uriToHttp from '../../../utils/functions/uriToHttp';
import ConfirmationModalControl from '../../Global/ConfirmationModalControl/ConfirmationModalControl';
import TokensArrow from '../../Global/TokensArrow/TokensArrow';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';

interface propsIF {
    type: 'Swap' | 'Limit' | 'Pool' | 'Reposition';
    tokenA: { token: TokenIF; quantity?: string };
    tokenB: { token: TokenIF; quantity?: string };
    transactionHash: string;
    txErrorCode: string;
    showConfirmation: boolean;
    statusText: string;
    initiate: () => void;
    setShowConfirmation: Dispatch<SetStateAction<boolean>>;
    resetConfirmation: () => void;
    poolTokenDisplay?: React.ReactNode;
    transactionDetails?: React.ReactNode;
    acknowledgeUpdate?: React.ReactNode;
    extraNotes?: React.ReactNode;
}

export default function TradeConfirmationSkeleton(props: propsIF) {
    const {
        type,
        initiate,
        tokenA: { token: tokenA, quantity: tokenAQuantity },
        tokenB: { token: tokenB, quantity: tokenBQuantity },
        transactionDetails,
        transactionHash,
        txErrorCode,
        statusText,
        showConfirmation,
        setShowConfirmation,
        resetConfirmation,
        poolTokenDisplay,
        acknowledgeUpdate,
        extraNotes,
    } = props;

    const {
        bypassConfirmLimit,
        bypassConfirmRange,
        bypassConfirmRepo,
        bypassConfirmSwap,
    } = useContext(UserPreferenceContext);

    const [skipFutureConfirmation, setSkipFutureConfirmation] =
        useState<boolean>(false);

    const transactionApproved = transactionHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    const formattedTokenAQuantity = getFormattedNumber({
        value: tokenAQuantity ? parseFloat(tokenAQuantity) : undefined,
        abbrevThreshold: 1000000000,
    });

    const formattedTokenBQuantity = getFormattedNumber({
        value: tokenBQuantity ? parseFloat(tokenBQuantity) : undefined,
        abbrevThreshold: 1000000000,
    });

    const tokenDisplay = (
        <>
            <div className={styles.currency_row_container}>
                <h2>{formattedTokenAQuantity}</h2>
                <div className={styles.logo_display}>
                    <TokenIcon
                        src={uriToHttp(tokenA.logoURI)}
                        alt={tokenA.symbol}
                        size='2xl'
                    />
                    <h2>{tokenA.symbol}</h2>
                </div>
            </div>
            <div className={styles.arrow_container}>
                <TokensArrow onlyDisplay />
            </div>
            <div className={styles.currency_row_container}>
                <h2>{formattedTokenBQuantity}</h2>
                <div className={styles.logo_display}>
                    <TokenIcon
                        src={uriToHttp(tokenB.logoURI)}
                        alt={tokenB.symbol}
                        size='2xl'
                    />
                    <h2>{tokenB.symbol}</h2>
                </div>
            </div>
        </>
    );

    // REGULAR CONFIRMATION MESSAGE STARTS HERE
    const confirmSendMessage = <WaitingConfirmation content={statusText} />;

    const transactionDenied = (
        <TransactionDenied resetConfirmation={resetConfirmation} />
    );
    const transactionException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    const transactionSubmitted = (
        <TransactionSubmitted
            hash={transactionHash}
            tokenBSymbol={tokenB.symbol}
            tokenBAddress={tokenB.address}
            tokenBDecimals={tokenB.decimals}
            tokenBImage={uriToHttp(tokenB.logoURI)}
            chainId={tokenB.chainId}
        />
    );

    // END OF REGULAR CONFIRMATION MESSAGE

    const confirmationDisplay = isTransactionException
        ? transactionException
        : isTransactionDenied
        ? transactionDenied
        : transactionApproved
        ? transactionSubmitted
        : confirmSendMessage;

    return (
        <div
            className={styles.modal_container}
            aria-label='Transaction Confirmation modal'
        >
            {type === 'Swap' || type === 'Limit'
                ? tokenDisplay
                : poolTokenDisplay}
            {transactionDetails && (
                <div className={styles.extra_info_container}>
                    {transactionDetails}
                </div>
            )}
            {extraNotes && extraNotes}
            <footer>
                {showConfirmation ? (
                    !acknowledgeUpdate ? (
                        <>
                            <ConfirmationModalControl
                                tempBypassConfirm={skipFutureConfirmation}
                                setTempBypassConfirm={setSkipFutureConfirmation}
                            />
                            <Button
                                title={statusText}
                                action={() => {
                                    // if this modal is launched we can infer user wants confirmation
                                    // if user enables bypass, update all settings in parallel
                                    // otherwise do not not make any change to persisted preferences
                                    if (skipFutureConfirmation) {
                                        bypassConfirmSwap.enable();
                                        bypassConfirmLimit.enable();
                                        bypassConfirmRange.enable();
                                        bypassConfirmRepo.enable();
                                    }
                                    initiate();
                                    setShowConfirmation(false);
                                }}
                                flat
                                disabled={!!acknowledgeUpdate}
                            />
                        </>
                    ) : (
                        acknowledgeUpdate
                    )
                ) : (
                    confirmationDisplay
                )}
            </footer>
        </div>
    );
}
