import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AppStateContext,
    ChainDataContext,
    ExploreContext,
} from '../../../contexts';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import {
    HomeContent,
    HomeTitle,
    TopPoolContainer,
    TopPoolViewMore,
} from '../../../styled/Components/Home';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import PoolCard from '../../Global/PoolCard/PoolCard';
import TopPoolSkeleton from './TopPoolSkeleton/TopPoolSkeleton';

interface TopPoolsPropsIF {
    noTitle?: boolean;
    gap?: string;
}

// eslint-disable-next-line
export default function TopPoolsHome(props: TopPoolsPropsIF) {
    const { cachedQuerySpotPrice } = useContext(CachedDataContext);
    const { crocEnv, provider } = useContext(CrocEnvContext);
    const {
        pools: { topPools, visibleTopPoolData, setVisibleTopPoolData },
    } = useContext(ExploreContext);

    const { blockPollingUrl } = useContext(ChainDataContext);

    const {
        activeNetwork: { chainId, priorityPool },
    } = useContext(AppStateContext);

    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    const show4TopPools = useMediaQuery('(max-width: 1500px)');
    const show3TopPools = useMediaQuery('(min-height: 700px)');

    // State for fade animation
    const [isFading, setIsFading] = useState(false);

    const topPoolsWithPriority = useMemo(() => {
        if (!topPools.length) return [];
        if (!priorityPool) return topPools;
        const updatedPools = [...topPools];
        updatedPools.splice(2, 0, priorityPool);
        return updatedPools;
    }, [topPools, priorityPool]);

    const lengthOfTopPoolsDisplay = useMemo(
        () =>
            showMobileVersion ? (show3TopPools ? 3 : 2) : show4TopPools ? 4 : 5,
        [showMobileVersion, show3TopPools, show4TopPools],
    );

    const poolData = useMemo(
        () => topPoolsWithPriority.slice(0, lengthOfTopPoolsDisplay),

        [topPoolsWithPriority, showMobileVersion, show3TopPools, show4TopPools],
    );

    useEffect(() => {
        if (
            !topPoolsWithPriority.length ||
            chainId !== topPoolsWithPriority[0].chainId
        ) {
            setVisibleTopPoolData([]);
            return;
        }
        if (
            poolData.map((pool) => pool.name?.toLowerCase()).join('|') !==
            visibleTopPoolData.map((pool) => pool.name?.toLowerCase()).join('|')
        ) {
            // Trigger fade-out effect
            setIsFading(true);
            // After fade-out duration (1s), update pool data and fade back in
            setTimeout(() => {
                setVisibleTopPoolData(poolData);
                setIsFading(false);
            }, 1000); // Match the fade-out duration
        }
    }, [
        topPoolsWithPriority.map((pool) => pool.name?.toLowerCase()).join('|'),
        chainId,
    ]);

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
        if (
            !poolData.length ||
            !crocEnv ||
            (await crocEnv.context).chain.chainId !== chainId
        )
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

    const tempItems = Array.from(
        { length: lengthOfTopPoolsDisplay },
        (_, i) => i + 1,
    );
    const skeletonDisplay = tempItems.map((item, idx) => (
        <TopPoolSkeleton key={idx} />
    ));

    return (
        <TopPoolContainer flexDirection='column' gap={16}>
            <HomeTitle tabIndex={0} aria-label='Top Pools'>
                Top Pools
            </HomeTitle>
            <HomeContent minHeight='120px'>
                {isFading || !visibleTopPoolData.length
                    ? skeletonDisplay
                    : visibleTopPoolData.map((pool, idx) => (
                          <PoolCard
                              key={idx}
                              pool={pool}
                              spotPrice={spotPrices[idx]}
                          />
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
