import { PoolStatsFn } from '../../../ambient-utils/dataLayer';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { TokenPriceFn } from '../../../ambient-utils/api';
import PoolsListItem from './PoolsListItem';
import { useLinkGen } from '../../../utils/hooks/useLinkGen';
import { useLocation } from 'react-router-dom';
import { FlexContainer } from '../../../styled/Common';
import {
    ItemHeaderContainer,
    ItemsContainer,
    ViewMoreFlex,
} from '../../../styled/Components/Sidebar';

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
        <FlexContainer
            flexDirection='column'
            fontSize='body'
            fullHeight
            gap={8}
        >
            <ItemHeaderContainer color='text2'>
                {['Pair', 'Price', '24h Vol.', 'TVL', '24h Price Δ', ''].map(
                    (item) => (
                        <FlexContainer key={item}>{item}</FlexContainer>
                    ),
                )}
            </ItemHeaderContainer>
            <ItemsContainer>
                {topPools.map((pool, idx) => (
                    <PoolsListItem
                        pool={pool}
                        key={idx}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        cachedFetchTokenPrice={cachedFetchTokenPrice}
                    />
                ))}
                {onExploreRoute ? undefined : (
                    <ViewMoreFlex
                        justifyContent='center'
                        color='accent4'
                        onClick={() => linkGenExplore.navigate()}
                    >
                        View More
                    </ViewMoreFlex>
                )}
            </ItemsContainer>
        </FlexContainer>
    );
}
