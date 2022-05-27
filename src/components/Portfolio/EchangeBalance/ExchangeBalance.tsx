import styles from './ExchangeBalance.module.css';
import { useState } from 'react';
import TabContent from '../../Global/Tabs/TabContent/TabContent';
import TabNavItem from '../../Global/Tabs/TabNavItem/TabNavItem';

export default function ExchangeBalance() {
    const [activeTab, setActiveTab] = useState('tab1');

    const tabData = [
        { title: 'Deposit', id: 'tab1' },
        { title: 'Withdraw', id: 'tab2' },
        { title: 'Transfer', id: 'tab3' },
    ];

    return (
        <div className={styles.main_container}>
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
                </div>
                <div className={styles.tabs_outlet}>
                    <TabContent id='tab1' activeTab={activeTab}>
                        {/* <p>Deposit</p> */}
                    </TabContent>
                    <TabContent id='tab2' activeTab={activeTab}>
                        {/* <p>Withdraw</p> */}
                    </TabContent>
                    <TabContent id='tab3' activeTab={activeTab}>
                        {/* <p>Transfer</p> */}
                    </TabContent>
                </div>
            </div>
            <div className={styles.info_text}>
                {' '}
                Collateral stored on the Ambient Finance exchange reduces gas costs when making
                transactions. Collateral can be withdrawn at any time.
            </div>
        </div>
    );
}
