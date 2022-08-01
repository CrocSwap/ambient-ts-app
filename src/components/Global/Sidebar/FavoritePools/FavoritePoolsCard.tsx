import styles from './FavoritePoolsCard.module.css';

export default function FavoritePoolsCard() {
    return (
        <div className={styles.container}>
            <div>Pool</div>
            <div>Volume</div>
            <div>TVL</div>
        </div>
    );
}
