import Divider from '../Divider/Divider';
import styles from './Chart.module.css';

export default function Chart() {
    return (
        <div className={styles.container}>
            <Divider count={2} />
            <h3>CHART</h3>
            <div className={styles.content}></div>
        </div>
    );
}
