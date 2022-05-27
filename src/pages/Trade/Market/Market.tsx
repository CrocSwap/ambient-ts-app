import styles from './Market.module.css';
import { motion } from 'framer-motion';

export default function Market() {
    return (
        <motion.section
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 0.6 } }}
            data-testid={'market'}
        >
            <main className={styles.main_layout}>
                <div className={styles.middle_col}>
                    <h1>THIS IS GRAPH COMPONENT FOR MARKEY</h1>
                </div>
                <div className={styles.right_col}>
                    <h1>THIS IS MARKET</h1>
                </div>
            </main>
        </motion.section>
    );
}
