import OpenOrderStatus from '../../../Global/OpenOrderStatus/OpenOrderStatus';
import Price from '../../../Global/Tabs/Price/Price';
import TableMenu from '../../../Global/Tabs/TableMenu/TableMenu';
import TokenQty from '../../../Global/Tabs/TokenQty/TokenQty';
import OrderTypeSide from '../../../Global/Tabs/TypeAndSide/OrderTypeAndSide/OrderTypeSide';
import WalletAndId from '../../../Global/Tabs/WalletAndID/WalletAndId';
import styles from './OrderCard2.module.css';

export default function OrderCard2() {
    const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    const tempPosHash = '0x01e650abfc761c6a0fc60f62a4e4b3832bb1178b';
    return (
        <div className={styles.main_container}>
            <div className={styles.row_container}>
                {/* ------------------------------------------------------ */}
                {/* <section className={styles.column_account}>
                    <p>0xcD...1234</p>
                    <p>0xCd...9876</p>
                </section>
                <section className={styles.account_sing}>0xcD...1234</section>
                <section className={styles.account_sing}>0xCd...9876</section> */}
                <WalletAndId ownerId={tempOwnerId} posHash={tempPosHash} />

                {/* ------------------------------------------------------ */}
                {/* <section className={styles.price}>Price</section> */}
                <Price />
                {/* ------------------------------------------------------ */}

                {/* <section className={styles.type_column}>
                    <p>Buy</p>
                    <p>Limit</p>
                </section>
                <section className={styles.side_sing}>Buy</section>
                <section className={styles.type_sing}>Limit</section> */}

                <OrderTypeSide />
                {/* ------------------------------------------------------ */}
                {/* <section className={styles.column_qty}>
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
                </section>
                {token1}
                {token2} */}
                <TokenQty />
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
