import styles from './TokenInfo.module.css';

export default function TokenInfo() {
    return (
        <div className={styles.token_info_container}>
            <div className={styles.price_info}>
                <span className={styles.price}>$2,658.00</span>
                <span className={styles.price_change}>+8.57% | 24h</span>
            </div>
            <div className={styles.apy}>APY | 35.65%</div>
        </div>
    );
}
