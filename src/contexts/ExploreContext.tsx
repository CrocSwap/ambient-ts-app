import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { CachedDataContext } from './CachedDataContext';
import { ChainDataContext } from './ChainDataContext';
import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { PoolIF } from '../ambient-utils/types';
import {
    getMoneynessRank,
    getFormattedNumber,
} from '../ambient-utils/dataLayer';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { CrocEnvContext } from './CrocEnvContext';
import { CACHE_UPDATE_FREQ_IN_MS } from '../ambient-utils/constants';
import ambientTokenList from '../ambient-utils/constants/ambient-token-list.json';
import { PoolContext } from './PoolContext';

export interface ExploreContextIF {
    pools: {
        all: Array<PoolDataIF>;
        getLimited(poolList: PoolIF[], crocEnv: CrocEnv, chainId: string): void;
        getExtra: (
            poolList: PoolIF[],
            crocEnv: CrocEnv,
            chainId: string,
        ) => void;
        resetPoolData: () => void;
    };
}

export interface PoolDataIF extends PoolIF {
    spotPrice: number;
    displayPrice: string;
    poolIdx: number;
    tvl: number;
    tvlStr: string;
    volume: number;
    volumeStr: string;
    priceChange: number;
    priceChangeStr: string;
    moneyness: {
        base: number;
        quote: number;
    };
}

export const ExploreContext = createContext<ExploreContextIF>(
    {} as ExploreContextIF,
);

