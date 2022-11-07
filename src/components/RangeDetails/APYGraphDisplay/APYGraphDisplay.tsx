import Apy from '../../Global/Tabs/Apy/Apy';
import styles from './APYGraphDisplay.module.css';
import chartImage from '../../../assets/images/Temporary/chart2.svg';

interface IApyGraphDisplayProps {
    updatedPositionApy: number | undefined;
}
export default function APYGraphDisplay(props: IApyGraphDisplayProps) {
    const { updatedPositionApy } = props;
    return (
        <div className={styles.main_container}>
            <div className={styles.apr}>
                <Apy amount={updatedPositionApy || undefined} />
                <p className={`${styles.apr_text} ${styles.apr_green}`}>APR</p>
            </div>
            <div className={styles.chart_container}>
                <img src={chartImage} alt='chart' />
            </div>
        </div>
    );
}
