import styles from './TabComponent.module.css';
import React, { useState, useEffect, Dispatch, SetStateAction, cloneElement } from 'react';
import { motion, AnimateSharedLayout } from 'framer-motion';
import '../../../App/App.css';

import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';
type tabData = {
    label: string;
    content: React.ReactNode;
    icon?: string;
};

type outsideTab = {
    switchToTab: boolean;
    tabToSwitchTo: number;
    stateHandler: Dispatch<SetStateAction<boolean>>;
};

interface TabProps {
    data: tabData[];
    rightTabOptions?: React.ReactNode;
    outsideTabControl?: outsideTab;
}

export default function TabComponent(props: TabProps) {
    const { data, outsideTabControl } = props;

    const [selectedTab, setSelectedTab] = useState(data[0]);

    useEffect(() => {
        const currentTabData = data.find((item) => item.label === selectedTab.label);
        if (currentTabData) setSelectedTab(currentTabData);
    }, [data, outsideTabControl]);

    function handleOutsideControl() {
        if (outsideTabControl) {
            if (selectedTab.label === data[outsideTabControl.tabToSwitchTo].label) {
                return;
            } else if (outsideTabControl.switchToTab) {
                setSelectedTab(data[outsideTabControl.tabToSwitchTo]);
            }
        }
        return;
    }

    useEffect(() => {
        handleOutsideControl();
    }, [selectedTab, outsideTabControl]);

    // const firstTwoNavs = [...data].slice(0, 2);
    // const remainingNavs = [...data].splice(2, data.length - 1);

    // We can honestly refactor one jsx to take care of both full nav items and nav items on the left but this is simpler to understand and refactor down the line.
    // TAB MENU WITH ITEMS ON THE RIGHT

    function handleSelectedTab(item: tabData) {
        if (outsideTabControl) {
            if (outsideTabControl.switchToTab) {
                outsideTabControl.stateHandler(false);

                setSelectedTab(item);
            } else {
                setSelectedTab(item);
            }
        }

        setSelectedTab(item);
    }

    function handleMobileMenuIcon(icon: string, label: string) {
        return (
            <div className={styles.tab_iconf}>
                <DefaultTooltip
                    title={label}
                    placeholder={'bottom'}
                    arrow
                    enterDelay={400}
                    leaveDelay={200}
                >
                    <img className={styles.tab_icon} src={icon} alt={label} width='15px' />
                </DefaultTooltip>
            </div>
        );
    }
    const rightOptionWithProps =
        // eslint-disable-next-line
        cloneElement(props.rightTabOptions as React.ReactElement<any>, {
            currentTab: selectedTab.label,
        });

    const tabsWithRightOption = (
        <div className={styles.tab_with_option_container}>
            <ul className={`${styles.tab_ul_left} ${styles.desktop_tabs} `}>
                {data.map((item) => (
                    <li
                        key={item.label}
                        className={item.label === selectedTab.label ? styles.selected : ''}
                        onClick={() => handleSelectedTab(item)}
                    >
                        {item.icon ? handleMobileMenuIcon(item.icon, item.label) : null}

                        <div className={styles.item_label}> {item.label}</div>
                        {item.label === selectedTab.label && <div className={styles.underline} />}
                        {item === selectedTab ? (
                            <motion.div className={styles.underline} layoutId='underline' />
                        ) : null}
                    </li>
                ))}
            </ul>
            <div className={styles.tap_option_right}>
                {props.rightTabOptions ? rightOptionWithProps : null}
            </div>
        </div>
    );

    // TAB MENU WITHOUT ANY ITEMS ON THE RIGHT

    const fullTabs = (
        // <AnimateSharedLayout>

        <ul className={`${styles.tab_ul} ${styles.desktop_tabs}`}>
            {data.map((item) => {
                return (
                    <li
                        key={item.label}
                        className={item.label === selectedTab.label ? styles.selected : ''}
                        onClick={() => handleSelectedTab(item)}
                    >
                        {item.icon ? handleMobileMenuIcon(item.icon, item.label) : null}
                        <div className={styles.item_label}> {item.label}</div>

                        {item.label === selectedTab.label && (
                            <motion.div className={styles.underline} layoutId='underline' />
                        )}
                    </li>
                );
            })}
        </ul>
        // </AnimateSharedLayout>
    );

    return (
        <div className={styles.tab_window}>
            <nav className={styles.tab_nav}>
                <AnimateSharedLayout>
                    {props.rightTabOptions ? tabsWithRightOption : fullTabs}
                </AnimateSharedLayout>
            </nav>
            <main className={styles.main_tab_content}>
                <AnimateSharedLayout>
                    <motion.div
                        key={selectedTab ? selectedTab.label : 'empty'}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {selectedTab ? selectedTab.content : null}
                    </motion.div>
                </AnimateSharedLayout>
            </main>
        </div>
    );
}
