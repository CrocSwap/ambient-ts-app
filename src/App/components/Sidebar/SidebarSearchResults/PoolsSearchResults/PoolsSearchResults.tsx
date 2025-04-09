import { useContext, useEffect, useState } from 'react';
import { expandPoolStats } from '../../../../../ambient-utils/dataLayer';
import { PoolIF } from '../../../../../ambient-utils/types';
import {
    AppStateContext,
    CachedDataContext,
    CrocEnvContext,
    ExploreContext,
    TokenContext,
} from '../../../../../contexts';
import { TradeDataContext } from '../../../../../contexts/TradeDataContext';
import {
    FlexContainer,
    GridContainer,
    Text,
} from '../../../../../styled/Common';
import { ResultsContainer } from '../../../../../styled/Components/Sidebar';
import {
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../../utils/hooks/useLinkGen';
import checkPoolForWETH from '../../../../functions/checkPoolForWETH';
import PoolSearchResult from './PoolSearchResult';

interface propsIF {
    searchedPools: PoolIF[];
}

export default function PoolsSearchResults(props: propsIF) {
    const { searchedPools } = props;
    const { tokenA, tokenB } = useContext(TradeDataContext);
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const { tokens } = useContext(TokenContext);

    const {
        pools: { all: explorePools },
    } = useContext(ExploreContext);
    const { cachedFetchTokenPrice, cachedTokenDetails, cachedQuerySpotPrice } =
        useContext(CachedDataContext);
    const { crocEnv } = useContext(CrocEnvContext);

    const [expandedPoolData, setExpandedPoolData] = useState<PoolIF[]>([]);

    useEffect(() => {
        if (!searchedPools || !crocEnv) return;

        const expandedPoolDataOnCurrentChain = searchedPools

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
        JSON.stringify(searchedPools),
        crocEnv === undefined,
        JSON.stringify(explorePools),
    ]);

    // hook to generate navigation actions with pre-loaded path
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');

    // fn to handle user clicks on `<PoolLI />` instances
    const handleClick = (baseAddr: string, quoteAddr: string): void => {
        // reorganize base and quote tokens as tokenA and tokenB

        const [addrTokenA, addrTokenB] =
            tokenA.address.toLowerCase() === baseAddr.toLowerCase()
                ? [baseAddr, quoteAddr]
                : tokenA.address.toLowerCase() === quoteAddr.toLowerCase()
                  ? [quoteAddr, baseAddr]
                  : tokenB.address.toLowerCase() === baseAddr.toLowerCase()
                    ? [quoteAddr, baseAddr]
                    : [baseAddr, quoteAddr];

        // navigate user to the new appropriate URL path
        linkGenMarket.navigate({
            chain: chainId,
            tokenA: addrTokenA,
            tokenB: addrTokenB,
        });
    };

    return (
        <FlexContainer
            flexDirection='column'
            justifyContent='center'
            alignItems='flex-start'
            gap={8}
        >
            <Text fontWeight='500' fontSize='body' color='accent5'>
                Pools
            </Text>
            {expandedPoolData.length ? (
                <FlexContainer flexDirection='column' fullWidth>
                    <GridContainer
                        numCols={3}
                        fullWidth
                        fontWeight='300'
                        fontSize='body'
                        color='text2'
                        style={{ borderBottom: '1px solid var(--dark3)' }}
                        padding='0 0 4px 0'
                    >
                        {['Pool', '24h Vol.', 'TVL'].map((item, idx) => (
                            <Text
                                key={idx}
                                fontWeight='300'
                                fontSize='body'
                                color='text2'
                                align='center'
                            >
                                {item}
                            </Text>
                        ))}
                    </GridContainer>
                    <ResultsContainer flexDirection='column'>
                        {expandedPoolData
                            .filter((pool: PoolIF) => !checkPoolForWETH(pool))
                            // max five elements before content overflows container
                            .slice(0, 5)
                            .map((pool, idx) => (
                                <PoolSearchResult
                                    pool={pool}
                                    key={idx}
                                    handleClick={handleClick}
                                />
                            ))}
                    </ResultsContainer>
                </FlexContainer>
            ) : (
                <FlexContainer
                    margin='0 8px 96px 8px'
                    fontSize='body'
                    color='text2'
                >
                    No Pools Found
                </FlexContainer>
            )}
        </FlexContainer>
    );
}
