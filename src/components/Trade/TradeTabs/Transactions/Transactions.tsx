import styles from './Transactions.module.css';
import TransactionCard from './TransactionCard';
import TransactionCardHeader from './TransactionCardHeader';
import { graphData } from '../../../../utils/state/graphDataSlice';

interface TransactionsProps {
    isShowAllEnabled: boolean;
    portfolio?: boolean;

    graphData: graphData;
}
export default function Transactions(props: TransactionsProps) {
    const { isShowAllEnabled, graphData } = props;

    const swapsByUser = graphData?.swapsByUser?.swaps;
    const swapsByPool = graphData?.swapsByPool?.swaps;

    const TransactionsDisplay = isShowAllEnabled
        ? swapsByPool.map((swap, idx) => (
              //   />
              <TransactionCard key={idx} swap={swap} />
          ))
        : //   .reverse()
          swapsByUser.map((swap, idx) => <TransactionCard key={idx} swap={swap} />);

    return (
        <div className={styles.container}>
            <TransactionCardHeader />
            {TransactionsDisplay}
        </div>
    );
}
