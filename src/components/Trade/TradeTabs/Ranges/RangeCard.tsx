import styles from './RangeCard.module.css';
import Price from '../../../Global/Tabs/Price/Price';
import TableMenu from '../../../Global/Tabs/TableMenu/TableMenu';
import TokenQty from '../../../Global/Tabs/TokenQty/TokenQty';
import OrderTypeSide from '../../../Global/Tabs/TypeAndSide/OrderTypeAndSide/OrderTypeSide';
import WalletAndId from '../../../Global/Tabs/WalletAndID/WalletAndId';
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import RangeMinMax from '../../../Global/Tabs/RangeMinMax/RangeMinMax';
import Apy from '../../../Global/Tabs/Apy/Apy';
export default function RangeCard() {
    const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    const tempPosHash = '0x01e650abfc761c6a0fc60f62a4e4b3832bb1178b';
    return (
        <div className={styles.main_container}>
            <div className={styles.row_container}>
                {/* ------------------------------------------------------ */}

                <WalletAndId ownerId={tempOwnerId} posHash={tempPosHash} />

                {/* ------------------------------------------------------ */}
                {/* <Price priceType='priceBuy' /> */}
                <RangeMinMax />
                {/* ------------------------------------------------------ */}
                {/* <OrderTypeSide type='order' side='sell' /> */}
                <TokenQty />
                {/* ------------------------------------------------------ */}
                <Apy amount={10} />
                {/* ------------------------------------------------------ */}
                <RangeStatus isInRange isAmbient={false} />
            </div>

            <div className={styles.menu_container}>
                <TableMenu tableType='orders' />
            </div>
        </div>
    );
}
