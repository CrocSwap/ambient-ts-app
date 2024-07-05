import { PoolStatsFn } from '../../../ambient-utils/dataLayer';
import { memo, useContext } from 'react';
import { SidebarContext } from '../../../contexts/SidebarContext';
import { TokenPriceFn } from '../../../ambient-utils/api';
import { PoolIF } from '../../../ambient-utils/types';
import PoolsListItem from './PoolsListItem';
import {
    ItemHeaderContainer,
    ItemsContainer,
} from '../../../styled/Components/Sidebar';
import { FlexContainer } from '../../../styled/Common';

interface propsIF {
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

function RecentPools(props: propsIF) {
    const { cachedPoolStatsFetch, cachedFetchTokenPrice } = props;

    const { recentPools } = useContext(SidebarContext);

    return (
        <FlexContainer
            flexDirection='column'
            fontSize='body'
            fullHeight
            gap={8}
        >
            <ItemHeaderContainer color='text2'>
                {['Pair', 'Price', 'Volume', 'TVL', ''].map((item) => (
                    <FlexContainer key={item}>{item}</FlexContainer>
                ))}
            </ItemHeaderContainer>

            <ItemsContainer>
                {recentPools.get(5).map((pool: PoolIF) => (
                    <PoolsListItem
                        pool={pool}
                        key={'recent_pool_' + JSON.stringify(pool)}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        cachedFetchTokenPrice={cachedFetchTokenPrice}
                    />
                ))}
            </ItemsContainer>
        </FlexContainer>
    );
}

export default memo(RecentPools);
