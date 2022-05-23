import styles from './Position.module.css';

export default function Position() {
    return (
        <div className={styles.position_container}>
            <div className={styles.position_info}>
                <div className={styles.id}>0xfa05...db35</div>
                <div className={styles.range}>2100.00 3200.00</div>
                <div className={styles.apy}>35.65%</div>
                <div className={styles.range_sign}>In Range</div>
            </div>

            <div className={styles.options_container}>
                <button className={styles.options}>Harvest</button>
                <button className={styles.options}>Edit</button>
                <button className={styles.options}>Remove</button>
                <button className={styles.options}>Details</button>
            </div>
        </div>
    );
}
