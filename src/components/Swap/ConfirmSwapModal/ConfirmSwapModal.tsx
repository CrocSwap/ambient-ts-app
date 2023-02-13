import styles from './ConfirmSwapModal.module.css';
// import { useState } from 'react';
import WaitingConfirmation from '../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../Global/TransactionSubmitted/TransactionSubmitted';
import TransactionDenied from '../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../Global/TransactionException/TransactionException';
import Button from '../../Global/Button/Button';
import { TokenPairIF } from '../../../utils/interfaces/exports';
import { CrocImpact } from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction, useState } from 'react';
import TokensArrow from '../../Global/TokensArrow/TokensArrow';
// import DenominationSwitch from '../DenominationSwitch/DenominationSwitch';
// import ConfirmationModalControl from '../../Global/ConfirmationModalControl/ConfirmationModalControl';
import InitPoolDenom from '../../InitPool/InitPoolDenom/InitPoolDenom';
import NoTokenIcon from '../../Global/NoTokenIcon/NoTokenIcon';
import ConfirmationModalControl from '../../Global/ConfirmationModalControl/ConfirmationModalControl';

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
    setShowConfirmation: Dispatch<SetStateAction<boolean>>;
    resetConfirmation: () => void;
    slippageTolerancePercentage: number;
    effectivePrice: number;
    isSellTokenBase: boolean;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
    sellQtyString: string;
    buyQtyString: string;
}

