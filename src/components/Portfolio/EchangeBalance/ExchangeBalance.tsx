import styles from './ExchangeBalance.module.css';
import { useState } from 'react';
import TabContent from '../../Global/Tabs/TabContent/TabContent';
import TabNavItem from '../../Global/Tabs/TabNavItem/TabNavItem';
import Deposit from './Deposit/Deposit';
import Withdraw from './Withdraw/Withdraw';
import Transfer from './Transfer/Transfer';

import transferImage from '../../../assets/images/sidebarImages/transfer.svg';
import withdrawImage from '../../../assets/images/sidebarImages/withdraw.svg';
import depositImage from '../../../assets/images/sidebarImages/deposit.svg';
import TabComponent from '../../Global/TabComponent/TabComponent';

export default function ExchangeBalance() {
    const accountData = [
        { label: 'Deposit', content: <Deposit />, icon: depositImage },
        { label: 'Withdraw', content: <Withdraw />, icon: withdrawImage },
        { label: 'Transfer', content: <Transfer />, icon: transferImage },
    ];

    return (
        <div className={styles.main_container}>
            <div className={styles.title}>Exchange Balance</div>

            <div className={styles.tabs_container}>
                <TabComponent data={accountData} rightTabOptions={false} />
            </div>
            <div className={styles.info_text}>
                {' '}
                Collateral stored on the Ambient Finance exchange reduces gas costs when making
                transactions. Collateral can be withdrawn at any time.
            </div>
        </div>
    );
}
