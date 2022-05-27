import styles from './Tabs.module.css';
import { useState } from 'react';
import TabNavItem from './TabNavItem/TabNavItem';
import TabContent from './TabContent/TabContent';
import Toggle from '../Toggle/Toggle';
import Positions from '../../Trade/Positions/Positions';
import LimitOrders from '../../Trade/LimitOrders/LimitOrders';
export default function Tabs() {
    const [activeTab, setActiveTab] = useState('tab1');
    const [isChecked, setIsChecked] = useState<boolean>(false);

    const positionsOnlyToggle = (
        <span className={styles.options_toggle}>
            My positions only
            <div className={styles.toggle_container}>
                <Toggle
                    isOn={isChecked}
                    handleToggle={() => setIsChecked(!isChecked)}
                    Width={36}
                    id='positions_only_toggle'
                />
            </div>
        </span>
    );

    const tabData = [
        { title: 'Positions', id: 'tab1' },
        { title: 'Limit Orders', id: 'tab2' },
        { title: 'Transactions', id: 'tab3' },
        { title: 'Leaderboard', id: 'tab4' },
        { title: 'Info', id: 'tab5' },
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
                <div className={styles.option_toggles}>{positionsOnlyToggle}</div>
            </div>
            <div className={styles.tabs_outlet}>
                <TabContent id='tab1' activeTab={activeTab}>
                    <Positions />
                </TabContent>
                <TabContent id='tab2' activeTab={activeTab}>
                    <LimitOrders />
                </TabContent>
                <TabContent id='tab3' activeTab={activeTab}>
                    <p>Tab 3 works!</p>
                </TabContent>
                <TabContent id='tab4' activeTab={activeTab}>
                    <p>tab4 works!</p>
                </TabContent>
            </div>
        </div>
    );
}
