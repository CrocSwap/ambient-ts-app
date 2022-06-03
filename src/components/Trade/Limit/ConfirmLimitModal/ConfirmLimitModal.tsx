import styles from './ConfirmLimitModal.module.css';
import { useState } from 'react';
import CurrencyDisplay from '../../../Global/CurrencyDisplay/CurrencyDisplay';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import Button from '../../../Global/Button/Button';
import Divider from '../../../Global/Divider/Divider';

interface ConfirmLimitModalProps {
    children: React.ReactNode;
}

export default function ConfirmLimitModal(props: ConfirmLimitModalProps) {
    const [confirmDetails, setConfirmDetails] = useState<boolean>(true);
    const [transactionApproved, setTransactionApproved] = useState<boolean>(false);

    const sellTokenQty = (document.getElementById('sell-quantity') as HTMLInputElement)?.value;
    const buyTokenQty = (document.getElementById('buy-quantity') as HTMLInputElement)?.value;

    const primarySwapInput = 'sell';
    const sellTokenData = {
        symbol: 'ETH',
        logoAltText: 'eth',
        logoLocal:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png',
    };
    const buyTokenData = {
        symbol: 'DAI',
        logoAltText: 'dai',
        logoLocal: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    };

    const moreExpensiveToken = 'ETH';
    const lessExpensiveToken = 'DAI';
    const displayConversionRate = parseFloat(buyTokenQty) / parseFloat(sellTokenQty);
    const priceLimit = 0.12;

    const explanationText = (
        <div className={styles.confSwap_detail_note}>this is explanation text</div>
    );

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
                1 {moreExpensiveToken} = {displayConversionRate} {lessExpensiveToken}
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
                    Price Limit
                    <span>
                        {priceLimit} {lessExpensiveToken} /{moreExpensiveToken}
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

    const transactionSubmitted = <TransactionSubmitted hash={'newSwapTransactionHash'} />;

    const confirmationDisplay = transactionApproved ? transactionSubmitted : confirmSendMessage;

    const modal = (
        <div className={styles.modal_container}>
            <section className={styles.modal_content}>
                {confirmDetails ? fullTxDetails : confirmationDisplay}
            </section>
            <footer className={styles.modal_footer}>
                {/* {confirmDetails ? confirmSwapButton : closeButton} */}
            </footer>
        </div>
    );

    return <>{modal}</>;
}
