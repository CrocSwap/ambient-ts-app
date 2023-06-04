import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import styles from './Home.module.css';
import LandingSections from '../../components/Home/Landing/LandingSections';
import Hero from '../../components/Home/Landing/Hero';
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import MobileHero from '../../components/Home/Landing/MobileHero';
import Investors from '../../components/Home/Landing/Investors';
import { stopAnimation } from 'framer-motion/types/render/utils/animation';

export default function Home() {
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    return (
        <section data-testid={'home'} className={styles.home_container}>
            {showMobileVersion && <MobileHero />}
            {!showMobileVersion && (
                <div style={{ width: '100%', height: '480px' }}>
                    <Hero />
                </div>
            )}
            {<Investors />}
            <div className={styles.pools_container}>
                <TopPools />
                {!showMobileVersion && <Stats />}
            </div>
            {showMobileVersion && <div className={styles.mobile_divider} />}

            <LandingSections />
        </section>
    );
}
