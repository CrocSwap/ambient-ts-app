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
        <div className={styles.desktopContainer}>
            <p className={styles.network}>
                NETWORK : {chainData.displayName.toUpperCase()}
            </p>
            <div className={styles.leftContainer}>
                <p className={styles.price}>
                    ETH PRICE : {nativeTokenPriceFormatted}
                </p>
                {/* <div className={styles.status}>
                    <p>RPC STATUS : </p>
                    <span
                        className={styles.statusDisplay}
                        style={{
                            background: isStatusPositive
                                ? 'var(--positive)'
                                : 'var(--negative)',
                        }}
                    />
                </div> */}
                <p className={styles.blockNumber}>{lastBlockNumber}</p>
            </div>
        </div>
    );
}
