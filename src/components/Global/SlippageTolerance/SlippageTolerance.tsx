import styles from './SlippageTolerance.module.css';

export default function SlippageTolerance() {
    return (
        <div className={styles.slippage_tolerance_container}>
            <div className={styles.slippage_title}>Slippage tolerance</div>
            <div className={styles.slippage_box}>
                <div className={styles.slippage_content}>
                    <input type='text ' placeholder='0.5' />
                    <button>0.1%</button>
                    <button>0.1%</button>
                    <button>0.1%</button>
                </div>
            </div>
        </div>
    );
}
