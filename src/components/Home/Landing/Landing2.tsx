import styles from './Landing2.module.css';

export default function Landing2() {
    return (
        <div className={styles.main_container}>
            <div className={styles.content_container}>
                <div className={styles.on_chain}>
                    The on-chain exchange designed{' '}
                    <div className={styles.highlight_text}>for traders</div>
                </div>
                {/* <div className={styles.ambient}>ambient</div>
                <div className={styles.architecture}>
                    Our <div className={styles.highlight_text}> unique architecture</div> provides
                    low fee transactions, greater liquidity rewards, and a fairer trading
                    experience.
                </div> */}
            </div>
        </div>
    );
}
