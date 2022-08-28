// // import RangeStatus from '../../RangeStatus/RangeStatus';
import styles from './RangeCard.module.css';

import RangeStatus from '../../../RangeStatus/RangeStatus';
import { PositionIF } from '../../../../../utils/interfaces/PositionIF';
// import WalletAndId from '../../../Tabs/WalletAndID/WalletAndId';
import RangeMinMax from '../../../Tabs/RangeMinMax/RangeMinMax';
import TokenQty from '../../../Tabs/TokenQty/TokenQty';
import Apy from '../../../Tabs/Apy/Apy';
// import RangesMenu from '../../../Tabs/TableMenu/TableMenuComponents/RangesMenu';
import AccountPoolDisplay from '../../../Tabs/AccountPoolDisplay/AccountPoolDisplay';
import AccountTokensDisplay from '../../../Tabs/AccountTokensDisplay/AccountTokensDisplay';

interface RangeCardPropsIF {
    position: PositionIF;
}

export default function RangeCard(props: RangeCardPropsIF) {
    const { position } = props;
    console.log({ position });

    return (
        <div className={styles.main_container}>
            <div className={styles.tokens_container}>
                <AccountTokensDisplay />
            </div>

            <div className={styles.row_container}>
                <AccountPoolDisplay />
                {/* <WalletAndId posHash='0xcD3eee3fddg134' ownerId={position.user} /> */}
                <RangeMinMax min={234} max={342} />
                <TokenQty />
                <Apy amount={10} />
                <RangeStatus isInRange isAmbient={false} />
            </div>

            <div className={styles.menu_container}>...</div>
        </div>
    );
}
