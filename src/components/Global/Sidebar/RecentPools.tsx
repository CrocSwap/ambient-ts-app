import { PoolQueryFn } from '../../../ambient-utils/dataLayer';
import { memo, useContext, useEffect, useState } from 'react';
import { SidebarContext } from '../../../contexts/SidebarContext';
import PoolsListItem from './PoolsListItem';
import {
    ItemHeaderContainer,
    ItemsContainer,
} from '../../../styled/Components/Sidebar';
import { FlexContainer } from '../../../styled/Common';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

interface propsIF {
    cachedQuerySpotPrice: PoolQueryFn;
}

function RecentPools(props: propsIF) {
    const { cachedQuerySpotPrice } = props;

    const { recentPools } = useContext(SidebarContext);
    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const poolPriceCacheTime = Math.floor(Date.now() / 15000); // 15 second cache

    const [spotPrices, setSpotPrices] = useState<(number | undefined)[]>([]);
    useEffect(() => {
        if (!crocEnv) return;

        const fetchSpotPrices = async () => {
            const spotPricePromises = recentPools.get(5).map((pool) =>
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
    }, [recentPools, crocEnv, chainId, poolPriceCacheTime]);

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
                {recentPools.get(5).map((pool, idx) => (
                    <PoolsListItem
                        pool={pool}
                        key={idx}
                        spotPrice={spotPrices[idx]} // Pass the corresponding spot price
                    />
                ))}
            </ItemsContainer>
        </FlexContainer>
    );
}

export default memo(RecentPools);
