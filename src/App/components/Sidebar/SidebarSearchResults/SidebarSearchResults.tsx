import { ReactNode } from 'react';
import styles from './SidebarSearchResults.module.css';
import TransactionsSkeletons from '../../../../components/Trade/TradeTabs/Transactions/TransactionsSkeletons/TransactionsSkeletons';
import PoolsSearchResults from './PoolsSearchResults/PoolsSearchResults';

interface SidebarSearchResultsPropsIF {
    searchInput: ReactNode;
}

export default function SidebarSearchResults(props: SidebarSearchResultsPropsIF) {
    const { searchInput } = props;

    return (
        <div className={styles.container}>
            <div className={styles.search_input_container}>{`Searching for ${searchInput}...`}</div>
            {/* <TransactionsSkeletons />
            <TransactionsSkeletons /> */}
            <PoolsSearchResults />
        </div>
    );
}
