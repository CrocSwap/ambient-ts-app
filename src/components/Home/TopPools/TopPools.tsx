import PoolCard from '../../Global/PoolCard/PoolCard';
import styles from './TopPools.module.css';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

interface TopPoolsPropsIF {
    noTitle?: boolean;
    gap?: string;
}
export default function TopPools(props: TopPoolsPropsIF) {
    const { topPools } = useContext(CrocEnvContext);

    const { t } = useTranslation();

    // TODO:   @Junior  please remove the NavLink wrapper or refactor PoolCard.tsx
    // TODO:   ... so it returns a NavLink element
    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    return (
        <motion.div
            className={styles.container}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 2 } }}
            data-aos={showMobileVersion ? 'fade-up' : ''}
        >
            {!props.noTitle && (
                <div
                    className={styles.title}
                    tabIndex={0}
                    aria-label='Top Pools'
                >
                    {t('topPools')}
                </div>
            )}
            <div
                className={styles.content}
                style={{ gap: props.gap ? props.gap : '1rem' }}
            >
                {topPools.map((pool, idx) => (
                    <PoolCard key={idx} pool={pool} />
                ))}
            </div>
        </motion.div>
    );
}
