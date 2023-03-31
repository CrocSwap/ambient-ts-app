import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { tradeData } from '../../../../utils/state/tradeDataSlice';
import styles from './RecentPools.module.css';
import RecentPoolsCard from './RecentPoolsCard';
import {
    recentPoolsMethodsIF,
    SmallerPoolIF,
} from '../../../../App/hooks/useRecentPools';

interface propsIF {
    tradeData: tradeData;
    chainId: string;
    cachedPoolStatsFetch: PoolStatsFn;
    lastBlockNumber: number;
    recentPools: recentPoolsMethodsIF;
}

export default function RecentPools(props: propsIF) {
    const {
        tradeData,
        chainId,
        lastBlockNumber,
        cachedPoolStatsFetch,
        recentPools,
    } = props;

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
                        chainId={chainId}
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
