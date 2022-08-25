import { ReactNode, useState, useEffect } from 'react';
import styles from './SidebarSearchResults.module.css';
import TransactionsSkeletons from '../../../../components/Trade/TradeTabs/Transactions/TransactionsSkeletons/TransactionsSkeletons';
import PoolsSearchResults from './PoolsSearchResults/PoolsSearchResults';
import PositionsSearchResults from './PositionsSearchResults/PositionsSearchResults';
import OrdersSearchResults from './OrdersSearchResults/OrdersSearchResults';
import TransactionsSearchResults from './TransactionsResults/TransactionsResults';

interface SidebarSearchResultsPropsIF {
    searchInput: ReactNode;
    exampleLoading: boolean;
}

export default function SidebarSearchResults(props: SidebarSearchResultsPropsIF) {
    const { searchInput, exampleLoading } = props;

    // we are not going to use this following loading functionality. It is just for demonstration purposes

    return (
        <div className={styles.container}>
            <div className={styles.search_result_title}>Search Results</div>
            <PoolsSearchResults loading={exampleLoading} />
            <PositionsSearchResults loading={exampleLoading} />
            <OrdersSearchResults loading={exampleLoading} />
            <TransactionsSearchResults loading={exampleLoading} />
        </div>
    );
}
