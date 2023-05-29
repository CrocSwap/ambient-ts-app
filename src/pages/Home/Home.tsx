import DividerDark from '../../components/Global/DividerDark/DividerDark';
import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import styles from './Home.module.css';
import LandingSections from '../../components/Home/Landing/LandingSections';
import Hero from '../../components/Home/Landing/Hero';

export default function Home() {
    return (
        <section data-testid={'home'} className={styles.home_container}>
            <div style={{ width: '100%', height: '480px' }}>
                <Hero />
            </div>
            <div className={styles.pools_container}>
                <TopPools />
                <Stats />
            </div>
            <DividerDark />
            <LandingSections />
        </section>
    );
}
