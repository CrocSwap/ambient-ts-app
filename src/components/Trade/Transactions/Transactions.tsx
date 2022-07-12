import Transaction from '../../Transaction/Transaction';
import styles from './Transactions.module.css';
import { graphData } from '../../../utils/state/graphDataSlice';

interface TransactionsProps {
    isShowAllEnabled: boolean;
    portfolio?: boolean;
    notOnTradeRoute?: boolean;
    graphData: graphData;
}

export default function Transactions(props: TransactionsProps) {
    const {
        // portfolio,
        //  notOnTradeRoute,
        isShowAllEnabled,
        graphData,
    } = props;

    // const exampleTransactions = [1, 2, 3];

    const swapsByUser = graphData?.swapsByUser?.swaps;
    const swapsByPool = graphData?.swapsByPool?.swaps;

    const TransactionsDisplay = isShowAllEnabled
        ? swapsByPool.map((swap, idx) => <Transaction key={idx} swap={swap} />)
        : swapsByUser.map((swap, idx) => <Transaction key={idx} swap={swap} />);

    const TransactionsHeader = (
        <thead>
            <tr>
                <th>Id</th>
                <th>Price</th>
                <th>From</th>
                <th>To</th>
                <th></th>
            </tr>
        </thead>
    );

    return (
        <div className={styles.transactions_table_display}>
            <table>
                {TransactionsHeader}

                <tbody>{TransactionsDisplay}</tbody>
            </table>
        </div>
    );
}
