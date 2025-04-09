import { useContext, useEffect, useState } from 'react';
import { expandPoolStats } from '../../../ambient-utils/dataLayer';
import { PoolIF } from '../../../ambient-utils/types';
import {
    AppStateContext,
    CachedDataContext,
    CrocEnvContext,
    ExploreContext,
    TokenContext,
} from '../../../contexts';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { FlexContainer } from '../../../styled/Common';
import {
    ItemHeaderContainer,
    ItemsContainer,
    ViewMoreFlex,
} from '../../../styled/Components/Sidebar';
import PoolsListItem from './PoolsListItem';

export default function FavoritePools() {
    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const {
        pools: { all: explorePools },
    } = useContext(ExploreContext);

    const { crocEnv } = useContext(CrocEnvContext);

    const {
        activeNetwork: { chainId, poolIndex: poolId },
    } = useContext(AppStateContext);
    const { favePools } = useContext(UserPreferenceContext);

    const { tokens } = useContext(TokenContext);

    const { cachedFetchTokenPrice, cachedTokenDetails, cachedQuerySpotPrice } =
        useContext(CachedDataContext);

    const isAlreadyFavorited = favePools.check(
        baseToken.address,
        quoteToken.address,
        chainId,
        poolId,
    );

    const [expandedPoolData, setExpandedPoolData] = useState<PoolIF[]>([]);

    useEffect(() => {
        if (!favePools.pools || !crocEnv) return;

        const expandedPoolDataOnCurrentChain = favePools.pools
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
    }, [favePools.pools, crocEnv === undefined, explorePools]);

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
                {expandedPoolData
                    .filter((pool) => pool.chainId === chainId)
                    .map((pool, idx) => (
                        <PoolsListItem pool={pool} key={idx} />
                    ))}
            </ItemsContainer>
        </FlexContainer>
    );
}
