import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { memo, useContext } from 'react';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TokenPriceFn } from '../../../../App/functions/fetchTokenPrice';
import { PoolIF } from '../../../../utils/interfaces/exports';
import PoolListItem from '../PoolListItem/PoolListItem';
import SidebarPoolsListContainer from '../../../../styled/Sidebar/SidebarPoolsListContainer';
import SidebarPoolsListHeader from '../../../../styled/Sidebar/SidebarPoolsListHeader';
import SidebarPoolsListItemsContainer from '../../../../styled/Sidebar/SidebarPoolsListItemsContainer';
import SidebarPoolsListHeaderContainer from '../../../../styled/Sidebar/SidebarPoolsListHeaderContainer';

interface propsIF {
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

function RecentPools(props: propsIF) {
    const { cachedPoolStatsFetch, cachedFetchTokenPrice } = props;

    const { recentPools } = useContext(SidebarContext);

    return (
        <SidebarPoolsListContainer>
            <SidebarPoolsListHeaderContainer>
                <SidebarPoolsListHeader>Pool</SidebarPoolsListHeader>
                <SidebarPoolsListHeader>Volume</SidebarPoolsListHeader>
                <SidebarPoolsListHeader>TVL</SidebarPoolsListHeader>
            </SidebarPoolsListHeaderContainer>
            <SidebarPoolsListItemsContainer>
                {recentPools.get(5).map((pool: PoolIF) => (
                    <PoolListItem
                        pool={pool}
                        key={'recent_pool_' + JSON.stringify(pool)}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        cachedFetchTokenPrice={cachedFetchTokenPrice}
                    />
                ))}
            </SidebarPoolsListItemsContainer>
        </SidebarPoolsListContainer>
    );
}

export default memo(RecentPools);
