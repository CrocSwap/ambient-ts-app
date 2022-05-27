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
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: innerWidth, transition: { duration: 0.4 } }}
            className={styles.TabContent}
        >
            {children}
        </motion.div>
    ) : null;
}
