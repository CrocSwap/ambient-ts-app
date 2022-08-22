import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import styles from './TabContent.module.css';

interface TabContentPropsIF {
    children: ReactNode;
    id: string;
    activeTab: string;
}
export default function Toggle(props: TabContentPropsIF) {
    const { children, id, activeTab } = props;

    return activeTab === id ? (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={styles.tab_container}
        >
            <div className={styles.TabContent}>{children}</div>
        </motion.div>
    ) : null;
}
