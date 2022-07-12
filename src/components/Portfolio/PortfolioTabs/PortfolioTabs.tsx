import styles from './PortfolioTabs.module.css';
import { useState } from 'react';
import TabContent from '../../Global/Tabs/TabContent/TabContent';
import TabNavItem from '../../Global/Tabs/TabNavItem/TabNavItem';
import Positions from '../../Trade/Positions/Positions';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

export default function PortfolioTabs() {
    const [activeTab, setActiveTab] = useState('tab1');
    const graphData = useAppSelector((state) => state?.graphData);

    const tabData = [
        { title: 'Wallet', id: 'tab1' },
        { title: 'Exchange', id: 'tab2' },
        { title: 'Positions', id: 'tab3' },
        { title: 'Limit Orders', id: 'tab4' },
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
                    <Positions
                        portfolio
                        isShowAllEnabled={false}
                        notOnTradeRoute={true}
                        graphData={graphData}
                    />
                </TabContent>
                <TabContent id='tab2' activeTab={activeTab}>
                    {/* <p>Exchange Component</p> */}
                </TabContent>
                <TabContent id='tab3' activeTab={activeTab}>
                    {/* <p>Position component</p> */}
                </TabContent>
                <TabContent id='tab4' activeTab={activeTab}>
                    {/* <p>Limit Orders component</p> */}
                </TabContent>
                <TabContent id='tab5' activeTab={activeTab}>
                    {/* <p>Transactions component</p> */}
                </TabContent>
            </div>
        </div>
    );
}