export const ExploreContextProvider = (props: { children: ReactNode }) => {
    const { lastBlockNumber, isActiveNetworkBlast } =
        useContext(ChainDataContext);

    const {
        cachedPoolStatsFetch,
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedGet24hChange,
    } = useContext(CachedDataContext);

    const { crocEnv, chainData, activeNetwork } = useContext(CrocEnvContext);

    const [limitedPools, setLimitedPools] = useState<Array<PoolDataIF>>([]);
    const [extraPools, setExtraPools] = useState<Array<PoolDataIF>>([]);

    const allPools = useMemo(
        () => limitedPools.concat(extraPools),
        [limitedPools, extraPools],
    );
    // metadata only
    const { poolList } = useContext(PoolContext);

    const getLimitedPools = async (): Promise<void> => {
        if (crocEnv && poolList.length) {
            getLimitedPoolData(poolList, crocEnv, chainData.chainId);
        }
    };

    const getAllPools = async (): Promise<void> => {
        // make sure crocEnv exists and pool metadata is present
        if (crocEnv && poolList.length) {
            // clear text in DOM for time since last update
            setLimitedPools([]);
            setExtraPools([]);
            // use metadata to get expanded pool data
            getLimitedPools().then(() => {
                getExtraPoolData(poolList, crocEnv, chainData.chainId);
            });
        }
    };

    // get expanded pool metadata
    useEffect(() => {
        // wait 5 seconds to get data
        setTimeout(() => {
            if (crocEnv !== undefined && poolList.length > 0) {
                getAllPools();
            }
        }, 5000);
    }, [crocEnv, poolList.length]);

    // fn to get data on a single pool
    async function getPoolData(
        pool: PoolIF,
        crocEnv: CrocEnv,
        chainId: string,
    ): Promise<PoolDataIF> {
        // moneyness of base token
        const baseMoneyness: number = getMoneynessRank(pool.base.symbol);
        // moneyness of quote token
        const quoteMoneyness: number = getMoneynessRank(pool.quote.symbol);
        // determination to invert based on relative moneyness
        const shouldInvert: boolean = quoteMoneyness - baseMoneyness >= 0;

        // pool index
        const poolIdx: number = lookupChain(chainId).poolIndex;

        const poolStatsNow = await cachedPoolStatsFetch(
            chainId,
            pool.base.address,
            pool.quote.address,
            poolIdx,
            Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
            crocEnv,
            activeNetwork.graphCacheUrl,
            cachedFetchTokenPrice,
        );
        const ydayTime = Math.floor(Date.now() / 1000 - 24 * 3600);

        const poolStats24hAgo = await cachedPoolStatsFetch(
            chainId,
            pool.base.address,
            pool.quote.address,
            poolIdx,
            Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
            crocEnv,
            activeNetwork.graphCacheUrl,
            cachedFetchTokenPrice,
            ydayTime,
        );

        const baseVolumeUsdNow = poolStatsNow?.baseVolumeUsd;
        const quoteVolumeUsdNow = poolStatsNow?.quoteVolumeUsd;

        const baseVolumeUsd24hAgo = poolStats24hAgo?.baseVolumeUsd;
        const quoteVolumeUsd24hAgo = poolStats24hAgo?.quoteVolumeUsd;

        const volumeChange24h =
            baseVolumeUsdNow +
            quoteVolumeUsdNow -
            (baseVolumeUsd24hAgo + quoteVolumeUsd24hAgo);

        if (
            !poolStatsNow ||
            (!isActiveNetworkBlast && poolStatsNow.tvlTotalUsd < 100)
        ) {
            // return early
            const poolData: PoolDataIF = {
                ...pool,
                spotPrice: 0,
                displayPrice: '0',
                poolIdx,
                tvl: 0,
                tvlStr: '0',
                volume: 0,
                volumeStr: '0',
                priceChange: 0,
                priceChangeStr: '0',
                moneyness: {
                    base: 0,
                    quote: 0,
                },
            };
            return poolData;
        }

        // format TVL, use empty string as backup value
        const tvlDisplay: string = poolStatsNow.tvlTotalUsd
            ? getFormattedNumber({
                  value: poolStatsNow.tvlTotalUsd,
                  isTvl: true,
                  prefix: '$',
              })
            : '';
        // format volume, use empty string as backup value
        const volumeDisplay: string = volumeChange24h
            ? getFormattedNumber({
                  value: volumeChange24h,
                  prefix: '$',
              })
            : '';
        // human readable price change over last 24 hours
        let priceChangePercent: string;
        const priceChangeRaw: number | undefined = await cachedGet24hChange(
            chainId,
            pool.base.address,
            pool.quote.address,
            poolIdx,
            shouldInvert,
            activeNetwork.graphCacheUrl,
            Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
        );
        if (!priceChangeRaw) {
            priceChangePercent = '';
        } else if (priceChangeRaw * 100 >= 0.01) {
            priceChangePercent =
                '+ ' +
                (priceChangeRaw * 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }) +
                '%';
        } else if (priceChangeRaw * 100 <= -0.01) {
            priceChangePercent =
                (priceChangeRaw * 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }) + '%';
        } else {
            priceChangePercent = 'No Change';
        }

        // spot price for pool
        const spotPrice: number = await cachedQuerySpotPrice(
            crocEnv,
            pool.base.address,
            pool.quote.address,
            chainId,
            lastBlockNumber,
        );
        // display price, inverted if necessary
        const displayPrice: number = shouldInvert
            ? 1 /
              toDisplayPrice(spotPrice, pool.base.decimals, pool.quote.decimals)
            : toDisplayPrice(
                  spotPrice,
                  pool.base.decimals,
                  pool.quote.decimals,
              );

        // return variable
        const poolData: PoolDataIF = {
            ...pool,
            spotPrice,
            displayPrice: getFormattedNumber({
                value: displayPrice,
                abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
            }),
            poolIdx,
            tvl: poolStatsNow.tvlTotalUsd,
            tvlStr: tvlDisplay,
            volume: volumeChange24h,
            volumeStr: volumeDisplay,
            priceChange: priceChangeRaw ?? 0,
            priceChangeStr: priceChangePercent,
            moneyness: {
                base: baseMoneyness,
                quote: quoteMoneyness,
            },
        };
        // write a pool name should it not be there already
        poolData.name =
            baseMoneyness < quoteMoneyness
                ? `${pool.base.symbol} / ${pool.quote.symbol}`
                : `${pool.quote.symbol} / ${pool.base.symbol}`;
        return poolData;
    }

    // meta function to apply pool data get fn to an array of pools
    function getLimitedPoolData(
        poolList: PoolIF[],
        crocEnv: CrocEnv,
        chainId: string,
    ): void {
        const ambientTokens = ambientTokenList.tokens;
        const limitedPoolList = poolList.filter((pool) => {
            const baseToken = ambientTokens.find(
                (token) =>
                    token.address.toLowerCase() ===
                    pool.base.address.toLowerCase(),
            );
            const quoteToken = ambientTokens.find(
                (token) =>
                    token.address.toLowerCase() ===
                    pool.quote.address.toLowerCase(),
            );
            return baseToken && quoteToken;
        });
        const limitedPoolData = limitedPoolList.map((pool: PoolIF) =>
            getPoolData(pool, crocEnv, chainId),
        );

        Promise.all(limitedPoolData)
            .then((results: Array<PoolDataIF>) => {
                const filteredPoolData = results.filter(
                    (pool) => pool.spotPrice > 0,
                );
                setLimitedPools(filteredPoolData);
            })
            .catch((err) => {
                console.warn(err);
                // re-enable autopolling to attempt more data fetches
            });
    }

    // meta function to apply pool data get fn to an array of pools
    function getExtraPoolData(
        poolList: PoolIF[],
        crocEnv: CrocEnv,
        chainId: string,
    ): void {
        const ambientTokens = ambientTokenList.tokens;
        const extraPoolList = poolList.filter((pool) => {
            const baseToken = ambientTokens.find(
                (token) =>
                    token.address.toLowerCase() ===
                    pool.base.address.toLowerCase(),
            );
            const quoteToken = ambientTokens.find(
                (token) =>
                    token.address.toLowerCase() ===
                    pool.quote.address.toLowerCase(),
            );
            return !(baseToken && quoteToken);
        });

        const extraPoolData = extraPoolList.map((pool: PoolIF) =>
            getPoolData(pool, crocEnv, chainId),
        );
        Promise.all(extraPoolData)
            .then((results: Array<PoolDataIF>) => {
                const filteredPoolData = results.filter(
                    (pool) => pool.spotPrice > 0,
                );
                setExtraPools(filteredPoolData);
            })
            .catch((err) => {
                console.warn(err);
            });
    }

    const exploreContext: ExploreContextIF = {
        pools: {
            all: allPools,
            getLimited: getLimitedPoolData,
            getExtra: getExtraPoolData,
            resetPoolData: () => {
                setLimitedPools([]);
                setExtraPools([]);
            },
        },
    };

    return (
        <ExploreContext.Provider value={exploreContext}>
            {props.children}
        </ExploreContext.Provider>
    );
};
