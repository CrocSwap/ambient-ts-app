import Hero from '../../components/Home/Landing/Hero';
import LandingSections from '../../components/Home/Landing/LandingSections';
import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import MobileLandingSections from '../../components/Home/Landing/MobileLandingSections';
import { Link, useSearchParams } from 'react-router-dom';
import { useSwitchNetwork } from 'wagmi';
import {
    APP_ENVIRONMENT,
    supportedNetworks,
} from '../../ambient-utils/constants';
import { useContext, useEffect } from 'react';
import { lookupChainId } from '../../ambient-utils/dataLayer';
import { UserDataContext } from '../../contexts/UserDataContext';
import { Text } from '../../styled/Common';
import styled from 'styled-components';
import { TradeDataContext } from '../../contexts/TradeDataContext';

export default function Home() {
    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    // hook from wagmi to switch connected wallet in extension
    const { switchNetwork } = useSwitchNetwork();
    // hook from wagmi indicating if user is connected
    const { isUserConnected } = useContext(UserDataContext);
    const { chainData, chooseNetwork } = useContext(TradeDataContext);
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

    const PointSystemContainer = styled.section`
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: auto;
        width: auto;
        background: var(--dark2);
        border-radius: 4px;
        gap: 1rem;

        @media (min-width: 720px) {
            height: 127px;
            width: 842px;
        }
    `;

    if (showMobileVersion) return <MobileLandingSections />;

    return (
        <section data-testid={'home'}>
            {!showMobileVersion && (
                <div style={{ width: '100%', height: '480px' }}>
                    <Hero />
                </div>
            )}
            {APP_ENVIRONMENT !== 'production' && (
                <PointSystemContainer>
                    <Text fontSize='header1'>Points system now live!</Text>

                    <Link
                        to={isUserConnected ? '/account/xp' : '/xp-leaderboard'}
                    >
                        <Text
                            fontSize='header2'
                            color='accent1'
                            style={{ textDecoration: 'underline' }}
                        >
                            {isUserConnected
                                ? ' View your current XP here'
                                : 'View XP leaderboard'}
                        </Text>
                    </Link>
                </PointSystemContainer>
            )}
            <div>
                <TopPools />
                <Stats />
            </div>
            <LandingSections />
        </section>
    );
}
