import { useTranslation } from 'react-i18next';
import styles from './Landing6.module.css';

export default function Landing6() {
    const { t } = useTranslation();
    return <div className={styles.main_container}>{t('slide6.part1')}</div>;
}
