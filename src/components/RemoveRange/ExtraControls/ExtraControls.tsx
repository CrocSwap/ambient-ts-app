import styles from './ExtraControls.module.css';
import Toggle2 from '../../Global/Toggle/Toggle2';
import { MdAccountBalanceWallet } from 'react-icons/md';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import { Dispatch, SetStateAction } from 'react';

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

    const truncatedWalletBaseQty = baseTokenWalletBalanceNum.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const truncatedWalletQuoteQty = quoteTokenWalletBalanceNum.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const truncatedDexBaseQty = baseTokenDexBalanceNum.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const truncatedDexQuoteQty = quoteTokenDexBalanceNum.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const truncatedCombinedWalletBaseQty = combinedBaseWalletBalanceAndRemovalNum.toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    );

    const truncatedCombinedWalletQuoteQty = combinedQuoteWalletBalanceAndRemovalNum.toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    );

    const truncatedCombinedDexBaseQty = combinedBaseDexBalanceAndRemovalNum.toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    );

    const truncatedCombinedDexQuoteQty = combinedQuoteDexBalanceAndRemovalNum.toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    );

    const exchangeBalanceControl = (
        <section className={styles.wallet_container}>
            <div className={styles.wallet_container_left}>
                <div
                    className={styles.wallet_section}
                    style={{ color: !isSaveAsDexSurplusChecked ? '#ebebff' : '#555555' }}
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
                <div
                    className={`${styles.exchange_text} ${
                        !isSaveAsDexSurplusChecked && styles.grey_logo
                    }`}
                    style={{ color: isSaveAsDexSurplusChecked ? '#ebebff' : '#555555' }}
                >
                    <img src={ambientLogo} width='25' alt='' />
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
                </div>
            </div>

            <Toggle2
                isOn={isSaveAsDexSurplusChecked}
                handleToggle={() => setIsSaveAsDexSurplusChecked(!isSaveAsDexSurplusChecked)}
                id='remove_range_exchange_balance'
                disabled={false}
            />
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
