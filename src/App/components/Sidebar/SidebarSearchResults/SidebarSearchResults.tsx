import PoolsSearchResults from './PoolsSearchResults/PoolsSearchResults';
import PositionsSearchResults from './PositionsSearchResults';
import OrdersSearchResults from './OrdersSearchResults';
import TxSearchResults from './TxSearchResults/TxSearchResults';
import { PoolStatsFn } from '../../../functions/getPoolStats';
import { sidebarSearchIF } from '../../../hooks/useSidebarSearch';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { TokenPriceFn } from '../../../functions/fetchTokenPrice';
import { SearchResultsContainer } from '../../../../styled/Components/Sidebar';
import { Text } from '../../../../styled/Common';

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
        <SearchResultsContainer
            flexDirection='column'
            fullHeight
            fullWidth
            margin='8px 8px 0 8px'
            padding='8px'
            background='dark2'
            gap={8}
        >
            <Text fontSize='header2' color='accent5'>
                Search Results
            </Text>
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
        </SearchResultsContainer>
    );
}
