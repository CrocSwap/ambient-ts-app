import PoolCard from '../../Global/PoolCard/PoolCard';
import styles from './TopPools.module.css';

export default function TopPools() {
    const examplePools = [1, 2, 3, 4, 5, 6, 7, 8];

    return (
        <div className={styles.container}>
            <div className={styles.title}>Top Pools</div>
            <div className={styles.content}>
                {examplePools.map((pool, idx) => (
                    <PoolCard key={idx} />
                ))}
            </div>
        </div>
    );
}
