import { useContext } from 'react';
import Hero from '../../../components/Home/Landing/Hero';
import LandingSections from '../../../components/Home/Landing/LandingSections';
import MobileLandingSections from '../../../components/Home/Landing/MobileLandingSections';
import Stats from '../../../components/Home/Stats/AmbientStats';
import TopPoolsHome from '../../../components/Home/TopPoolsHome/TopPoolsHome';
import { BrandContext } from '../../../contexts/BrandContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import styles from './Home.module.css';
export default function Home() {
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    const { showDexStats } = useContext(BrandContext);

    if (showMobileVersion) return <MobileLandingSections />;
    return (
        <section data-testid={'home'}>
            <div className={styles.container}>
                <Hero />
            </div>
            <div>
                <TopPoolsHome />
                {showDexStats && <Stats />}
            </div>
            <LandingSections />
        </section>
    );
}
