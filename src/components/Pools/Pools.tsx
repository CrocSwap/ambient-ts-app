import { useCallback, useEffect, useMemo, useState } from 'react';
import { TOKEN_HIDE } from '../../constants';
import { PoolData } from '../../state/pools/models';
import PoolCardHeader from './PoolCardHeader';
import PoolRow from './PoolRow';
import styles from './Pools.module.css';
import { Pagination } from '@mui/material';

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
}

export default function Pools(props: PoolProps) {
    const [sortField, setSortField] = useState(SORT_FIELD.tvlUSD);
    const [sortDirection, setSortDirection] = useState<boolean>(true);
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const pools = props.pools;
    const maxItems = props.maxItems ? props.maxItems : pools.length;

    useEffect(() => {
        let extraPages = 1;
        if (pools.length % maxItems === 0) {
            extraPages = 0;
        }
        setMaxPage(Math.floor(pools.length / maxItems) + extraPages);
    }, [maxItems, pools]);

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
                  .slice(maxItems * (page - 1), page * maxItems)
            : [];
    }, [pools, sortDirection, sortField, page]);

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (event: any, value: number) => {
        setPage(value);
    };

    const poolsDisplay = sortedPools.map((pool, idx) => (
        <PoolRow pool={pool} key={pool.address} index={(page - 1) * maxItems + idx} />
    ));

    return (
        <div className={styles.container}>
            <div className={styles.container}>
                <PoolCardHeader arrow={arrow} sort={handleSort} />
                {poolsDisplay}
            </div>

            {maxItems !== pools.length ? (
                <Pagination
                    count={maxPage}
                    size='large'
                    page={page}
                    variant='outlined'
                    shape='rounded'
                    onChange={handleChange}
                    color='primary'
                />
            ) : (
                <></>
            )}
        </div>
    );
}
