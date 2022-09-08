// START: Import React and Dongles
import { useState, Dispatch, SetStateAction } from 'react';

// START: Import JSX Functional Components
import Divider from '../../../Global/Divider/Divider';
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

interface ConfirmRangeModalPropsIF {
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
    txErrorCode: number;
    txErrorMessage: string;
}

export default function ConfirmRangeModal(props: ConfirmRangeModalPropsIF) {
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
        txErrorMessage,
    } = props;

    const tokenA = tokenPair.dataTokenA;
    const tokenB = tokenPair.dataTokenB;

    const [confirmDetails, setConfirmDetails] = useState(true);
    const transactionApproved = newRangeTransactionHash !== '';
    const isTransactionDenied =
        txErrorCode === 4001 &&
        txErrorMessage === 'MetaMask Tx Signature: User denied transaction signature.';
    const tokenAQty = (document.getElementById('A-range-quantity') as HTMLInputElement)?.value;
    const tokenBQty = (document.getElementById('B-range-quantity') as HTMLInputElement)?.value;

    const dataTokenA = tokenPair.dataTokenA;
    const dataTokenB = tokenPair.dataTokenB;

    const rangeHeader = (
        <section className={styles.position_display}>
            <div className={styles.token_display}>
                <div className={styles.tokens}>
                    <img src={dataTokenB.logoURI} alt={dataTokenB.name} />
                    <img src={dataTokenA.logoURI} alt={dataTokenA.name} />
                </div>
                <span className={styles.token_symbol}>
                    {dataTokenA.symbol}/{dataTokenB.symbol}
                </span>
            </div>
            <RangeStatus isInRange={isInRange} isAmbient={isAmbient} />
        </section>
    );

    const tokenACharacter = getUnicodeCharacter(dataTokenA.symbol);
    const tokenBCharacter = getUnicodeCharacter(dataTokenB.symbol);

    const feeTierDisplay = (
        <section className={styles.fee_tier_display}>
            <div className={styles.fee_tier_container}>
                <div className={styles.detail_line}>
                    <div>
                        <img src={dataTokenA.logoURI} alt={dataTokenA.name} />
                        <span>{dataTokenA.symbol}</span>
                    </div>
                    <span>{tokenAQty !== '' ? tokenACharacter + tokenAQty : '0'}</span>
                </div>
                <div className={styles.detail_line}>
                    <div>
                        <img src={dataTokenB.logoURI} alt={dataTokenB.name} />
                        <span>{dataTokenB.symbol}</span>
                    </div>
                    <span>{tokenBQty !== '' ? tokenBCharacter + tokenBQty : '0'}</span>
                </div>
                <Divider />
                <div className={styles.detail_line}>
                    <span>CURRENT FEE TIER</span>
                    <span>{0.05}%</span>
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
            {feeTierDisplay}
            {selectedRangeOrNull}
        </>
    );

    // CONFIRMATION LOGIC STARTS HERE
    const confirmSendMessage = (
        <WaitingConfirmation
            content={`Minting a Position with ${tokenAQty ? tokenAQty : '0'} ${tokenA.symbol} and ${
                tokenBQty ? tokenBQty : '0'
            } ${tokenB.symbol}`}
        />
    );
    const transactionDenied = <TransactionDenied />;
    const transactionSubmitted = (
        <TransactionSubmitted
            hash={newRangeTransactionHash}
            tokenBSymbol={tokenB.symbol}
            tokenBAddress={tokenB.address}
            tokenBDecimals={tokenB.decimals}
            tokenBImage={tokenB.logoURI}
        />
    );

    const confirmTradeButton = (
        <Button
            title='Send to Metamask'
            action={() => {
                console.log(`Sell Token Full name: ${tokenA.symbol} and quantity: ${tokenAQty}`);
                console.log(
                    `Buy Token Full name: ${tokenB.symbol} and quantity: ${
                        tokenBQty !== '' ? tokenBQty : '0'
                    }`,
                );
                sendTransaction();
                setConfirmDetails(false);
            }}
        />
    );

    const confirmationDisplay = isTransactionDenied
        ? transactionDenied
        : transactionApproved
        ? transactionSubmitted
        : confirmSendMessage;

    return (
        <div className={styles.confirm_range_modal_container}>
            <div>{confirmDetails ? fullTxDetails : confirmationDisplay}</div>
            <footer className={styles.modal_footer}>
                {confirmDetails ? confirmTradeButton : null}
            </footer>
        </div>
    );
}
