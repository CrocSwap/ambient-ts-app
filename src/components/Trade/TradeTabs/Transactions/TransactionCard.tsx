import Price from '../../../Global/Tabs/Price/Price';
import TableMenu from '../../../Global/Tabs/TableMenu/TableMenu';
import TokenQty from '../../../Global/Tabs/TokenQty/TokenQty';
import TransactionTypeSide from '../../../Global/Tabs/TypeAndSide/TransactionTypeSide/TransactionTypeSide';
import WalletAndId from '../../../Global/Tabs/WalletAndID/WalletAndId';
import styles from './TransactionCard.module.css';
import { ISwap } from '../../../../utils/state/graphDataSlice';

interface TransactionProps {
    swap: ISwap;
}
export default function TransactionCard(props: TransactionProps) {
    const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    const PosHash = props.swap.id;

    return (
        <div className={styles.main_container}>
            <div className={styles.row_container}>
                {/* ------------------------------------------------------ */}

                <WalletAndId ownerId={tempOwnerId} posHash={PosHash} />

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
