import styles from './ExtraControls.module.css';
import { MdAccountBalanceWallet } from 'react-icons/md';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import { DefaultTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import { allDexBalanceMethodsIF } from '../../../App/hooks/useExchangePrefs';

interface propsIF {
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    baseRemovalNum: number;
    quoteRemovalNum: number;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    dexBalancePrefs: allDexBalanceMethodsIF;
}

export default function ExtraControls(props: propsIF) {
    const {
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        baseRemovalNum,
        quoteRemovalNum,
        baseTokenSymbol,
        quoteTokenSymbol,
        dexBalancePrefs,
    } = props;

    const baseTokenWalletBalanceNum = parseFloat(baseTokenBalance);
    const quoteTokenWalletBalanceNum = parseFloat(quoteTokenBalance);

    const baseTokenDexBalanceNum = parseFloat(baseTokenDexBalance);
    const quoteTokenDexBalanceNum = parseFloat(quoteTokenDexBalance);

    const combinedBaseWalletBalanceAndRemovalNum =
        baseTokenWalletBalanceNum + baseRemovalNum;
    const combinedQuoteWalletBalanceAndRemovalNum =
        quoteTokenWalletBalanceNum + quoteRemovalNum;

    const combinedBaseDexBalanceAndRemovalNum =
        baseTokenDexBalanceNum + baseRemovalNum;
    const combinedQuoteDexBalanceAndRemovalNum =
        quoteTokenDexBalanceNum + quoteRemovalNum;

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

    const truncatedCombinedWalletBaseQty = isNaN(
        combinedBaseWalletBalanceAndRemovalNum,
    )
        ? '...'
        : combinedBaseWalletBalanceAndRemovalNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const truncatedCombinedWalletQuoteQty = isNaN(
        combinedQuoteWalletBalanceAndRemovalNum,
    )
        ? '...'
        : combinedQuoteWalletBalanceAndRemovalNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const truncatedCombinedDexBaseQty = isNaN(
        combinedBaseDexBalanceAndRemovalNum,
    )
        ? '...'
        : combinedBaseDexBalanceAndRemovalNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const truncatedCombinedDexQuoteQty = isNaN(
        combinedQuoteDexBalanceAndRemovalNum,
    )
        ? '...'
        : combinedQuoteDexBalanceAndRemovalNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const walletBalanceWithTooltip = (
        <DefaultTooltip
            interactive
            title={'Save to Wallet Balance'}
            placement={'top-end'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            <div
                className={styles.wallet_section}
                style={{
                    color: !dexBalancePrefs.range.outputToDexBal.isEnabled
                        ? '#ebebff'
                        : '#555555',
                    cursor: 'pointer',
                }}
                onClick={() => dexBalancePrefs.range.outputToDexBal.disable()}
            >
                <MdAccountBalanceWallet
                    size={25}
                    color={
                        dexBalancePrefs.range.outputToDexBal.isEnabled
                            ? '#555555'
                            : '#EBEBFF'
                    }
                />
                <div className={styles.wallet_amounts}>
                    <div>
                        {dexBalancePrefs.range.outputToDexBal.isEnabled
                            ? `${truncatedWalletBaseQty} ${baseTokenSymbol}`
                            : `${truncatedCombinedWalletBaseQty} ${baseTokenSymbol}`}
                    </div>
                    <div>
                        {dexBalancePrefs.range.outputToDexBal.isEnabled
                            ? `${truncatedWalletQuoteQty} ${quoteTokenSymbol}`
                            : `${truncatedCombinedWalletQuoteQty} ${quoteTokenSymbol}`}
                    </div>
                </div>
            </div>
        </DefaultTooltip>
    );

    const exchangeBalanceWithTooltip = (
        <DefaultTooltip
            interactive
            title={'Save to Exchange Balance'}
            placement={'top-end'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            <div
                className={`${styles.exchange_text} ${
                    !dexBalancePrefs.range.outputToDexBal.isEnabled &&
                    styles.grey_logo
                }`}
                style={{
                    color: dexBalancePrefs.range.outputToDexBal.isEnabled
                        ? '#ebebff'
                        : '#555555',
                    cursor: 'pointer',
                }}
                onClick={() => dexBalancePrefs.range.outputToDexBal.enable()}
            >
                <div className={styles.wallet_amounts}>
                    <div>
                        {dexBalancePrefs.range.outputToDexBal.isEnabled
                            ? `${truncatedCombinedDexBaseQty} ${baseTokenSymbol}`
                            : `${truncatedDexBaseQty} ${baseTokenSymbol}`}
                    </div>
                    <div>
                        {dexBalancePrefs.range.outputToDexBal.isEnabled
                            ? `${truncatedCombinedDexQuoteQty} ${quoteTokenSymbol}`
                            : `${truncatedDexQuoteQty} ${quoteTokenSymbol}`}
                    </div>
                </div>
                <img src={ambientLogo} width='25' alt='ambient finance logo' />
            </div>
        </DefaultTooltip>
    );

    return (
        <div className={styles.main_container}>
            <section className={styles.wallet_container}>
                <div className={styles.wallet_container_left}>
                    {walletBalanceWithTooltip}
                    {exchangeBalanceWithTooltip}
                </div>
            </section>
        </div>
    );
}
