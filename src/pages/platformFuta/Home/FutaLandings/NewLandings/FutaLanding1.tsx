import { Link } from 'react-router-dom';
import styles from './FutaLanding.module.css';
import HexReveal from '../../Animations/HexReveal';
export default function FutaLanding() {
    return (
        <div className={styles.container}>
            <div className={styles.content} style={{ gap: '64px' }}>
                <HexReveal>
                    <p>No pictures. No devs. Just tickers.</p>
                    <p>To move forwards, we must go back.</p>
                </HexReveal>
                <Link to='/auctions'>/Enter</Link>
            </div>
        </div>
    );
}
