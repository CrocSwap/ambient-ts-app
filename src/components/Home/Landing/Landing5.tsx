import { useTranslation } from 'react-i18next';
import styles from './Landing5.module.css';

export default function Landing5() {
    const { t } = useTranslation();
    return <div className={styles.main_container}>{t('slide5.part1')}</div>;
}
