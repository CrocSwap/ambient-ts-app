import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import styles from './Home.module.css';
import LandingSections from '../../components/Home/Landing/LandingSections';
import Hero from '../../components/Home/Landing/Hero';
import useMediaQuery from '../../utils/hooks/useMediaQuery';

import MobileLandingSections from '../../components/Home/Landing/MobileLandingSections';

export default function Home() {
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    if (showMobileVersion) return <MobileLandingSections />;
    return (
        <section data-testid={'home'} className={styles.home_container}>
            {!showMobileVersion && (
                <div style={{ width: '100%', height: '480px' }}>
                    <Hero />
                </div>
            )}

            <div className={styles.pools_container}>
                <TopPools />
                <Stats />
            </div>

            <LandingSections />
        </section>
    );
}
