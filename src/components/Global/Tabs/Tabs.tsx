import styles from './Tabs.module.css';
import { useState } from 'react';
import TabNavItem from './TabNavItem/TabNavItem';
import Toggle from '../Toggle/Toggle';
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
                    id='tokens_withdrawal'
                />
            </div>
        </span>
    );

    return (
        <div className={styles.tabs_container}>
            <div className={styles.tabs}>
                <ul className={styles.tab_navs}>
                    <TabNavItem
                        title='Tab 1'
                        id='tab1'
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                    <TabNavItem
                        title='Tab 2'
                        id='tab2'
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                    <TabNavItem
                        title='Tab 3'
                        id='tab3'
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                    <TabNavItem
                        title='Tab 4'
                        id='tab4'
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                </ul>
                <div className={styles.option_toggles}>{positionsOnlyToggle}</div>
            </div>
            <div className={styles.tabs_outlet}></div>
        </div>
    );
}
