import OpenOrderStatus from '../../OpenOrderStatus/OpenOrderStatus';
import TableMenu from '../../TableMenu/TableMenu';
import styles from './OrderCard2.module.css';

export default function OrderCard2() {
    const token1 = (
        <div className={styles.qty_sing}>
            <p>T1 Qty</p>
            <img
                src='https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                alt=''
            />
        </div>
    );
    const token2 = (
        <div className={styles.qty_sing}>
            <p>T2 Qty</p>
            <img src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' alt='' />
        </div>
    );

    return (
        <div className={styles.main_container}>
            <div className={styles.row_container}>
                {/* ------------------------------------------------------ */}
                <div className={styles.column_account}>
                    <p>0xaBcD...1234</p>
                    <p>0xAbCd...9876</p>
                </div>
                <p className={styles.account_sing}>0xaBcD...1234</p>
                <p className={styles.account_sing}>0xAbCd...9876</p>

                {/* ------------------------------------------------------ */}
                <p className={styles.price}>Price</p>
                {/* ------------------------------------------------------ */}

                <div className={styles.type_column}>
                    <p>Buy</p>
                    <p>Limit</p>
                </div>
                <p className={styles.side_sing}>Buy</p>
                <p className={styles.type_sing}>Limit</p>
                {/* ------------------------------------------------------ */}
                <div className={styles.column_qty}>
                    <div>
                        <p>T1 Qty</p>
                        <img
                            src='https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                            alt=''
                        />
                    </div>
                    <div>
                        <p>T2 Qty</p>
                        <img
                            src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png'
                            alt=''
                        />
                    </div>
                </div>
                {token1}
                {token2}
                {/* ------------------------------------------------------ */}
                <div className={styles.status}>
                    <OpenOrderStatus isFilled />
                </div>
            </div>

            <div className={styles.menu_container}>
                <TableMenu tableType='orders' />
            </div>
        </div>
    );
}
