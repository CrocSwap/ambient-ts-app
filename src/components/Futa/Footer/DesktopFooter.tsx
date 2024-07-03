import { useContext } from 'react';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import styles from './Footer.module.css';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { getFormattedNumber } from '../../../ambient-utils/dataLayer';
export default function DesktopFooter() {
    // const isStatusPositive = true;

    const { chainData } = useContext(TradeDataContext);
    const { nativeTokenUsdPrice, lastBlockNumber } =
        useContext(ChainDataContext);

    if (location.pathname === '/') return null;

    const nativeTokenPriceFormatted = getFormattedNumber({
        value: nativeTokenUsdPrice,
        isUSD: true,
    });

    return (
        <footer data-theme='orange_dark' className={styles.desktopContainer}>
            <p className={styles.network}>
                NETWORK : {chainData.displayName.toUpperCase()}
            </p>
            <div className={styles.leftContainer}>
                <p className={styles.price}>
                    ETH PRICE : {nativeTokenPriceFormatted}
                </p>
                <p className={styles.blockNumber}>{lastBlockNumber}</p>
            </div>
        </footer>
    );
}
