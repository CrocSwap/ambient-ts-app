import { memo, useContext, useEffect, useState } from 'react';
import { expandPoolStats } from '../../../ambient-utils/dataLayer';
import { PoolIF } from '../../../ambient-utils/types';
import {
    AppStateContext,
    CachedDataContext,
    CrocEnvContext,
    ExploreContext,
    TokenContext,
} from '../../../contexts';
import { SidebarContext } from '../../../contexts/SidebarContext';
import { FlexContainer } from '../../../styled/Common';
import {
    ItemHeaderContainer,
    ItemsContainer,
} from '../../../styled/Components/Sidebar';
import PoolsListItem from './PoolsListItem';

function RecentPools() {
    const { recentPools } = useContext(SidebarContext);

    const { tokens } = useContext(TokenContext);

    const { cachedFetchTokenPrice, cachedTokenDetails, cachedQuerySpotPrice } =
        useContext(CachedDataContext);
    const { crocEnv } = useContext(CrocEnvContext);

    const {
        pools: { all: explorePools },
    } = useContext(ExploreContext);
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const [expandedPoolData, setExpandedPoolData] = useState<PoolIF[]>([]);

    useEffect(() => {
        if (!recentPools.get(5) || !crocEnv) return;

        const expandedPoolDataOnCurrentChain = recentPools
            .get(5)
            .filter((pool) => {
                return pool.chainId === chainId;
            })
            .map((pool: PoolIF) => {
                const poolDataFromExplore = explorePools.find(
                    (explorePool) =>
                        explorePool.poolIdx === pool.poolIdx &&
                        explorePool.chainId === pool.chainId &&
                        explorePool.baseToken.address ===
                            pool.baseToken.address &&
                        explorePool.quoteToken.address ===
                            pool.quoteToken.address,
                );
                if (poolDataFromExplore) return poolDataFromExplore;
                return expandPoolStats(
                    pool,
                    crocEnv,
                    cachedFetchTokenPrice,
                    cachedTokenDetails,
                    cachedQuerySpotPrice,
                    tokens.tokenUniv,
                );
            });

        Promise.all(expandedPoolDataOnCurrentChain)
            .then((results: Array<PoolIF>) => {
                // setIsFetchError(false);
                if (results.length) {
                    setExpandedPoolData(results);
                }
            })
            .catch((err) => {
                // setIsFetchError(true);
                console.warn(err);
            });
    }, [
        JSON.stringify(recentPools.get(5)),
        crocEnv === undefined,
        JSON.stringify(explorePools),
    ]);

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
                {expandedPoolData.map((pool, idx) => (
                    <PoolsListItem pool={pool} key={idx} />
                ))}
            </ItemsContainer>
        </FlexContainer>
    );
}

export default memo(RecentPools);
