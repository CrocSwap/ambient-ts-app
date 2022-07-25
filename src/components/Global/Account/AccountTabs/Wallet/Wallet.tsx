import styles from './Wallet.module.css';
import WalletCard from './WalletCard';
import WalletHeader from './WalletHeader';

export default function Wallet() {
    const items = [1, 2, 3, 4, 5, 6];

    const ItemContent = items.map((item, idx) => <WalletCard key={idx} />);
    return (
        <div className={styles.container}>
            <WalletHeader />
            {ItemContent}
        </div>
    );
}
