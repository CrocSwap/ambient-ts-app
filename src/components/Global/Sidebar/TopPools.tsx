import { useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ExploreContext } from '../../../contexts';
import { FlexContainer } from '../../../styled/Common';
import {
    ItemHeaderContainer,
    ItemsContainer,
    ViewMoreFlex,
} from '../../../styled/Components/Sidebar';
import { useLinkGen } from '../../../utils/hooks/useLinkGen';
import PoolsListItem from './PoolsListItem';

export default function TopPools() {
    const {
        pools: { topPools },
    } = useContext(ExploreContext);

    const location = useLocation();
    const onExploreRoute = location.pathname.includes('explore');

    const linkGenExplore = useLinkGen('explore');

    const top5pools = useMemo(() => topPools.slice(0, 5), [topPools]);

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
                {top5pools.map((pool, idx) => (
                    <PoolsListItem pool={pool} key={idx} />
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
