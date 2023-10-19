import Hero from '../../components/Home/Landing/Hero';
import LandingSections from '../../components/Home/Landing/LandingSections';
import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import MobileLandingSections from '../../components/Home/Landing/MobileLandingSections';
import { useSearchParams } from 'react-router-dom';
import { useSwitchNetwork } from 'wagmi';
import { supportedNetworks } from '../../utils/networks/index';
import { useAppChain } from '../../App/hooks/useAppChain';
import { useEffect } from 'react';

export default function Home() {
    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    const { switchNetwork } = useSwitchNetwork();
    const { chooseNetwork, chainData } = useAppChain();
    const [searchParams] = useSearchParams();
    // const [searchParams, setSearchParams] = useSearchParams();
    const chainParam = searchParams.get('chain');
    const networkParam = searchParams.get('network');
    useEffect(() => {
        if (chainParam && supportedNetworks[chainParam]) {
            if (chainParam !== chainData.chainId) {
                switchNetwork
                    ? switchNetwork(parseInt(chainParam))
                    : chooseNetwork(supportedNetworks[chainParam]);
            }
        } else if (networkParam && supportedNetworks[networkParam]) {
            if (networkParam !== chainData.chainId) {
                switchNetwork
                    ? switchNetwork(parseInt(networkParam))
                    : chooseNetwork(supportedNetworks[networkParam]);
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
