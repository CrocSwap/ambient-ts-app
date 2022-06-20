import PoolCard from '../../Global/PoolCard/PoolCard';
import styles from './TopPools.module.css';
import { motion, AnimateSharedLayout, useViewportScroll, useTransform } from 'framer-motion';
import { useState } from 'react';

export default function TopPools() {
    const [selected, setSelected] = useState(-2);

    const statCardData = [
        {
            title: 'Total TVL',
            value: '1,000,000,000',
            speed: -2,
            id: 1,
        },
        {
            title: 'Total Volume',
            value: '1,000,000,000',
            speed: 0,
            id: 2,
        },
        {
            title: 'Total Fees',
            value: '1,000,000,000',
            speed: 0,
            id: 3,
        },

        {
            title: 'Total Fees',
            value: '1,000,000,000',
            speed: -1,
            id: 4,
        },
        {
            title: 'Total Fees',
            value: '1,000,000,000',
            speed: 0.5,
            id: 5,
        },

        {
            title: 'Total Fees',
            value: '1,000,000,000',
            speed: 0,
            id: 8,
        },
        {
            title: 'Total Fees',
            value: '1,000,000,000',
            speed: 0,
            id: 6,
        },
        {
            title: 'Total Fees',
            value: '1,000,000,000',
            speed: 0.5,
            id: 7,
        },
    ];

    return (
        <AnimateSharedLayout>
            <motion.div
                className={styles.container}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                exit={{ x: window.innerWidth, transition: { duration: 2 } }}
            >
                <div className={styles.title}>Top Pools</div>
                <div className={styles.content}>
                    {statCardData.map((pool, idx) => (
                        <PoolCard
                            speed={pool.speed}
                            key={idx}
                            isSelected={selected === pool.id}
                            onClick={() => setSelected(pool.id ? pool.id : -2)}
                        />
                    ))}
                </div>
            </motion.div>
        </AnimateSharedLayout>
    );
}
