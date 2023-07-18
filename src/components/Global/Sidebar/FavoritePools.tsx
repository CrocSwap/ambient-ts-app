import { PoolStatsFn } from '../../../App/functions/getPoolStats';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { useContext } from 'react';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { TokenPriceFn } from '../../../App/functions/fetchTokenPrice';
import {
    SidebarPoolsListContainer,
    SidebarPoolsListHeader,
    SidebarPoolsListHeaderContainer,
    SidebarPoolsListItemsContainer,
    SidebarPoolsListViewMoreContainer,
} from '../../../styled/Sidebar';
import PoolsListItem from './PoolsListItem';

interface propsIF {
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function FavoritePools(props: propsIF) {
    const { cachedPoolStatsFetch } = props;

    const { tradeData } = useAppSelector((state) => state);
    const {
        chainData: { chainId, poolIndex: poolId },
    } = useContext(CrocEnvContext);
    const { favePools } = useContext(UserPreferenceContext);

    const isAlreadyFavorited = favePools.check(
        tradeData.baseToken.address,
        tradeData.quoteToken.address,
        chainId,
        poolId,
    );

    return (
        <SidebarPoolsListContainer>
            <SidebarPoolsListHeaderContainer>
                <SidebarPoolsListHeader>Pool</SidebarPoolsListHeader>
                <SidebarPoolsListHeader>Volume</SidebarPoolsListHeader>
                <SidebarPoolsListHeader>TVL</SidebarPoolsListHeader>
            </SidebarPoolsListHeaderContainer>
            {isAlreadyFavorited || (
                <SidebarPoolsListViewMoreContainer
                    onClick={() =>
                        favePools.add(
                            tradeData.baseToken,
                            tradeData.quoteToken,
                            chainId,
                            poolId,
                        )
                    }
                >
                    Add Current Pool
                </SidebarPoolsListViewMoreContainer>
            )}
            <SidebarPoolsListItemsContainer>
                {favePools.pools.map((pool, idx) => (
                    <PoolsListItem
                        key={idx}
                        pool={pool}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        cachedFetchTokenPrice={props.cachedFetchTokenPrice}
                    />
                ))}
            </SidebarPoolsListItemsContainer>
        </SidebarPoolsListContainer>
    );
}
