import styles from './Landing.module.css';
import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className={styles.main_container}>
            <div className={styles.content_container}>
                <div className={styles.ambient}>ambient</div>
                <Link to={'/trade'}>
                    <button className={styles.action_button}>
                        <span>Trade now</span>
                    </button>
                </Link>
            </div>
        </div>
    );
}
