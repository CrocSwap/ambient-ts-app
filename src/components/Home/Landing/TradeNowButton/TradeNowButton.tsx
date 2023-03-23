import styles from './TradeNowButton.module.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export default function TradeNowButton() {
    const { t } = useTranslation();

    return (
        <Link to={'/trade/market'} tabIndex={0} aria-label='Go to trade page'>
            <button className={styles.action_button}>
                <p className={styles.button_text}>{t('marketCTA')}</p>
            </button>
        </Link>
    );
}