export default function ConfirmSwapModal(props: propsIF) {
    const {
        initiateSwapMethod,

        // priceImpact,
        isDenomBase,
        poolPriceDisplay,
        baseTokenSymbol,
        quoteTokenSymbol,
        // onClose,
        newSwapTransactionHash,
        tokenPair,
        txErrorCode,
        // txErrorMessage,
        resetConfirmation,
        showConfirmation,
        setShowConfirmation,
        slippageTolerancePercentage,
        effectivePrice,
        isSellTokenBase,
        bypassConfirm,
        toggleBypassConfirm,
        sellQtyString,
        buyQtyString,
    } = props;

    const transactionApproved = newSwapTransactionHash !== '';
    // console.log({ txErrorCode });
    // console.log({ txErrorMessage });
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode === 'CALL_EXCEPTION';
    const isGasLimitException = txErrorCode === 'UNPREDICTABLE_GAS_LIMIT';
    const isInsufficientFundsException = txErrorCode === 'INSUFFICIENT_FUNDS';

    // const isTransactionDenied =
    //     txErrorCode === 4001 &&
    //     txErrorMessage === 'MetaMask Tx Signature: User denied transaction signature.';

    // const sellTokenQty = (document.getElementById('sell-quantity') as HTMLInputElement)?.value;
    // const buyTokenQty = (document.getElementById('buy-quantity') as HTMLInputElement)?.value;

    // const primarySwapInput = 'sell';
    const sellTokenData = tokenPair.dataTokenA;

    const buyTokenData = tokenPair.dataTokenB;

    const [isDenomBaseLocal, setIsDenomBaseLocal] = useState(isDenomBase);

    const isPriceInverted =
        (isDenomBaseLocal && !isSellTokenBase) || (!isDenomBaseLocal && isSellTokenBase);

    const effectivePriceWithDenom = effectivePrice
        ? isPriceInverted
            ? 1 / effectivePrice
            : effectivePrice
        : undefined;

    const displayEffectivePriceString =
        !effectivePriceWithDenom ||
        effectivePriceWithDenom === Infinity ||
        effectivePriceWithDenom === 0
            ? '…'
            : effectivePriceWithDenom < 2
            ? effectivePriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : effectivePriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    // const explanationText =
    //     primarySwapInput === 'sell' ? (
    //         <div className={styles.confSwap_detail_note}>
    //             Output is estimated. You will swap up to {sellTokenQty} {sellTokenData.symbol} for{' '}
    //             {buyTokenData.symbol}. You may swap less than {sellTokenQty} {sellTokenData.symbol}{' '}
    //             if the price moves beyond the price limit shown above. You can increase the
    //             likelihood of swapping the full amount by increasing your slippage tolerance in
    //             settings.
    //         </div>
    //     ) : (
    //         <div className={styles.confSwap_detail_note}>
    //             Input is estimated. You will swap {sellTokenData.symbol} for up to {buyTokenQty}{' '}
    //             {buyTokenData.symbol}. You may swap less than {buyTokenQty} {buyTokenData.symbol} if
    //             the price moves beyond the price limit shown above. You can increase the likelihood
    //             of swapping the full amount by increasing your slippage tolerance in settings.
    //         </div>
    //     );

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
    // const priceAfterImpact = priceImpact?.finalPrice;

    // const priceAfterImpactWithDenom = priceAfterImpact
    //     ? isDenomBase
    //         ? priceAfterImpact
    //         : 1 / priceAfterImpact
    //     : undefined;

    // const priceLimit = priceAfterImpactWithDenom
    //     ? priceAfterImpactWithDenom < 2
    //         ? priceAfterImpactWithDenom.toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 6,
    //           })
    //         : priceAfterImpactWithDenom.toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 2,
    //           })
    //     : '...';

    const buyCurrencyRow = (
        <div className={styles.currency_row_container}>
            <h2>{buyQtyString}</h2>

            <div className={styles.logo_display}>
                {buyTokenData.logoURI ? (
                    <img src={buyTokenData.logoURI} alt={buyTokenData.symbol} />
                ) : (
                    <NoTokenIcon tokenInitial={buyTokenData.symbol.charAt(0)} width='30px' />
                )}

                <h2>{buyTokenData.symbol}</h2>
            </div>
        </div>
    );

    const sellCurrencyRow = (
        <div className={styles.currency_row_container}>
            <h2>{sellQtyString}</h2>

            <div className={styles.logo_display}>
                {sellTokenData.logoURI ? (
                    <img src={sellTokenData.logoURI} alt={sellTokenData.symbol} />
                ) : (
                    <NoTokenIcon tokenInitial={sellTokenData.symbol.charAt(0)} width='30px' />
                )}

                <h2>{sellTokenData.symbol}</h2>
            </div>
        </div>
    );

    const extraInfoData = (
        <div className={styles.extra_info_container}>
            <div className={styles.row}>
                <p>Expected Output</p>
                <p>
                    {buyQtyString} {buyTokenData.symbol}{' '}
                </p>
            </div>
            <div className={styles.row}>
                <p>Effective Conversion Rate</p>
                <p>
                    {isDenomBaseLocal
                        ? `${displayEffectivePriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                        : `${displayEffectivePriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                </p>
            </div>
            <div className={styles.row}>
                <p>Slippage Tolerance</p>
                <p>{slippageTolerancePercentage}% </p>
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
            <InitPoolDenom setIsDenomBase={setIsDenomBaseLocal} isDenomBase={isDenomBaseLocal} />

            {extraInfoData}
            {/* {explanationText} */}
            <ConfirmationModalControl
                bypassConfirm={bypassConfirm}
                toggleBypassConfirm={toggleBypassConfirm}
                toggleFor='swap'
            />
        </div>
    );

    // TODO: add confirmation modal control to local storage, settings
    // TODO: and re-enable <ConfirmationModalControl> above

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
            content={`Swapping ${sellQtyString} ${sellTokenData.symbol} for ${buyQtyString} ${
                buyTokenData.symbol
            }. Please check the ${'Metamask'} extension in your browser for notifications.
            `}
        />
    );

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

    // END OF REGULAR CONFIRMATION MESSAGE

    const confirmSwapButton = (
        <Button
            title='Send Swap'
            action={() => {
                console.log(
                    `Sell Token Full name: ${sellTokenData.symbol} and quantity: ${sellQtyString}`,
                );
                console.log(
                    `Buy Token Full name: ${buyTokenData.symbol} and quantity: ${buyQtyString}`,
                );
                initiateSwapMethod();
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
