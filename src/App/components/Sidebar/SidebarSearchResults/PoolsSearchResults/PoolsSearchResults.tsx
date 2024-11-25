import { useContext, useEffect, useState } from 'react';
import { PoolIF } from '../../../../../ambient-utils/types';
import { AppStateContext } from '../../../../../contexts';
import { CachedDataContext } from '../../../../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
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
    const { cachedQuerySpotPrice } = useContext(CachedDataContext);
    const { crocEnv } = useContext(CrocEnvContext);
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const poolPriceCacheTime = Math.floor(Date.now() / 60000); // 60 second cache

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

    const [spotPrices, setSpotPrices] = useState<(number | undefined)[]>([]);

    useEffect(() => {
        if (!crocEnv) return;

        const fetchSpotPrices = async () => {
            if ((await crocEnv.context).chain.chainId !== chainId) return;
            const spotPricePromises = searchedPools
                .filter((pool: PoolIF) => !checkPoolForWETH(pool))
                // max five elements before content overflows container
                .slice(0, 5)
                .map((pool) =>
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
            setSpotPrices(results);
        };

        fetchSpotPrices();
    }, [searchedPools, crocEnv, chainId, poolPriceCacheTime]);

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
            {searchedPools.length ? (
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
                        {searchedPools
                            .filter((pool: PoolIF) => !checkPoolForWETH(pool))
                            // max five elements before content overflows container
                            .slice(0, 5)
                            .map((pool, idx) => (
                                <PoolSearchResult
                                    pool={pool}
                                    key={idx}
                                    handleClick={handleClick}
                                    spotPrice={spotPrices[idx]} // Pass the corresponding spot price
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
