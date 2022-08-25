import OpenOrderStatus from '../../../../Global/OpenOrderStatus/OpenOrderStatus';
import Price from '../../../../Global/Tabs/Price/Price';
import TokenQty from '../../../../Global/Tabs/TokenQty/TokenQty';
import OrderTypeSide from '../../../../Global/Tabs/TypeAndSide/OrderTypeAndSide/OrderTypeSide';
import WalletAndId from '../../../../Global/Tabs/WalletAndID/WalletAndId';
import AccountPoolDisplay from '../../../Tabs/AccountPoolDisplay/AccountPoolDisplay';
import AccountTokensDisplay from '../../../Tabs/AccountTokensDisplay/AccountTokensDisplay';
import OrdersMenu from '../../../Tabs/TableMenu/TableMenuComponents/OrdersMenu';

import styles from './OrderCard.module.css';

interface OrderCardProps {
    account: string;
}

export default function OrderCard(props: OrderCardProps) {
    const { account } = props;

    const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    const tempPosHash = '0x01e650abfc761c6a0fc60f62a4e4b3832bb1178b';

    const isOwnerActiveAccount = tempOwnerId.toLowerCase() === account.toLowerCase();

    return (
        <div className={styles.main_container}>
            <div className={styles.tokens_container}>
                <AccountTokensDisplay />
            </div>

            <div className={styles.row_container}>
                <AccountPoolDisplay />
                <WalletAndId
                    ownerId={tempOwnerId}
                    posHash={tempPosHash}
                    isOwnerActiveAccount={isOwnerActiveAccount}
                />
                <Price priceType='priceBuy' />
                <OrderTypeSide type='order' side='sell' />
                <TokenQty />
                <div className={styles.status}>
                    <OpenOrderStatus isFilled />
                </div>
            </div>

            <div className={styles.menu_container}>
                <OrdersMenu userPosition={false} />
            </div>
        </div>
    );
}
