import styles from './ExtraControls.module.css';
// import Toggle2 from '../../Global/Toggle/Toggle2';
import { MdAccountBalanceWallet } from 'react-icons/md';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import { Dispatch, SetStateAction } from 'react';
import { DefaultTooltip } from '../../Global/StyledTooltip/StyledTooltip';

interface CurrencyConverterPropsIF {
    isSaveAsDexSurplusChecked: boolean;
    setIsSaveAsDexSurplusChecked: Dispatch<SetStateAction<boolean>>;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    baseRemovalNum: number;
    quoteRemovalNum: number;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
}

export default function ExtraControls(props: CurrencyConverterPropsIF) {
    const {
        isSaveAsDexSurplusChecked,
        setIsSaveAsDexSurplusChecked,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        baseRemovalNum,
        quoteRemovalNum,
        baseTokenSymbol,
        quoteTokenSymbol,
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

    const walletBalanceWithTooltip = (
        <DefaultTooltip
            interactive
            title={'Save to Wallet Balance'}
            // placement={'bottom'}
            placement={'top-end'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            <div
                className={styles.wallet_section}
                style={{
                    color: !isSaveAsDexSurplusChecked ? '#ebebff' : '#555555',
                    cursor: 'pointer',
                }}
                onClick={() => setIsSaveAsDexSurplusChecked(false)}
            >
                <MdAccountBalanceWallet
                    size={25}
                    color={isSaveAsDexSurplusChecked ? '#555555' : '#EBEBFF'}
                />
                <div className={styles.wallet_amounts}>
                    <div>
                        {isSaveAsDexSurplusChecked
                            ? `${truncatedWalletBaseQty} ${baseTokenSymbol}`
                            : `${truncatedCombinedWalletBaseQty} ${baseTokenSymbol}`}
                    </div>
                    <div>
                        {isSaveAsDexSurplusChecked
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
            // placement={'bottom'}
            placement={'top-end'}
            // placement={'left-start'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            <div
                className={`${styles.exchange_text} ${
                    !isSaveAsDexSurplusChecked && styles.grey_logo
                }`}
                style={{
                    color: isSaveAsDexSurplusChecked ? '#ebebff' : '#555555',
                    cursor: 'pointer',
                }}
                onClick={() => setIsSaveAsDexSurplusChecked(true)}
            >
                <div className={styles.wallet_amounts}>
                    <div>
                        {isSaveAsDexSurplusChecked
                            ? `${truncatedCombinedDexBaseQty} ${baseTokenSymbol}`
                            : `${truncatedDexBaseQty} ${baseTokenSymbol}`}
                    </div>
                    <div>
                        {isSaveAsDexSurplusChecked
                            ? `${truncatedCombinedDexQuoteQty} ${quoteTokenSymbol}`
                            : `${truncatedDexQuoteQty} ${quoteTokenSymbol}`}
                    </div>
                </div>
                <img src={ambientLogo} width='25' alt='' />
            </div>
        </DefaultTooltip>
    );

    const exchangeBalanceControl = (
        <section className={styles.wallet_container}>
            <div className={styles.wallet_container_left}>
                {walletBalanceWithTooltip}
                {exchangeBalanceWithTooltip}
            </div>
            {/* 
            <Toggle2
                isOn={isSaveAsDexSurplusChecked}
                handleToggle={() => setIsSaveAsDexSurplusChecked(!isSaveAsDexSurplusChecked)}
                id='remove_range_exchange_balance'
                disabled={false}
            /> */}
        </section>
    );
    // const gaslesssTransactionControl = (
    //     <section className={styles.gasless_container}>
    //         <div className={styles.gasless_text}>Enable Gasless Transaction</div>

    //         <Toggle2
    //             isOn={false}
    //             handleToggle={() => console.log('toggled')}
    //             id='gasless_transaction_toggle'
    //             disabled={true}
    //         />
    //     </section>
    // );

    return (
        <div className={styles.main_container}>
            {exchangeBalanceControl}
            {/* {gaslesssTransactionControl} */}
        </div>
    );
}
