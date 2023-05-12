import DividerDark from '../../components/Global/DividerDark/DividerDark';
import HomeSlider from '../../components/Home/Landing/HomeSlider';
import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import { TokenIF } from '../../utils/interfaces/exports';
import styles from './Home.module.css';
import { SpotPriceFn } from '../../App/functions/querySpotPrice';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import Home1 from '../../components/Home/Landing/Home1';
import { topPoolIF } from '../../App/hooks/useTopPools';
import { PoolStatsFn } from '../../App/functions/getPoolStats';

interface propsIF {
    cachedQuerySpotPrice: SpotPriceFn;
    tokenMap: Map<string, TokenIF>;
    lastBlockNumber: number;
    chainId: string;
    topPools: topPoolIF[];
    cachedPoolStatsFetch: PoolStatsFn;
}
export default function Home(props: propsIF) {
    const {
        tokenMap,
        lastBlockNumber,
        chainId,
        cachedQuerySpotPrice,
        topPools,
        cachedPoolStatsFetch,
    } = props;

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
                    tokenMap={tokenMap}
                    lastBlockNumber={lastBlockNumber}
                    chainId={chainId}
                    topPools={topPools}
                    cachedPoolStatsFetch={cachedPoolStatsFetch}
                />
                <DividerDark />
                <Stats
                    lastBlockNumber={lastBlockNumber}
                    userData={userData}
                    chainId={chainId}
                />
            </div>
            <DividerDark />
            <Home1 />
        </section>
    );
}
