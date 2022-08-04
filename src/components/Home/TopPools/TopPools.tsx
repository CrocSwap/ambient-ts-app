import PoolCard from '../../Global/PoolCard/PoolCard';
import styles from './TopPools.module.css';
import { motion } from 'framer-motion';
import { topPools } from '../../../App/mockData';
import { useTranslation } from 'react-i18next';

export default function TopPools() {
    const { t } = useTranslation();

    // const statCardData = [
    //     {
    //         title: 'Total TVL',
    //         value: '1,000,000,000',
    //         speed: -2,
    //         id: 1,
    //     },
    //     {
    //         title: 'Total Volume',
    //         value: '1,000,000,000',
    //         speed: 0,
    //         id: 2,
    //     },
    //     {
    //         title: 'Total Fees',
    //         value: '1,000,000,000',
    //         speed: 0,
    //         id: 3,
    //     },

    //     {
    //         title: 'Total Fees',
    //         value: '1,000,000,000',
    //         speed: -1,
    //         id: 4,
    //     },
    //     {
    //         title: 'Total Fees',
    //         value: '1,000,000,000',
    //         speed: 0.5,
    //         id: 5,
    //     },

    //     {
    //         title: 'Total Fees',
    //         value: '1,000,000,000',
    //         speed: 0,
    //         id: 8,
    //     },
    //     {
    //         title: 'Total Fees',
    //         value: '1,000,000,000',
    //         speed: 0,
    //         id: 6,
    //     },
    //     {
    //         title: 'Total Fees',
    //         value: '1,000,000,000',
    //         speed: 0.5,
    //         id: 7,
    //     },
    // ];

    return (
        <motion.div
            className={styles.container}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 2 } }}
        >
            <div className={styles.title}>{t('topPools')}</div>
            <div className={styles.content}>
                {topPools.map((pool, idx) => (
                    <PoolCard speed={pool.speed} name={pool.name} key={idx} />
                ))}
            </div>
        </motion.div>
    );
}
