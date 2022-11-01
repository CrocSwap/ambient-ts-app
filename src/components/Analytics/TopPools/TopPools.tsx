import styles from './TopPools.module.css';
import TopPoolsCard from './TopPoolsCard/TopPoolsCard';
import TopPoolsHeader from './TopPoolsHeader/TopPoolsHeader';
import { uniswapPools } from '../fakedata/uniswapTokens';

export default function TopPools() {
    const container = (
        <div className={styles.item_container}>
            {uniswapPools.slice(0, 10).map((pair, idx) => (
                <TopPoolsCard pair={pair} key={idx} number={idx + 1} />
            ))}
        </div>
    );
    return (
        <div className={styles.main_container}>
            {/* <p>Trending Pools</p> */}
            <p>All Pools</p>
            <TopPoolsHeader />

            {container}
        </div>
    );
}
