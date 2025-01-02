import FutaDivider2 from '../Divider/FutaDivider2';
import styles from './Chart.module.css';
import ScatterChart from './ScatterChart/ScatterChart';

export default function Chart() {
    return (
        <div className={styles.container}>
            {/* <FutaDivider count={2} /> */}
            <div>
                <p className={styles.label}>chart</p>
                <FutaDivider2 />
            </div>
            <ScatterChart />
        </div>
    );
}
