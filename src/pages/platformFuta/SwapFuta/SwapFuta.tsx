import Divider from '../../../components/Futa/Divider/FutaDivider';
import Separator from '../../../components/Futa/Separator/Separator';
import Swap from '../../platformAmbient/Trade/Swap/Swap';

import Trade from '../../platformAmbient/Trade/Trade';
import styles from './SwapFuta.module.css';

// import logo from '../../../assets/futa/logos/homeLogo.svg';

function SwapFuta() {
    return (
        <section className={styles.mainSection}>
            <div className={styles.chartSection}>
                <Divider count={2} />
                <Trade />
            </div>
            <div style={{ paddingBottom: '4px' }}>
                <Separator dots={100} />
            </div>

            <div>
                <Divider count={2} />
                <Swap isOnTradeRoute />
            </div>
        </section>
    );
}

export default SwapFuta;
