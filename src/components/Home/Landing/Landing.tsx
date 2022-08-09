import styles from './Landing.module.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Landing() {
    const { t } = useTranslation();

    return (
        <div className={styles.main_container}>
            <div className={styles.content_container}>
                {/* <div className={styles.ambient_background}>DEFI 2.0</div> */}
                <div className={styles.ambient}>ambient</div>
                <Link to={'/trade/market'}>
                    <button className={styles.action_button}>
                        <p className={styles.button_text}>{t('marketCTA')}</p>
                    </button>
                </Link>
            </div>
        </div>
    );
}
