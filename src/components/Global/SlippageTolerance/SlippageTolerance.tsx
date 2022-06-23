import styles from './SlippageTolerance.module.css';

export default function SlippageTolerance() {
    return (
        <div className={styles.slippage_tolerance_container}>
            <div className={styles.slippage_title}>Slippage tolerance</div>
            <div className={styles.slippage_box}>
                <div className={styles.slippage_content}>
                    <div className={styles.input_container}>
                        <input type='text ' placeholder='0.5' />
                        {/* <div>%</div> */}
                    </div>
                    <button>0.1%</button>
                    <button>0.5%</button>
                    <button>1%</button>
                </div>
            </div>
        </div>
    );
}
