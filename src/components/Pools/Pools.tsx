import { PoolData } from '../../state/pools/models';
import PoolCardHeader from './PoolCardHeader';
import PoolRow from './PoolRow';
import styles from './Pools.module.css';

export const SORT_FIELD = {
    feeTier: 'feeTier',
    volumeUSD: 'volumeUSD',
    tvlUSD: 'tvlUSD',
    volumeUSDWeek: 'volumeUSDWeek',
};

interface PoolProps {
    pools: PoolData[];
}

export default function Pools(props: PoolProps) {
    const poolsDisplay = props.pools.map((pool, idx) => (
        <PoolRow pool={pool} key={pool.address} index={idx} />
    ));

    return (
        <div className={styles.container}>
            <div className={styles.container}>
                <PoolCardHeader />
                {poolsDisplay}
            </div>
        </div>
    );
}
