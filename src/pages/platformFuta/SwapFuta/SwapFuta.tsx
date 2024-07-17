import Swap from '../../platformAmbient/Trade/Swap/Swap';

import Trade from '../../platformAmbient/Trade/Trade';
import styles from './SwapFuta.module.css';

// import logo from '../../../assets/futa/logos/homeLogo.svg';

function SwapFuta() {
    return (
        <section className={styles.mainSection}>
            <div className={styles.chartSection}>
                {/* <img src={logo} alt='' /> */}
                <Trade />
            </div>
            <Swap isOnTradeRoute />
        </section>
    );
}

export default SwapFuta;
