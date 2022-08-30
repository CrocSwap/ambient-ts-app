import { ReactNode } from 'react';
import styles from './SidebarSearchResults.module.css';
import PoolsSearchResults from './PoolsSearchResults/PoolsSearchResults';
import PositionsSearchResults from './PositionsSearchResults/PositionsSearchResults';
import OrdersSearchResults from './OrdersSearchResults/OrdersSearchResults';
import TransactionsSearchResults from './TransactionsResults/TransactionsResults';

interface SidebarSearchResultsPropsIF {
    searchInput: ReactNode;
    exampleLoading: boolean;
}

export default function SidebarSearchResults(props: SidebarSearchResultsPropsIF) {
    const { exampleLoading, searchInput } = props;

    // we are not going to use this following loading functionality. It is just for demonstration purposes

    return (
        <div className={styles.container}>
            <div className={styles.search_result_title}>Search Results</div>

            <PoolsSearchResults loading={exampleLoading} searchInput={searchInput} />
            <PositionsSearchResults loading={exampleLoading} searchInput={searchInput} />
            <OrdersSearchResults loading={exampleLoading} searchInput={searchInput} />
            <TransactionsSearchResults loading={exampleLoading} searchInput={searchInput} />
        </div>
    );
}
