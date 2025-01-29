import { useContext } from 'react';
import { getFormattedNumber } from '../../../ambient-utils/dataLayer';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import styles from './Footer.module.css';

export default function DesktopFooter() {
    const {
        activeNetwork: { displayName },
    } = useContext(AppStateContext);
    const { nativeTokenUsdPrice, lastBlockNumber, rpcNodeStatus } =
        useContext(ChainDataContext);

    if (location.pathname === '/') return null;

    const nativeTokenPriceFormatted = getFormattedNumber({
        value: nativeTokenUsdPrice,
        isUSD: true,
    });

    const rpcStatusStyle = rpcNodeStatus
        ? rpcNodeStatus === 'active'
            ? styles.active_status
            : rpcNodeStatus === 'inactive'
              ? styles.inactive_status
              : styles.unknown_status
        : styles.unknown_status;

    return (
        <footer data-theme='futa_dark' className={styles.desktopContainer}>
            <p className={styles.network}>
                NETWORK: {displayName.toUpperCase()}
            </p>
            <div className={styles.leftContainer}>
                <p className={styles.price}>
                    ETH PRICE: {nativeTokenPriceFormatted}
                </p>
                <p className={styles.rpc_container}>
                    RPC STATUS:
                    <span
                        className={`${styles.rpc_status} ${rpcStatusStyle}`}
                    />
                </p>
                <p className={styles.blockNumber}>{lastBlockNumber}</p>
            </div>
        </footer>
    );
}
