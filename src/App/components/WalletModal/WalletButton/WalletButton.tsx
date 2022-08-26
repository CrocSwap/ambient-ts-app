import styles from './WalletButton.module.css';

export default function WalletButton() {
    return (
        <button className={styles.container}>
            <img
                className={styles.icon}
                src='https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                alt=''
            />
            <div className={styles.wallet_name}></div>
        </button>
    );
}
