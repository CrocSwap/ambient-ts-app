import { PoolStatsFn } from '../../../App/functions/getPoolStats';
import { useContext } from 'react';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { TokenPriceFn } from '../../../App/functions/fetchTokenPrice';
import PoolsListItem from './PoolsListItem';
import { FlexContainer } from '../../../styled/Common';
import {
    HeaderGrid,
    ItemsContainer,
    ViewMoreFlex,
} from '../../../styled/Components/Sidebar';
import { TradeDataContext } from '../../../contexts/TradeDataContext';

interface propsIF {
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function FavoritePools(props: propsIF) {
    const { cachedPoolStatsFetch } = props;

    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const {
        chainData: { chainId, poolIndex: poolId },
    } = useContext(CrocEnvContext);
    const { favePools } = useContext(UserPreferenceContext);

    const isAlreadyFavorited = favePools.check(
        baseToken.address,
        quoteToken.address,
        chainId,
        poolId,
    );

    return (
        <FlexContainer flexDirection='column' fontSize='body' fullHeight>
            <HeaderGrid numCols={3} color='text2' padding='4px 0'>
                {['Pool', 'Volume', 'TVL'].map((item) => (
                    <FlexContainer key={item} justifyContent='center'>
                        {item}
                    </FlexContainer>
                ))}
            </HeaderGrid>
            {isAlreadyFavorited || (
                <ViewMoreFlex
                    justifyContent='center'
                    color='accent4'
                    onClick={() =>
                        favePools.add(baseToken, quoteToken, chainId, poolId)
                    }
                >
                    Add Current Pool
                </ViewMoreFlex>
            )}
            <ItemsContainer>
                {favePools.pools.map((pool, idx) => (
                    <PoolsListItem
                        key={idx}
                        pool={pool}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        cachedFetchTokenPrice={props.cachedFetchTokenPrice}
                    />
                ))}
            </ItemsContainer>
        </FlexContainer>
    );
}
