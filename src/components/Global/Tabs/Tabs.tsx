import styles from './Tabs.module.css';
import { useState } from 'react';
import TabNavItem from './TabNavItem/TabNavItem';
export default function Tabs() {
    const [activeTab, setActiveTab] = useState('tab1');

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
                <div className={styles.option_toggles}>I AM OPTIONS</div>
            </div>
            <div className={styles.tabs_outlet}></div>
        </div>
    );
}
