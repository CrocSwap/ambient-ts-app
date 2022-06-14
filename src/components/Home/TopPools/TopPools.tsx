import PoolCard from '../../Global/PoolCard/PoolCard';
import styles from './TopPools.module.css';
import { motion } from 'framer-motion';

export default function TopPools() {
    const examplePools = [1, 2, 3, 4, 5, 6, 7, 8];

    return (
        <motion.div
            className={styles.container}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 2 } }}
        >
            <div className={styles.title}>Top Pools</div>
            <div className={styles.content}>
                {examplePools.map((pool, idx) => (
                    <PoolCard key={idx} />
                ))}
            </div>
        </motion.div>
    );
}
