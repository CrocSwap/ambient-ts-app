import styles from './AnalyticsTransactionsCard.module.css';

interface AnalyticsTransactionsCardProp {
    number: number;
}
// eslint-disable-next-line
export default function AnalyticsTransactionsCard(props: AnalyticsTransactionsCardProp) {
    return (
        <div className={styles.container}>
            <div>Remove WBTC and USDC</div>
            <div>$9.45m</div>
            <div>0.09 WBTC</div>
            <div>9.45m USDC</div>
            <div>0x6555...e0B</div>
            <div>1 hour ago</div>
        </div>
    );
}
