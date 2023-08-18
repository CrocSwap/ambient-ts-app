import { PoolStatsFn } from '../../../App/functions/getPoolStats';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { TokenPriceFn } from '../../../App/functions/fetchTokenPrice';
import PoolsListItem from './PoolsListItem';
import { useLinkGen } from '../../../utils/hooks/useLinkGen';
import { useLocation } from 'react-router-dom';
import {
    SidebarPoolsListContainer,
    SidebarPoolsListHeader,
    SidebarPoolsListHeaderContainer,
    SidebarPoolsListItemsContainer,
    SidebarPoolsListViewMoreContainer,
} from '../../../styled/Sidebar';

interface propsIF {
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function TopPools(props: propsIF) {
    const { cachedPoolStatsFetch, cachedFetchTokenPrice } = props;

    const { topPools } = useContext(CrocEnvContext);
    const location = useLocation();
    const onExploreRoute = location.pathname.includes('explore');

    const linkGenExplore = useLinkGen('explore');

    return (
        <SidebarPoolsListContainer fontSize={'body'}>
            <SidebarPoolsListHeaderContainer>
                <SidebarPoolsListHeader>Pool</SidebarPoolsListHeader>
                <SidebarPoolsListHeader>Volume</SidebarPoolsListHeader>
                <SidebarPoolsListHeader>TVL</SidebarPoolsListHeader>
            </SidebarPoolsListHeaderContainer>
            <SidebarPoolsListItemsContainer>
                {topPools.map((pool, idx) => (
                    <PoolsListItem
                        pool={pool}
                        key={idx}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        cachedFetchTokenPrice={cachedFetchTokenPrice}
                    />
                ))}
                {onExploreRoute ? undefined : (
                    <SidebarPoolsListViewMoreContainer
                        onClick={() => linkGenExplore.navigate()}
                    >
                        View More
                    </SidebarPoolsListViewMoreContainer>
                )}
            </SidebarPoolsListItemsContainer>
        </SidebarPoolsListContainer>
    );
}
