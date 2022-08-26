import { ethers } from 'ethers';
import DividerDark from '../../components/Global/DividerDark/DividerDark';
import Investors from '../../components/Home/Investors/Investors';
import Slides from '../../components/Home/Landing/Slides';
import Links from '../../components/Home/Links/Links';
import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import styles from './Home.module.css';

interface HomeProps {
    tokenMap: Map<string, TokenIF>;
    lastBlockNumber: number;
    provider: ethers.providers.Provider | undefined;
    chainId: string;
}
export default function Home(props: HomeProps) {
    const { tokenMap, lastBlockNumber, provider, chainId } = props;

    return (
        <main data-testid={'home'} className={styles.home_container}>
            {/* <Landing /> */}
            <Slides />
            <DividerDark />
            <div className={styles.pools_container}>
                <TopPools
                    tokenMap={tokenMap}
                    lastBlockNumber={lastBlockNumber}
                    provider={provider}
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
    );
}
