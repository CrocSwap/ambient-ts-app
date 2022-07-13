// Unfinished file - Currently not in used.

import styles from './LimitOrderHeader.module.css';

export default function LimitOrderHeader() {
    const buttonsDisplay = (
        <div className={styles.buttons_container}>
            {/* <button className={styles.details_button}>Edit</button>
            <button className={styles.details_button}>Copy</button>
            <button className={styles.details_button}>Details</button> */}
        </div>
    );

    return (
        // <div className={styles.heading}>
        //     <p className={`${styles.large_device} ${styles.account_style} `}>ID </p>
        //     <p className={`${styles.large_device} ${styles.account_style} `}>Wallet </p>
        //     <div className={styles.column_display}>
        //         <p>ID</p>
        //         <p>Wallet</p>
        //     </div>

        //     <p className={styles.price}>Price</p>
        //         <p className={styles.side}>Buy</p>
        //         <p className={styles.type}>Limit</p>

        //     <p className={`${styles.qty_large_screen} ${styles.qty}`}>T1 Qty</p>
        //     <p className={`${styles.qty_large_screen} ${styles.qty}`}>T2 Qty</p>
        //     <div className={`${styles.qty_column_display} ${styles.qty_display}`}>
        //         <p>T1 Qty</p>
        //         <p>T2 Qty</p>
        //     </div>

        //     <p className={styles.menu}></p>

        // </div>
        <div className={styles.container}>
            <div className={styles.heading}>
                <p className={styles.id}>ID</p>
                <p className={styles.wallet}>Wallet</p>
                <div className={styles.column_display}>
                    <p>ID</p>
                    <p>Wallet</p>
                </div>
                <p>Price</p>
                <p>Side</p>
                <p>Type</p>
                <p className={styles.token_name}>ETH</p>
                <p className={styles.token_name}> USDC</p>

                <div className={styles.token_column_display}>
                    <p>ETH</p>
                    <p> USDC</p>
                </div>

                <p>Status</p>
            </div>
            {buttonsDisplay}
        </div>
    );
}
