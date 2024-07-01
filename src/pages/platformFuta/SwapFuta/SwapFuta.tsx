import Swap from '../../platformAmbient/Trade/Swap/Swap';
import styles from './SwapFuta.module.css';
function SwapFuta() {
    return (
        <section className={styles.mainSection}>
            <div className={styles.chartSection}></div>
            <Swap isOnTradeRoute />
        </section>
    );
}

export default SwapFuta;
