// START: Import React and Dongles
import { useState, Dispatch, SetStateAction } from 'react';

// START: Import JSX Functional Components
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import Button from '../../../Global/Button/Button';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import TransactionDenied from '../../../Global/TransactionDenied/TransactionDenied';

// START: Import Local Files
import styles from './ConfirmRangeModal.module.css';
import SelectedRange from './SelectedRange/SelectedRange';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import ConfirmationModalControl from '../../../Global/ConfirmationModalControl/ConfirmationModalControl';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';
import TransactionException from '../../../Global/TransactionException/TransactionException';
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
    } = props;

    const { dataTokenA, dataTokenB } = tokenPair;

    const transactionApproved = newRangeTransactionHash !== '';

    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode === 'CALL_EXCEPTION';
    const isGasLimitException = txErrorCode === 'UNPREDICTABLE_GAS_LIMIT';
    const isInsufficientFundsException = txErrorCode === 'INSUFFICIENT_FUNDS';

    const transactionDenied = (
        <TransactionDenied resetConfirmation={resetConfirmation} />
    );
    const transactionException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    const transactionSubmitted = (
        <TransactionSubmitted
            hash={newRangeTransactionHash}
            tokenBSymbol={dataTokenB.symbol}
            tokenBAddress={dataTokenB.address}
            tokenBDecimals={dataTokenB.decimals}
            tokenBImage={dataTokenB.logoURI}
            range
        />
    );

    const tokenAQty = (
        document.getElementById('A-range-quantity') as HTMLInputElement
    )?.value;
    const tokenBQty = (
        document.getElementById('B-range-quantity') as HTMLInputElement
    )?.value;

    const tokenACharacter = getUnicodeCharacter(dataTokenA.symbol);
    const tokenBCharacter = getUnicodeCharacter(dataTokenB.symbol);

    const selectedRangeOrNull = !isAmbient ? (
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
    ) : null;

    const [currentSkipConfirm, setCurrentSkipConfirm] = useState<boolean>(
        bypassConfirm.range.isEnabled,
    );

    const toggleFor = 'range';

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
                            {tokenAQty !== ''
                                ? tokenACharacter + tokenAQty
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
                            {tokenBQty !== ''
                                ? tokenBCharacter + tokenBQty
                                : '0'}
                        </span>
                    </div>
                </div>
            </section>
            {selectedRangeOrNull}
            <ConfirmationModalControl
                tempBypassConfirm={currentSkipConfirm}
                setTempBypassConfirm={setCurrentSkipConfirm}
                toggleFor={toggleFor}
            />
        </>
    );

    // CONFIRMATION LOGIC STARTS HERE
    const confirmSendMessage = (
        <WaitingConfirmation
            content={`Minting a Position with ${tokenAQty ? tokenAQty : '0'} ${
                dataTokenA.symbol
            } and ${tokenBQty ? tokenBQty : '0'} ${dataTokenB.symbol}. 
            
                Please check the ${'Metamask'} extension in your browser for notifications.`}
        />
    );

    const confirmationDisplay =
        isTransactionException ||
        isGasLimitException ||
        isInsufficientFundsException
            ? transactionException
            : isTransactionDenied
            ? transactionDenied
            : transactionApproved
            ? transactionSubmitted
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
                            bypassConfirm.range.setValue(currentSkipConfirm);
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
