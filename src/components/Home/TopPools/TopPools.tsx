import PoolCard from '../../Global/PoolCard/PoolCard';
import styles from './TopPools.module.css';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SpotPriceFn } from '../../../App/functions/querySpotPrice';
import { userData } from '../../../utils/state/userDataSlice';
import { tradeData } from '../../../utils/state/tradeDataSlice';
import { PoolStatsFn } from '../../../App/functions/getPoolStats';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

interface propsIF {
    tradeData: tradeData;
    userData: userData;
    cachedQuerySpotPrice: SpotPriceFn;
    lastBlockNumber: number;
    cachedPoolStatsFetch: PoolStatsFn;
}

export default function TopPools(props: propsIF) {
    const {
        tradeData,
        userData,
        lastBlockNumber,
        cachedQuerySpotPrice,
        cachedPoolStatsFetch,
    } = props;
    const { topPools } = useContext(CrocEnvContext);

    const { t } = useTranslation();

    // TODO:   @Junior  please remove the NavLink wrapper or refactor PoolCard.tsx
    // TODO:   ... so it returns a NavLink element

    const isUserIdle = userData.isUserIdle;

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
                    <PoolCard
                        isUserIdle={isUserIdle}
                        tradeData={tradeData}
                        cachedQuerySpotPrice={cachedQuerySpotPrice}
                        key={idx}
                        lastBlockNumber={lastBlockNumber}
                        pool={pool}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                    />
                ))}
            </div>
        </motion.div>
    );
}
