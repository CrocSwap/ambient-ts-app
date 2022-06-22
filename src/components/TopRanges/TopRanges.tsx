import TopRange from './TopRange';
import styles from './TopRanges.module.css';

export default function TopRanges() {
    const exampleTopRanges = [1, 2, 3, 4, 5, 6];

    const topRangesDisplay = exampleTopRanges.map((topRange, idx) => <TopRange key={idx} />);

    const topRangesHeader = (
        <thead>
            <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Price Change</th>
                <th>Volume 24H</th>
                <th>TVL</th>
            </tr>
        </thead>
    );

    return (
        <div className={styles.topRange_table_display}>
            <table>
                {topRangesHeader}

                <tbody>{topRangesDisplay}</tbody>
            </table>
        </div>
    );
}
