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
import { linkGenMethodsIF, useLinkGen } from '../../utils/hooks/useLinkGen';
import { useEffect } from 'react';

export default function Home() {
    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    const { switchNetwork } = useSwitchNetwork({
        onSuccess() {
            console.log('did it!');
            linkGenIndex.redirect('');
        },
    });
    const { chooseNetwork, chainData } = useAppChain();
    const linkGenIndex: linkGenMethodsIF = useLinkGen('index');
    const [searchParams] = useSearchParams();
    const chainParam = searchParams.get('chain');
    useEffect(() => {
        if (chainParam && chainParam !== chainData.chainId) {
            console.log(chainParam, chainData.chainId);
            switchNetwork
                ? switchNetwork(parseInt(chainParam))
                : chooseNetwork(supportedNetworks[chainParam]);
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
