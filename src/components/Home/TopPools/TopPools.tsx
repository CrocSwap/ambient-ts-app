import PoolCard from '../../Global/PoolCard/PoolCard';
import styles from './TopPools.module.css';
import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { topPools } from '../../../App/mockData';
import { TokenIF } from '../../../utils/interfaces/exports';
import { CrocEnv } from '@crocswap-libs/sdk';
import { SpotPriceFn } from '../../../App/functions/querySpotPrice';
import { userData } from '../../../utils/state/userDataSlice';
import { tradeData } from '../../../utils/state/tradeDataSlice';

interface propsIF {
    isServerEnabled: boolean;
    tradeData: tradeData;
    userData: userData;
    crocEnv?: CrocEnv;
    cachedQuerySpotPrice: SpotPriceFn;
    tokenMap: Map<string, TokenIF>;
    lastBlockNumber: number;
    chainId: string;
}

export default function TopPools(props: propsIF) {
    const {
        isServerEnabled,
        tradeData,
        userData,
        tokenMap,
        lastBlockNumber,
        crocEnv,
        chainId,
        cachedQuerySpotPrice,
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
            <div className={styles.title}>{t('topPools')}</div>
            <div className={styles.content}>
                {topPools.map((pool, idx) => (
                    <NavLink key={idx} to='/trade/market'>
                        <PoolCard
                            isServerEnabled={isServerEnabled}
                            isUserIdle={isUserIdle}
                            crocEnv={crocEnv}
                            tradeData={tradeData}
                            cachedQuerySpotPrice={cachedQuerySpotPrice}
                            name={pool.name}
                            baseToken={pool.base}
                            quoteToken={pool.quote}
                            key={idx}
                            tokenMap={tokenMap}
                            lastBlockNumber={lastBlockNumber}
                            chainId={chainId}
                        />
                    </NavLink>
                ))}
            </div>
        </motion.div>
    );
}
