import Price from '../../../../Global/Tabs/Price/Price';
import TableMenu from '../../../../Global/Tabs/TableMenu/TableMenu';
import TokenQty from '../../../../Global/Tabs/TokenQty/TokenQty';
import TransactionTypeSide from '../../../../Global/Tabs/TypeAndSide/TransactionTypeSide/TransactionTypeSide';
import WalletAndId from '../../../../Global/Tabs/WalletAndID/WalletAndId';
import styles from './TransactionCard.module.css';
import AccountPoolDisplay from '../../../Tabs/AccountPoolDisplay/AccountPoolDisplay';
import AccountTokensDisplay from '../../../Tabs/AccountTokensDisplay/AccountTokensDisplay';

export default function TransactionCard() {
    const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    const tempPosHash = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    return (
        <div className={styles.main_container}>
            <div className={styles.tokens_container}>
                <AccountTokensDisplay />
            </div>
            <div className={styles.row_container}>
                <AccountPoolDisplay />
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
                <TableMenu tableType='transactions' userPosition={false} />
            </div>
        </div>
    );
}
