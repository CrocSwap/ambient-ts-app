import AnalyticsTokenRows from '../AnalyticsTokenRows/AnalyticsTokenRows';
import styles from './TrendingPools.module.css';
import TrendingPoolsCard from './TrendingPoolsCard/TrendingPoolsCard';
import TrendingPoolsHeader from './TrendingPoolsHeader/TrendingPoolsHeader';
import { Dispatch, SetStateAction } from 'react';
interface TrendingPoolsPropsIF {
    analyticsSearchInput: string;
    setAnalyticsSearchInput: Dispatch<SetStateAction<string>>;
}
const TrendingPools = (props: TrendingPoolsPropsIF) => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const searchItems = [0, 1];

    const itemsToMap = props.analyticsSearchInput == '' ? items : searchItems;

    const container = (
        <div className={styles.item_container}>
            {itemsToMap.map((item, idx) => (
                <TrendingPoolsCard key={idx} number={item + 1} />
            ))}
        </div>
    );
    return (
        <div className={styles.main_container}>
            <AnalyticsTokenRows searchInput={props.analyticsSearchInput} />
            <p>
                {props.analyticsSearchInput == ''
                    ? 'Trending Pools'
                    : ` Trending pools with ${props.analyticsSearchInput}`}
            </p>
            <TrendingPoolsHeader />

            {container}
        </div>
    );
};

export default TrendingPools;
