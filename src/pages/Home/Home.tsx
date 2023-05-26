import DividerDark from '../../components/Global/DividerDark/DividerDark';
import HomeSlider from '../../components/Home/Landing/HomeSlider';
import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import styles from './Home.module.css';
import Home1 from '../../components/Home/Landing/Home1';

export default function Home() {
    return (
        <section data-testid={'home'} className={styles.home_container}>
            <HomeSlider />
            <div className={styles.pools_container}>
                <TopPools />
                <DividerDark />
                <Stats />
            </div>
            <DividerDark />
            <Home1 />
        </section>
    );
}
