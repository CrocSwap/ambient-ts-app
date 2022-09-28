import { CrocEnv } from '@crocswap-libs/sdk';
// import { ethers } from 'ethers';
import DividerDark from '../../components/Global/DividerDark/DividerDark';
import Investors from '../../components/Home/Investors/Investors';
import HomeSlider from '../../components/Home/Landing/HomeSlider';
import Links from '../../components/Home/Links/Links';
import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import styles from './Home.module.css';

interface HomeProps {
    crocEnv?: CrocEnv;
    tokenMap: Map<string, TokenIF>;
    lastBlockNumber: number;
    chainId: string;
}
export default function Home(props: HomeProps) {
    const { tokenMap, lastBlockNumber, crocEnv, chainId } = props;

    return (
        <>
            <main data-testid={'home'} className={styles.home_container}>
                {/* <Landing /> */}
                {/* <Slides /> */}
                <HomeSlider />

                <div className={styles.pools_container}>
                    <TopPools
                        crocEnv={crocEnv}
                        tokenMap={tokenMap}
                        lastBlockNumber={lastBlockNumber}
                        chainId={chainId}
                    />
                    <DividerDark />
                    <Stats lastBlockNumber={lastBlockNumber} />
                </div>
                <DividerDark />

                <Investors />
                <DividerDark />
                <Links />
            </main>
        </>
    );
}
