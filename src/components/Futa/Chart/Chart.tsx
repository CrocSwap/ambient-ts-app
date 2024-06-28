import Divider from '../Divider/Divider';
import styles from './Chart.module.css';
import ScatterChart from './ScatterChart/ScatterChart';

export default function Chart() {
    return (
        <div id='container111' className={styles.container}>
            <Divider count={2} />
            <h3>CHART</h3>
            {/* <div className={styles.content}> */}
            <ScatterChart />
            {/* </div> */}
        </div>
    );
}
