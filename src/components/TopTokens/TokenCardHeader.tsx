import { useCallback, useState } from 'react';
import { SORT_FIELD } from './TopTokens';
import styles from './TokenCardHeader.module.css';
export default function TokenCardHeader() {
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
                <p className={styles.pool}>Name {arrow(SORT_FIELD.name)}</p>
                <p className={styles.wallet}>Price {arrow(SORT_FIELD.priceUSD)}</p>
                <p className={styles.price}>TVL{arrow(SORT_FIELD.tvlUSD)}</p>
                <p className={styles.price}>Volume 24H{arrow(SORT_FIELD.volumeUSD)}</p>
                <p className={styles.token}>Price Change{arrow(SORT_FIELD.priceUSDChange)}</p>
                <p>APY</p>
            </div>

            <div></div>
        </div>
    );
}
