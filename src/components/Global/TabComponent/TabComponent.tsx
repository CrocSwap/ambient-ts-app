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
// eslint-disable-next-line
import { motion, AnimateSharedLayout } from 'framer-motion';

// START: Import Local Files
import styles from './TabComponent.module.css';
import '../../../App/App.css';
import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import { ChartContext } from '../../../contexts/ChartContext';
import { FlexContainer } from '../../../styled/Common';

type tabData = {
    label: string;
    content: ReactNode;
    icon?: string;
    showRightSideOption?: boolean;
    onClick?: () => void;
};

interface TabPropsIF {
    data: tabData[];
    rightTabOptions?: ReactNode;
    setShowPositionsOnlyToggle?: Dispatch<SetStateAction<boolean>>;
    isModalView?: boolean;
    shouldSyncWithTradeModules?: boolean;
    transparent?: boolean;
    // this props is for components that do not need outside control such as exchange balance
}

export default function TabComponent(props: TabPropsIF) {
    const {
        data,
        rightTabOptions,
        isModalView = false,
        shouldSyncWithTradeModules = true,
        transparent = false,
    } = props;
    const {
        outsideControl,
        setOutsideControl,
        selectedOutsideTab,
        toggleTradeTable,
        setCurrentTxActiveInTransactions,
        setCurrentLimitOrderActive,
        setCurrentPositionActive,
    } = useContext(TradeTableContext);

    const { tradeTableState } = useContext(ChartContext);

    const [selectedTab, setSelectedTab] = useState(data[0]);

    const resetActiveRow = () => {
        setCurrentTxActiveInTransactions('');
        setCurrentLimitOrderActive('');
        setCurrentPositionActive('');
    };

    useEffect(() => {
        resetActiveRow();
    }, [selectedTab.label]);

    function handleSelectedTab(item: tabData) {
        setOutsideControl(false);
        setSelectedTab(item);

        if (tradeTableState === 'Collapsed') toggleTradeTable();
    }

    useEffect(() => {
        const currentTabData = data.find(
            (item) => item.label === selectedTab.label,
        );
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
        if (shouldSyncWithTradeModules) handleOutside2();
    }, [
        selectedTab,
        selectedOutsideTab,
        outsideControl,
        shouldSyncWithTradeModules,
    ]);

    function handleMobileMenuIcon(icon: string, label: string): JSX.Element {
        return (
            <div className={styles.tab_icon_container}>
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
        <FlexContainer alignItems='center' justifyContent='space-between'>
            <ul
                className={`${styles.tab_ul_left}`}
                aria-label='Navigation Tabs'
                role='tablist'
            >
                {data.map((item) => (
                    <li
                        key={item.label}
                        id={`${item.label
                            .replaceAll(' ', '_')
                            .toLowerCase()}_tab_clickable`}
                        className={
                            item.label === selectedTab.label
                                ? styles.selected
                                : styles.non_selected
                        }
                        onClick={() => {
                            handleSelectedTab(item);
                            item.onClick?.();
                        }}
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
                        {item.label === selectedTab.label ? (
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
        </FlexContainer>
    );

    // TAB MENU WITHOUT ANY ITEMS ON THE RIGHT

    const fullTabs = (
        <ul
            className={`${styles.tab_ul} ${styles.desktop_tabs}`}
            aria-label='Navigation Tabs'
        >
            {data.map((item) => (
                <li
                    key={item.label}
                    id={`${item.label
                        .replaceAll(' ', '_')
                        .toLowerCase()}_tab_clickable`}
                    className={
                        item.label === selectedTab.label
                            ? styles.selected
                            : styles.non_selected
                    }
                    onClick={() => {
                        handleSelectedTab(item);
                        item.onClick?.();
                    }}
                    role='tablist'
                    aria-describedby={
                        item.label === selectedTab.label ? 'current-tab' : ''
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
            ))}
        </ul>
    );

    const tabAlignStyle = isModalView
        ? styles.justify_content_center
        : styles.justify_content_flex_start;

    const backgroundStyle = transparent ? 'transparent' : 'var(--dark1)';

    return (
        <div
            className={styles.tab_window}
            style={{ background: backgroundStyle }}
            role='tablist'
            aria-orientation='horizontal'
            aria-label=''
        >
            <nav className={`${styles.tab_nav} ${tabAlignStyle}`}>
                {/* <AnimateSharedLayout> */}
                {rightTabOptions ? tabsWithRightOption : fullTabs}
                {/* </AnimateSharedLayout> */}
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
