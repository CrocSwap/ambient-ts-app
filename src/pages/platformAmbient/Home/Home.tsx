import Hero from '../../../components/Home/Landing/Hero';
import LandingSections from '../../../components/Home/Landing/LandingSections';
import Stats from '../../../components/Home/Stats/AmbientStats';
import TopPoolsHome from '../../../components/Home/TopPoolsHome/TopPoolsHome';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import MobileLandingSections from '../../../components/Home/Landing/MobileLandingSections';
import { Link } from 'react-router-dom';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { useContext } from 'react';
import { Text } from '../../../styled/Common';
import styled from 'styled-components';
import { BrandContext } from '../../../contexts/BrandContext';
import { minWidth } from '../../../ambient-utils/types/mediaQueries';

export default function Home() {
    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    // hook from web3modal to switch connected wallet in extension
    const { isConnected } = useWeb3ModalAccount();
    // hook from web3modal indicating if user is connected
    // hook to consume and alter search params on the index page

    const { showPoints, showDexStats } = useContext(BrandContext);

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
            {showPoints && (
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
                <TopPoolsHome />
                {showDexStats && <Stats />}
            </div>
            <LandingSections />
        </section>
    );
}
