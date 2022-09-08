import styles from './ConfirmSwapModal.module.css';
import { useState } from 'react';
import CurrencyDisplay from '../../Global/CurrencyDisplay/CurrencyDisplay';
import WaitingConfirmation from '../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../Global/TransactionSubmitted/TransactionSubmitted';
import TransactionDenied from '../../Global/TransactionDenied/TransactionDenied';
import Button from '../../Global/Button/Button';
import { TokenPairIF } from '../../../utils/interfaces/exports';
import Divider from '../../Global/Divider/Divider';
import { CrocImpact } from '@crocswap-libs/sdk';

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
    } = props;

    const [confirmDetails, setConfirmDetails] = useState<boolean>(true);
    const transactionApproved = newSwapTransactionHash !== '';
    const isTransactionDenied =
        txErrorCode === 4001 &&
        txErrorMessage === 'MetaMask Tx Signature: User denied transaction signature.';
    const sellTokenQty = (document.getElementById('sell-quantity') as HTMLInputElement)?.value;
    const buyTokenQty = (document.getElementById('buy-quantity') as HTMLInputElement)?.value;

    const primarySwapInput = 'sell';
    const sellTokenData = tokenPair.dataTokenA;
    // const sellTokenData = {
    //     symbol: 'ETH',
    //     logoAltText: 'eth',
    //     logoLocal:
    //         'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png',
    // };
    const buyTokenData = tokenPair.dataTokenB;
    // const buyTokenData = {
    //     symbol: 'DAI',
    //     logoAltText: 'dai',
    //     logoLocal: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    // };

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

    const fullTxDetails = (
        <>
            <div className={styles.modal_currency_converter}>
                <CurrencyDisplay amount={sellTokenQty} tokenData={sellTokenData} />
                <div className={styles.arrow_container}>
                    <span className={styles.arrow} />
                </div>
                <CurrencyDisplay amount={buyTokenQty} tokenData={buyTokenData} />
            </div>
            <div className={styles.convRate}>
                {isDenomBase
                    ? `1 ${baseTokenSymbol} ≈ ${displayConversionRate} ${quoteTokenSymbol}`
                    : `1 ${quoteTokenSymbol} ≈ ${displayConversionRate} ${baseTokenSymbol}`}
            </div>
            <Divider />
            <div className={styles.confSwap_detail}>
                <div className={styles.detail_line}>
                    Expected Output
                    <span>
                        {buyTokenQty} {buyTokenData.symbol}
                    </span>
                </div>
                <div className={styles.detail_line}>
                    Effective Conversion Rate
                    <span>
                        {isDenomBase
                            ? `${priceLimit} ${quoteTokenSymbol} / ${baseTokenSymbol}`
                            : `${priceLimit} ${baseTokenSymbol} / ${quoteTokenSymbol}`}
                    </span>
                </div>
                <div className={`${styles.detail_line} ${styles.min_received}`}></div>
            </div>
            {explanationText}
        </>
    );

    // REGULAR CONFIRMATION MESSAGE STARTS HERE
    // const currentTxHash = 'i am hash number';
    const confirmSendMessage = (
        <WaitingConfirmation
            content={` Swapping ${sellTokenQty} ${sellTokenData.symbol} for ${buyTokenQty} ${buyTokenData.symbol}`}
        />
    );

    const transactionDenied = <TransactionDenied />;

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
                setConfirmDetails(false);
            }}
        />
    );
    // function onConfirmSwapClose() {
    //     setConfirmDetails(true);
    //     onClose();
    // }

    // const closeButton = <Button title='Close' action={onConfirmSwapClose} />;

    const confirmationDisplay = isTransactionDenied
        ? transactionDenied
        : transactionApproved
        ? transactionSubmitted
        : confirmSendMessage;

    const modal = (
        <div className={styles.modal_container}>
            <section className={styles.modal_content}>
                {confirmDetails ? fullTxDetails : confirmationDisplay}
            </section>
            <footer className={styles.modal_footer}>
                {confirmDetails ? confirmSwapButton : null}
            </footer>
        </div>
    );

    return <>{modal}</>;
}
