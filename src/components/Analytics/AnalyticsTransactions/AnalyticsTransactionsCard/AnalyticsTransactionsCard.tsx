import styles from './AnalyticsTransactionsCard.module.css';

type txData = {
    label: string;
    data: string;
};
interface AnalyticsTransactionsCardProp {
    number: number;
    currentTransactions: txData;
    searchInput?: string;
}
// eslint-disable-next-line
export default function AnalyticsTransactionsCard(props: AnalyticsTransactionsCardProp) {
    const { currentTransactions, searchInput } = props;
    return (
        <div className={styles.container}>
            <div>{`${currentTransactions.data} ${
                searchInput ? searchInput : 'WBTC'
            } and USDC`}</div>

            <div>$9.45m</div>
            <div>0.09 WBTC</div>
            <div>9.45m USDC</div>
            <div>0x6555...e0B</div>
            <div>1 hour ago</div>
        </div>
    );
}
