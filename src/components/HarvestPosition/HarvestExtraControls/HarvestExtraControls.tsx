import styles from './HarvestExtraControls.module.css';
import { MdAccountBalanceWallet } from 'react-icons/md';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import { allDexBalanceMethodsIF } from '../../../App/hooks/useExchangePrefs';

interface propsIF {
    dexBalancePrefs: allDexBalanceMethodsIF;
}

export default function HarvestExtraControls(props: propsIF) {
    const { dexBalancePrefs } = props;

    return (
        <div className={styles.main_container}>
            <section className={styles.wallet_container}>
                <div className={styles.wallet_container_left}>
                    <div
                        className={styles.wallet_section}
                        style={{
                            color: !dexBalancePrefs.range.outputToDexBal
                                .isEnabled
                                ? '#ebebff'
                                : '#555555',
                            cursor: 'pointer',
                        }}
                        onClick={() =>
                            dexBalancePrefs.range.outputToDexBal.disable()
                        }
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
                            Send to Wallet
                        </div>
                    </div>
                    <div
                        className={`${styles.exchange_text} ${
                            !dexBalancePrefs.range.outputToDexBal.isEnabled &&
                            styles.grey_logo
                        }`}
                        style={{
                            color: dexBalancePrefs.range.outputToDexBal
                                .isEnabled
                                ? '#ebebff'
                                : '#555555',
                            cursor: 'pointer',
                        }}
                        onClick={() =>
                            dexBalancePrefs.range.outputToDexBal.enable()
                        }
                    >
                        <div className={styles.wallet_amounts}>
                            Send to DEX Balance
                        </div>
                        <img src={ambientLogo} width='25' alt='' />
                    </div>
                </div>
            </section>
        </div>
    );
}
