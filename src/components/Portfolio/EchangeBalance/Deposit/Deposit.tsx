import styles from './Deposit.module.css';
import DepositButton from './DepositButton/DepositButton';
import DepositCurrencySelector from './DepositCurrencySelector/DepositCurrencySelector';

export default function Deposit() {
    return (
        <div className={styles.deposit_container}>
            <div className={styles.info_text}>
                Deposit tokens to Ambient Finance exchange wallet
            </div>
            <DepositCurrencySelector fieldId='exchange-balance-deposit' />
            <DepositButton />
        </div>
    );
}
