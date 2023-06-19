import PoolCard from '../../Global/PoolCard/PoolCard';
import styles from './TopPools.module.css';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

export default function TopPools() {
    const { topPools } = useContext(CrocEnvContext);

    const { t } = useTranslation();

    return (
        <div className={styles.container}>
            <div className={styles.title} tabIndex={0} aria-label='Top Pools'>
                {t('topPools')}
            </div>
            <div className={styles.content}>
                {topPools.map((pool, idx) => (
                    <PoolCard key={idx} pool={pool} />
                ))}
            </div>
        </div>
    );
}
