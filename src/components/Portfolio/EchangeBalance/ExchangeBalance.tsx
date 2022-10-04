import styles from './ExchangeBalance.module.css';

import Deposit from './Deposit/Deposit';
import Withdraw from './Withdraw/Withdraw';
import Transfer from './Transfer/Transfer';

import transferImage from '../../../assets/images/sidebarImages/transfer.svg';
import withdrawImage from '../../../assets/images/sidebarImages/withdraw.svg';
import depositImage from '../../../assets/images/sidebarImages/deposit.svg';
import TabComponent from '../../Global/TabComponent/TabComponent';

import { SetStateAction, Dispatch } from 'react';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { CrocEnv } from '@crocswap-libs/sdk';

interface ExchangeBalanceProps {
    crocEnv: CrocEnv | undefined;
    connectedAccount: string;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    closeGlobalModal: () => void;
    tempTokenSelection: TokenIF;
}

export default function ExchangeBalance(props: ExchangeBalanceProps) {
    const {
        crocEnv,
        connectedAccount,
        openGlobalModal,
        closeGlobalModal,
        setSelectedOutsideTab,
        setOutsideControl,
        tempTokenSelection,
    } = props;

    const accountData = [
        {
            label: 'Deposit',
            content: (
                <Deposit
                    crocEnv={crocEnv}
                    connectedAccount={connectedAccount}
                    openGlobalModal={openGlobalModal}
                    closeGlobalModal={closeGlobalModal}
                    tempTokenSelection={tempTokenSelection}
                />
            ),
            icon: depositImage,
        },
        {
            label: 'Withdraw',
            content: (
                <Withdraw
                    crocEnv={crocEnv}
                    connectedAccount={connectedAccount}
                    openGlobalModal={openGlobalModal}
                    closeGlobalModal={closeGlobalModal}
                    tempTokenSelection={tempTokenSelection}
                />
            ),
            icon: withdrawImage,
        },
        {
            label: 'Transfer',
            content: (
                <Transfer
                    crocEnv={crocEnv}
                    // connectedAccount={connectedAccount}
                    openGlobalModal={openGlobalModal}
                    closeGlobalModal={closeGlobalModal}
                    tempTokenSelection={tempTokenSelection}
                />
            ),
            icon: transferImage,
        },
    ];

    return (
        <div className={styles.main_container}>
            {/* <div className={styles.title}>Exchange Balance</div> */}

            <div className={styles.tabs_container}>
                <TabComponent
                    data={accountData}
                    rightTabOptions={false}
                    setSelectedOutsideTab={setSelectedOutsideTab}
                    setOutsideControl={setOutsideControl}
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
