import Price from '../../../Global/Tabs/Price/Price';
import TableMenu from '../../../Global/Tabs/TableMenu/TableMenu';
import TokenQty from '../../../Global/Tabs/TokenQty/TokenQty';
import TransactionTypeSide from '../../../Global/Tabs/TypeAndSide/TransactionTypeSide/TransactionTypeSide';
import WalletAndId from '../../../Global/Tabs/WalletAndID/WalletAndId';
import styles from './TransactionCard2.module.css';

export default function TransactionCard2() {
    const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    const tempPosHash = '0x01e650abfc761c6a0fc60f62a4e4b3832bb1178b';

    return (
        <div className={styles.main_container}>
            <div className={styles.row_container}>
                {/* ------------------------------------------------------ */}

                <WalletAndId ownerId={tempOwnerId} posHash={tempPosHash} />

                {/* ------------------------------------------------------ */}

                <Price priceType='minMaxAdd' />
                {/* ------------------------------------------------------ */}

                <TransactionTypeSide type='remove' side='rangeAdd' />
                {/* ------------------------------------------------------ */}

                <TokenQty />
            </div>

            <div className={styles.menu_container}>
                <TableMenu tableType='transactions' />
            </div>
        </div>
    );
}
