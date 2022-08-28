import candleStickImage from '../../../../assets/images/charts/candlestick2.png';
import styles from './TradeChartsLoading.module.css';
export default function TradeChartsLoading() {
    return (
        <div className={styles.container}>
            <img src={candleStickImage} alt='' />
            <div className={styles.overlay_container}>
                <div className={styles.overlay}> </div>
                <div className={styles.overlay}> </div>
            </div>
        </div>
    );
}
