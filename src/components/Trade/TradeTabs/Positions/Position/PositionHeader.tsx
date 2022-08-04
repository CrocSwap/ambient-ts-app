// Unfinished file - Currently not in used.

import styles from './PositionHeader.module.css';

export default function PositionHeader() {
    return (
        <div className={styles.heading}>
            <p className={styles.large_device}>ID </p>
            <p className={styles.large_device}>Wallet </p>
            <div className={styles.column_display}>
                <p>ID</p>
                <p>Wallet</p>
            </div>

            <p className={`${styles.min_max}`}>Range </p>

            <p className={styles.large_device}>ETH</p>
            <p className={styles.large_device}>USDC</p>
            <div className={styles.column_display}>
                <p>ETH</p>
                <p>USDC</p>
            </div>
            <p className={styles.apy}>APY</p>

            <p className={styles.full_range}>Status</p>
            <p className={styles.range_icon}></p>
            <p className={styles.hide_mobile}></p>
            <p className={styles.option_button}> </p>
            <p className={styles.menu}></p>
            {/* <p className='hide-mobile'>Volume</p>
<p className='hide-mobile'>Mkt Cap</p> */}
        </div>
    );
}
