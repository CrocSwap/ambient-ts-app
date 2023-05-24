import { CircularProgress } from '@mui/material';
import styles from './TradeChartsLoading.module.css';
export default function TradeChartsLoading() {
    return (
        <div className={styles.container}>
            <CircularProgress />
        </div>
    );
}
