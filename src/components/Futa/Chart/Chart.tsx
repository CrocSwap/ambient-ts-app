import styles from './Chart.module.css';
import ScatterChart from './ScatterChart/ScatterChart';

export default function Chart() {
    return (
        <div className={styles.container}>
            {/* <FutaDivider count={2} /> */}
            <h3>CHART</h3>
            <ScatterChart />
        </div>
    );
}
