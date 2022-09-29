// START: Import React and Dongles
import {
    useState,
    useEffect,
    Dispatch,
    SetStateAction,
    cloneElement,
    ReactNode,
    ReactElement,
} from 'react';
import { motion, AnimateSharedLayout } from 'framer-motion';

// START: Import Local Files
import styles from './TabComponent.module.css';
import '../../../App/App.css';
import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';

type tabData = {
    label: string;
    content: ReactNode;
    icon?: string;
};

interface TabPropsIF {
    data: tabData[];
    setSelectedInsideTab?: Dispatch<SetStateAction<number>>;
    rightTabOptions?: ReactNode;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    // this props is for components that do not need outside control such as exchange balance
}

export default function TabComponent(props: TabPropsIF) {
    const {
        data,
        setSelectedInsideTab,
        selectedOutsideTab,
        rightTabOptions,
        outsideControl,
        setOutsideControl,
    } = props;

    const [selectedTab, setSelectedTab] = useState(data[0]);

    function handleSelectedTab(item: tabData) {
        // console.log({ item });
        if (setSelectedInsideTab) {
            switch (item.label) {
                case 'Transactions':
                    setSelectedInsideTab(0);
                    break;
                case 'Limit Orders':
                    setSelectedInsideTab(1);
                    break;
                case 'Ranges':
                    setSelectedInsideTab(2);
                    break;
                default:
                    break;
            }
        }
        setOutsideControl(false);
        setSelectedTab(item);
    }

    useEffect(() => {
        const currentTabData = data.find((item) => item.label === selectedTab.label);
        if (currentTabData) setSelectedTab(currentTabData);
    }, [data, outsideControl]);

    function handleOutside2() {
        if (!outsideControl) {
            return;
        } else {
            if (outsideControl) {
                if (data[selectedOutsideTab]) {
                    setSelectedTab(data[selectedOutsideTab]);
                } else {
                    setSelectedTab(data[0]);
                }
            }
        }
    }

    useEffect(() => {
        handleOutside2();
    }, [selectedTab, selectedOutsideTab, outsideControl]);

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
        cloneElement(rightTabOptions as ReactElement<any>, {
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
                {rightTabOptions ? rightOptionWithProps : null}
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
                <AnimateSharedLayout>
                    {rightTabOptions ? tabsWithRightOption : fullTabs}
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
