import styles from './ConfirmLimitModal.module.css';
import { useState } from 'react';
import CurrencyDisplay from '../../../Global/CurrencyDisplay/CurrencyDisplay';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import Button from '../../../Global/Button/Button';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import Divider from '../../../Global/Divider/Divider';

interface ConfirmLimitModalProps {
    onClose: () => void;
    initiateLimitOrderMethod: () => void;
    tokenPair: TokenPairIF;
    tokenAInputQty: string;
    tokenBInputQty: string;
    isTokenAPrimary: boolean;
    limitRate: string;
}

export default function ConfirmLimitModal(props: ConfirmLimitModalProps) {
    const { onClose, tokenPair, initiateLimitOrderMethod, limitRate } = props;
    const [confirmDetails, setConfirmDetails] = useState<boolean>(true);
    const [transactionApproved] = useState<boolean>(false);

    const sellTokenQty = (document.getElementById('sell-limit-quantity') as HTMLInputElement)
        ?.value;
    const buyTokenQty = (document.getElementById('buy-limit-quantity') as HTMLInputElement)?.value;

    const sellTokenData = tokenPair.dataTokenA;

    const buyTokenData = tokenPair.dataTokenB;

    const moreExpensiveToken = 'ETH';
    const lessExpensiveToken = 'DAI';
    const displayConversionRate = parseFloat(buyTokenQty) / parseFloat(sellTokenQty);
    // const priceLimit = 0.12;

    const explanationText = (
        <div className={styles.confSwap_detail_note}>any other explanation text will go here.</div>
    );

    const fullTxDetails = (
        <>
            <div className={styles.modal_currency_converter}>
                <CurrencyDisplay amount={sellTokenQty} tokenData={sellTokenData} />
                <div className={styles.limit_price_container}>
                    <CurrencyDisplay amount={limitRate} tokenData={buyTokenData} isLimitBox />
                </div>
                <div className={styles.arrow_container}>
                    <span className={styles.arrow} />
                </div>
                <CurrencyDisplay amount={buyTokenQty} tokenData={buyTokenData} />
            </div>
            <div className={styles.convRate}>
                1 {moreExpensiveToken} = {displayConversionRate} {lessExpensiveToken}
            </div>
            <Divider />
            <div className={styles.confSwap_detail}>
                <div className={styles.detail_line}>
                    Current Price
                    <span>
                        0.000043 {moreExpensiveToken} per {lessExpensiveToken}
                    </span>
                </div>
                <div className={styles.detail_line}>
                    ETH Appreciation Before Swap
                    <span>2%</span>
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

    const transactionSubmitted = <TransactionSubmitted hash={'newSwapTransactionHash'} />;

    const confirmationDisplay = transactionApproved ? transactionSubmitted : confirmSendMessage;

    const confirmLimitButton = (
        <Button
            title='Send Limit to Metamask'
            action={() => {
                // console.log(
                //     `Sell Token Full name: ${sellTokenData.symbol} and quantity: ${sellTokenQty}`,
                // );
                // console.log(
                //     `Buy Token Full name: ${buyTokenData.symbol} and quantity: ${buyTokenQty}`,
                // );
                initiateLimitOrderMethod();

                setConfirmDetails(false);
            }}
        />
    );

    function onConfirmLimitClose() {
        setConfirmDetails(true);

        onClose();
    }

    const closeButton = <Button title='Close' action={onConfirmLimitClose} />;

    const modal = (
        <div className={styles.modal_container}>
            <section className={styles.modal_content}>
                {confirmDetails ? fullTxDetails : confirmationDisplay}
            </section>
            <footer className={styles.modal_footer}>
                {confirmDetails ? confirmLimitButton : closeButton}
            </footer>
        </div>
    );

    return <>{modal}</>;
}
