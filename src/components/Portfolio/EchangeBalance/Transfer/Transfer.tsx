import styles from './Transfer.module.css';
import TransferButton from './TransferButton/TransferButton';
import TransferCurrencySelector from './TransferCurrencySelector/TransferCurrencySelector';

export default function Deposit() {
    return (
        <div className={styles.deposit_container}>
            <div className={styles.info_text}>
                Transfer tokens to another account within the exchange
            </div>
            <TransferCurrencySelector fieldId='exchange-balance-transfer' />
            <TransferButton />
        </div>
    );
}
