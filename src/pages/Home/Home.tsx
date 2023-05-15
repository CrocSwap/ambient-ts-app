import DividerDark from '../../components/Global/DividerDark/DividerDark';
import HomeSlider from '../../components/Home/Landing/HomeSlider';
import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import styles from './Home.module.css';
import { SpotPriceFn } from '../../App/functions/querySpotPrice';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import Home1 from '../../components/Home/Landing/Home1';
import { PoolStatsFn } from '../../App/functions/getPoolStats';

interface propsIF {
    cachedQuerySpotPrice: SpotPriceFn;
    lastBlockNumber: number;
    cachedPoolStatsFetch: PoolStatsFn;
}
export default function Home(props: propsIF) {
    const { lastBlockNumber, cachedQuerySpotPrice, cachedPoolStatsFetch } =
        props;

    const tradeData = useAppSelector((state) => state.tradeData);
    const userData = useAppSelector((state) => state.userData);

    return (
        <section data-testid={'home'} className={styles.home_container}>
            <HomeSlider />
            <div className={styles.pools_container}>
                <TopPools
                    tradeData={tradeData}
                    userData={userData}
                    cachedQuerySpotPrice={cachedQuerySpotPrice}
                    lastBlockNumber={lastBlockNumber}
                    cachedPoolStatsFetch={cachedPoolStatsFetch}
                />
                <DividerDark />
                <Stats lastBlockNumber={lastBlockNumber} userData={userData} />
            </div>
            <DividerDark />
            <Home1 />
        </section>
    );
}
