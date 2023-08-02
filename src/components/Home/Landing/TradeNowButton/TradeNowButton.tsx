import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import styles from './TradeNowButton.module.css';
import { Link } from 'react-router-dom';

interface propsIF {
    inNav?: boolean;
}
export default function TradeNowButton(props: propsIF) {
    const { inNav } = props;
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    const mobileButton = (
        <Link
            to={'/trade'}
            tabIndex={0}
            aria-label='Go to trade page button'
            className={`${styles.action_button} ${
                inNav && styles.nav_action_button
            }`}
            style={{ alignItems: 'flex-start' }}
        >
            <div className={styles.content_container}>
                <p
                    className={`${styles.button_text} ${
                        inNav && styles.nav_button_text
                    }`}
                >
                    Trade Now
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
                    Trade Now
                </p>
            </div>
        </Link>
    );
}
