import { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PoolQueryFn } from '../../../ambient-utils/dataLayer';
import { AppStateContext, ExploreContext } from '../../../contexts';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { FlexContainer } from '../../../styled/Common';
import {
    ItemHeaderContainer,
    ItemsContainer,
    ViewMoreFlex,
} from '../../../styled/Components/Sidebar';
import { useLinkGen } from '../../../utils/hooks/useLinkGen';
import PoolsListItem from './PoolsListItem';

interface propsIF {
    cachedQuerySpotPrice: PoolQueryFn;
}

export default function TopPools(props: propsIF) {
    const { cachedQuerySpotPrice } = props;

    const { crocEnv } = useContext(CrocEnvContext);
    const {
        pools: { topPools },
    } = useContext(ExploreContext);

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const location = useLocation();
    const onExploreRoute = location.pathname.includes('explore');

    const linkGenExplore = useLinkGen('explore');

    const poolPriceCacheTime = Math.floor(Date.now() / 15000); // 15 second cache

    const [spotPrices, setSpotPrices] = useState<(number | undefined)[]>([]);

    const top5pools = useMemo(
        () => topPools.slice(0, 5),

        [topPools],
    );

    useEffect(() => {
        if (!crocEnv) return;

        const fetchSpotPrices = async () => {
            if (!crocEnv || (await crocEnv.context).chain.chainId !== chainId)
                return;
            const spotPricePromises = top5pools.map((pool) =>
                cachedQuerySpotPrice(
                    crocEnv,
                    pool.base.address,
                    pool.quote.address,
                    chainId,
                    poolPriceCacheTime,
                ).catch((error) => {
                    console.error(
                        `Failed to fetch spot price for pool ${pool.base.address}-${pool.quote.address}:`,
                        error,
                    );
                    return undefined; // Handle the case where fetching spot price fails
                }),
            );

            const results = await Promise.all(spotPricePromises);
            results && setSpotPrices(results);
        };

        fetchSpotPrices();
    }, [crocEnv, chainId, poolPriceCacheTime, top5pools]);

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
                    <PoolsListItem
                        pool={pool}
                        key={idx}
                        spotPrice={spotPrices[idx]} // Pass the corresponding spot price
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
