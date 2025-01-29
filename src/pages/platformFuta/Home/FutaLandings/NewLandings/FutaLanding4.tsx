import styles from './FutaLanding4.module.css';
export default function FutaLanding4() {
    return (
        <div className={styles.container}>
            <h3>/How It Works</h3>
            <div className={styles.content}>
                <div className={styles.list}>
                    <div className={styles.number}>01</div>
                    <p>Find a ticker you like</p>
                </div>
                <div className={styles.list}>
                    <div className={styles.number}>02</div>
                    <p>
                        Select the max market cap you are willing to bid up to
                    </p>
                </div>
                <div className={styles.list}>
                    <div className={styles.number}>03</div>
                    <p>Bid the amount you wish to buy</p>
                </div>
                <div className={styles.list}>
                    <div className={styles.number}>04</div>
                    <p>
                        Claim your tokens from the winning bid after the auction
                        has complete
                    </p>
                </div>
            </div>
        </div>
    );
}
