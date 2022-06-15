import styles from './Landing.module.css';
import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className={styles.main_container}>
            <div className={styles.content_container}>
                <div className={styles.ambient_background}>DEFI 2.0</div>
                <div className={styles.ambient}>ambient</div>
                <Link to={'/trade/market'}>
                    <button className={styles.action_button}>
                        <span>Trade now</span>
                    </button>
                </Link>
            </div>
        </div>
    );
}
