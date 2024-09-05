import PoolCard from '../../Global/PoolCard/PoolCard';
import { useContext, useEffect, useState } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { Link } from 'react-router-dom';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import {
    HomeContent,
    HomeTitle,
    TopPoolContainer,
    TopPoolViewMore,
} from '../../../styled/Components/Home';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { CachedDataContext } from '../../../contexts/CachedDataContext';

interface TopPoolsPropsIF {
    noTitle?: boolean;
    gap?: string;
}

// eslint-disable-next-line
export default function TopPools(props: TopPoolsPropsIF) {
    const { isActiveNetworkPlume } = useContext(ChainDataContext);
    const { cachedQuerySpotPrice } = useContext(CachedDataContext);
    const {
        topPools,
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    const show4TopPools = useMediaQuery('(max-width: 1500px)');
    const show3TopPools = useMediaQuery('(min-height: 700px)');
    const poolData = showMobileVersion
        ? show3TopPools
            ? topPools.slice(0, 3)
            : topPools.slice(0, 2)
        : show4TopPools
          ? topPools.slice(0, 4)
          : topPools;

    const poolPriceCacheTime = Math.floor(Date.now() / 15000); // 15 second cache

    const [spotPrices, setSpotPrices] = useState<(number | undefined)[]>([]);

    useEffect(() => {
        if (!crocEnv) return;

        const fetchSpotPrices = async () => {
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
    }, [crocEnv === undefined, chainId, poolPriceCacheTime]);

    return (
        <TopPoolContainer flexDirection='column' gap={16}>
            <HomeTitle tabIndex={0} aria-label='Top Pools'>
                Top Pools
            </HomeTitle>
            <HomeContent>
                {poolData.map((pool, idx) => (
                    <PoolCard
                        key={idx}
                        pool={pool}
                        spotPrice={spotPrices[idx]}
                    /> // Pass the corresponding spot price
                ))}
            </HomeContent>
            {!isActiveNetworkPlume && (
                <HomeContent
                    justifyContent='center'
                    alignItems='center'
                    gap={16}
                    as={TopPoolViewMore}
                >
                    <Link to='/explore'>View More</Link>
                </HomeContent>
            )}
        </TopPoolContainer>
    );
}
