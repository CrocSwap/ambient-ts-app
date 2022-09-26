import { SORT_FIELD } from './TopTokens';
import styles from './TopTokenHeader.module.css';

interface TopTokenHeaderProps {
    arrow: (field: string) => '↑' | '↓' | '';
    sort(newField: string): void;
}

export default function TopTokenHeader(props: TopTokenHeaderProps) {
    const arrow = props.arrow;
    const sort = props.sort;
    return (
        <div className={styles.main_container}>
            <div className={styles.token_logos} />
            <div className={styles.row_container}>
                <p className={styles.token} onClick={() => sort(SORT_FIELD.name)}>
                    Name {arrow(SORT_FIELD.name)}
                </p>
                <p className={styles.pCursor} onClick={() => sort(SORT_FIELD.address)}>
                    Address {arrow(SORT_FIELD.address)}
                </p>

                <p className={styles.pCursor} onClick={() => sort(SORT_FIELD.priceUSD)}>
                    Price {arrow(SORT_FIELD.priceUSD)}
                </p>
                <p className={styles.pCursor} onClick={() => sort(SORT_FIELD.tvlUSD)}>
                    TVL {arrow(SORT_FIELD.tvlUSD)}
                </p>
                <p className={styles.pCursor} onClick={() => sort(SORT_FIELD.tvlTick)}>
                    TVL at Tick {arrow(SORT_FIELD.tvlTick)}
                </p>
                <p className={styles.pCursor} onClick={() => sort(SORT_FIELD.volumeUSD)}>
                    Volume 24H {arrow(SORT_FIELD.volumeUSD)}
                </p>
                <p className={styles.pCursor} onClick={() => sort(SORT_FIELD.priceUSDChange)}>
                    Price Change {arrow(SORT_FIELD.priceUSDChange)}
                </p>
            </div>
            <div></div>
        </div>
    );
}
