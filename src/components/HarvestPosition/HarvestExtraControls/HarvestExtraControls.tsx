import styles from './HarvestExtraControls.module.css';
import { MdAccountBalanceWallet } from 'react-icons/md';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import { allDexBalanceMethodsIF } from '../../../App/hooks/useExchangePrefs';

interface propsIF {
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseRemovalNum: number;
    quoteRemovalNum: number;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    dexBalancePrefs: allDexBalanceMethodsIF;
}

export default function HarvestExtraControls(props: propsIF) {
    const {
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        baseRemovalNum,
        quoteRemovalNum,
        dexBalancePrefs
    } = props;

    const baseTokenWalletBalanceNum = parseFloat(baseTokenBalance);
    const quoteTokenWalletBalanceNum = parseFloat(quoteTokenBalance);

    const baseTokenDexBalanceNum = parseFloat(baseTokenDexBalance);
    const quoteTokenDexBalanceNum = parseFloat(quoteTokenDexBalance);

    const combinedBaseWalletBalanceAndRemovalNum = baseTokenWalletBalanceNum + baseRemovalNum;
    const combinedQuoteWalletBalanceAndRemovalNum = quoteTokenWalletBalanceNum + quoteRemovalNum;

    const combinedBaseDexBalanceAndRemovalNum = baseTokenDexBalanceNum + baseRemovalNum;
    const combinedQuoteDexBalanceAndRemovalNum = quoteTokenDexBalanceNum + quoteRemovalNum;

    const truncatedWalletBaseQty = isNaN(baseTokenWalletBalanceNum)
        ? '...'
        : baseTokenWalletBalanceNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const truncatedWalletQuoteQty = isNaN(quoteTokenWalletBalanceNum)
        ? '...'
        : quoteTokenWalletBalanceNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const truncatedDexBaseQty = isNaN(baseTokenDexBalanceNum)
        ? '...'
        : baseTokenDexBalanceNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const truncatedDexQuoteQty = isNaN(quoteTokenDexBalanceNum)
        ? '...'
        : quoteTokenDexBalanceNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });
    const truncatedCombinedWalletBaseQty = isNaN(combinedBaseWalletBalanceAndRemovalNum)
        ? '...'
        : combinedBaseWalletBalanceAndRemovalNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const truncatedCombinedWalletQuoteQty = isNaN(combinedQuoteWalletBalanceAndRemovalNum)
        ? '...'
        : combinedQuoteWalletBalanceAndRemovalNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const truncatedCombinedDexBaseQty = isNaN(combinedBaseDexBalanceAndRemovalNum)
        ? '...'
        : combinedBaseDexBalanceAndRemovalNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const truncatedCombinedDexQuoteQty = isNaN(combinedQuoteDexBalanceAndRemovalNum)
        ? '...'
        : combinedQuoteDexBalanceAndRemovalNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const exchangeBalanceControl = (
        <section className={styles.wallet_container}>
            <div className={styles.wallet_container_left}>
                <div
                    className={styles.wallet_section}
                    style={{
                        color: !dexBalancePrefs.reap.outputToDexBal.isEnabled ? '#ebebff' : '#555555',
                        cursor: 'pointer',
                    }}
                    onClick={() => dexBalancePrefs.reap.outputToDexBal.disable()}
                >
                    <MdAccountBalanceWallet
                        size={25}
                        color={dexBalancePrefs.reap.outputToDexBal.isEnabled ? '#555555' : '#EBEBFF'}
                    />
                    <div className={styles.wallet_amounts}>
                        <div>
                            {dexBalancePrefs.reap.outputToDexBal.isEnabled
                                ? `${truncatedWalletBaseQty} ${baseTokenSymbol}`
                                : `${truncatedCombinedWalletBaseQty} ${baseTokenSymbol}`}
                        </div>
                        <div>
                            {dexBalancePrefs.reap.outputToDexBal.isEnabled
                                ? `${truncatedWalletQuoteQty} ${quoteTokenSymbol}`
                                : `${truncatedCombinedWalletQuoteQty} ${quoteTokenSymbol}`}
                        </div>
                    </div>
                </div>
                <div
                    className={`${styles.exchange_text} ${
                        !dexBalancePrefs.reap.outputToDexBal.isEnabled && styles.grey_logo
                    }`}
                    style={{
                        color: dexBalancePrefs.reap.outputToDexBal.isEnabled ? '#ebebff' : '#555555',
                        cursor: 'pointer',
                    }}
                    onClick={() => dexBalancePrefs.reap.outputToDexBal.enable()}
                >
                    <div className={styles.wallet_amounts}>
                        <div>
                            {dexBalancePrefs.reap.outputToDexBal.isEnabled
                                ? `${truncatedCombinedDexBaseQty} ${baseTokenSymbol}`
                                : `${truncatedDexBaseQty} ${baseTokenSymbol}`}
                        </div>
                        <div>
                            {dexBalancePrefs.reap.outputToDexBal.isEnabled
                                ? `${truncatedCombinedDexQuoteQty} ${quoteTokenSymbol}`
                                : `${truncatedDexQuoteQty} ${quoteTokenSymbol}`}
                        </div>
                    </div>
                    <img src={ambientLogo} width='25' alt='' />
                </div>
            </div>
        </section>
    );

    return (
        <div className={styles.main_container}>
            {exchangeBalanceControl}
        </div>
    );
}
