import { Link } from 'react-router-dom';
import styles from './FutaLanding.module.css';
export default function FutaLanding() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <p>No pictures. No devs. Just tickers.</p>
                <p>To move forwards, we must go back.</p>
                <Link to='/auctions'>/Enter</Link>
            </div>
        </div>
    );
}
