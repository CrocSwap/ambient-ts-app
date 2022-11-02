import styles from './TopRanges.module.css';
import TopRangesCard from './TopRangesCard/TopRangesCard';
import TopRangesHeader from './TopRangesHeader/TopRangesHeader';

const TopRanges = () => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const container = (
        <div className={styles.item_container}>
            {items.map((item, idx) => (
                <TopRangesCard key={idx} number={item + 1} />
            ))}
        </div>
    );
    return (
        <div className={styles.main_container}>
            <p>Top Ranges</p>
            <TopRangesHeader />

            {container}
        </div>
    );
};

export default TopRanges;
