import styles from './ConfirmSwapModal.module.css';
import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import CurrencyDisplay from '../../Global/CurrencyDisplay/CurrencyDisplay';
import WaitingConfirmation from '../../Global/WaitingConfirmation/WaitingConfirmation';

interface ConfirmSwapModalProps {
    children: React.ReactNode;
}

export default function ConfirmSwapModal(props: ConfirmSwapModalProps) {
    const [confirmDetails, setConfirmDetails] = useState(true);
    const [transactionApproved, setTransactionApproved] = useState(false);

    const { isAuthenticated, authenticate, enableWeb3 } = useMoralis();

    const sellTokenQty = 1;
    const buyTokenQty = 0;
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

    const explanationText =
        primarySwapInput === 'sell' ? (
            <div className={styles.confSwap_detail_note}>
                Output is estimated. You will swap up to {sellTokenQty}
                {sellTokenData.symbol} for {buyTokenData.symbol}. You may swap less than
                {sellTokenQty} {sellTokenData.symbol} if the price moves beyond the price limit
                shown above. You can increase the likelihood of swapping the full amount by
                increasing your slippage tolerance in settings.
            </div>
        ) : (
            <div className={styles.confSwap_detail_note}>
                Input is estimated. You will swap {sellTokenData.symbol} for up to
                {buyTokenQty} {buyTokenData.symbol}. You may swap less than {buyTokenQty}
                {buyTokenData.symbol} if the price moves beyond the price limit shown above. You can
                increase the likelihood of swapping the full amount by increasing your slippage
                tolerance in settings.
            </div>
        );

    const moreExpensiveToken = 'ETH';
    const lessExpensiveToken = 'DAI';
    const displayConversionRate = 0.00212;
    const priceLimit = 0.12;

    const fullTxDetails = (
        <>
            <div className={styles.modal_currency_converter}>
                <CurrencyDisplay amount={sellTokenQty} tokenData={sellTokenData} />
                {/* <div className={styles.arrow}>
                  <img src={arrow} alt="" />
                </div> */}

                <CurrencyDisplay amount={buyTokenQty} tokenData={buyTokenData} />
            </div>
            <div className={styles.convRate}>
                1 {moreExpensiveToken} ≈ {displayConversionRate}
                {lessExpensiveToken}
            </div>
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
    const confirmSendMessage = (
        <WaitingConfirmation
            content={` Swapping ${sellTokenQty} ${sellTokenData.symbol} for ${buyTokenQty} ${buyTokenData.symbol}`}
        />
    );

    // END OF REGULAR CONFIRMATION MESSAGE

    return <div className={styles.row}>{props.children}</div>;
}
