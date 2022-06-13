import DividerDark from '../../components/Global/DividerDark/DividerDark';
import Investors from '../../components/Home/Investors/Investors';
import Landing from '../../components/Home/Landing/Landing';
import Links from '../../components/Home/Links/Links';
import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import styles from './Home.module.css';

export default function Home() {
    return (
        <main data-testid={'home'} className={styles.home_container}>
            <Landing />
            <DividerDark />
            <div className={styles.pools_container}>
                <TopPools />
                <DividerDark />
                <Stats />
            </div>
            <DividerDark />

            <Investors />
            <DividerDark />
            <Links />
        </main>
    );
}
