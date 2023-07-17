import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import styles from '../SidebarTable.module.css';
import { memo, useContext } from 'react';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TokenPriceFn } from '../../../../App/functions/fetchTokenPrice';
import { PoolIF } from '../../../../utils/interfaces/exports';
import PoolListItem from '../PoolListItem/PoolListItem';

interface propsIF {
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

function RecentPools(props: propsIF) {
    const { cachedPoolStatsFetch, cachedFetchTokenPrice } = props;

    const { recentPools } = useContext(SidebarContext);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>Pool</div>
                <div>Volume</div>
                <div>TVL</div>
            </header>
            <div className={styles.content}>
                {recentPools.get(5).map((pool: PoolIF) => (
                    <PoolListItem
                        pool={pool}
                        key={'recent_pool_' + JSON.stringify(pool)}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        cachedFetchTokenPrice={cachedFetchTokenPrice}
                    />
                ))}
            </div>
        </div>
    );
}

export default memo(RecentPools);
