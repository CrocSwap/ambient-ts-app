import TopRange from './TopRange';
import TopRangeCardHeader from './TopRangeCardHeader';
import styles from './TopRanges.module.css';

export default function TopRanges() {
    const exampleTopRanges = [1, 2, 3, 4, 5, 6];

    const topRangesDisplay = exampleTopRanges.map((topRange, idx) => <TopRange key={idx} />);

    return (
        <div className={styles.container}>
            <div className={styles.container}>
                <TopRangeCardHeader />
                {topRangesDisplay}
            </div>
        </div>
    );
}
