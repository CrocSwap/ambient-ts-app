import Swap from '../../platformAmbient/Trade/Swap/Swap';

import styles from './SwapFuta.module.css';

import logo from '../../../assets/futa/logos/homeLogo.svg';

function SwapFuta() {
    return (
        <section className={styles.mainSection}>
            <div className={styles.chartSection}>
                <img src={logo} alt='' />
            </div>
            <Swap isOnTradeRoute />
        </section>
    );
}

export default SwapFuta;
