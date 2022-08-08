import { useCallback, useState } from 'react';
import { SORT_FIELD } from './Pools';
import styles from './PoolCardHeader.module.css';

export default function PoolCardHeader() {
    const [sortField, setSortField] = useState(SORT_FIELD.tvlUSD);
    const [sortDirection, setSortDirection] = useState<boolean>(true);

    const arrow = useCallback(
        (field: string) => {
            return sortField === field ? (!sortDirection ? '↑' : '↓') : '';
        },
        [sortDirection, sortField],
    );

    return (
        <div className={styles.main_container}>
            <div className={styles.token_logos} />
            <div className={styles.row_container}>
                <p className={styles.pool}>Pool {arrow(SORT_FIELD.feeTier)}</p>
                <p className={styles.wallet}>TVL {arrow(SORT_FIELD.tvlUSD)}</p>
                <p className={styles.price}>Volume 24H{arrow(SORT_FIELD.volumeUSD)}</p>
                <p className={styles.price}>Volume 7D{arrow(SORT_FIELD.volumeUSDWeek)}</p>
                <p className={styles.token}>TVL Change</p>
                <p>APY</p>
            </div>

            <div></div>
        </div>
    );
}
