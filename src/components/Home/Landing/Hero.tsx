import { useContext, useMemo } from 'react';
import { BrandContext } from '../../../contexts/BrandContext';
import styles from './Hero.module.css';
import TradeNowButton from './TradeNowButton/TradeNowButton';

export default function Hero() {
    const { platformName, cobrandingLogo } = useContext(BrandContext);

    // Get CSS class for background based on platform name
    const backgroundClass = useMemo(() => {
        switch (platformName) {
            case 'ambient':
            default:
                return styles.purple_waves;
        }
    }, [platformName]);

    return (
        <div
            className={`${styles.hero_container} ${backgroundClass}`}
            id='hero'
        >
            <div className={styles.hero_content}>
                <div className={styles.hero_items}>
                    <span
                        className={`${styles.ambient_logo} ${cobrandingLogo ? '' : styles.ambient_only}`}
                    >
                        ambient
                    </span>

                    {cobrandingLogo && (
                        <>
                            <span className={styles.separator}>x</span>
                            <img
                                src={cobrandingLogo}
                                alt=''
                                className={styles.cobranding_logo}
                            />
                        </>
                    )}
                </div>
                <div className={styles.button_container}>
                    <TradeNowButton fieldId='trade_now_btn_in_hero' />
                </div>
            </div>
        </div>
    );
}
