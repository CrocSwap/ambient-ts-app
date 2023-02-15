import styles from './Landing1.module.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoText from '../../../assets/images/logos/logo_text.svg';

export default function Landing1() {
    const { t } = useTranslation();

    return (
        <div className={styles.main_container}>
            <div className={styles.content_container}>
                {/* <div className={styles.ambient_background}>DEFI 2.0</div> */}
                {/* <div className={styles.ambient}>ambient</div> */}
                <img src={logoText} alt='ambient' />
                <Link to={'/trade/market'}>
                    <button className={styles.action_button}>
                        <p className={styles.button_text}>{t('marketCTA')}</p>
                    </button>
                </Link>
            </div>
        </div>
    );
}
