import styles from './TabContent.module.css';
import { motion } from 'framer-motion';

interface TabContentProps {
    children: React.ReactNode;
    id: string;
    activeTab: string;
}
export default function Toggle(props: TabContentProps) {
    const { children, id, activeTab } = props;

    return activeTab === id ? (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={styles.TabContent}
        >
            {children}
        </motion.div>
    ) : null;
}
