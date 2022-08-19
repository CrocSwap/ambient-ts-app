import styles from './FavoritePoolsCard.module.css';
import { PoolIF } from '../../../../utils/interfaces/exports';

interface FavoritePoolsCardIF {
    pool: PoolIF;
}

export default function FavoritePoolsCard(props: FavoritePoolsCardIF) {
    const { pool } = props;
    return (
        <div className={styles.container}>
            <div>{pool.base.address} / {pool.quote.address}</div>
            <div>Volume</div>
            <div>TVL</div>
        </div>
    );
}
