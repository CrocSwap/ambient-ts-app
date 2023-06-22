import styles from './Hero.module.css';
import logoText from '../../../assets/images/logos/logo_text.png';
import TradeNowButton from './TradeNowButton/TradeNowButton';
import Stats from '../Stats/AmbientStats';

export default function MobileHero() {
    return (
        <div className={styles.mobile_container}>
            <div className={styles.mobile_hero_content}>
                <div style={{ paddingBottom: '2rem' }}>
                    <img src={logoText} alt='ambient' />

                    <p className={styles.tagline}>
                        Zero-to-One Decentralized Trading Protocol.
                    </p>
                </div>
                <Stats />
            </div>
            <TradeNowButton />
        </div>
    );
}
