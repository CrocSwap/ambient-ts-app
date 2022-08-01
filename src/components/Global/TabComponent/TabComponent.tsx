import styles from './TabComponent.module.css';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ItemEnterAnimation } from '../../../utils/others/FramerMotionAnimations';
import DropdownMenu2 from '../DropdownMenu2/DropdownMenu2';
import '../../../App/App.css';
import { Tooltip } from '@mui/material';
import { useStyles } from '../../../utils/functions/styles';
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

    console.log(data);
    const [selectedTab, setSelectedTab] = useState(data[0]);

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
        const classes = useStyles();
        return (
            <div className={styles.tab_iconf}>
                <Tooltip
                    title={label}
                    placeholder={'bottom'}
                    arrow
                    enterDelay={400}
                    leaveDelay={200}
                    classes={{
                        tooltip: classes.customTooltip,
                    }}
                >
                    <img className={styles.tab_icon} src={icon} alt={label} width='15px' />
                </Tooltip>
            </div>
        );
    }

    const tabsWithRightOption = (
        <div className={styles.tab_with_option_container}>
            <ul className={`${styles.tab_ul_left} ${styles.desktop_tabs} `}>
                {data.map((item) => (
                    <li
                        key={item.label}
                        className={item === selectedTab ? styles.selected : ''}
                        onClick={() => handleSelectedTab(item)}
                    >
                        {item.icon ? handleMobileMenuIcon(item.icon, item.label) : null}

                        <div className={styles.item_label}> {item.label}</div>
                        {item.label === selectedTab.label && <div className={styles.underline} />}
                        {/* {item === selectedTab ? (
              <motion.div className={styles.underline} layoutId='underline' />
            ) : null} */}
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
    );

    return (
        <div className={styles.tab_window}>
            <nav className={styles.tab_nav}>
                {props.rightTabOptions ? tabsWithRightOption : fullTabs}
            </nav>
            <main className={styles.main_tab_content}>
                {/* <AnimatePresence exitBeforeEnter> */}
                <div
                // key={selectedTab ? selectedTab.label : 'empty'}
                // initial={{ y: 10, opacity: 0 }}
                // animate={{ y: 0, opacity: 1 }}
                // exit={{ y: -10, opacity: 0 }}
                // transition={{ duration: 0.2 }}
                >
                    {selectedTab ? selectedTab.content : 'no content to display'}
                </div>
                {/* </AnimatePresence> */}
            </main>
        </div>
    );
}
