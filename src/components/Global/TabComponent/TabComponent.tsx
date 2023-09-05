// START: Import React and Dongles
import {
    useState,
    useEffect,
    Dispatch,
    SetStateAction,
    cloneElement,
    ReactNode,
    ReactElement,
    useContext,
} from 'react';
import { motion, AnimateSharedLayout } from 'framer-motion';

// START: Import Local Files
import styles from './TabComponent.module.css';
import '../../../App/App.css';
import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import { ChartContext } from '../../../contexts/ChartContext';

type tabData = {
    label: string;
    content: ReactNode;
    icon?: string;
    showRightSideOption?: boolean;
};

interface TabPropsIF {
    data: tabData[];
    setSelectedInsideTab?: Dispatch<SetStateAction<number>>;
    rightTabOptions?: ReactNode;
    setShowPositionsOnlyToggle?: Dispatch<SetStateAction<boolean>>;
    isModalView?: boolean;
    shouldSyncWithTradeModules?: boolean;
    // this props is for components that do not need outside control such as exchange balance
}

export default function TabComponent(props: TabPropsIF) {
    const {
        data,
        setSelectedInsideTab,
        rightTabOptions,
        setShowPositionsOnlyToggle,
        isModalView = false,
        shouldSyncWithTradeModules = true,
    } = props;
    const {
        outsideControl,
        setOutsideControl,
        selectedOutsideTab,
        toggleTradeTable,
    } = useContext(TradeTableContext);

    const { tradeTableState } = useContext(ChartContext);

    const [selectedTab, setSelectedTab] = useState(data[0]);

    function handleSelectedTab(item: tabData) {
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

        if (tradeTableState === 'Collapsed') toggleTradeTable();
    }

    useEffect(() => {
        const currentTabData = data.find(
            (item) => item.label === selectedTab.label,
        );
        if (currentTabData) setSelectedTab(currentTabData);

        if (
            !currentTabData?.showRightSideOption &&
            setShowPositionsOnlyToggle
        ) {
            setShowPositionsOnlyToggle(false);
        } else if (
            currentTabData?.showRightSideOption &&
            setShowPositionsOnlyToggle
        ) {
            setShowPositionsOnlyToggle(true);
        }
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
        if (shouldSyncWithTradeModules) handleOutside2();
    }, [
        selectedTab,
        selectedOutsideTab,
        outsideControl,
        shouldSyncWithTradeModules,
    ]);

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
                    <img
                        className={styles.tab_icon}
                        src={icon}
                        alt={label}
                        width='15px'
                    />
                </DefaultTooltip>
            </div>
        );
    }
    const rightOptionWithProps =
        // eslint-disable-next-line
        cloneElement(rightTabOptions as ReactElement<any>, {
            currentTab: selectedTab.label,
        });
    const mobileView = useMediaQuery('(min-width: 800px)');

    const tabsWithRightOption = (
        <div className={styles.tab_with_option_container}>
            <ul
                className={`${styles.tab_ul_left}`}
                aria-label='Navigation Tabs'
                role='tablist'
            >
                {data.map((item) => (
                    <li
                        key={item.label}
                        className={
                            item.label === selectedTab.label
                                ? styles.selected
                                : styles.non_selected
                        }
                        onClick={() => handleSelectedTab(item)}
                        aria-describedby={
                            item.label === selectedTab.label
                                ? 'current-tab'
                                : ''
                        }
                        tabIndex={0}
                    >
                        {item.icon
                            ? handleMobileMenuIcon(item.icon, item.label)
                            : null}

                        {mobileView && (
                            <button
                                onClick={() => handleSelectedTab(item)}
                                className={styles.label_button}
                                role='tab'
                                aria-selected={item.label === selectedTab.label}
                                tabIndex={0}
                            >
                                {' '}
                                {item.label}
                            </button>
                        )}
                        {item.label === selectedTab.label && (
                            <div className={styles.underline} />
                        )}
                        {item === selectedTab ? (
                            <motion.div
                                className={styles.underline}
                                layoutId='underline'
                            />
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
        <ul
            className={`${styles.tab_ul} ${styles.desktop_tabs}`}
            aria-label='Navigation Tabs'
        >
            {data.map((item) => {
                return (
                    <li
                        key={item.label}
                        className={
                            item.label === selectedTab.label
                                ? styles.selected
                                : styles.non_selected
                        }
                        onClick={() => handleSelectedTab(item)}
                        role='tablist'
                        aria-describedby={
                            item.label === selectedTab.label
                                ? 'current-tab'
                                : ''
                        }
                    >
                        {item.icon
                            ? handleMobileMenuIcon(item.icon, item.label)
                            : null}
                        {mobileView && (
                            <button
                                className={`${styles.item_label} ${
                                    item.label === selectedTab.label
                                        ? styles.selected
                                        : ''
                                }`}
                                onClick={() => handleSelectedTab(item)}
                                role='tab'
                                aria-selected={item.label === selectedTab.label}

                                // tabIndex={item.label === selectedTab.label ? 0 : -1}
                            >
                                {' '}
                                {item.label}
                            </button>
                        )}

                        {item.label === selectedTab.label && (
                            <motion.div
                                className={styles.underline}
                                layoutId='underline'
                                role='presentation'
                            />
                        )}
                    </li>
                );
            })}
        </ul>
    );

    const tabAlignStyle = isModalView
        ? styles.justify_content_center
        : styles.justify_content_flex_start;

    return (
        <div
            className={styles.tab_window}
            role='tablist'
            aria-orientation='horizontal'
            aria-label=''
        >
            <nav className={`${styles.tab_nav} ${tabAlignStyle}`}>
                <AnimateSharedLayout>
                    {rightTabOptions ? tabsWithRightOption : fullTabs}
                </AnimateSharedLayout>
            </nav>
            <div className={styles.main_tab_content}>
                <AnimateSharedLayout>
                    <motion.div
                        key={selectedTab ? selectedTab.label : 'empty'}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        role='tabpanel'
                        tabIndex={0}
                        style={{ height: '100%' }}
                        hidden={!selectedTab}
                    >
                        {selectedTab ? selectedTab.content : null}
                    </motion.div>
                </AnimateSharedLayout>
            </div>
        </div>
    );
}
