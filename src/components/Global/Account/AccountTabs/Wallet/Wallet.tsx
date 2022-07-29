import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import styles from './Wallet.module.css';
import WalletCard from './WalletCard';
import WalletHeader from './WalletHeader';
interface WalletPropsIF {
    resolvedAddress: string;
    activeAccount: string;
    connectedAccountActive: boolean;
}
export default function Wallet(props: WalletPropsIF) {
    const tokensInRTK = useAppSelector((state) => state.tokenData.tokens);

    // tokensInRTK[0].
    const { connectedAccountActive } = props;

    const items = [1, 2, 3, 4, 5, 6];

    const ItemContent = connectedAccountActive
        ? tokensInRTK.map((item, idx) => <WalletCard key={idx} token={item} />)
        : items.map((item, idx) => <WalletCard key={idx} />);
    return (
        <div className={styles.container}>
            <WalletHeader />
            {ItemContent}
        </div>
    );
}
