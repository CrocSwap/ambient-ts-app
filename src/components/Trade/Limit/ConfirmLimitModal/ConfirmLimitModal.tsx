import styles from './ConfirmLimitModal.module.css';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import Button from '../../../Global/Button/Button';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import TransactionDenied from '../../../Global/TransactionDenied/TransactionDenied';
// import DenominationSwitch from '../../../Swap/DenominationSwitch/DenominationSwitch';
import TokensArrow from '../../../Global/TokensArrow/TokensArrow';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

interface ConfirmLimitModalProps {
    onClose: () => void;
    initiateLimitOrderMethod: () => void;
    tokenPair: TokenPairIF;
    poolPriceDisplay: number;
    tokenAInputQty: string;
    tokenBInputQty: string;
    isTokenAPrimary: boolean;
    // limitRate: string;
    insideTickDisplayPrice: number;
    newLimitOrderTransactionHash: string;
    txErrorCode: number;
    txErrorMessage: string;
    showConfirmation: boolean;
    setShowConfirmation: Dispatch<SetStateAction<boolean>>;
    resetConfirmation: () => void;
}

export default function ConfirmLimitModal(props: ConfirmLimitModalProps) {
    const {
        // onClose,
        tokenPair,
        poolPriceDisplay,
        initiateLimitOrderMethod,
        // limitRate,
        insideTickDisplayPrice,
        newLimitOrderTransactionHash,
        txErrorCode,
        txErrorMessage,
        resetConfirmation,
        showConfirmation,
        setShowConfirmation,
    } = props;
    // const [confirmDetails, setConfirmDetails] = useState<boolean>(true);
    const [transactionApproved, setTransactionApproved] = useState<boolean>(false);

    useEffect(() => {
        if (newLimitOrderTransactionHash) {
            setTransactionApproved(true);
        }
    }, [newLimitOrderTransactionHash]);

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    const displayPoolPriceWithDenom = isDenomBase ? 1 / poolPriceDisplay : poolPriceDisplay;

    const displayPoolPriceString =
        displayPoolPriceWithDenom === Infinity || displayPoolPriceWithDenom === 0
            ? '…'
            : displayPoolPriceWithDenom < 2
            ? displayPoolPriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : displayPoolPriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const trunctatedInsideTickDisplayPrice =
        insideTickDisplayPrice < 2
            ? insideTickDisplayPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : insideTickDisplayPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const isTransactionDenied =
        txErrorCode === 4001 &&
        txErrorMessage === 'MetaMask Tx Signature: User denied transaction signature.';
    const sellTokenQty = (document.getElementById('sell-limit-quantity') as HTMLInputElement)
        ?.value;
    const buyTokenQty = (document.getElementById('buy-limit-quantity') as HTMLInputElement)?.value;

    const sellTokenData = tokenPair.dataTokenA;

    const buyTokenData = tokenPair.dataTokenB;

    const explanationText = (
        <div
            className={styles.confSwap_detail_note}
        >{`${tokenPair.dataTokenB.symbol} will be available for withdrawl after the order is filled. ${tokenPair.dataTokenA.symbol} collateral can be withdrawn at any time before the limit order is filled.`}</div>
    );

    // console.log(sellTokenData);
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

    const limitRateRow = (
        <div className={styles.limit_row_container}>
            <h2>@ {trunctatedInsideTickDisplayPrice}</h2>
        </div>
    );

    const extraInfoData = (
        <div className={styles.extra_info_container}>
            <div className={styles.convRate}>
                {isDenomBase
                    ? `${trunctatedInsideTickDisplayPrice} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                    : `${trunctatedInsideTickDisplayPrice} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
            </div>
            <div className={styles.row}>
                <p>Current Price</p>
                <p>
                    {isDenomBase
                        ? `${displayPoolPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                        : `${displayPoolPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                </p>
            </div>
            <div className={styles.row}>
                <p>Fill Start</p>
                <p>
                    {isDenomBase
                        ? `... ${quoteTokenSymbol} per ${baseTokenSymbol}`
                        : `... ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                </p>
            </div>
            <div className={styles.row}>
                <p>Fill End</p>
                <p>
                    {isDenomBase
                        ? `... ${quoteTokenSymbol} per ${baseTokenSymbol}`
                        : `... ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                </p>
            </div>
        </div>
    );

    const fullTxDetails = (
        <div className={styles.main_container}>
            <section>
                {limitRateRow}
                {sellCurrencyRow}
                <div className={styles.arrow_container}>
                    <TokensArrow />
                </div>
                {buyCurrencyRow}
            </section>
            {/* <DenominationSwitch /> */}
            {extraInfoData}
            {explanationText}
        </div>
    );

    // REGULAR CONFIRMATION MESSAGE STARTS HERE
    // const currentTxHash = 'i am hash number';
    const confirmSendMessage = (
        <WaitingConfirmation
            content={` Submitting Limit Order to Swap ${sellTokenQty} ${sellTokenData.symbol} for ${buyTokenQty} ${buyTokenData.symbol}`}
        />
    );

    const transactionDenied = <TransactionDenied resetConfirmation={resetConfirmation} />;

    const transactionSubmitted = (
        <TransactionSubmitted
            hash={newLimitOrderTransactionHash}
            tokenBSymbol={buyTokenData.symbol}
            tokenBAddress={buyTokenData.address}
            tokenBDecimals={buyTokenData.decimals}
            tokenBImage={buyTokenData.logoURI}
        />
    );

    const confirmationDisplay = isTransactionDenied
        ? transactionDenied
        : transactionApproved
        ? transactionSubmitted
        : confirmSendMessage;

    const confirmLimitButton = (
        <Button
            title='Send Limit Order to Metamask'
            action={() => {
                // console.log(
                //     `Sell Token Full name: ${sellTokenData.symbol} and quantity: ${sellTokenQty}`,
                // );
                // console.log(
                //     `Buy Token Full name: ${buyTokenData.symbol} and quantity: ${buyTokenQty}`,
                // );
                initiateLimitOrderMethod();

                setShowConfirmation(false);
            }}
        />
    );

    const modal = (
        <div className={styles.modal_container}>
            <section className={styles.modal_content}>
                {showConfirmation ? fullTxDetails : confirmationDisplay}
            </section>
            <footer className={styles.modal_footer}>
                {showConfirmation ? confirmLimitButton : null}
            </footer>
        </div>
    );

    return <>{modal}</>;
}
