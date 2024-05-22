import { PoolStatsFn } from '../../../ambient-utils/dataLayer';
import { useContext } from 'react';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { TokenPriceFn } from '../../../ambient-utils/api';
import PoolsListItem from './PoolsListItem';
import { FlexContainer } from '../../../styled/Common';
import {
    ItemHeaderContainer,
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
        <FlexContainer
            flexDirection='column'
            fontSize='body'
            fullHeight
            gap={8}
        >
            <ItemHeaderContainer color='text2'>
                {['Pair', 'Price', 'Volume', 'TVL', '24h Price', ''].map(
                    (item) => (
                        <FlexContainer key={item}>{item}</FlexContainer>
                    ),
                )}
            </ItemHeaderContainer>
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
                {favePools.pools
                    .filter((pool) => pool.chainId === chainId)
                    .map((pool, idx) => (
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
