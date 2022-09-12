import styles from './HarvestExtraControls.module.css';
import Toggle2 from '../../Global/Toggle/Toggle2';
import { MdAccountBalanceWallet } from 'react-icons/md';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import { Dispatch, SetStateAction } from 'react';

interface HarvestExtraControlsPropsIF {
    isSaveAsDexSurplusChecked: boolean;
    setIsSaveAsDexSurplusChecked: Dispatch<SetStateAction<boolean>>;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseRemovalNum: number;
    quoteRemovalNum: number;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
}

export default function HarvestExtraControls(props: HarvestExtraControlsPropsIF) {
    const {
        isSaveAsDexSurplusChecked,
        setIsSaveAsDexSurplusChecked,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        baseRemovalNum,
        quoteRemovalNum,
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
                    className={styles.wallet_amount}
                    style={{ color: !isSaveAsDexSurplusChecked ? '#ebebff' : '#555555' }}
                >
                    <MdAccountBalanceWallet
                        size={15}
                        color={isSaveAsDexSurplusChecked ? '#555555' : '#EBEBFF'}
                    />
                    {isSaveAsDexSurplusChecked
                        ? `${truncatedWalletBaseQty} ${baseTokenSymbol} / ${truncatedWalletQuoteQty} ${quoteTokenSymbol}`
                        : `${truncatedCombinedWalletBaseQty} ${baseTokenSymbol} / ${truncatedCombinedWalletQuoteQty} ${quoteTokenSymbol}`}
                </div>
                <div
                    className={`${styles.exchange_text} ${
                        !isSaveAsDexSurplusChecked && styles.grey_logo
                    }`}
                    style={{ color: isSaveAsDexSurplusChecked ? '#ebebff' : '#555555' }}
                >
                    <img src={ambientLogo} width='15' alt='' />
                    {isSaveAsDexSurplusChecked
                        ? `${truncatedCombinedDexBaseQty} ${baseTokenSymbol} / ${truncatedCombinedDexQuoteQty} ${quoteTokenSymbol}`
                        : `${truncatedDexBaseQty} ${baseTokenSymbol} / ${truncatedDexQuoteQty} ${quoteTokenSymbol}`}
                </div>
            </div>

            <Toggle2
                isOn={isSaveAsDexSurplusChecked}
                handleToggle={() => setIsSaveAsDexSurplusChecked(!isSaveAsDexSurplusChecked)}
                id='harvest_position_exchange_balance'
                disabled={false}
            />
        </section>
    );
    const gaslesssTransactionControl = (
        <section className={styles.gasless_container}>
            <div className={styles.gasless_text}>Enable Gasless Transaction</div>

            <Toggle2
                isOn={false}
                handleToggle={() => console.log('toggled')}
                id='gasless_transaction_toggle'
                disabled={true}
            />
        </section>
    );

    return (
        <div className={styles.main_container}>
            {exchangeBalanceControl}
            {gaslesssTransactionControl}
        </div>
    );
}
