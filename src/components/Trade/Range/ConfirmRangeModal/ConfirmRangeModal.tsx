// START: Import React and Dongles
import {
    // useState,
    // useEffect,
    Dispatch,
    SetStateAction,
} from 'react';

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
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
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
        // txErrorMessage,
        showConfirmation,
        setShowConfirmation,
        resetConfirmation,
        bypassConfirm,
        toggleBypassConfirm,
        isAdd,
    } = props;

    const tokenA = tokenPair.dataTokenA;
    const tokenB = tokenPair.dataTokenB;

    const transactionApproved = newRangeTransactionHash !== '';

    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode === 'CALL_EXCEPTION';
    const isGasLimitException = txErrorCode === 'UNPREDICTABLE_GAS_LIMIT';
    const isInsufficientFundsException = txErrorCode === 'INSUFFICIENT_FUNDS';

    const transactionDenied = <TransactionDenied resetConfirmation={resetConfirmation} />;
    const transactionException = <TransactionException resetConfirmation={resetConfirmation} />;

    const transactionSubmitted = (
        <TransactionSubmitted
            hash={newRangeTransactionHash}
            tokenBSymbol={tokenB.symbol}
            tokenBAddress={tokenB.address}
            tokenBDecimals={tokenB.decimals}
            tokenBImage={tokenB.logoURI}
        />
    );

    // const isTransactionDenied =
    //     txErrorCode === 4001 &&
    //     txErrorMessage === 'MetaMask Tx Signature: User denied transaction signature.';

    const tokenAQty = (document.getElementById('A-range-quantity') as HTMLInputElement)?.value;
    const tokenBQty = (document.getElementById('B-range-quantity') as HTMLInputElement)?.value;

    const dataTokenA = tokenPair.dataTokenA;
    const dataTokenB = tokenPair.dataTokenB;

    const rangeHeader = (
        <section className={styles.position_display}>
            <div className={styles.token_display}>
                <div className={styles.tokens}>
                    {dataTokenA.logoURI ? (
                        <img src={dataTokenA.logoURI} alt={dataTokenA.name} />
                    ) : (
                        <NoTokenIcon tokenInitial={dataTokenA.symbol.charAt(0)} width='30px' />
                    )}
                    {dataTokenB.logoURI ? (
                        <img src={dataTokenB.logoURI} alt={dataTokenB.name} />
                    ) : (
                        <NoTokenIcon tokenInitial={dataTokenB.symbol.charAt(0)} width='30px' />
                    )}
                </div>
                <span className={styles.token_symbol}>
                    {dataTokenA.symbol}/{dataTokenB.symbol}
                </span>
            </div>
            <RangeStatus isInRange={isInRange} isEmpty={false} isAmbient={isAmbient} />
        </section>
    );

    const tokenACharacter = getUnicodeCharacter(dataTokenA.symbol);
    const tokenBCharacter = getUnicodeCharacter(dataTokenB.symbol);

    const tokenAmountDisplay = (
        <section className={styles.fee_tier_display}>
            <div className={styles.fee_tier_container}>
                <div className={styles.detail_line}>
                    <div>
                        {dataTokenA.logoURI ? (
                            <img src={dataTokenA.logoURI} alt={dataTokenA.name} />
                        ) : (
                            <NoTokenIcon tokenInitial={dataTokenA.symbol.charAt(0)} width='20px' />
                        )}
                        <span>{dataTokenA.symbol}</span>
                    </div>
                    <span>{tokenAQty !== '' ? tokenACharacter + tokenAQty : '0'}</span>
                </div>
                <div className={styles.detail_line}>
                    <div>
                        {dataTokenB.logoURI ? (
                            <img src={dataTokenB.logoURI} alt={dataTokenB.name} />
                        ) : (
                            <NoTokenIcon tokenInitial={dataTokenB.symbol.charAt(0)} width='20px' />
                        )}
                        <span>{dataTokenB.symbol}</span>
                    </div>
                    <span>{tokenBQty !== '' ? tokenBCharacter + tokenBQty : '0'}</span>
                </div>
            </div>
        </section>
    );

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
            pinnedMinPriceDisplayTruncatedInBase={pinnedMinPriceDisplayTruncatedInBase}
            pinnedMinPriceDisplayTruncatedInQuote={pinnedMinPriceDisplayTruncatedInQuote}
            pinnedMaxPriceDisplayTruncatedInBase={pinnedMaxPriceDisplayTruncatedInBase}
            pinnedMaxPriceDisplayTruncatedInQuote={pinnedMaxPriceDisplayTruncatedInQuote}
        />
    ) : null;

    const fullTxDetails = (
        <>
            {rangeHeader}
            {tokenAmountDisplay}
            {selectedRangeOrNull}
            <ConfirmationModalControl
                bypassConfirm={bypassConfirm}
                toggleBypassConfirm={toggleBypassConfirm}
                toggleFor='range'
            />
        </>
    );

    // CONFIRMATION LOGIC STARTS HERE
    const confirmSendMessage = (
        <WaitingConfirmation
            content={`Minting a Position with ${tokenAQty ? tokenAQty : '0'} ${tokenA.symbol} and ${
                tokenBQty ? tokenBQty : '0'
            } ${tokenB.symbol}. 
            
                Please check the ${'Metamask'} extension in your browser for notifications.`}
        />
    );

    const confirmTradeButton = (
        <Button
            title={
                isAdd
                    ? `Add to ${isAmbient ? 'Ambient' : 'Range'} Position`
                    : `Create ${isAmbient ? 'Ambient' : 'Range'} Position`
            }
            action={() => {
                console.log(`Sell Token Full name: ${tokenA.symbol} and quantity: ${tokenAQty}`);
                console.log(
                    `Buy Token Full name: ${tokenB.symbol} and quantity: ${
                        tokenBQty !== '' ? tokenBQty : '0'
                    }`,
                );
                sendTransaction();
                setShowConfirmation(false);
            }}
            flat={true}
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

    return (
        <div className={styles.confirm_range_modal_container}>
            <div>{showConfirmation ? fullTxDetails : confirmationDisplay}</div>
            <footer className={styles.modal_footer}>
                {showConfirmation ? confirmTradeButton : null}
            </footer>
        </div>
    );
}
