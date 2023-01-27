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

    return (
        <div>
            <div className={styles.card_title}>My Recent Transactions</div>
            <div className={styles.header}>
                <div>Pool</div>
                <div>Type</div>
                <div>Value</div>
            </div>
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
}
