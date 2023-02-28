import styles from './Home1.module.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoText from '../../../assets/images/logos/logo_text.svg';
import TradeNowButton from './TradeNowButton/TradeNowButton';

export default function Home1() {
    const { t } = useTranslation();

    return (
        <div className={styles.main_container}>
            <div className={styles.content_container}>
                <h1>Zero-to-One Decentralized Trading Protocol</h1>
                <TradeNowButton />
            </div>
        </div>
    );
}
