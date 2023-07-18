import { PoolStatsFn } from '../../../App/functions/getPoolStats';
import { memo, useContext } from 'react';
import { SidebarContext } from '../../../contexts/SidebarContext';
import { TokenPriceFn } from '../../../App/functions/fetchTokenPrice';
import { PoolIF } from '../../../utils/interfaces/exports';
import PoolsListItem from './PoolsListItem';
import {
    SidebarPoolsListContainer,
    SidebarPoolsListHeader,
    SidebarPoolsListHeaderContainer,
    SidebarPoolsListItemsContainer,
} from '../../../styled/Sidebar';

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
                    <PoolsListItem
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
