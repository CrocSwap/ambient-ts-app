import PoolCard from '../../Global/PoolCard/PoolCard';
import styles from './TopPools.module.css';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

export default function TopPools() {
    const { topPools } = useContext(CrocEnvContext);

    const { t } = useTranslation();

    // TODO:   @Junior  please remove the NavLink wrapper or refactor PoolCard.tsx
    // TODO:   ... so it returns a NavLink element

    return (
        <motion.div
            className={styles.container}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 2 } }}
        >
            <div className={styles.divider} />
            <div className={styles.title} tabIndex={0} aria-label='Top Pools'>
                {t('topPools')}
            </div>
            <div className={styles.content}>
                {topPools.map((pool, idx) => (
                    <PoolCard key={idx} pool={pool} />
                ))}
            </div>
        </motion.div>
    );
}
