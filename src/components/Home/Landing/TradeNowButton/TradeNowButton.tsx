import styles from './TradeNowButton.module.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { useContext } from 'react';
import { AppStateContext } from '../../../../contexts/AppStateContext';
interface Props {
    inNav?: boolean;
}
export default function TradeNowButton(props: Props) {
    const { inNav } = props;
    const { t } = useTranslation();
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    const {
        tradeComponent: { setShowOnlyTrade },
    } = useContext(AppStateContext);

    const mobileButton = (
        <Link
            to={'/trade'}
            tabIndex={0}
            aria-label='Go to trade page button'
            className={`${styles.action_button} ${
                inNav && styles.nav_action_button
            }`}
            onClick={() => setShowOnlyTrade(true)}
            style={{ alignItems: 'flex-start' }}
        >
            <div className={styles.content_container}>
                <p
                    className={`${styles.button_text} ${
                        inNav && styles.nav_button_text
                    }`}
                >
                    Get Started
                </p>
            </div>
        </Link>
    );
    if (showMobileVersion) return mobileButton;
    return (
        <Link
            to={'/trade/market'}
            tabIndex={0}
            aria-label='Go to trade page button'
            className={`${styles.action_button} ${
                inNav && styles.nav_action_button
            }`}
        >
            <div className={styles.content_container}>
                <p
                    className={`${styles.button_text} ${
                        inNav && styles.nav_button_text
                    }`}
                >
                    {t('marketCTA')}
                </p>
            </div>
        </Link>
    );
}
