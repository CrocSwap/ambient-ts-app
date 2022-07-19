import styles from './RangeCard.module.css';
export default function RangeCard() {
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
            <button>Edit</button>
            <button>Remove</button>
            <button>Details</button>
            <button>Harvest</button>
            <button>Reposition</button>
        </div>
    );

    const menuIcon = (
        <div className={styles.min_buttons}>
            <button>Reposition</button>
            <div className={styles.menu_icon}>...</div>
        </div>
    );

    const inRangeStatus = (
        <div className={styles.range_status}>
            <div className={styles.range_icon}></div>
            In Range
        </div>
    );

    const rangeIcon2 = <div className={styles.range_icon_2}></div>;

    const rowData = (
        <div className={styles.row}>
            <div className={styles.pool_name}>ABC/XYZ</div>
            <div className={styles.account}>0xcD...134</div>
            <div className={styles.account}>0BcD...134</div>
            {accountColumn}
            {minMax}
            {lardeDesktopMinMaxDisplay}
            {tokenQty}
            {tokenQty}
            {tokenQtyColumn}
            <div className={styles.adivy}>APY</div>
            {inRangeStatus}
            {rangeIcon2}
        </div>
    );

    return <div></div>;
}
