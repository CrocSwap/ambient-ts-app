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
import { useContext, useEffect } from 'react';
import { lookupChainId } from '../../utils/functions/lookupChainId';
import { UserDataContext } from '../../contexts/UserDataContext';

export default function Home() {
    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    // hook from wagmi to switch connected wallet in extension
    const { switchNetwork } = useSwitchNetwork();
    // hook from wagmi indicating if user is connected
    const { isUserConnected } = useContext(UserDataContext);
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
            // get a canonical 0x hex string chain ID from URL param
            const targetChain: string =
                lookupChainId(chainParam, 'string') ?? chainParam;
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
                } else if (!isUserConnected) {
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
