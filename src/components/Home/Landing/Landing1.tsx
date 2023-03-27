import styles from './Landing1.module.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoText from '../../../assets/images/logos/logo_text.svg';
import TradeNowButton from './TradeNowButton/TradeNowButton';

export default function Landing1() {
    const { t } = useTranslation();

    return (
        <div className={styles.main_container}>
            <div className={styles.content_container}>
                <img src={logoText} alt='ambient' />
                <TradeNowButton />
            </div>
        </div>
    );
}
