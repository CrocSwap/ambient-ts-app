import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppStateContext } from '../../../contexts';
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

interface TopPoolsPropsIF {
    noTitle?: boolean;
    gap?: string;
}

// eslint-disable-next-line
export default function TopPoolsHome(props: TopPoolsPropsIF) {
    const { cachedQuerySpotPrice } = useContext(CachedDataContext);
    const { topPools, crocEnv } = useContext(CrocEnvContext);

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    const show4TopPools = useMediaQuery('(max-width: 1500px)');
    const show3TopPools = useMediaQuery('(min-height: 700px)');

    const poolData = useMemo(
        () =>
            showMobileVersion
                ? show3TopPools
                    ? topPools.slice(0, 3)
                    : topPools.slice(0, 2)
                : show4TopPools
                  ? topPools.slice(0, 4)
                  : topPools,
        [showMobileVersion, show3TopPools, show4TopPools, topPools],
    );

    const poolPriceCacheTime = Math.floor(Date.now() / 5000); // 5 second cache

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

    const fetchSpotPrices = async () => {
        if (!crocEnv || (await crocEnv.context).chain.chainId !== chainId)
            return;
        const spotPricePromises = poolData.map((pool) =>
            cachedQuerySpotPrice(
                crocEnv,
                pool.base.address,
                pool.quote.address,
                pool.chainId,
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
        results &&
            setIntermediarySpotPrices({
                prices: results,
                chainId: poolData[0].chainId,
            });
    };

    useEffect(() => {
        fetchSpotPrices();
    }, [poolPriceCacheTime, poolData]);

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
