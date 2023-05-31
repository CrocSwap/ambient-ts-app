import styles from './ConfirmRepositionModal.module.css';
import Button from '../../../Global/Button/Button';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { Dispatch, SetStateAction, useContext, useState } from 'react';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import TransactionDenied from '../../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../../Global/TransactionException/TransactionException';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import SelectedRange from '../../Range/ConfirmRangeModal/SelectedRange/SelectedRange';
import ConfirmationModalControl from '../../../Global/ConfirmationModalControl/ConfirmationModalControl';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

interface propsIF {
    onClose: () => void;
    position: PositionIF;
    newRepositionTransactionHash: string;
    rangeWidthPercentage: number;
    currentPoolPriceTick: number;
    currentPoolPriceDisplay: string;
    onSend: () => void;
    setMaxPrice: Dispatch<SetStateAction<number>>;
    setMinPrice: Dispatch<SetStateAction<number>>;
    showConfirmation: boolean;
    setShowConfirmation: Dispatch<SetStateAction<boolean>>;
    resetConfirmation: () => void;
    txErrorCode: string;
    txErrorMessage: string;
    minPriceDisplay: string;
    maxPriceDisplay: string;
    currentBaseQtyDisplayTruncated: string;
    currentQuoteQtyDisplayTruncated: string;
    isAmbient: boolean;
    pinnedMinPriceDisplayTruncatedInBase: string;
    pinnedMinPriceDisplayTruncatedInQuote: string;
    pinnedMaxPriceDisplayTruncatedInBase: string;
    pinnedMaxPriceDisplayTruncatedInQuote: string;
    newBaseQtyDisplay: string;
    newQuoteQtyDisplay: string;
    isTokenABase: boolean;
    isPositionInRange: boolean;
}

export default function ConfirmRepositionModal(props: propsIF) {
    const {
        isAmbient,
        pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote,
        onSend,
        showConfirmation,
        setShowConfirmation,
        newRepositionTransactionHash,
        resetConfirmation,
        txErrorCode,
        minPriceDisplay,
        maxPriceDisplay,
        currentBaseQtyDisplayTruncated,
        currentQuoteQtyDisplayTruncated,
        newBaseQtyDisplay,
        newQuoteQtyDisplay,
        isTokenABase,
        isPositionInRange,
    } = props;
    const {
        bypassConfirmLimit,
        bypassConfirmRange,
        bypassConfirmRepo,
        bypassConfirmSwap,
    } = useContext(UserPreferenceContext);

    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);

    const baseToken = isTokenABase ? tokenA : tokenB;
    const quoteToken = isTokenABase ? tokenB : tokenA;

    const txApproved = newRepositionTransactionHash !== '';
    const isTxDenied: boolean = txErrorCode === 'ACTION_REJECTED';

    const isTxException = txErrorCode !== '' && !isTxDenied;

    const txSubmitted = (
        <TransactionSubmitted
            hash={newRepositionTransactionHash}
            tokenBSymbol={tokenB.symbol}
            tokenBAddress={tokenB.address}
            tokenBDecimals={tokenB.decimals}
            tokenBImage={tokenB.logoURI}
            chainId={tokenB.chainId}
            reposition
        />
    );

    const confirmSendMessage = (
        <WaitingConfirmation content={'Repositioning'} />
    );

    const txDenied = (
        <TransactionDenied resetConfirmation={resetConfirmation} />
    );
    const txException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    const confirmationDisplay: JSX.Element = isTxException
        ? txException
        : isTxDenied
        ? txDenied
        : txApproved
        ? txSubmitted
        : confirmSendMessage;

    // ------------------------------------

    const tokenAmountDisplay = (
        <section className={styles.fee_tier_display}>
            <div className={styles.fee_tier_container}>
                <div className={styles.detail_line}>
                    <div>
                        {baseToken.logoURI ? (
                            <img src={baseToken.logoURI} alt={baseToken.name} />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={baseToken.symbol?.charAt(0)}
                                width='20px'
                            />
                        )}
                        <span>Current {baseToken.symbol} Collateral</span>
                    </div>
                    <span>{currentBaseQtyDisplayTruncated}</span>
                </div>

                <div className={styles.detail_line}>
                    <div>
                        {tokenA.logoURI ? (
                            <img src={baseToken.logoURI} alt={baseToken.name} />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={baseToken.symbol?.charAt(0)}
                                width='20px'
                            />
                        )}
                        <span> {baseToken.symbol} After Reposition</span>
                    </div>
                    <span>{newBaseQtyDisplay}</span>
                </div>
                <p className={styles.divider} />

                <div className={styles.detail_line}>
                    <div>
                        {quoteToken.logoURI ? (
                            <img
                                src={quoteToken.logoURI}
                                alt={quoteToken.name}
                            />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={quoteToken.symbol?.charAt(0)}
                                width='20px'
                            />
                        )}
                        <span>Current {quoteToken.symbol} Collateral</span>
                    </div>
                    <span>{currentQuoteQtyDisplayTruncated}</span>
                </div>
                <div className={styles.detail_line}>
                    <div>
                        {quoteToken.logoURI ? (
                            <img
                                src={quoteToken.logoURI}
                                alt={quoteToken.name}
                            />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={quoteToken.symbol?.charAt(0)}
                                width='20px'
                            />
                        )}
                        <span>{quoteToken.symbol} After Reposition</span>
                    </div>
                    <span>{newQuoteQtyDisplay}</span>
                </div>
            </div>
        </section>
    );

    // this is the starting state for the bypass confirmation toggle switch
    // if this modal is being shown, we can assume bypass is disabled
    const [currentSkipConfirm, setCurrentSkipConfirm] =
        useState<boolean>(false);

    const fullTxDetails2 = (
        <>
            <section className={styles.position_display}>
                <div className={styles.token_display}>
                    <div className={styles.tokens}>
                        {tokenA.logoURI ? (
                            <img src={tokenA.logoURI} alt={tokenA.name} />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={tokenA.symbol?.charAt(0)}
                                width='30px'
                            />
                        )}
                        {tokenB.logoURI ? (
                            <img src={tokenB.logoURI} alt={tokenB.name} />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={tokenB.symbol?.charAt(0)}
                                width='30px'
                            />
                        )}
                    </div>
                    <span className={styles.token_symbol}>
                        {tokenA.symbol}/{tokenB.symbol}
                    </span>
                </div>
                <RangeStatus
                    isInRange={true}
                    isEmpty={false}
                    isAmbient={false}
                />
            </section>
            {tokenAmountDisplay}
            {isAmbient || (
                <SelectedRange
                    minPriceDisplay={minPriceDisplay}
                    maxPriceDisplay={maxPriceDisplay}
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

    return (
        <div className={styles.confirm_range_modal_container}>
            <div>{showConfirmation ? fullTxDetails2 : confirmationDisplay}</div>
            <footer className={styles.modal_footer}>
                {showConfirmation && (
                    <Button
                        title={
                            isPositionInRange
                                ? 'Position Currently In Range'
                                : 'Send Reposition'
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
                            setShowConfirmation(false);
                            onSend();
                        }}
                        disabled={isPositionInRange}
                        flat
                    />
                )}
            </footer>
        </div>
    );
}
