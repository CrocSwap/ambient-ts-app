import styles from './FavoritePools.module.css';
import FavoritePoolsCard from './FavoritePoolsCard';
export default function FavoritePools() {
    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Volume</div>
            <div>TVL</div>
        </div>
    );

    const mapItems = [1, 2, 3, 4, 5, 6, 7];
    return (
        <div className={styles.container}>
            {header}
            <div className={styles.content}>
                {mapItems.map((item, idx) => (
                    <FavoritePoolsCard key={idx} />
                ))}
            </div>
        </div>
    );
}
