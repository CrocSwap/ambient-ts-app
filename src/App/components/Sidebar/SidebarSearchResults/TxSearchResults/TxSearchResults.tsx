import ResultSkeleton from '../ResultSkeleton/ResultSkeleton';
import styles from '../SidebarSearchResults.module.css';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import TxLI from './TxLI'

interface propsIF {
    loading: boolean;
    searchInput: React.ReactNode;
    txsByUser: TransactionIF[];
}

export default function TxSearchResults(props: propsIF) {
    const { txsByUser } = props;

    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Price</div>
            <div>Change</div>
        </div>
    );

    const exampleContent = (
        <div className={styles.main_result_container}>
            {
                txsByUser.map((tx: TransactionIF) => (
                    <TxLI
                        key={`tx-sidebar-search-result-${JSON.stringify(tx)}`}
                        tx={tx}
                    />
                ))
            }
        </div>
    );
    return (
        <div>
            <div className={styles.card_title}>My Recent Transactions</div>
            {header}
            {props.loading ? <ResultSkeleton /> : exampleContent}
        </div>
    );
}
