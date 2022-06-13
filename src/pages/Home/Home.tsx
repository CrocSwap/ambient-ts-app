import DividerDark from '../../components/Global/DividerDark/DividerDark';
import Landing from '../../components/Home/Landing/Landing';
import TopPools from '../../components/Home/TopPools/TopPools';
import styles from './Home.module.css';

export default function Home() {
    return (
        <main data-testid={'home'} className={styles.home_container}>
            {/* {ambientImage} */}
            {/* {ambientText} */}
            <Landing />
            <DividerDark />
            <TopPools />
        </main>
    );
}
