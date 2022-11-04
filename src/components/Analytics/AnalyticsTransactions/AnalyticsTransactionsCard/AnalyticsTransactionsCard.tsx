import styles from './AnalyticsTransactionsCard.module.css';

type txData = {
    label: string;
    data: string;
};
interface AnalyticsTransactionsCardProp {
    number: number;
    currentTransactions: txData;
}
// eslint-disable-next-line
export default function AnalyticsTransactionsCard(props: AnalyticsTransactionsCardProp) {
    const { currentTransactions } = props;
    return (
        <div className={styles.container}>
            <div>{`${currentTransactions.data} WBTC and USDC`}</div>

            <div>$9.45m</div>
            <div>0.09 WBTC</div>
            <div>9.45m USDC</div>
            <div>0x6555...e0B</div>
            <div>1 hour ago</div>
        </div>
    );
}
