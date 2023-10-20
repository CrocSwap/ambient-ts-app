import Hero from '../../components/Home/Landing/Hero';
import LandingSections from '../../components/Home/Landing/LandingSections';
import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import MobileLandingSections from '../../components/Home/Landing/MobileLandingSections';
import { useSearchParams } from 'react-router-dom';
import { useAccount, useSwitchNetwork } from 'wagmi';
import { supportedNetworks } from '../../utils/networks/index';
import { useAppChain } from '../../App/hooks/useAppChain';
import { useEffect } from 'react';

export default function Home() {
    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    const { switchNetwork } = useSwitchNetwork();
    const { isConnected } = useAccount();

    const { chooseNetwork, chainData } = useAppChain();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const chainParam: string | null =
            searchParams.get('chain') ?? searchParams.get('network');
        if (chainParam) {
            if (
                supportedNetworks[chainParam] &&
                chainParam !== chainData.chainId
            ) {
                if (switchNetwork) {
                    switchNetwork(parseInt(chainParam));
                } else if (!isConnected) {
                    chooseNetwork(supportedNetworks[chainParam]);
                }
            } else {
                setSearchParams('');
            }
        }
    }, [switchNetwork]);
    if (showMobileVersion) return <MobileLandingSections />;
    return (
        <section data-testid={'home'}>
            {!showMobileVersion && (
                <div style={{ width: '100%', height: '480px' }}>
                    <Hero />
                </div>
            )}
            <div>
                <TopPools />
                <Stats />
            </div>
            <LandingSections />
        </section>
    );
}
