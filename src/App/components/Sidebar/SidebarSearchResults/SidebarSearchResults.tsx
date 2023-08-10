import styles from './SidebarSearchResults.module.css';
import PoolsSearchResults from './PoolsSearchResults/PoolsSearchResults';
import PositionsSearchResults from './PositionsSearchResults';
import OrdersSearchResults from './OrdersSearchResults';
import TxSearchResults from './TxSearchResults/TxSearchResults';
import { PoolStatsFn } from '../../../functions/getPoolStats';
import { sidebarSearchIF } from '../../../hooks/useSidebarSearch';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { TokenPriceFn } from '../../../functions/fetchTokenPrice';

interface propsIF {
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
    searchData: sidebarSearchIF;
}

export default function SidebarSearchResults(props: propsIF) {
    const { searchData, cachedPoolStatsFetch, cachedFetchTokenPrice } = props;
    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );

    return (
        <div className={styles.container}>
            <div className={styles.search_result_title}>Search Results</div>
            <PoolsSearchResults
                searchedPools={searchData.pools}
                cachedPoolStatsFetch={cachedPoolStatsFetch}
                cachedFetchTokenPrice={cachedFetchTokenPrice}
            />
            {isUserConnected && (
                <>
                    <TxSearchResults searchedTxs={searchData.txs} />
                    <OrdersSearchResults
                        searchedLimitOrders={searchData.limits}
                    />
                    <PositionsSearchResults
                        searchedPositions={searchData.positions}
                    />
                </>
            )}
        </div>
    );
}
