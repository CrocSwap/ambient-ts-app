import styles from './ExtraControls.module.css';
import Toggle2 from '../../Global/Toggle/Toggle2';
export default function ExtraControls() {
    const exchangeBalanceControl = (
        <section className={styles.wallet_container}>
            <div className={styles.wallet_container_left}>
                <div>Wallet</div>
                <div>logo</div>
            </div>

            <Toggle2
                isOn={false}
                handleToggle={() => console.log('toggled')}
                id='remove_range_exchange_balance'
                disabled={true}
            />
        </section>
    );

    return <div className={styles.main_container}>{exchangeBalanceControl}</div>;
}
