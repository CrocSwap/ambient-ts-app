import styles from './ConfirmSwapModal.module.css';
// import { useState } from 'react';
import WaitingConfirmation from '../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../Global/TransactionSubmitted/TransactionSubmitted';
import TransactionDenied from '../../Global/TransactionDenied/TransactionDenied';
import Button from '../../Global/Button/Button';
import { TokenPairIF } from '../../../utils/interfaces/exports';
import { CrocImpact } from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction, useEffect } from 'react';
import TokensArrow from '../../Global/TokensArrow/TokensArrow';
import DenominationSwitch from '../DenominationSwitch/DenominationSwitch';

interface ConfirmSwapModalProps {
    initiateSwapMethod: () => void;
    poolPriceDisplay: number | undefined;
    isDenomBase: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    priceImpact: CrocImpact | undefined;
    onClose: () => void;
    newSwapTransactionHash: string;
    tokenPair: TokenPairIF;
    txErrorCode: number;
    txErrorMessage: string;
    showConfirmation: boolean;
    setShowConfirmation: Dispatch<SetStateAction<boolean>>;
    resetConfirmation: () => void;
    pendingTransactions: string[];
}

export default function ConfirmSwapModal(props: ConfirmSwapModalProps) {
    const {
        initiateSwapMethod,
        priceImpact,
        isDenomBase,
        poolPriceDisplay,
        baseTokenSymbol,
        quoteTokenSymbol,
        // onClose,
        newSwapTransactionHash,
        tokenPair,
        txErrorCode,
        txErrorMessage,
        resetConfirmation,
        showConfirmation,
        setShowConfirmation,
        pendingTransactions,
    } = props;

    const transactionApproved = newSwapTransactionHash !== '';
    const isTransactionDenied =
        txErrorCode === 4001 &&
        txErrorMessage === 'MetaMask Tx Signature: User denied transaction signature.';

    const sellTokenQty = (document.getElementById('sell-quantity') as HTMLInputElement)?.value;
    const buyTokenQty = (document.getElementById('buy-quantity') as HTMLInputElement)?.value;

    const primarySwapInput = 'sell';
    const sellTokenData = tokenPair.dataTokenA;

    const buyTokenData = tokenPair.dataTokenB;

    useEffect(() => {
        if (newSwapTransactionHash && newSwapTransactionHash !== '') {
            pendingTransactions.push(newSwapTransactionHash);
        }
    }, [newSwapTransactionHash]);

    console.log(pendingTransactions);

    const explanationText =
        primarySwapInput === 'sell' ? (
            <div className={styles.confSwap_detail_note}>
                Output is estimated. You will swap up to {sellTokenQty} {sellTokenData.symbol} for{' '}
                {buyTokenData.symbol}. You may swap less than {sellTokenQty} {sellTokenData.symbol}{' '}
                if the price moves beyond the price limit shown above. You can increase the
                likelihood of swapping the full amount by increasing your slippage tolerance in
                settings.
            </div>
        ) : (
            <div className={styles.confSwap_detail_note}>
                Input is estimated. You will swap {sellTokenData.symbol} for up to {buyTokenQty}{' '}
                {buyTokenData.symbol}. You may swap less than {buyTokenQty} {buyTokenData.symbol} if
                the price moves beyond the price limit shown above. You can increase the likelihood
                of swapping the full amount by increasing your slippage tolerance in settings.
            </div>
        );

    const displayPriceWithDenom = poolPriceDisplay
        ? isDenomBase
            ? 1 / poolPriceDisplay
            : poolPriceDisplay
        : undefined;
    // eslint-disable-next-line
    const displayConversionRate = displayPriceWithDenom
        ? displayPriceWithDenom < 2
            ? displayPriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : displayPriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : '...';
    // const displayConversionRate = parseFloat(buyTokenQty) / parseFloat(sellTokenQty);
    const priceAfterImpact = priceImpact?.finalPrice;

    const priceAfterImpactWithDenom = priceAfterImpact
        ? isDenomBase
            ? priceAfterImpact
            : 1 / priceAfterImpact
        : undefined;

    const priceLimit = priceAfterImpactWithDenom
        ? priceAfterImpactWithDenom < 2
            ? priceAfterImpactWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : priceAfterImpactWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : '...';

    const buyCurrencyRow = (
        <div className={styles.currency_row_container}>
            <h2>{buyTokenQty}</h2>

            <div className={styles.logo_display}>
                <img src={buyTokenData.logoURI} alt={buyTokenData.symbol} />
                <h2>{buyTokenData.symbol}</h2>
            </div>
        </div>
    );

    const sellCurrencyRow = (
        <div className={styles.currency_row_container}>
            <h2>{sellTokenQty}</h2>

            <div className={styles.logo_display}>
                <img src={sellTokenData.logoURI} alt={sellTokenData.symbol} />
                <h2>{sellTokenData.symbol}</h2>
            </div>
        </div>
    );

    const extraInfoData = (
        <div className={styles.extra_info_container}>
            <div className={styles.row}>
                <p>Expected Output</p>
                <p>
                    {buyTokenQty} {buyTokenData.symbol}{' '}
                </p>
            </div>
            <div className={styles.row}>
                <p>Effective Conversion Rate</p>
                <p>
                    {' '}
                    {isDenomBase
                        ? `${priceLimit} ${quoteTokenSymbol} / ${baseTokenSymbol}`
                        : `${priceLimit} ${baseTokenSymbol} / ${quoteTokenSymbol}`}{' '}
                </p>
            </div>
            <div className={styles.row}>
                <p>Slippage</p>
                <p>0.3% </p>
            </div>
        </div>
    );
    const fullTxDetails2 = (
        <div className={styles.main_container}>
            <section>
                {sellCurrencyRow}
                <div className={styles.arrow_container}>
                    <TokensArrow />
                </div>
                {buyCurrencyRow}
            </section>
            <DenominationSwitch />
            {extraInfoData}
            {explanationText}
        </div>
    );

    // const fullTxDetails = (
    //     <>
    //         <div className={styles.modal_currency_converter}>
    //             <CurrencyDisplay amount={sellTokenQty} tokenData={sellTokenData} />
    //             <div className={styles.arrow_container}>
    //                 <span className={styles.arrow} />
    //             </div>
    //             <CurrencyDisplay amount={buyTokenQty} tokenData={buyTokenData} />
    //         </div>
    //         <div className={styles.convRate}>
    //             {isDenomBase
    //                 ? `1 ${baseTokenSymbol} ≈ ${displayConversionRate} ${quoteTokenSymbol}`
    //                 : `1 ${quoteTokenSymbol} ≈ ${displayConversionRate} ${baseTokenSymbol}`}
    //         </div>
    //         <Divider />
    //         <div className={styles.confSwap_detail}>
    //             <div className={styles.detail_line}>
    //                 Expected Output
    //                 <span>
    //                     {buyTokenQty} {buyTokenData.symbol}
    //                 </span>
    //             </div>
    //             <div className={styles.detail_line}>
    //                 Effective Conversion Rate
    //                 <span>
    //                     {isDenomBase
    //                         ? `${priceLimit} ${quoteTokenSymbol} / ${baseTokenSymbol}`
    //                         : `${priceLimit} ${baseTokenSymbol} / ${quoteTokenSymbol}`}
    //                 </span>
    //             </div>
    //             <div className={`${styles.detail_line} ${styles.min_received}`}></div>
    //         </div>
    //         {explanationText}
    //     </>
    // );

    // REGULAR CONFIRMATION MESSAGE STARTS HERE
    // const currentTxHash = 'i am hash number';
    const confirmSendMessage = (
        <WaitingConfirmation
            content={` Swapping ${sellTokenQty} ${sellTokenData.symbol} for ${buyTokenQty} ${buyTokenData.symbol}`}
        />
    );

    const transactionDenied = <TransactionDenied resetConfirmation={resetConfirmation} />;

    const transactionSubmitted = (
        <TransactionSubmitted
            hash={newSwapTransactionHash}
            tokenBSymbol={buyTokenData.symbol}
            tokenBAddress={buyTokenData.address}
            tokenBDecimals={buyTokenData.decimals}
            tokenBImage={buyTokenData.logoURI}
        />
    );

    // END OF REGULAR CONFIRMATION MESSAGE

    const confirmSwapButton = (
        <Button
            title='Send Swap to Metamask'
            action={() => {
                console.log(
                    `Sell Token Full name: ${sellTokenData.symbol} and quantity: ${sellTokenQty}`,
                );
                console.log(
                    `Buy Token Full name: ${buyTokenData.symbol} and quantity: ${buyTokenQty}`,
                );
                initiateSwapMethod();
                setShowConfirmation(false);
            }}
        />
    );

    const confirmationDisplay = isTransactionDenied
        ? transactionDenied
        : transactionApproved
        ? transactionSubmitted
        : confirmSendMessage;

    const modal = (
        <div className={styles.modal_container}>
            <section className={styles.modal_content}>
                {showConfirmation ? fullTxDetails2 : confirmationDisplay}
            </section>
            <footer className={styles.modal_footer}>
                {showConfirmation ? confirmSwapButton : null}
            </footer>
        </div>
    );

    return <>{modal}</>;
}
