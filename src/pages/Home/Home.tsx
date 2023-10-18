import Hero from '../../components/Home/Landing/Hero';
import LandingSections from '../../components/Home/Landing/LandingSections';
import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import useMediaQuery from '../../utils/hooks/useMediaQuery';

import MobileLandingSections from '../../components/Home/Landing/MobileLandingSections';
import { useContext } from 'react';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { TokenContext } from '../../contexts/TokenContext';
import { useUrlParams } from '../../utils/hooks/useUrlParams';

export default function Home() {
    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    const {
        chainData: { chainId },
        provider,
    } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);
    useUrlParams(tokens, chainId, provider);

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
