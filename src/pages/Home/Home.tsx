import Landing from '../../components/Home/Landing/Landing';
import styles from './Home.module.css';

export default function Home() {
    return (
        <main data-testid={'home'} className={styles.home_container}>
            {/* {ambientImage} */}
            {/* {ambientText} */}
            <Landing />
        </main>
    );
}
