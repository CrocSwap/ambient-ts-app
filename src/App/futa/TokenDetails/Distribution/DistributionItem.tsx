import styles from './Distribution.module.css';
interface Props {
    wallet: string;
    value: string;
}
export default function DistributionItem(props: Props) {
    const { wallet, value } = props;

    return (
        <div className={styles.distributionItemContainer}>
            <p>{wallet}</p>
            <p>{value}</p>
        </div>
    );
}
