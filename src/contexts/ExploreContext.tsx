import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    Dispatch,
    ReactNode,
    SetStateAction,
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import {
    expandPoolStats,
    getFormattedNumber,
    getMoneynessRank,
} from '../ambient-utils/dataLayer';
import { PoolIF, SinglePoolDataIF } from '../ambient-utils/types';
import {
    useTokenStats,
    useTokenStatsIF,
} from '../pages/platformAmbient/Explore/useTokenStats';
import { AppStateContext } from './AppStateContext';
import { CachedDataContext } from './CachedDataContext';
import { ChainDataContext } from './ChainDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { PoolContext } from './PoolContext';
import { TokenContext } from './TokenContext';

export interface ExploreContextIF {
    pools: {
        all: Array<PoolDataIF>;
        getAllPools: (
            poolList: PoolIF[],
            crocEnv: CrocEnv,
            chainId: string,
        ) => void;

        reset: () => void;
    };
    topTokensOnchain: useTokenStatsIF;
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
    apr: number;
    priceChange: number;
    priceChangeStr: string;
    moneyness: {
        base: number;
        quote: number;
    };
    usdPriceMoneynessBased: number;
}

export const ExploreContext = createContext({} as ExploreContextIF);

export const ExploreContextProvider = (props: { children: ReactNode }) => {
    const { activeNetwork, isUserOnline } = useContext(AppStateContext);
    const { cachedFetchTokenPrice, cachedTokenDetails } =
        useContext(CachedDataContext);
    const { crocEnv, provider } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);
    const { allPoolStats, isActiveNetworkPlume, isActiveNetworkSwell } =
        useContext(ChainDataContext);
    const { poolList } = useContext(PoolContext);

    const [allPools, setAllPools] = useState<Array<PoolDataIF>>([]);
    const [intermediaryPoolData, setIntermediaryPoolData] = useState<
        Array<PoolDataIF>
    >([]);
    const [isExploreDollarizationEnabled, setIsExploreDollarizationEnabled] =
        useState(
            localStorage.getItem('isExploreDollarizationEnabled') === 'true',
        );

    // used to prevent displaying data for a previous network after switching networks
    useEffect(() => {
        if (intermediaryPoolData.length) {
            if (intermediaryPoolData[0].chainId === activeNetwork.chainId) {
                setAllPools(intermediaryPoolData);
            }
        } else {
            setAllPools([]);
        }
    }, [intermediaryPoolData]);

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

    const getAllPools = async (): Promise<void> => {
        // make sure crocEnv exists and pool metadata is present
        if (crocEnv && poolList.length) {
            // use metadata to get expanded pool data
            getAllPoolData(poolList, crocEnv, activeNetwork.chainId);
        }
    };

    // get expanded pool metadata
    useEffect(() => {
        (async () => {
            if (
                isUserOnline &&
                crocEnv !== undefined &&
                poolList.length > 0 &&
                (await crocEnv.context).chain.chainId === activeNetwork.chainId
            ) {
                if (
                    intermediaryPoolData.length &&
                    intermediaryPoolData[0]?.chainId !== activeNetwork.chainId
                ) {
                    setIntermediaryPoolData([]);
                }
                if (!intermediaryPoolData.length) {
                    getAllPools();
                    const interval = setInterval(() => {
                        getAllPools(); // refresh pool data every 5 minutes
                    }, 300000);
                    return () => clearInterval(interval);
                }
            }
        })();
    }, [
        isUserOnline,
        poolList.length,
        poolList[0]?.chainId,
        intermediaryPoolData[0]?.chainId,
        crocEnv,
        activeNetwork.chainId,
    ]);

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

        const poolStats = allPoolStats?.find(
            (poolStat: SinglePoolDataIF) =>
                poolStat.base.toLowerCase() ===
                    pool.base.address.toLowerCase() &&
                poolStat.quote.toLowerCase() ===
                    pool.quote.address.toLowerCase(),
        );

        const poolStatsNow = {
            baseFees: poolStats?.baseFees || 0,
            baseTvl: poolStats?.baseTvl || 0,
            baseVolume: poolStats?.baseVolume || 0,
            quoteFees: poolStats?.quoteFees || 0,
            quoteTvl: poolStats?.quoteTvl || 0,
            quoteVolume: poolStats?.quoteVolume || 0,
            feeRate: poolStats?.feeRate || 0,
            lastPriceIndic: poolStats?.lastPriceIndic || 0,
            lastPriceLiq: poolStats?.lastPriceLiq || 0,
            lastPriceSwap: poolStats?.lastPriceSwap || 0,
            latestTime: poolStats?.latestTime || 0,
            isHistorical: false,
        };

        const expandedPoolStatsNow = await expandPoolStats(
            poolStatsNow,
            pool.base.address,
            pool.quote.address,
            chainId,
            crocEnv,
            cachedFetchTokenPrice,
            cachedTokenDetails,
            tokens.tokenUniv,
        );

        const poolStats24hAgo = {
            baseFees: poolStats?.baseFees24hAgo || 0,
            baseTvl: poolStats?.baseTvl || 0,
            baseVolume: poolStats?.baseVolume24hAgo || 0,
            quoteFees: poolStats?.quoteFees24hAgo || 0,
            quoteTvl: poolStats?.quoteTvl || 0,
            quoteVolume: poolStats?.quoteVolume24hAgo || 0,
            feeRate: poolStats?.feeRate || 0,
            lastPriceIndic: poolStats?.lastPriceIndic || 0,
            lastPriceLiq: poolStats?.lastPriceLiq || 0,
            lastPriceSwap: poolStats?.lastPriceSwap || 0,
            latestTime: poolStats?.latestTime || 0,
            isHistorical: false,
        };

        const expandedPoolStats24hAgo = await expandPoolStats(
            poolStats24hAgo,
            pool.base.address,
            pool.quote.address,
            chainId,
            crocEnv,
            cachedFetchTokenPrice,
            cachedTokenDetails,
            tokens.tokenUniv,
        );

        const volumeTotalNow = expandedPoolStatsNow?.volumeTotalUsd;
        const volumeTotal24hAgo = expandedPoolStats24hAgo?.volumeTotalUsd;

        const volumeChange24h = volumeTotalNow - volumeTotal24hAgo;

        const nowPrice = expandedPoolStatsNow?.lastPriceSwap;
        const ydayPrice = poolStats?.priceSwap24hAgo;

        const feesTotalNow = expandedPoolStatsNow?.feesTotalUsd;
        const feesTotal24hAgo = expandedPoolStats24hAgo?.feesTotalUsd;
        const feesChange24h = feesTotalNow - feesTotal24hAgo;

        const priceChangeRaw =
            ydayPrice && nowPrice && ydayPrice > 0 && nowPrice > 0
                ? shouldInvert
                    ? ydayPrice / nowPrice - 1.0
                    : nowPrice / ydayPrice - 1.0
                : undefined;

        const minimumPoolTvl = isActiveNetworkSwell
            ? 20
            : isActiveNetworkPlume
              ? 20
              : 100;

        if (
            !expandedPoolStatsNow ||
            expandedPoolStatsNow.tvlTotalUsd < minimumPoolTvl
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
                apr: 0,
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
        // format fees as apr, use 0 as backup value
        const aprNum: number =
            feesChange24h && expandedPoolStatsNow.tvlTotalUsd
                ? (feesChange24h / expandedPoolStatsNow.tvlTotalUsd) * 100 * 365
                : 0;
        // human readable price change over last 24 hours
        let priceChangePercent: string;

        if (priceChangeRaw === undefined || volumeChange24h === 0) {
            priceChangePercent = '';
        } else if (priceChangeRaw * 100 >= 0.01) {
            priceChangePercent =
                '+' +
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

        // display price, inverted if necessary
        const displayPrice: number = shouldInvert
            ? 1 /
              toDisplayPrice(nowPrice, pool.base.decimals, pool.quote.decimals)
            : toDisplayPrice(nowPrice, pool.base.decimals, pool.quote.decimals);

        const tokenPriceForUsd = shouldInvert
            ? (await cachedFetchTokenPrice(pool.quote.address, pool.chainId))
                  ?.usdPrice || 0
            : (await cachedFetchTokenPrice(pool.base.address, pool.chainId))
                  ?.usdPrice || 0;

        const usdPriceMoneynessBased = displayPrice * tokenPriceForUsd;

        // return variable
        const poolData: PoolDataIF = {
            ...pool,
            spotPrice: nowPrice,
            displayPrice: getFormattedNumber({
                value: displayPrice,
                abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
            }),
            poolIdx,
            tvl: expandedPoolStatsNow.tvlTotalUsd,
            tvlStr: tvlDisplay,
            volume: volumeChange24h,
            volumeStr: volumeDisplay,
            apr: aprNum,
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

    function getAllPoolData(
        poolList: PoolIF[],
        crocEnv: CrocEnv,
        chainId: string,
    ): void {
        const allPoolData = poolList.map((pool: PoolIF) =>
            getPoolData(pool, crocEnv, chainId),
        );
        Promise.all(allPoolData)
            .then((results: Array<PoolDataIF>) => {
                const filteredPoolData = results.filter(
                    (pool) => pool.spotPrice > 0,
                );
                if (filteredPoolData.length) {
                    setIntermediaryPoolData(filteredPoolData);
                }
            })
            .catch((err) => {
                console.warn(err);
            });
    }

    const dexTokens: useTokenStatsIF = useTokenStats(
        activeNetwork.chainId,
        crocEnv,
        activeNetwork.GCGO_URL,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        tokens,
        provider,
    );

    const exploreContext: ExploreContextIF = {
        pools: {
            all: allPools,
            getAllPools: getAllPools,
            reset: () => {
                setIntermediaryPoolData([]);
            },
        },
        topTokensOnchain: dexTokens,
        isExploreDollarizationEnabled,
        setIsExploreDollarizationEnabled,
    };

    return (
        <ExploreContext.Provider value={exploreContext}>
            {props.children}
        </ExploreContext.Provider>
    );
};
