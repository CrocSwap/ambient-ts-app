// START: Import React and Dongles
import { useState, Dispatch, SetStateAction, useContext, memo } from 'react';

// START: Import JSX Functional Components
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import Button from '../../../Global/Button/Button';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import TransactionDenied from '../../../Global/TransactionDenied/TransactionDenied';
import ConfirmationModalControl from '../../../Global/ConfirmationModalControl/ConfirmationModalControl';
import SelectedRange from './SelectedRange/SelectedRange';
import TransactionException from '../../../Global/TransactionException/TransactionException';

// START: Import Local Files
import styles from './ConfirmRangeModal.module.css';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';
import { getFormattedTokenBalance } from '../../../../App/functions/getFormattedTokenBalance';

interface propsIF {
    sendTransaction: () => void;
    newRangeTransactionHash: string;
    spotPriceDisplay: string;
    maxPriceDisplay: string;
    minPriceDisplay: string;
    isTokenABase: boolean;
    isAmbient: boolean;
    isInRange: boolean;
    pinnedMinPriceDisplayTruncatedInBase: string;
    pinnedMinPriceDisplayTruncatedInQuote: string;
    pinnedMaxPriceDisplayTruncatedInBase: string;
    pinnedMaxPriceDisplayTruncatedInQuote: string;
    showConfirmation: boolean;
    setShowConfirmation: Dispatch<SetStateAction<boolean>>;
    txErrorCode: string;
    resetConfirmation: () => void;
    isAdd: boolean;
    tokenAQtyLocal: number;
    tokenBQtyLocal: number;
}

function ConfirmRangeModal(props: propsIF) {
    const {
        sendTransaction,
        newRangeTransactionHash,
        isTokenABase,
        isAmbient,
        isInRange,
        pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote,
        txErrorCode,
        showConfirmation,
        setShowConfirmation,
        resetConfirmation,
        isAdd,
        tokenAQtyLocal,
        tokenBQtyLocal,
    } = props;

    const {
        bypassConfirmLimit,
        bypassConfirmRange,
        bypassConfirmRepo,
        bypassConfirmSwap,
    } = useContext(UserPreferenceContext);
    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);

    const txApproved = newRangeTransactionHash !== '';
    const isTxDenied = txErrorCode === 'ACTION_REJECTED';
    const isTxException = txErrorCode !== '' && !isTxDenied;

    const localeTokenAString = getFormattedTokenBalance({
        balance: tokenAQtyLocal,
    });
    const localeTokenBString = getFormattedTokenBalance({
        balance: tokenBQtyLocal,
    });

    const txDenied = (
        <TransactionDenied resetConfirmation={resetConfirmation} />
    );
    const txException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    const txSubmitted = (
        <TransactionSubmitted
            hash={newRangeTransactionHash}
            tokenBSymbol={tokenB.symbol}
            tokenBAddress={tokenB.address}
            tokenBDecimals={tokenB.decimals}
            tokenBImage={tokenB.logoURI}
            chainId={tokenB.chainId}
            range
        />
    );

    const tokenACharacter: string = getUnicodeCharacter(tokenA.symbol);
    const tokenBCharacter: string = getUnicodeCharacter(tokenB.symbol);

    // this is the starting state for the bypass confirmation toggle switch
    // if this modal is being shown, we can assume bypass is disabled
    const [currentSkipConfirm, setCurrentSkipConfirm] =
        useState<boolean>(false);

    const fullTxDetails = (
        <>
            <section className={styles.position_display}>
                <div className={styles.token_display}>
                    <div className={styles.tokens}>
                        <TokenIcon
                            src={tokenA.logoURI}
                            alt={tokenA.name}
                            size='2xl'
                        />
                        <TokenIcon
                            src={tokenB.logoURI}
                            alt={tokenB.name}
                            size='2xl'
                        />
                    </div>
                    <span className={styles.token_symbol}>
                        {tokenA.symbol}/{tokenB.symbol}
                    </span>
                </div>
                <RangeStatus
                    isInRange={isInRange}
                    isEmpty={false}
                    isAmbient={isAmbient}
                />
            </section>
            <section className={styles.fee_tier_display}>
                <div className={styles.fee_tier_container}>
                    <div className={styles.detail_line}>
                        <div>
                            <TokenIcon
                                src={tokenA.logoURI}
                                alt={tokenA.name}
                                size='m'
                            />
                            <span>{tokenA.symbol}</span>
                        </div>
                        <span>
                            {localeTokenAString !== ''
                                ? tokenACharacter + localeTokenAString
                                : '0'}
                        </span>
                    </div>
                    <div className={styles.detail_line}>
                        <div>
                            <TokenIcon
                                src={tokenB.logoURI}
                                alt={tokenB.name}
                                size='m'
                            />
                            <span>{tokenB.symbol}</span>
                        </div>
                        <span>
                            {localeTokenBString
                                ? tokenBCharacter + localeTokenBString
                                : '0'}
                        </span>
                    </div>
                </div>
            </section>
            {isAmbient || (
                <SelectedRange
                    isTokenABase={isTokenABase}
                    isAmbient={isAmbient}
                    pinnedMinPriceDisplayTruncatedInBase={
                        pinnedMinPriceDisplayTruncatedInBase
                    }
                    pinnedMinPriceDisplayTruncatedInQuote={
                        pinnedMinPriceDisplayTruncatedInQuote
                    }
                    pinnedMaxPriceDisplayTruncatedInBase={
                        pinnedMaxPriceDisplayTruncatedInBase
                    }
                    pinnedMaxPriceDisplayTruncatedInQuote={
                        pinnedMaxPriceDisplayTruncatedInQuote
                    }
                />
            )}
            <ConfirmationModalControl
                tempBypassConfirm={currentSkipConfirm}
                setTempBypassConfirm={setCurrentSkipConfirm}
            />
        </>
    );

    // CONFIRMATION LOGIC STARTS HERE
    const confirmSendMessage = (
        <WaitingConfirmation
            content={`Minting a Position with ${
                localeTokenAString ? localeTokenAString : '0'
            } ${tokenA.symbol} and ${
                localeTokenBString ? localeTokenBString : '0'
            } ${tokenB.symbol} `}
        />
    );

    const confirmationDisplay: JSX.Element = isTxException
        ? txException
        : isTxDenied
        ? txDenied
        : txApproved
        ? txSubmitted
        : confirmSendMessage;

    return (
        <div className={styles.confirm_range_modal_container}>
            <div>{showConfirmation ? fullTxDetails : confirmationDisplay}</div>
            <footer className={styles.modal_footer}>
                {showConfirmation && (
                    <Button
                        title={
                            isAdd
                                ? `Add ${isAmbient ? 'Ambient' : ''} Liquidity`
                                : `Submit ${
                                      isAmbient ? 'Ambient' : ''
                                  } Liquidity`
                        }
                        action={() => {
                            // if this modal is launched we can infer user wants confirmation
                            // if user enables bypass, update all settings in parallel
                            // otherwise do not not make any change to persisted preferences
                            if (currentSkipConfirm) {
                                bypassConfirmSwap.enable();
                                bypassConfirmLimit.enable();
                                bypassConfirmRange.enable();
                                bypassConfirmRepo.enable();
                            }
                            sendTransaction();
                            setShowConfirmation(false);
                        }}
                        flat
                    />
                )}
            </footer>
        </div>
    );
}

export default memo(ConfirmRangeModal);
