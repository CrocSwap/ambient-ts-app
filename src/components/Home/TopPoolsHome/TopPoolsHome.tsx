import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AppStateContext,
    ChainDataContext,
    ExploreContext,
} from '../../../contexts';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PoolDataIF } from '../../../contexts/ExploreContext';
import {
    HomeContent,
    HomeTitle,
    TopPoolContainer,
    TopPoolViewMore,
} from '../../../styled/Components/Home';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import PoolCard from '../../Global/PoolCard/PoolCard';

interface TopPoolsPropsIF {
    noTitle?: boolean;
    gap?: string;
}

// eslint-disable-next-line
export default function TopPoolsHome(props: TopPoolsPropsIF) {
    const { cachedQuerySpotPrice } = useContext(CachedDataContext);
    const {
        topPools: hardcodedTopPools,
        crocEnv,
        provider,
    } = useContext(CrocEnvContext);
    const {
        pools: { all: allPoolData },
    } = useContext(ExploreContext);

    const { blockPollingUrl } = useContext(ChainDataContext);

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    const show4TopPools = useMediaQuery('(max-width: 1500px)');
    const show3TopPools = useMediaQuery('(min-height: 700px)');

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
            ).slice(
                0,
                showMobileVersion
                    ? show3TopPools
                        ? 3
                        : 2
                    : show4TopPools
                      ? 4
                      : 5,
            ),

        [
            hardcodedTopPools,
            showMobileVersion,
            show3TopPools,
            show4TopPools,
            allPoolData,
        ],
    );

    const poolPriceCacheTime = Math.floor(Date.now() / 10000); // 10 second cache
    const poolPriceUpdateInterval = Math.floor(Date.now() / 2000); // 2 second interval

    const [spotPrices, setSpotPrices] = useState<(number | undefined)[]>([]);
    const [intermediarySpotPrices, setIntermediarySpotPrices] = useState<{
        prices: (number | undefined)[];
        chainId: string;
    }>({
        prices: [],
        chainId: '',
    });

    useEffect(() => {
        // prevent setting spot prices if the chainId of the intermediary spot prices is different
        if (intermediarySpotPrices.chainId !== chainId) return;

        setSpotPrices(intermediarySpotPrices.prices);
    }, [intermediarySpotPrices]);

    const providerUrl = provider?._getConnection().url;

    const fetchSpotPrices = async () => {
        if (!crocEnv || (await crocEnv.context).chain.chainId !== chainId)
            return;
        const spotPricePromises = poolData.map((pool) =>
            cachedQuerySpotPrice(
                crocEnv,
                pool.base.address,
                pool.quote.address,
                pool.chainId,
                poolPriceCacheTime + providerUrl.length,
            ).catch((error) => {
                console.error(
                    `Failed to fetch spot price for pool ${pool.base.address}-${pool.quote.address}:`,
                    error,
                );
                return undefined; // Handle the case where fetching spot price fails
            }),
        );

        const results = await Promise.all(spotPricePromises);
        results &&
            setIntermediarySpotPrices({
                prices: results,
                chainId: poolData[0].chainId,
            });
    };

    useEffect(() => {
        if (providerUrl === blockPollingUrl) {
            fetchSpotPrices();
        }
    }, [poolData, poolPriceUpdateInterval, blockPollingUrl, providerUrl]);

    useEffect(() => {
        if (!crocEnv) return;

        setSpotPrices([]);

        fetchSpotPrices();
    }, [crocEnv]);

    return (
        <TopPoolContainer flexDirection='column' gap={16}>
            <HomeTitle tabIndex={0} aria-label='Top Pools'>
                Top Pools
            </HomeTitle>
            <HomeContent minHeight='120px'>
                {poolData.map((pool, idx) => (
                    <PoolCard
                        key={idx}
                        pool={pool}
                        spotPrice={spotPrices[idx]}
                    /> // Pass the corresponding spot price
                ))}
            </HomeContent>
            <HomeContent
                justifyContent='center'
                alignItems='center'
                gap={16}
                as={TopPoolViewMore}
            >
                <Link to='/explore'>View More</Link>
            </HomeContent>
        </TopPoolContainer>
    );
}
