import Swap from '../../platformAmbient/Trade/Swap/Swap';
import Trade from '../../platformAmbient/Trade/Trade';
import styles from './SwapFuta.module.css';
function SwapFuta() {
    return (
        <section className={styles.mainSection}>
            <div className={styles.chartSection}>
                <Trade />
            </div>
            <Swap isOnTradeRoute />
        </section>
    );
}

export default SwapFuta;
