import { useTranslation } from 'react-i18next';
import styles from './Landing2.module.css';

export default function Landing2() {
    const { t } = useTranslation();

    return (
        <div className={styles.main_container}>
            <div className={styles.content_container}>
                <div className={styles.on_chain}>
                    {t('slide2.part1')}{' '}
                    <div className={styles.highlight_text}> {t('slide2.part2')}</div>
                </div>
                <div className={styles.ambient}>ambient</div>
                <div className={styles.architecture}>
                    {/* <div className={styles.highlight_text_mobile}>Our unique architecture</div> */}
                    Our <span className={styles.highlight_text}> unique architecture</span> provides
                    low fee transactions, greater liquidity rewards, and a fairer trading
                    experience.
                </div>
            </div>
        </div>
    );
}
