import styles from './PositionCard.module.css';

export default function PositionCard() {
    const heading2 = (
        <div className={styles.heading}>
            <p className={styles.hide_ipad}>ID SPACING.....</p>
            <p className={styles.hide_ipad}>Wallet SPACING.....</p>
            <div className={styles.hide_desktop}>
                <p>ID</p>
                <p>Wallet</p>
            </div>

            <p className={styles.hide_ipad}>Range Min</p>
            <p className={styles.hide_ipad}>Range Max</p>

            <p className={styles.hide_desktop}>Range</p>

            <p className={styles.hide_ipad}>ETH</p>
            <p className={styles.hide_ipad}>USDC</p>
            <div className={styles.hide_desktop}>
                <p>ETH</p>
                <p>USDC</p>
            </div>
            <p className={styles.hide_mobile}>APY</p>

            <p>Status</p>
            <p className={styles.hide_mobile}>Reposition</p>
            <p>Menu</p>
            {/* <p className='hide-mobile'>Volume</p>
        <p className='hide-mobile'>Mkt Cap</p> */}
        </div>
    );

    const coinItem2 = (
        <div className={styles.coin_row}>
            <p className={`${styles.hide_ipad} ${styles.account_style}`}>0xaBcD...1234</p>
            <p className={`${styles.hide_ipad} ${styles.account_style}`}>0xAbCd...9876</p>

            <div className={styles.hide_desktop}>
                <p className={styles.account_style}>0xaBcD...1234</p>
                <p className={styles.account_style}>0xAbCd...9876</p>
            </div>

            <p className={`${styles.hide_ipad} ${styles.min_max}`}>Min</p>
            <p className={`${styles.hide_ipad} ${styles.min_max}`}>Max</p>

            <div className={styles.hide_desktop}>
                <p className={styles.min_max}>Min</p>
                <p className={styles.min_max}>Max</p>
            </div>
            <p className={`${styles.hide_ipad} ${styles.qty}`}>T1 Qty</p>
            <p className={`${styles.hide_ipad} ${styles.qty}`}>T2 Qty</p>
            <div className={styles.hide_desktop}>
                <p className={styles.qty}>T1 Qty</p>
                <p className={styles.qty}>T2 Qty</p>
            </div>
            <p className={`${styles.hide_mobile} ${styles.apy}`}>APY</p>
            <p>In Range</p>
            <button className={`${styles.option_button} ${styles.hide_mobile}`}>Reposition</button>
            <div>Menu</div>
        </div>
    );

    const coins = [1, 2, 3, 4];

    return (
        <div className={styles.container}>
            {heading2}
            {coinItem2}
        </div>
    );
}
