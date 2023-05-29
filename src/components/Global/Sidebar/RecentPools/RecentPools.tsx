import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import styles from './RecentPools.module.css';
import RecentPoolsCard from './RecentPoolsCard';
import { SmallerPoolIF } from '../../../../App/hooks/useRecentPools';
import { memo, useContext } from 'react';
import { SidebarContext } from '../../../../contexts/SidebarContext';

interface propsIF {
    cachedPoolStatsFetch: PoolStatsFn;
}

function RecentPools(props: propsIF) {
    const { cachedPoolStatsFetch } = props;

    const { recentPools } = useContext(SidebarContext);

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
                        pool={pool}
                        key={'recent_pool_' + JSON.stringify(pool)}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                    />
                ))}
            </div>
        </div>
    );
}

export default memo(RecentPools);
