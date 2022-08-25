import { useCallback, useMemo, useState } from 'react';
import { TOKEN_HIDE } from '../../constants';
import { PoolData } from '../../state/pools/models';
import { PoolIF } from '../../utils/interfaces/PoolIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import PoolCardHeader from './PoolCardHeader';
import PoolRow from './PoolRow';
import styles from './Pools.module.css';

export const SORT_FIELD = {
    name: 'name',
    feeTier: 'feeTier',
    volumeUSD: 'volumeUSD',
    tvlUSD: 'tvlUSD',
    volumeUSDWeek: 'volumeUSDWeek',
};

interface PoolProps {
    pools: PoolData[];
    maxItems?: number;
    poolType: string;
    favePools: PoolIF[];
    addPoolToFaves: (tokenA: TokenIF, tokenB: TokenIF, chainId: string, poolId: number) => void;
    removePoolFromFaves: (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ) => void;
}

export default function Pools(props: PoolProps) {
    const [sortField, setSortField] = useState(SORT_FIELD.tvlUSD);
    const [sortDirection, setSortDirection] = useState<boolean>(true);
    const pools = props.pools;

    const sortedPools = useMemo(() => {
        return pools
            ? pools
                  .filter((x) => !!x && !TOKEN_HIDE.includes(x.address))
                  .sort((a, b) => {
                      if (a && b) {
                          return a[sortField as keyof PoolData] > b[sortField as keyof PoolData]
                              ? (sortDirection ? -1 : 1) * 1
                              : (sortDirection ? -1 : 1) * -1;
                      } else {
                          return -1;
                      }
                  })
            : [];
    }, [pools, sortDirection, sortField]);

    const handleSort = useCallback(
        (newField: string) => {
            setSortField(newField);
            setSortDirection(sortField !== newField ? true : !sortDirection);
        },
        [sortDirection, sortField],
    );

    const arrow = useCallback(
        (field: string) => {
            return sortField === field ? (!sortDirection ? '↑' : '↓') : '';
        },
        [sortDirection, sortField],
    );

    const poolsDisplay = sortedPools.map((pool) => (
        <PoolRow
            poolType={props.poolType}
            pool={pool}
            key={pool.address}
            favePools={props.favePools}
            removePoolFromFaves={props.removePoolFromFaves}
            addPoolToFaves={props.addPoolToFaves}
        />
    ));

    return (
        <div className={styles.container}>
            <div className={styles.container}>
                <PoolCardHeader poolType={props.poolType} arrow={arrow} sort={handleSort} />
                {poolsDisplay}
            </div>
        </div>
    );
}
