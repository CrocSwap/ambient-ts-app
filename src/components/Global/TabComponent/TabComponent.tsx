import styles from './TabComponent.module.css';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ItemEnterAnimation } from '../../../utils/others/FramerMotionAnimations';
import DropdownMenu2 from '../DropdownMenu2/DropdownMenu2';
import '../../../App/App.css';
type tabData = {
    label: string;
    content: React.ReactNode;
};

interface TabProps {
    data: tabData[];
    rightTabOptions?: React.ReactNode;
}

export default function TabComponent(props: TabProps) {
    const { data } = props;
    const [selectedTab, setSelectedTab] = useState(data[0]);

    // const firstTwoNavs = [...data].slice(0, 2);
    // const remainingNavs = [...data].splice(2, data.length - 1);

    const networkMenuContent = (
        <ul className={`${styles.menu_content} `}>
            {data.map((nav, idx) => (
                <motion.li
                    key={idx}
                    className={`${styles.network_item} ${
                        nav === selectedTab ? styles.selected : ''
                    }`}
                    onClick={() => setSelectedTab(nav)}
                    custom={idx}
                    variants={ItemEnterAnimation}
                >
                    <div className={styles.chain_name_status}>{nav.label}</div>
                </motion.li>
            ))}
        </ul>
    );

    const dropdownMenu = (
        <div className={styles.dropdown_menu_container}>
            <DropdownMenu2 marginTop={'10px'} titleWidth={'100%'} title={'Menu'}>
                {networkMenuContent}
            </DropdownMenu2>
        </div>
    );

    const mobileTabContainer = (
        <div className={styles.mobile_container}>
            {dropdownMenu}
            {/* {mobileTabMenu} */}
        </div>
    );

    // We can honestly refactor one jsx to take care of both full nav items and nav items on the left but this is simpler to understand and refactor down the line.
    // TAB MENU WITH ITEMS ON THE RIGHT
    const tabsWithRightOption = (
        <div className={styles.tab_with_option_container}>
            <ul className={`${styles.tab_ul_left} ${styles.desktop_tabs} `}>
                {data.map((item) => (
                    <li
                        key={item.label}
                        className={item === selectedTab ? styles.selected : ''}
                        onClick={() => setSelectedTab(item)}
                    >
                        {item.label}
                        {item === selectedTab ? (
                            <motion.div className={styles.underline} layoutId='underline' />
                        ) : null}
                    </li>
                ))}
            </ul>
            <div className={styles.tap_option_right}>
                {props.rightTabOptions ? props.rightTabOptions : null}
            </div>
        </div>
    );

    // TAB MENU WITHOUT ANY ITEMS ON THE RIGHT

    const fullTabs = (
        <ul className={`${styles.tab_ul} ${styles.desktop_tabs}`}>
            {data.map((item) => (
                <li
                    key={item.label}
                    className={item === selectedTab ? styles.selected : ''}
                    onClick={() => setSelectedTab(item)}
                >
                    {item.label}
                    {item === selectedTab ? (
                        <motion.div className={styles.underline} layoutId='underline' />
                    ) : null}
                </li>
            ))}
        </ul>
    );

    return (
        <div className={styles.tab_window}>
            <nav className={styles.tab_nav}>
                {props.rightTabOptions ? tabsWithRightOption : fullTabs}
                {mobileTabContainer}
            </nav>
            <main className={styles.main_tab_content}>
                <AnimatePresence exitBeforeEnter>
                    <motion.div
                        key={selectedTab ? selectedTab.label : 'empty'}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {selectedTab ? selectedTab.content : '😋'}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
