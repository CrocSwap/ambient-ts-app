import styles from './TradeChartsLoading.module.css';
import Spinner from '../../../../components/Global/Spinner/Spinner';
export default function TradeChartsLoading() {
    return (
        <div className={styles.container}>
            {/* <CircularProgress /> */}
            <Spinner size={100} bg='var(--dark2)' />
        </div>
    );
}
