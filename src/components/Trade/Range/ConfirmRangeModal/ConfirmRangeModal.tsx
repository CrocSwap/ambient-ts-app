// START: Import React and Dongles
import { useState, Dispatch, SetStateAction } from 'react';

// START: Import JSX Functional Components
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import Button from '../../../Global/Button/Button';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import TransactionDenied from '../../../Global/TransactionDenied/TransactionDenied';
import ConfirmationModalControl from '../../../Global/ConfirmationModalControl/ConfirmationModalControl';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';
import SelectedRange from './SelectedRange/SelectedRange';
import TransactionException from '../../../Global/TransactionException/TransactionException';

// START: Import Local Files
import styles from './ConfirmRangeModal.module.css';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { allSkipConfirmMethodsIF } from '../../../../App/hooks/useSkipConfirm';

interface propsIF {
    sendTransaction: () => void;
    closeModal: () => void;
    newRangeTransactionHash: string;
    setNewRangeTransactionHash: Dispatch<SetStateAction<string>>;
    tokenPair: TokenPairIF;
    poolPriceDisplayNum: number;
    spotPriceDisplay: string;
    maxPriceDisplay: string;
    minPriceDisplay: string;
    denominationsInBase: boolean;
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
    txErrorMessage: string;
    resetConfirmation: () => void;
    bypassConfirm: allSkipConfirmMethodsIF;
    isAdd: boolean;
    tokenAQtyLocal: number;
    tokenBQtyLocal: number;
}

export default function ConfirmRangeModal(props: propsIF) {
    const {
        sendTransaction,
        newRangeTransactionHash,
        minPriceDisplay,
        maxPriceDisplay,
        spotPriceDisplay,
        poolPriceDisplayNum,
        tokenPair,
        denominationsInBase,
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
        bypassConfirm,
        isAdd,
        tokenAQtyLocal,
        tokenBQtyLocal,
    } = props;

    const { dataTokenA, dataTokenB } = tokenPair;

    const txApproved = newRangeTransactionHash !== '';
    const isTxDenied = txErrorCode === 'ACTION_REJECTED';
    const isTxException = txErrorCode !== '' && !isTxDenied;

    const localeTokenAString =
        tokenAQtyLocal > 999
            ? tokenAQtyLocal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : tokenAQtyLocal.toString();

    const localeTokenBString =
        tokenBQtyLocal > 999
            ? tokenBQtyLocal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : tokenBQtyLocal.toString();

    const txDenied = (
        <TransactionDenied resetConfirmation={resetConfirmation} />
    );
    const txException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    const txSubmitted = (
        <TransactionSubmitted
            hash={newRangeTransactionHash}
            tokenBSymbol={dataTokenB.symbol}
            tokenBAddress={dataTokenB.address}
            tokenBDecimals={dataTokenB.decimals}
            tokenBImage={dataTokenB.logoURI}
            chainId={dataTokenB.chainId}
            range
        />
    );

    const tokenACharacter: string = getUnicodeCharacter(dataTokenA.symbol);
    const tokenBCharacter: string = getUnicodeCharacter(dataTokenB.symbol);

    // this is the starting state for the bypass confirmation toggle switch
    // if this modal is being shown, we can assume bypass is disabled
    const [currentSkipConfirm, setCurrentSkipConfirm] =
        useState<boolean>(false);

    const fullTxDetails = (
        <>
            <section className={styles.position_display}>
                <div className={styles.token_display}>
                    <div className={styles.tokens}>
                        {dataTokenA.logoURI ? (
                            <img
                                src={dataTokenA.logoURI}
                                alt={dataTokenA.name}
                            />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={dataTokenA.symbol.charAt(0)}
                                width='30px'
                            />
                        )}
                        {dataTokenB.logoURI ? (
                            <img
                                src={dataTokenB.logoURI}
                                alt={dataTokenB.name}
                            />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={dataTokenB.symbol.charAt(0)}
                                width='30px'
                            />
                        )}
                    </div>
                    <span className={styles.token_symbol}>
                        {dataTokenA.symbol}/{dataTokenB.symbol}
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
                            {dataTokenA.logoURI ? (
                                <img
                                    src={dataTokenA.logoURI}
                                    alt={dataTokenA.name}
                                />
                            ) : (
                                <NoTokenIcon
                                    tokenInitial={dataTokenA.symbol.charAt(0)}
                                    width='20px'
                                />
                            )}
                            <span>{dataTokenA.symbol}</span>
                        </div>
                        <span>
                            {localeTokenAString !== ''
                                ? tokenACharacter + localeTokenAString
                                : '0'}
                        </span>
                    </div>
                    <div className={styles.detail_line}>
                        <div>
                            {dataTokenB.logoURI ? (
                                <img
                                    src={dataTokenB.logoURI}
                                    alt={dataTokenB.name}
                                />
                            ) : (
                                <NoTokenIcon
                                    tokenInitial={dataTokenB.symbol.charAt(0)}
                                    width='20px'
                                />
                            )}
                            <span>{dataTokenB.symbol}</span>
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
                    minPriceDisplay={minPriceDisplay}
                    maxPriceDisplay={maxPriceDisplay}
                    spotPriceDisplay={spotPriceDisplay}
                    poolPriceDisplayNum={poolPriceDisplayNum}
                    tokenPair={tokenPair}
                    denominationsInBase={denominationsInBase}
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
            } ${dataTokenA.symbol} and ${
                localeTokenBString ? localeTokenBString : '0'
            } ${dataTokenB.symbol}. `}
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
                                ? `Add to ${
                                      isAmbient ? 'Ambient' : 'Range'
                                  } Position`
                                : `Create ${
                                      isAmbient ? 'Ambient' : 'Range'
                                  } Position`
                        }
                        action={() => {
                            // if this modal is launched we can infer user wants confirmation
                            // if user enables bypass, update all settings in parallel
                            // otherwise do not not make any change to persisted preferences
                            if (currentSkipConfirm) {
                                bypassConfirm.swap.enable();
                                bypassConfirm.limit.enable();
                                bypassConfirm.range.enable();
                                bypassConfirm.repo.enable();
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
