import { useContext, useEffect, useState } from 'react';
import { PoolQueryFn } from '../../../ambient-utils/dataLayer';
import { AppStateContext } from '../../../contexts';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { FlexContainer } from '../../../styled/Common';
import {
    ItemHeaderContainer,
    ItemsContainer,
    ViewMoreFlex,
} from '../../../styled/Components/Sidebar';
import PoolsListItem from './PoolsListItem';

interface propsIF {
    cachedQuerySpotPrice: PoolQueryFn;
}

export default function FavoritePools(props: propsIF) {
    const { cachedQuerySpotPrice } = props;

    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const { crocEnv } = useContext(CrocEnvContext);
    const {
        activeNetwork: { chainId, poolIndex: poolId },
    } = useContext(AppStateContext);
    const { favePools } = useContext(UserPreferenceContext);

    const isAlreadyFavorited = favePools.check(
        baseToken.address,
        quoteToken.address,
        chainId,
        poolId,
    );

    const [spotPrices, setSpotPrices] = useState<(number | undefined)[]>([]);

    const poolPriceCacheTime = Math.floor(Date.now() / 15000); // 15 second cache

    useEffect(() => {
        if (!crocEnv) return;

        const fetchSpotPrices = async () => {
            if (!crocEnv || (await crocEnv.context).chain.chainId !== chainId)
                return;
            const spotPricePromises = favePools.pools
                .filter((pool) => pool.chainId === chainId)
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
    }, [favePools.pools, crocEnv, chainId, poolPriceCacheTime]);

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
                {favePools.pools
                    .filter((pool) => pool.chainId === chainId)
                    .map((pool, idx) => (
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
