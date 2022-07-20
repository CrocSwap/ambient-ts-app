import OpenOrderStatus from '../../OpenOrderStatus/OpenOrderStatus';
import { FiMoreHorizontal } from 'react-icons/fi';

import styles from './OrderCard.module.css';
export default function OrderCard() {
    const tokenLogos = (
        <div className={styles.token_logos}>
            <img src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' alt='' />
            <img
                src='https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                alt=''
            />
        </div>
    );

    const tokenQty = (
        <div className={styles.token_qty}>
            T1 Qty
            <img src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' alt='' />
        </div>
    );

    const tokenQtyColumn = (
        <div className={styles.token_qty_column}>
            <p>T1 Qty</p>
            <p>T2 Qty</p>
        </div>
    );
    const accountColumn = (
        <div className={styles.account_column}>
            <p>0xcD...134</p>
            <p>0xcD...134</p>
        </div>
    );

    const buyLimitColumn = (
        <div className={styles.buy_limit_column}>
            <p>Buy</p>
            <p>Limit</p>
        </div>
    );

    const menuButtons = (
        <div className={styles.menu_buttons}>
            <button className={styles.reposition_button}>Reposition</button>
            <button className={styles.option_button}>Edit</button>
            <button className={styles.option_button}>Remove</button>
            <button className={styles.option_button}>Details</button>
            {/* <button className={styles.option_button}>Harvest</button> */}
        </div>
    );

    const menuIcon = (
        <div className={styles.min_buttons}>
            <button className={styles.reposition_button}>Reposition</button>
            <FiMoreHorizontal size={30} />
        </div>
    );

    const rangeIcon2 = (
        <div className={styles.range_icon_2}>
            <OpenOrderStatus isFilled />
        </div>
    );

    const rowData = (
        <div className={styles.row}>
            <div className={styles.pool_name}>ABC/XYZ</div>
            <div className={styles.account}>0xcD...134</div>
            <div className={styles.account}>0BcD...134</div>
            {accountColumn}
            <p className={styles.price_normal}>Price</p>
            <p className={styles.buy}>Buy</p>
            <p className={styles.limit}>Limit</p>
            {buyLimitColumn}
            {tokenQty}
            {tokenQty}
            {tokenQtyColumn}
            {rangeIcon2}
        </div>
    );

    return (
        <div className={styles.main_container}>
            {tokenLogos}
            {rowData}
            {menuButtons}
            {menuIcon}
        </div>
    );
}
