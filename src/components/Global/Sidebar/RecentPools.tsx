import { PoolStatsFn } from '../../../App/functions/getPoolStats';
import { memo, useContext } from 'react';
import { SidebarContext } from '../../../contexts/SidebarContext';
import { TokenPriceFn } from '../../../App/functions/fetchTokenPrice';
import { PoolIF } from '../../../utils/interfaces/exports';
import PoolsListItem from './PoolsListItem';
import { HeaderGrid, ItemsContainer } from '../../../styled/Components/Sidebar';
import { FlexContainer } from '../../../styled/Common';

interface propsIF {
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

function RecentPools(props: propsIF) {
    const { cachedPoolStatsFetch, cachedFetchTokenPrice } = props;

    const { recentPools } = useContext(SidebarContext);

    return (
        <FlexContainer flexDirection='column' fontSize='body' fullHeight>
            <HeaderGrid numCols={3} color='text2' padding='4px 0'>
                {['Pool', 'Volume', 'TVL'].map((item) => (
                    <FlexContainer key={item} justifyContent='center'>
                        {item}
                    </FlexContainer>
                ))}
            </HeaderGrid>
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
