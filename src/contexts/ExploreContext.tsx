import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
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
import {
    excludedTokenAddressesLowercase,
    hiddenTokens,
} from '../ambient-utils/constants';
import {
    expandPoolStats,
    getFormattedNumber,
} from '../ambient-utils/dataLayer';
import { PoolIF } from '../ambient-utils/types';
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

        topPools: PoolIF[];
        visibleTopPoolData: PoolIF[];
        setVisibleTopPoolData: Dispatch<SetStateAction<PoolIF[]>>;
        processPoolListForActiveChain: () => Promise<void>;
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
    usdPriceMoneynessBased: number;
}

export const ExploreContext = createContext({} as ExploreContextIF);

export const ExploreContextProvider = (props: { children: ReactNode }) => {
    const { activeNetwork, isUserOnline } = useContext(AppStateContext);
    const { cachedFetchTokenPrice, cachedTokenDetails } =
        useContext(CachedDataContext);
    const {
        topPools: hardcodedTopPools,
        crocEnv,
        provider,
    } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);
    const { isActiveNetworkPlume, isActiveNetworkSwell } =
        useContext(ChainDataContext);
    const { poolList } = useContext(PoolContext);

    const [intermediaryPoolData, setIntermediaryPoolData] = useState<
        Array<PoolDataIF>
    >([]);
    const [visibleTopPoolData, setVisibleTopPoolData] = useState<PoolIF[]>([]);
    const [isFetchError, setIsFetchError] = useState(false);
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

    const processPoolListForActiveChain = async (): Promise<void> => {
        // make sure crocEnv exists and pool metadata is present
        if (poolList.length && crocEnv) {
            // use metadata to get expanded pool data
            processPoolList(poolList, activeNetwork.chainId, crocEnv);
        }
    };

    // fn to get data on a single pool
    async function expandPoolListData(
        pool: PoolIF,
        crocEnv: CrocEnv,
    ): Promise<PoolDataIF> {
        const expandedPoolData = await expandPoolStats(
            pool,
            crocEnv,
            cachedFetchTokenPrice,
            cachedTokenDetails,
            tokens.tokenUniv,
        );

        const volumeChange24h = expandedPoolData.volumeChange24h || 0;

        const nowPrice = expandedPoolData.lastPriceSwap || 0;

        const feesChange24h = expandedPoolData.feesChange24h || 0;

        const minimumPoolTvl = isActiveNetworkSwell
            ? 20
            : isActiveNetworkPlume
              ? 20
              : 100;

        if (
            !expandedPoolData.tvlTotalUsd ||
            expandedPoolData.tvlTotalUsd < minimumPoolTvl
        ) {
            // return early
            const poolData: PoolDataIF = {
                ...pool,
                spotPrice: 0,
                displayPrice: '0',
                poolIdx: pool.poolIdx,
                tvl: 0,
                tvlStr: '0',
                volume: 0,
                volumeStr: '0',
                apr: 0,
                priceChange: 0,
                priceChangeStr: '0',
                usdPriceMoneynessBased: 0,
            };
            return poolData;
        }

        // format TVL, use empty string as backup value
        const tvlDisplay: string = expandedPoolData.tvlTotalUsd
            ? getFormattedNumber({
                  value: expandedPoolData.tvlTotalUsd,
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
            feesChange24h && expandedPoolData.tvlTotalUsd
                ? (feesChange24h / expandedPoolData.tvlTotalUsd) * 100 * 365
                : 0;
        // human readable price change over last 24 hours
        let priceChangePercent: string;

        if (
            expandedPoolData.priceChange24h === undefined ||
            volumeChange24h === 0
        ) {
            priceChangePercent = '';
        } else if (expandedPoolData.priceChange24h * 100 >= 0.01) {
            priceChangePercent =
                '+' +
                (expandedPoolData.priceChange24h * 100).toLocaleString(
                    undefined,
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    },
                ) +
                '%';
        } else if (expandedPoolData.priceChange24h * 100 <= -0.01) {
            priceChangePercent =
                (expandedPoolData.priceChange24h * 100).toLocaleString(
                    undefined,
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    },
                ) + '%';
        } else {
            priceChangePercent = 'No Change';
        }

        // display price, inverted if necessary
        const displayPrice: number =
            !expandedPoolData.isBaseTokenMoneynessGreaterOrEqual
                ? 1 /
                  toDisplayPrice(
                      nowPrice,
                      pool.base.decimals,
                      pool.quote.decimals,
                  )
                : toDisplayPrice(
                      nowPrice,
                      pool.base.decimals,
                      pool.quote.decimals,
                  );

        const tokenPriceForUsd = !pool.isBaseTokenMoneynessGreaterOrEqual
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
            poolIdx: pool.poolIdx,
            tvl: expandedPoolData.tvlTotalUsd,
            tvlStr: tvlDisplay,
            volume: volumeChange24h,
            volumeStr: volumeDisplay,
            apr: aprNum,
            priceChange: pool.priceChange24h ?? 0,
            priceChangeStr: priceChangePercent,
            usdPriceMoneynessBased,
        };
        // write a pool name should it not be there already
        poolData.name = !pool.isBaseTokenMoneynessGreaterOrEqual
            ? `${pool.base.symbol} / ${pool.quote.symbol}`
            : `${pool.quote.symbol} / ${pool.base.symbol}`;
        return poolData;
    }

    function processPoolList(
        poolList: PoolIF[],
        chainId: string,
        crocEnv: CrocEnv,
    ): void {
        const expandedPoolDataOnCurrentChain = poolList
            .filter((pool) => {
                return pool.chainId === chainId;
            })
            .map((pool: PoolIF) => expandPoolListData(pool, crocEnv));
        Promise.all(expandedPoolDataOnCurrentChain)
            .then((results: Array<PoolDataIF>) => {
                setIsFetchError(false);
                const filteredPoolData = results.filter(
                    (pool) => pool.spotPrice > 0,
                );
                if (filteredPoolData.length) {
                    setIntermediaryPoolData(filteredPoolData);
                }
            })
            .catch((err) => {
                setIsFetchError(true);
                console.warn(err);
            });
    }

    const [poolDataFilteredByActiveChain, setPoolDataFilteredByActiveChain] =
        useState<Array<PoolDataIF>>([]);

    useEffect(() => {
        setPoolDataFilteredByActiveChain([]);
    }, [activeNetwork.chainId]);

    useEffect(() => {
        const poolDataFilteredByActiveChain = intermediaryPoolData.filter(
            (pool) => pool.chainId === activeNetwork.chainId,
        );
        if (
            intermediaryPoolData.length === poolDataFilteredByActiveChain.length
        ) {
            setPoolDataFilteredByActiveChain(intermediaryPoolData);
        }
    }, [intermediaryPoolData, activeNetwork.chainId]);

    // Filter out excluded addresses and hidden tokens
    const filteredPoolsNoExcludedOrHiddenTokens = useMemo(
        () =>
            poolDataFilteredByActiveChain.filter(
                (pool) =>
                    !excludedTokenAddressesLowercase.includes(
                        pool.base.address.toLowerCase(),
                    ) &&
                    !excludedTokenAddressesLowercase.includes(
                        pool.quote.address.toLowerCase(),
                    ) &&
                    !hiddenTokens.some(
                        (excluded) =>
                            (excluded.address.toLowerCase() ===
                                pool.base.address.toLowerCase() ||
                                excluded.address.toLowerCase() ===
                                    pool.quote.address.toLowerCase()) &&
                            excluded.chainId === parseInt(pool.chainId),
                    ),
            ),
        [poolDataFilteredByActiveChain],
    );

    // get expanded pool metadata
    useEffect(() => {
        (async () => {
            if (
                isUserOnline &&
                crocEnv !== undefined &&
                poolList.length > 0 &&
                (await crocEnv.context).chain.chainId === activeNetwork.chainId
            ) {
                processPoolListForActiveChain();
            }
        })();
    }, [
        isUserOnline,
        poolList.map((pool) => pool.base.address + pool.quote.address).join(''),
        crocEnv,
        activeNetwork.chainId,
        intermediaryPoolData.length !== poolDataFilteredByActiveChain.length,
    ]);

    const topPools = useMemo(() => {
        const topPoolsFilteredByVolume =
            filteredPoolsNoExcludedOrHiddenTokens.filter(
                (pool) => pool.volume > 1000,
            );
        return isFetchError ||
            (filteredPoolsNoExcludedOrHiddenTokens.length &&
                !topPoolsFilteredByVolume.length)
            ? hardcodedTopPools
            : topPoolsFilteredByVolume
                  .sort(
                      (poolA: PoolDataIF, poolB: PoolDataIF) =>
                          poolB['volume'] - poolA['volume'],
                  )
                  .slice(0, 5);
    }, [
        isFetchError,
        hardcodedTopPools,
        filteredPoolsNoExcludedOrHiddenTokens
            .map((pool) => pool.base.address + pool.quote.address)
            .join(''),
    ]);

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
            all: filteredPoolsNoExcludedOrHiddenTokens,
            processPoolListForActiveChain,
            topPools: topPools,
            visibleTopPoolData,
            setVisibleTopPoolData,
            reset: () => {
                setIntermediaryPoolData([]);
                setPoolDataFilteredByActiveChain([]);
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
