import styles from './ConfirmSwapModal.module.css';
import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';

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
    };
    const buyTokenData = {
        symbol: 'DAI',
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
    return <div className={styles.row}>{props.children}</div>;
}
