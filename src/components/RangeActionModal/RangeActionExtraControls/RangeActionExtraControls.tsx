import styles from './RangeActionExtraControls.module.css';
import { MdAccountBalanceWallet } from 'react-icons/md';
import ambientLogo from '../../../assets/images/logos/ambient_logo.png';

import { useContext } from 'react';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';

export default function RangeActionExtraControls() {
    const { dexBalRange } = useContext(UserPreferenceContext);

    return (
        <div className={styles.main_container}>
            <section className={styles.wallet_container}>
                <div className={styles.wallet_container_left}>
                    <div
                        className={styles.wallet_section}
                        style={{
                            color: !dexBalRange.outputToDexBal.isEnabled
                                ? '#ebebff'
                                : '#555555',
                            cursor: 'pointer',
                        }}
                        onClick={() => dexBalRange.outputToDexBal.disable()}
                    >
                        <MdAccountBalanceWallet
                            size={25}
                            color={
                                dexBalRange.outputToDexBal.isEnabled
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
                            !dexBalRange.outputToDexBal.isEnabled &&
                            styles.grey_logo
                        }`}
                        style={{
                            color: dexBalRange.outputToDexBal.isEnabled
                                ? '#ebebff'
                                : '#555555',
                            cursor: 'pointer',
                        }}
                        onClick={() => dexBalRange.outputToDexBal.enable()}
                    >
                        <div className={styles.wallet_amounts}>
                            Send to DEX Balance
                        </div>
                        <img
                            src={ambientLogo}
                            width='25'
                            alt='ambient finance logo'
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
