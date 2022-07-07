import styles from './PositionHeader.module.css';

export default function PositionHeader() {
    return (
        <div className={styles.heading}>
            <p className={styles.hide_ipad}>ID </p>
            <p className={styles.hide_ipad}>Wallet </p>
            <div className={styles.hide_desktop}>
                <p>ID</p>
                <p>Wallet</p>
            </div>

            <p className={styles.hide_ipad}>Range Min</p>
            <p className={styles.hide_ipad}>Range Max </p>

            <p className={styles.hide_desktop}>Range</p>

            <p className={styles.hide_ipad}>ETH</p>
            <p className={styles.hide_ipad}>USDC</p>
            <div className={styles.hide_desktop}>
                <p>ETH</p>
                <p>USDC</p>
            </div>
            <p className={styles.hide_mobile}>APY</p>

            <p>Status</p>
            <p className={styles.hide_mobile}>
                {' '}
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
            </p>
            <p> &nbsp; &nbsp; &nbsp; &nbsp;</p>
            {/* <p className='hide-mobile'>Volume</p>
<p className='hide-mobile'>Mkt Cap</p> */}
        </div>
    );
}
