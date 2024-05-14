import {
    Dispatch,
    ReactNode,
    SetStateAction,
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
    expandPoolStats,
} from '../ambient-utils/dataLayer';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { CrocEnvContext } from './CrocEnvContext';
import { CACHE_UPDATE_FREQ_IN_MS } from '../ambient-utils/constants';
import ambientTokenList from '../ambient-utils/constants/ambient-token-list.json';
import { PoolContext } from './PoolContext';
import { useTokenStatsIF, useTokenStats } from '../pages/Explore/useTokenStats';
import { TokenContext } from './TokenContext';

export interface ExploreContextIF {
    pools: {
        all: Array<PoolDataIF>;
        getLimited(poolList: PoolIF[], crocEnv: CrocEnv, chainId: string): void;
        getExtra: (
            poolList: PoolIF[],
            crocEnv: CrocEnv,
            chainId: string,
        ) => void;
        reset: () => void;
    };
    tokens: useTokenStatsIF;
    isExploreDollarizationEnabled: boolean;
    setIsExploreDollarizationEnabled: Dispatch<SetStateAction<boolean>>;
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
    usdPriceMoneynessBased: number;
}

export const ExploreContext = createContext<ExploreContextIF>(
    {} as ExploreContextIF,
);

export const ExploreContextProvider = (props: { children: ReactNode }) => {
    const { isActiveNetworkBlast } = useContext(ChainDataContext);

    const {
        cachedPoolStatsFetch,
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
    } = useContext(CachedDataContext);

    const { crocEnv, chainData, activeNetwork, provider } =
        useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);

    const [limitedPools, setLimitedPools] = useState<Array<PoolDataIF>>([]);
    const [extraPools, setExtraPools] = useState<Array<PoolDataIF>>([]);
    const [isExploreDollarizationEnabled, setIsExploreDollarizationEnabled] =
        useState(
            localStorage.getItem('isExploreDollarizationEnabled') === 'true',
        );

    useEffect(() => {
        const savedDollarizationPreference =
            localStorage.getItem('isExploreDollarizationEnabled') === 'true';
        if (isExploreDollarizationEnabled !== savedDollarizationPreference) {
            localStorage.setItem(
                'isExploreDollarizationEnabled',
                isExploreDollarizationEnabled.toString(),
            );
        }
    }, [isExploreDollarizationEnabled]);

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
            activeNetwork.graphCacheUrl,
        );

        const expandedPoolStatsNow = await expandPoolStats(
            poolStatsNow,
            pool.base.address,
            pool.quote.address,
            chainId,
            crocEnv,
            cachedFetchTokenPrice,
            cachedTokenDetails,
            cachedQuerySpotPrice,
            tokens.tokenUniv,
        );
        const ydayTime = Math.floor(Date.now() / 1000 - 24 * 3600);

        const poolStats24hAgo = await cachedPoolStatsFetch(
            chainId,
            pool.base.address,
            pool.quote.address,
            poolIdx,
            Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
            activeNetwork.graphCacheUrl,
            ydayTime,
        );

        const expandedPoolStats24hAgo = await expandPoolStats(
            poolStats24hAgo,
            pool.base.address,
            pool.quote.address,
            chainId,
            crocEnv,
            cachedFetchTokenPrice,
            cachedTokenDetails,
            cachedQuerySpotPrice,
            tokens.tokenUniv,
        );

        const volumeTotalNow = expandedPoolStatsNow?.volumeTotalUsd;
        const volumeTotal24hAgo = expandedPoolStats24hAgo?.volumeTotalUsd;

        const volumeChange24h = volumeTotalNow - volumeTotal24hAgo;

        const nowPrice = expandedPoolStatsNow?.lastPriceIndic;
        const ydayPrice = expandedPoolStats24hAgo?.lastPriceIndic;

        const priceChangeRaw =
            ydayPrice && nowPrice && ydayPrice > 0 && nowPrice > 0
                ? shouldInvert
                    ? ydayPrice / nowPrice - 1.0
                    : nowPrice / ydayPrice - 1.0
                : 0.0;
        if (
            !expandedPoolStatsNow ||
            (!isActiveNetworkBlast && expandedPoolStatsNow.tvlTotalUsd < 100)
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
                usdPriceMoneynessBased: 0,
            };
            return poolData;
        }

        // format TVL, use empty string as backup value
        const tvlDisplay: string = expandedPoolStatsNow.tvlTotalUsd
            ? getFormattedNumber({
                  value: expandedPoolStatsNow.tvlTotalUsd,
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
            Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
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

        const tokenPriceForUsd = shouldInvert
            ? (
                  await cachedFetchTokenPrice(
                      pool.quote.address,
                      pool.chainId,
                      crocEnv,
                  )
              )?.usdPrice || 0
            : (
                  await cachedFetchTokenPrice(
                      pool.base.address,
                      pool.chainId,
                      crocEnv,
                  )
              )?.usdPrice || 0;

        const usdPriceMoneynessBased = displayPrice * tokenPriceForUsd;

        // return variable
        const poolData: PoolDataIF = {
            ...pool,
            spotPrice,
            displayPrice: getFormattedNumber({
                value: displayPrice,
                abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
            }),
            poolIdx,
            tvl: expandedPoolStatsNow.tvlTotalUsd,
            tvlStr: tvlDisplay,
            volume: volumeChange24h,
            volumeStr: volumeDisplay,
            priceChange: priceChangeRaw ?? 0,
            priceChangeStr: priceChangePercent,
            moneyness: {
                base: baseMoneyness,
                quote: quoteMoneyness,
            },
            usdPriceMoneynessBased,
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

    const dexTokens: useTokenStatsIF = useTokenStats(
        chainData.chainId,
        crocEnv,
        activeNetwork.graphCacheUrl,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        tokens,
        provider,
    );

    const exploreContext: ExploreContextIF = {
        pools: {
            all: allPools,
            getLimited: getLimitedPoolData,
            getExtra: getExtraPoolData,
            reset: () => {
                setLimitedPools([]);
                setExtraPools([]);
            },
        },
        tokens: dexTokens,
        isExploreDollarizationEnabled,
        setIsExploreDollarizationEnabled,
    };

    return (
        <ExploreContext.Provider value={exploreContext}>
            {props.children}
        </ExploreContext.Provider>
    );
};
