import styles from './Hero.module.css';
import logoText from '../../../assets/images/logos/logo_text.png';
import TradeNowButton from './TradeNowButton/TradeNowButton';

export default function Hero() {
    return (
        <div className={styles.hero_container}>
            <div className={styles.hero_container}>
                <img src={logoText} alt='ambient' />
                <TradeNowButton />
            </div>
        </div>
    );
}
