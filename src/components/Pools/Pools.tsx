import { useCallback, useMemo, useState } from 'react';
import { TOKEN_HIDE } from '../../constants';
import { PoolData } from '../../state/pools/reducer';
import PoolRow from './PoolRow';
import styles from './Pools.module.css';

interface PoolProps {
    propType: string;
    pools: PoolData[];
}

export default function Pools(props: PoolProps) {
    const SORT_FIELD = {
        feeTier: 'feeTier',
        volumeUSD: 'volumeUSD',
        tvlUSD: 'tvlUSD',
        volumeUSDWeek: 'volumeUSDWeek',
    };

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

    const poolsDisplay = sortedPools.map((pool, idx) => (
        <PoolRow pool={pool} index={idx + 1} key={idx} />
    ));

    const poolsHeader = (
        <thead>
            <tr>
                <th>#</th>

                <th>
                    <label onClick={() => handleSort(SORT_FIELD.feeTier)}>
                        Pool {arrow(SORT_FIELD.feeTier)}
                    </label>
                </th>
                <th></th>
                <th></th>
                <th>
                    <label onClick={() => handleSort(SORT_FIELD.tvlUSD)}>
                        TVL {arrow(SORT_FIELD.tvlUSD)}
                    </label>
                </th>
                <th>
                    <label onClick={() => handleSort(SORT_FIELD.volumeUSD)}>
                        Volume 24H {arrow(SORT_FIELD.volumeUSD)}
                    </label>
                </th>
                <th>
                    <label onClick={() => handleSort(SORT_FIELD.volumeUSDWeek)}>
                        Volume 7D {arrow(SORT_FIELD.volumeUSDWeek)}
                    </label>
                </th>
            </tr>
        </thead>
    );

    return (
        <div className={styles.pool_table_display}>
            <table>
                {poolsHeader}

                <tbody>{poolsDisplay}</tbody>
            </table>
        </div>
    );
}
