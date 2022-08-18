import styles from './ExchangeBalance.module.css';

import Deposit from './Deposit/Deposit';
import Withdraw from './Withdraw/Withdraw';
import Transfer from './Transfer/Transfer';

import transferImage from '../../../assets/images/sidebarImages/transfer.svg';
import withdrawImage from '../../../assets/images/sidebarImages/withdraw.svg';
import depositImage from '../../../assets/images/sidebarImages/deposit.svg';
import TabComponent from '../../Global/TabComponent/TabComponent';

import { SetStateAction, Dispatch } from 'react';

interface ExchangeBalanceProps {
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
}

export default function ExchangeBalance(props: ExchangeBalanceProps) {
    const accountData = [
        { label: 'Deposit', content: <Deposit />, icon: depositImage },
        { label: 'Withdraw', content: <Withdraw />, icon: withdrawImage },
        { label: 'Transfer', content: <Transfer />, icon: transferImage },
    ];

    return (
        <div className={styles.main_container}>
            <div className={styles.title}>Exchange Balance</div>

            <div className={styles.tabs_container}>
                <TabComponent
                    data={accountData}
                    rightTabOptions={false}
                    setSelectedOutsideTab={props.setSelectedOutsideTab}
                    setOutsideControl={props.setOutsideControl}
                    outsideControl={false}
                    selectedOutsideTab={0}
                />
            </div>
            <div className={styles.info_text}>
                {' '}
                Collateral stored on the Ambient Finance exchange reduces gas costs when making
                transactions. Collateral can be withdrawn at any time.
            </div>
        </div>
    );
}
