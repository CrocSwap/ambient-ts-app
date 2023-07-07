import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import styles from '../SidebarTable.module.css';
import RecentPoolsCard from './RecentPoolsCard';
import { SmallerPoolIF } from '../../../../App/hooks/useRecentPools';
import { memo, useContext } from 'react';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TokenPriceFn } from '../../../../App/functions/fetchTokenPrice';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';

interface propsIF {
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

function RecentPools(props: propsIF) {
    const { cachedPoolStatsFetch, cachedFetchTokenPrice } = props;

    const { recentPools } = useContext(SidebarContext);
    const { crocEnv } = useContext(CrocEnvContext);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>Pool</div>
                <div>Volume</div>
                <div>TVL</div>
            </header>
            <div className={styles.content}>
                {recentPools.get(5).map((pool: SmallerPoolIF) => (
                    <RecentPoolsCard
                        pool={pool}
                        key={'recent_pool_' + JSON.stringify(pool)}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        cachedFetchTokenPrice={cachedFetchTokenPrice}
                        crocEnv={crocEnv}
                    />
                ))}
            </div>
        </div>
    );
}

export default memo(RecentPools);
