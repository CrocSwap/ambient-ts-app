import { CrocEnv } from '@crocswap-libs/sdk';
// import { ethers } from 'ethers';
import DividerDark from '../../components/Global/DividerDark/DividerDark';
// import Investors from '../../components/Home/Investors/Investors';
import HomeSlider from '../../components/Home/Landing/HomeSlider';
// import Links from '../../components/Home/Links/Links';
import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import { TokenIF } from '../../utils/interfaces/exports';
import styles from './Home.module.css';
import { SpotPriceFn } from '../../App/functions/querySpotPrice';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import Home1 from '../../components/Home/Landing/Home1';

interface propsIF {
    isServerEnabled: boolean;
    crocEnv?: CrocEnv;
    cachedQuerySpotPrice: SpotPriceFn;
    tokenMap: Map<string, TokenIF>;
    lastBlockNumber: number;
    chainId: string;
}
export default function Home(props: propsIF) {
    const { isServerEnabled, tokenMap, lastBlockNumber, crocEnv, chainId, cachedQuerySpotPrice } =
        props;

    const tradeData = useAppSelector((state) => state.tradeData);
    const userData = useAppSelector((state) => state.userData);

    return (
        <>
            <section data-testid={'home'} className={styles.home_container}>
                {/* <Landing /> */}
                {/* <Slides /> */}
                <HomeSlider />

                <div className={styles.pools_container}>
                    <TopPools
                        isServerEnabled={isServerEnabled}
                        tradeData={tradeData}
                        userData={userData}
                        crocEnv={crocEnv}
                        cachedQuerySpotPrice={cachedQuerySpotPrice}
                        tokenMap={tokenMap}
                        lastBlockNumber={lastBlockNumber}
                        chainId={chainId}
                    />
                    <DividerDark />
                    <Stats
                        isServerEnabled={isServerEnabled}
                        lastBlockNumber={lastBlockNumber}
                        userData={userData}
                    />
                </div>
                <DividerDark />
                <Home1 />

                {/* <Investors /> */}
                {/* <DividerDark /> */}
                {/* <Links /> */}
            </section>
        </>
    );
}
