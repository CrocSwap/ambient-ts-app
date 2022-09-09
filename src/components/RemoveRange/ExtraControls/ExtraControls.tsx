import styles from './ExtraControls.module.css';
import Toggle2 from '../../Global/Toggle/Toggle2';
import { MdAccountBalanceWallet } from 'react-icons/md';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import { Dispatch, SetStateAction } from 'react';

interface CurrencyConverterPropsIF {
    isSaveAsDexSurplusChecked: boolean;
    setIsSaveAsDexSurplusChecked: Dispatch<SetStateAction<boolean>>;
}

export default function ExtraControls(props: CurrencyConverterPropsIF) {
    const { isSaveAsDexSurplusChecked, setIsSaveAsDexSurplusChecked } = props;

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
                    Wallet
                </div>
                <div
                    className={`${styles.exchange_text} ${
                        !isSaveAsDexSurplusChecked && styles.grey_logo
                    }`}
                    style={{ color: isSaveAsDexSurplusChecked ? '#ebebff' : '#555555' }}
                >
                    <img src={ambientLogo} width='15' alt='' />
                    0.00
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
