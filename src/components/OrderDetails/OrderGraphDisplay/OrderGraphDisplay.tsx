import Apy from '../../Global/Tabs/Apy/Apy';
import styles from './OrderGraphDisplay.module.css';
import chartImage from '../../../assets/images/Temporary/chart2.svg';

interface IOrderGraphDisplayProps {
    // updatedPositionApy: number | undefined;
    name?: boolean;
}
export default function OrderGraphDisplay(props: IOrderGraphDisplayProps) {
    // const { updatedPositionApy } = props;
    return (
        <div className={styles.main_container}>
            <div className={styles.apy}>
                {/* <Apy amount={updatedPositionApy || undefined} /> */}
                <p className={`${styles.apy_text} ${styles.apy_green}`}>APY</p>
            </div>
            <div className={styles.chart_container}>
                <img src={chartImage} alt='chart' />
            </div>
        </div>
    );
}
