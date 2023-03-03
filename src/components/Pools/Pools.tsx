/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from 'react';
import { favePoolsMethodsIF } from '../../App/hooks/useFavePools';
import { TOKEN_HIDE } from '../../constants';
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

interface propsIF {
    pools: any[];
    maxItems?: number;
    poolType: string;
    favePools: favePoolsMethodsIF;
}

export default function Pools(props: propsIF) {
    const {pools, poolType, favePools} = props;

    const [sortField, setSortField] = useState(SORT_FIELD.tvlUSD);
    const [sortDirection, setSortDirection] = useState<boolean>(true);

    const sortedPools = useMemo(() => {
        return pools
            ? pools
                .filter((x) => !!x && !TOKEN_HIDE.includes(x.address))
                .sort((a, b) => {
                    if (a && b) {
                        return a[sortField as keyof any] > b[sortField as keyof any]
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
            poolType={poolType}
            pool={pool}
            key={pool.address}
            favePools={favePools}
        />
    ));

    return (
        <div className={styles.container}>
            <div className={styles.container}>
                <PoolCardHeader poolType={poolType} arrow={arrow} sort={handleSort} />
                {poolsDisplay}
            </div>
        </div>
    );
}
