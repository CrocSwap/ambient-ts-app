import Hero from '../../components/Home/Landing/Hero';
import LandingSections from '../../components/Home/Landing/LandingSections';
import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import MobileLandingSections from '../../components/Home/Landing/MobileLandingSections';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { useSwitchNetwork, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { supportedNetworks } from '../../ambient-utils/constants';
import { useContext, useEffect } from 'react';
import { lookupChainId } from '../../ambient-utils/dataLayer';
import { UserDataContext } from '../../contexts/UserDataContext';
import { Text } from '../../styled/Common';
import styled from 'styled-components';
import { BrandContext } from '../../contexts/BrandContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { minWidth } from '../../ambient-utils/types/mediaQueries';
import { TradeDataContext } from '../../contexts/TradeDataContext';

export default function Home() {
    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    // hook from web3modal to switch connected wallet in extension
    const { isConnected } = useWeb3ModalAccount();
    const { switchNetwork } = useSwitchNetwork();
    // hook from web3modal indicating if user is connected
    const { isUserConnected } = useContext(UserDataContext);
    const { chainData, chooseNetwork } = useContext(TradeDataContext);
    const { showPoints, showDexStats } = useContext(BrandContext);
    const { isActiveNetworkPlume } = useContext(ChainDataContext);
    // hook to consume and alter search params on the index page
    const [searchParams, setSearchParams] = useSearchParams();
    // logic to consume chain param data from the URL
    // runs once when the app initializes, again when web3modal finishes initializing
    if (isActiveNetworkPlume) {
        return <Navigate to='/swap' />;
    }
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
                // use web3modal if wallet is connected, otherwise use in-app toggle
                if (isUserConnected) {
                    switchNetwork(parseInt(targetChain));
                } else if (!isUserConnected) {
                    chooseNetwork(supportedNetworks[targetChain]);
                }
            } else {
                setSearchParams('');
            }
        }
    }, [isUserConnected]);
    // hook to consume and alter search params on the index page

    const BREAKPOINT: minWidth = '(min-width: 720px)';

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

        @media ${BREAKPOINT} {
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
            {showPoints && !isActiveNetworkPlume && (
                <PointSystemContainer>
                    <Text fontSize='header1'>Points system now live!</Text>

                    <Link to={isConnected ? '/account/xp' : '/xp-leaderboard'}>
                        <Text
                            fontSize='header2'
                            color='accent1'
                            style={{ textDecoration: 'underline' }}
                        >
                            {isConnected
                                ? ' View your current XP here'
                                : 'View XP leaderboard'}
                        </Text>
                    </Link>
                </PointSystemContainer>
            )}
            <div>
                <TopPools />
                {showDexStats && !isActiveNetworkPlume && <Stats />}
            </div>
            <LandingSections />
        </section>
    );
}
