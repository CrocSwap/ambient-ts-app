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
    // hook from wagmi to switch connected wallet in extension
    const { switchNetwork } = useSwitchNetwork();
    // hook from wagmi indicating if user is connected
    const { isConnected } = useAccount();
    // hook managing chain data between the app and external APIs
    const { chooseNetwork, chainData } = useAppChain();
    // hook to consume and alter search params on the index page
    const [searchParams, setSearchParams] = useSearchParams();
    // logic to consume chain param data from the URL
    // runs once when the app initializes, again when wagmi finishes initializing
    useEffect(() => {
        // search for param in URL by key 'chain' or 'network'
        const chainParam: string | null =
            searchParams.get('chain') ?? searchParams.get('network');
        // logic to execute if a param is found (if not, do nothing)
        if (chainParam) {
            // map various chain identifiers to a canonical ID
            let targetChain: string;
            switch (chainParam) {
                case 'ethereum':
                case 'mainnet':
                case '1':
                    targetChain = '0x1';
                    break;
                case 'goerli':
                case '5':
                    targetChain = '0x5';
                    break;
                default:
                    targetChain = chainParam;
                    break;
            }
            // check if chain is supported and not the current chain in the app
            // yes → trigger machinery to switch the current network
            // no → no action except to clear the param from the URL
            if (
                supportedNetworks[targetChain] &&
                targetChain !== chainData.chainId
            ) {
                // use wagmi if wallet is connected, otherwise use in-app toggle
                if (switchNetwork) {
                    switchNetwork(parseInt(targetChain));
                } else if (!isConnected) {
                    chooseNetwork(supportedNetworks[targetChain]);
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
