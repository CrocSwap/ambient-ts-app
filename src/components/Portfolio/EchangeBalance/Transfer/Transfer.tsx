import styles from './Transfer.module.css';
import TransferAddressInput from './TransferAddressInput/TransferAddressInput';
import TransferButton from './TransferButton/TransferButton';
import TransferCurrencySelector from './TransferCurrencySelector/TransferCurrencySelector';

export default function Transfer() {
    return (
        <div className={styles.deposit_container}>
            <div className={styles.info_text}>
                Transfer tokens to another account within the exchange
            </div>
            <TransferAddressInput fieldId='exchange-balance-transfer-address' />
            <TransferCurrencySelector fieldId='exchange-balance-transfer' />
            <TransferButton />
        </div>
    );
}
