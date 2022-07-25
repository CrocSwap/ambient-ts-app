import styles from './TransactionCard.module.css';
import { FiMoreHorizontal } from 'react-icons/fi';

export default function TransactionCard() {
    const tokenLogos = (
        <div className={styles.token_logos}>
            <img src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' alt='' />
            <img
                src='https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                alt=''
            />
        </div>
    );

    const minMax = (
        <div className={styles.min_max}>
            <p>Min</p>
            <p>Max</p>
        </div>
    );

    const lardeDesktopMinMaxDisplay = (
        <div className={styles.min_max_range}>
            <p>Min: 1234.22</p>
            <p>Max: 232.212</p>
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

    const menuButtons = (
        <div className={styles.menu_buttons}>
            <button className={styles.reposition_button}>Reposition</button>
            <button className={styles.option_button}>Edit</button>
            <button className={styles.option_button}>Remove</button>
            <button className={styles.option_button}>Details</button>
            <button className={styles.option_button}>Harvest</button>
        </div>
    );

    const menuIcon = (
        <div className={styles.min_buttons}>
            <button className={styles.reposition_button}>Reposition</button>
            <FiMoreHorizontal size={30} />
        </div>
    );

    const removeRangeColumn = (
        <div className={styles.remove_range_column}>
            <p>Remove</p>
            <p>Range</p>
        </div>
    );
    const rowData = (
        <div className={styles.row}>
            <div className={styles.pool_name}>ABC/XYZ</div>
            <div className={styles.account}>0xcD...134</div>
            <div className={styles.account}>0BcD...134</div>
            {accountColumn}

            {minMax}
            {lardeDesktopMinMaxDisplay}
            {removeRangeColumn}
            <p className={styles.remove}>Remove</p>
            <p className={styles.range}>Range</p>
            {tokenQty}
            {tokenQty}
            {tokenQtyColumn}
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
