import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { tradeData } from '../../../../utils/state/tradeDataSlice';
import styles from './RecentPools.module.css';
import RecentPoolsCard from './RecentPoolsCard';
import {
    recentPoolsMethodsIF,
    SmallerPoolIF,
} from '../../../../App/hooks/useRecentPools';
import { memo } from 'react';

interface propsIF {
    tradeData: tradeData;
    cachedPoolStatsFetch: PoolStatsFn;
    lastBlockNumber: number;
    recentPools: recentPoolsMethodsIF;
}

function RecentPools(props: propsIF) {
    const { tradeData, lastBlockNumber, cachedPoolStatsFetch, recentPools } =
        props;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>Pool</div>
                <div>Volume</div>
                <div>TVL</div>
            </header>
            <div className={styles.content}>
                {recentPools.getPools(5).map((pool: SmallerPoolIF) => (
                    <RecentPoolsCard
                        tradeData={tradeData}
                        pool={pool}
                        key={'recent_pool_' + JSON.stringify(pool)}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        lastBlockNumber={lastBlockNumber}
                    />
                ))}
            </div>
        </div>
    );
}

export default memo(RecentPools);
