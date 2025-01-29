import { motion } from 'framer-motion';
import React from 'react';
import styles from './SwipeableTabs.module.css';

interface Tab {
    label: string;
    content: React.ReactNode;
}

interface SwipeableTabsProps {
    tabs: Tab[];
    activeTab: number;
    setActiveTab: (index: number) => void;
}

const SwipeableTabs: React.FC<SwipeableTabsProps> = ({
    tabs,
    activeTab,
    setActiveTab,
}) => {
    const [direction, setDirection] = React.useState(0); // 1 for right swipe, -1 for left swipe

    const handleTabClick = (index: number) => {
        if (index !== activeTab) {
            setDirection(index > activeTab ? 1 : -1);
            setActiveTab(index);
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.x < -50 && activeTab < tabs.length - 1) {
            setDirection(1); // Right swipe
            setActiveTab(activeTab + 1);
        } else if (info.offset.x > 50 && activeTab > 0) {
            setDirection(-1); // Left swipe
            setActiveTab(activeTab - 1);
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    };

    return (
        <div className={styles.tabsContainer}>
            {/* Tab labels */}
            <div className={styles.tabLabels}>
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => handleTabClick(index)}
                        className={`${styles.tabLabel} ${activeTab === index ? styles.active : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {/* Tab content with swipe */}
            <motion.div
                key={activeTab}
                className={styles.tabContent}
                custom={direction}
                variants={variants}
                initial='enter'
                animate='center'
                exit='exit'
                transition={{ duration: 0.3 }}
                drag='x'
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
            >
                {tabs[activeTab]?.content}
            </motion.div>
            ;
        </div>
    );
};

export default SwipeableTabs;
