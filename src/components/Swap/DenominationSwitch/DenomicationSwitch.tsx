import styles from './DenominationSwitch.module.css';

export default function DenominationSwitch() {
    return (
        <div className={styles.denomination_switch}>
            <div>Denomination</div>
            <div className={styles.denomination_content}>
                <span>ETH</span>
            </div>
            <div className={styles.denomination_content}>
                {' '}
                <span>USDC</span>
            </div>
        </div>
    );
}
