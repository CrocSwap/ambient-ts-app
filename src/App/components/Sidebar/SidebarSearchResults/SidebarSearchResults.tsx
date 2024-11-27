import { useContext } from 'react';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { Text } from '../../../../styled/Common';
import { SearchResultsContainer } from '../../../../styled/Components/Sidebar';
import { sidebarSearchIF } from '../../../hooks/useSidebarSearch';
import OrdersSearchResults from './OrdersSearchResults';
import PoolsSearchResults from './PoolsSearchResults/PoolsSearchResults';
import PositionsSearchResults from './PositionsSearchResults';
import TxSearchResults from './TxSearchResults/TxSearchResults';
import WalletSearchResults from './WalletSearchResults';

interface propsIF {
    searchData: sidebarSearchIF;
}

export default function SidebarSearchResults(props: propsIF) {
    const { searchData } = props;
    const { isUserConnected } = useContext(UserDataContext);

    return (
        <SearchResultsContainer
            flexDirection='column'
            fullHeight
            fullWidth
            gap={8}
        >
            <Text fontSize='header2' color='accent5'>
                Search Results
            </Text>
            {searchData.contentGroup === 'token' && (
                <>
                    <PoolsSearchResults searchedPools={searchData.pools} />
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
                </>
            )}
            {searchData.contentGroup === 'wallet' && (
                <WalletSearchResults searchData={searchData} />
            )}
        </SearchResultsContainer>
    );
}
