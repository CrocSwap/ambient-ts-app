import Comments from '../../../components/Futa/Comments/Comments';
import Swap from '../../platformAmbient/Trade/Swap/Swap';

import Trade from '../../platformAmbient/Trade/Trade';
import styles from './SwapFuta.module.css';

// import logo from '../../../assets/futa/logos/homeLogo.svg';

function SwapFuta() {
    const tradeWrapperID = 'swapFutaTradeWrapper';

    return (
        <section className={styles.mainSection}>
            <div className={styles.chartSection}>
                <Trade />
            </div>
            <span>
                <span id={tradeWrapperID}>
                    <Swap isOnTradeRoute />
                </span>
                <Comments
                    isForTrade={true}
                    isSmall={true}
                    resizeEffectorSelector={tradeWrapperID}
                />
            </span>
        </section>
    );
}

export default SwapFuta;
