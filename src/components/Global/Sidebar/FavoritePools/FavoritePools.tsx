import styles from './FavoritePools.module.css';
import FavoritePoolsCard from './FavoritePoolsCard';
import { PoolIF } from '../../../../utils/interfaces/exports';

interface FavoritePoolsIF {
    favePools: PoolIF[];
}

export default function FavoritePools(props: FavoritePoolsIF) {
    const { favePools } = props;
    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Volume</div>
            <div>TVL</div>
        </div>
    );

    return (
        <div className={styles.container}>
            {header}
            <div className={styles.content}>
                {favePools.map((pool, idx) => (
                    <FavoritePoolsCard key={idx} pool={pool} />
                ))}
            </div>
        </div>
    );
}
