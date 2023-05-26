import DividerDark from '../../components/Global/DividerDark/DividerDark';
import HomeSlider from '../../components/Home/Landing/HomeSlider';
import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import styles from './Home.module.css';
import { SpotPriceFn } from '../../App/functions/querySpotPrice';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import Home1 from '../../components/Home/Landing/Home1';
import { PoolStatsFn } from '../../App/functions/getPoolStats';
import { useContext } from 'react';
import { CachedDataContext } from '../../contexts/CachedDataContext';

export default function Home() {
    return (
        <section data-testid={'home'} className={styles.home_container}>
            <HomeSlider />
            <div className={styles.pools_container}>
                <TopPools />
                <DividerDark />
                <Stats />
            </div>
            <DividerDark />
            <Home1 />
        </section>
    );
}
