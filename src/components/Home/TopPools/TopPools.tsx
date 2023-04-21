import PoolCard from '../../Global/PoolCard/PoolCard';
import styles from './TopPools.module.css';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TokenIF } from '../../../utils/interfaces/exports';
import { SpotPriceFn } from '../../../App/functions/querySpotPrice';
import { userData } from '../../../utils/state/userDataSlice';
import { tradeData } from '../../../utils/state/tradeDataSlice';
import { topPoolIF } from '../../../App/hooks/useTopPools';
import { PoolStatsFn } from '../../../App/functions/getPoolStats';

interface propsIF {
    isServerEnabled: boolean;
    tradeData: tradeData;
    userData: userData;
    cachedQuerySpotPrice: SpotPriceFn;
    tokenMap: Map<string, TokenIF>;
    lastBlockNumber: number;
    chainId: string;
    topPools: topPoolIF[];
    cachedPoolStatsFetch: PoolStatsFn;
}

export default function TopPools(props: propsIF) {
    const {
        isServerEnabled,
        tradeData,
        userData,
        lastBlockNumber,
        chainId,
        cachedQuerySpotPrice,
        topPools,
        cachedPoolStatsFetch,
    } = props;

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
                        isServerEnabled={isServerEnabled}
                        isUserIdle={isUserIdle}
                        tradeData={tradeData}
                        cachedQuerySpotPrice={cachedQuerySpotPrice}
                        key={idx}
                        lastBlockNumber={lastBlockNumber}
                        chainId={chainId}
                        pool={pool}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                    />
                ))}
            </div>
        </motion.div>
    );
}
