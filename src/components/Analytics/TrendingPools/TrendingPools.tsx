import AnalyticsTokenRows from '../AnalyticsTokenRows/AnalyticsTokenRows';
import styles from './TrendingPools.module.css';
import TrendingPoolsCard from './TrendingPoolsCard/TrendingPoolsCard';
import TrendingPoolsHeader from './TrendingPoolsHeader/TrendingPoolsHeader';

const TrendingPools = () => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const container = (
        <div className={styles.item_container}>
            {items.map((item, idx) => (
                <TrendingPoolsCard key={idx} number={item + 1} />
            ))}
        </div>
    );
    return (
        <div className={styles.main_container}>
            <AnalyticsTokenRows />
            <p>Trending Pools</p>
            <TrendingPoolsHeader />

            {container}
        </div>
    );
};

export default TrendingPools;
