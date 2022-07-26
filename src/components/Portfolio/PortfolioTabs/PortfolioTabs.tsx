import styles from './PortfolioTabs.module.css';
import { useState } from 'react';
import TabContent from '../../Global/Tabs/TabContent/TabContent';
import TabNavItem from '../../Global/Tabs/TabNavItem/TabNavItem';
import Wallet from '../../Global/Account/AccountTabs/Wallet/Wallet';
import Exchange from '../../Global/Account/AccountTabs/Exchange/Exchange';
import Range from '../../Global/Account/AccountTabs/Range/Range';
import Order from '../../Global/Account/AccountTabs/Order/Order';
import TransactionsTable from '../../Global/Account/AccountTabs/Transaction/TransactionsTable';
// import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
// import Wallet from '../../Global/Account/Wallet/Wallet';
// import Exchange from '../../Global/Account/Exchange/Exchange';
// import Range from '../../Global/Account/Range/Range';
// import Order from '../../Global/Account/Order/Order';
// import TransactionsTable from '../../Global/Account/Transaction/TransactionsTable';

export default function PortfolioTabs() {
    const [activeTab, setActiveTab] = useState('tab1');
    // const graphData = useAppSelector((state) => state?.graphData);

    const tabData = [
        { title: 'Wallet', id: 'tab1' },
        { title: 'Exchange', id: 'tab2' },
        { title: 'Ranges', id: 'tab3' },
        { title: ' Orders', id: 'tab4' },
        { title: 'Transactions', id: 'tab5' },
    ];

    return (
        <div className={styles.tabs_container}>
            <div className={styles.tabs}>
                <ul className={styles.tab_navs}>
                    {tabData.map((tab) => (
                        <TabNavItem
                            key={tab.title}
                            title={tab.title}
                            id={tab.id}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    ))}
                </ul>
                {/* <div className={styles.option_toggles}>{positionsOnlyToggle}</div> */}
            </div>
            <div className={styles.tabs_outlet}>
                <TabContent id='tab1' activeTab={activeTab}>
                    <Wallet />
                </TabContent>
                <TabContent id='tab2' activeTab={activeTab}>
                    <Exchange />
                </TabContent>
                <TabContent id='tab3' activeTab={activeTab}>
                    <Range />
                </TabContent>
                <TabContent id='tab4' activeTab={activeTab}>
                    <Order />
                </TabContent>
                <TabContent id='tab5' activeTab={activeTab}>
                    <TransactionsTable />
                </TabContent>
            </div>
        </div>
    );
}
