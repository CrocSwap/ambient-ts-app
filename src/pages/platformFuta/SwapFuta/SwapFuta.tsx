import Comments from '../../../components/Futa/Comments/Comments';
import Swap from '../../platformAmbient/Trade/Swap/Swap';

import Trade from '../../platformAmbient/Trade/Trade';
import styles from './SwapFuta.module.css';

// import logo from '../../../assets/futa/logos/homeLogo.svg';

function SwapFuta() {
    return (
        <section className={styles.mainSection}>
            <div className={styles.chartSection}>
                <Trade />
            </div>
            <Swap isOnTradeRoute />

            <div className={styles.comments_wrapper}>
                <Comments />
            </div>
        </section>
    );
}

export default SwapFuta;
