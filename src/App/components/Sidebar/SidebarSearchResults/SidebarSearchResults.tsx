import { ReactNode } from 'react';
import { TokenIF, TokenPairIF, TempPoolIF } from '../../../../utils/interfaces/exports';
import styles from './SidebarSearchResults.module.css';
import PoolsSearchResults from './PoolsSearchResults/PoolsSearchResults';
import PositionsSearchResults from './PositionsSearchResults/PositionsSearchResults';
import OrdersSearchResults from './OrdersSearchResults/OrdersSearchResults';
import TransactionsSearchResults from './TransactionsResults/TransactionsResults';
import { PoolStatsFn } from '../../../functions/getPoolStats';

interface SidebarSearchResultsPropsIF {
    searchedPools: TempPoolIF[];
    searchInput: ReactNode;
    exampleLoading: boolean;
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    tokenPair: TokenPairIF;
    chainId: string;
    isConnected: boolean;
    cachedPoolStatsFetch: PoolStatsFn;
}

export default function SidebarSearchResults(props: SidebarSearchResultsPropsIF) {
    const {
        searchedPools,
        exampleLoading,
        searchInput,
        getTokenByAddress,
        tokenPair,
        chainId,
        isConnected,
        cachedPoolStatsFetch
    } = props;

    // we are not going to use this following loading functionality. It is just for demonstration purposes

    return (
        <div className={styles.container}>
            <div className={styles.search_result_title}>Search Results</div>
            <PoolsSearchResults
                searchedPools={searchedPools}
                loading={exampleLoading}
                getTokenByAddress={getTokenByAddress}
                tokenPair={tokenPair}
                chainId={chainId}
                cachedPoolStatsFetch={cachedPoolStatsFetch}
            />
            {
            isConnected && (<><PositionsSearchResults loading={exampleLoading} searchInput={searchInput} />
            <OrdersSearchResults loading={exampleLoading} searchInput={searchInput} />
            <TransactionsSearchResults loading={exampleLoading} searchInput={searchInput} /></>
            )}
        </div>
    );
}
