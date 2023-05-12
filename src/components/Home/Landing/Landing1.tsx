import styles from './Landing1.module.css';
import logoText from '../../../assets/images/logos/logo_text.png';
import TradeNowButton from './TradeNowButton/TradeNowButton';

export default function Landing1() {
    return (
        <div className={styles.main_container}>
            <div className={styles.content_container}>
                <img src={logoText} alt='ambient' />
                <TradeNowButton />
            </div>
        </div>
    );
}
