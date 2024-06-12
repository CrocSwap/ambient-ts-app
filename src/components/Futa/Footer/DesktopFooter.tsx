import styles from './Footer.module.css';
export default function DesktopFooter() {
    const isStatusPositive = true;

    return (
        <div className={styles.desktopContainer}>
            <p className={styles.network}>NETWORK : BASE</p>
            <div className={styles.leftContainer}>
                <p className={styles.price}>ETH PRICE : $4,000.00</p>
                <div className={styles.status}>
                    <p>RPC STATUS : </p>
                    <span
                        className={styles.statusDisplay}
                        style={{
                            background: isStatusPositive
                                ? 'var(--positive)'
                                : 'var(--negative)',
                        }}
                    />
                </div>
                <p className={styles.blockNumber}>15563300</p>
            </div>
        </div>
    );
}
