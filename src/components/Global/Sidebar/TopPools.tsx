import { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PoolQueryFn } from '../../../ambient-utils/dataLayer';
import { AppStateContext, ExploreContext } from '../../../contexts';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PoolDataIF } from '../../../contexts/ExploreContext';
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

    const { topPools: hardcodedTopPools, crocEnv } = useContext(CrocEnvContext);
    const {
        pools: { all: allPoolData },
    } = useContext(ExploreContext);

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const location = useLocation();
    const onExploreRoute = location.pathname.includes('explore');

    const linkGenExplore = useLinkGen('explore');

    const poolPriceCacheTime = Math.floor(Date.now() / 15000); // 15 second cache

    const [spotPrices, setSpotPrices] = useState<(number | undefined)[]>([]);

    const sortAndFilter = (
        poolData: PoolDataIF[],
        filter: 'volume' | 'tvl',
        threshold: number,
    ): PoolDataIF[] =>
        poolData
            .filter((pool) => {
                if (filter === 'tvl') return pool.tvl > threshold;
                return pool.volume > threshold;
            })
            .sort(
                (poolA: PoolDataIF, poolB: PoolDataIF) =>
                    poolB[filter] - poolA[filter],
            );

    const poolData = useMemo(
        () =>
            (!allPoolData.length
                ? hardcodedTopPools
                : sortAndFilter(allPoolData, 'volume', 1000).length >= 3
                  ? sortAndFilter(allPoolData, 'volume', 1000).slice(
                        0,
                        Math.max(
                            hardcodedTopPools.length,
                            sortAndFilter(allPoolData, 'volume', 1000).length,
                        ),
                    )
                  : sortAndFilter(allPoolData, 'volume', 100).length >= 3
                    ? sortAndFilter(allPoolData, 'volume', 100).slice(
                          0,
                          Math.max(
                              hardcodedTopPools.length,
                              sortAndFilter(allPoolData, 'volume', 100).length,
                          ),
                      )
                    : sortAndFilter(allPoolData, 'volume', 0).slice(0, 1)
            ).slice(0, 5),

        [hardcodedTopPools, allPoolData],
    );

    useEffect(() => {
        if (!crocEnv) return;

        const fetchSpotPrices = async () => {
            if (!crocEnv || (await crocEnv.context).chain.chainId !== chainId)
                return;
            const spotPricePromises = poolData.map((pool) =>
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
    }, [crocEnv, chainId, poolPriceCacheTime]);

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
                {poolData.map((pool, idx) => (
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
