import OpenOrderStatus from '../Global/OpenOrderStatus/OpenOrderStatus';
import AccountPoolDisplay from '../Global/Tabs/AccountPoolDisplay/AccountPoolDisplay';
import AccountTokensDisplay from '../Global/Tabs/AccountTokensDisplay/AccountTokensDisplay';
import Price from '../Global/Tabs/Price/Price';
import RangesMenu from '../Global/Tabs/TableMenu/TableMenuComponents/RangesMenu';
import TokenQty from '../Global/Tabs/TokenQty/TokenQty';
import OrderTypeSide from '../Global/Tabs/TypeAndSide/OrderTypeAndSide/OrderTypeSide';
import WalletAndId from '../Global/Tabs/WalletAndID/WalletAndId';
import styles from './TopRange.module.css';

export default function TopRange() {
    const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    const tempPosHash = '0x01e650abfc761c6a0fc60f62a4e4b3832bb1178b';

    return (
        <div className={styles.main_container}>
            <div className={styles.tokens_container}>
                <AccountTokensDisplay />
            </div>

            <div className={styles.row_container}>
                <AccountPoolDisplay />
                <WalletAndId ownerId={tempOwnerId} posHash={tempPosHash} />
                <Price priceType='priceBuy' />
                <OrderTypeSide type='order' side='sell' />
                <TokenQty />
                <div className={styles.status}>
                    <OpenOrderStatus isFilled />
                </div>
            </div>

            <div className={styles.menu_container}>
                <RangesMenu
                    userPosition={false}
                    removeRangeProps={false}
                    posHash={tempPosHash as string}
                    positionData={undefined}
                />
            </div>
        </div>
    );
}
