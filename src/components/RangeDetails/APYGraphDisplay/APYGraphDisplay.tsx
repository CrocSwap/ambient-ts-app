import { ReactNode } from 'react';
import Apy from '../../Global/Tabs/Apy/Apy';
import styles from './APYGraphDisplay.module.css';
import chartImage from '../../../assets/images/Temporary/chart.svg';

export default function APYGraphDisplay() {
    return (
        <div className={styles.main_container}>
            <div className={styles.apy}>
                <Apy amount={36.65} />
                <p className={`${styles.apy_text} ${styles.apy_green}`}>APY</p>
            </div>
            <div className={styles.chart_container}>
                <img src={chartImage} alt='chart' />
            </div>
        </div>
    );
}
