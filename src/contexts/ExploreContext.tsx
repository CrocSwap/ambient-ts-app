import { CrocEnv } from '@crocswap-libs/sdk';
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
import { expandPoolStats } from '../ambient-utils/dataLayer';
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
        all: Array<PoolIF>;
        topPools: PoolIF[];
        visibleTopPoolData: PoolIF[];
        setVisibleTopPoolData: Dispatch<SetStateAction<PoolIF[]>>;
        processPoolListForActiveChain: () => Promise<void>;
        activePoolList: PoolIF[];
        reset: () => void;
    };
    topTokensOnchain: useTokenStatsIF;
    isExploreDollarizationEnabled: boolean;
    setIsExploreDollarizationEnabled: Dispatch<SetStateAction<boolean>>;
}

export const ExploreContext = createContext({} as ExploreContextIF);

export const ExploreContextProvider = (props: { children: ReactNode }) => {
    const { activeNetwork, isUserOnline } = useContext(AppStateContext);
    const { cachedFetchTokenPrice, cachedTokenDetails } =
        useContext(CachedDataContext);
    const { gcgoPoolList } = useContext(ChainDataContext);
    const { analyticsPoolList } = useContext(PoolContext);

    const [activePoolList, setActivePoolList] = useState<PoolIF[]>(
        analyticsPoolList?.length ? analyticsPoolList : [],
    );

    useEffect(() => {
        if (!analyticsPoolList?.length) {
            const timeout = setTimeout(() => {
                return;
            }, 2000);

            if (gcgoPoolList?.length) {
                setActivePoolList(gcgoPoolList);
            }

            return () => clearTimeout(timeout); // Cleanup on unmount or re-run
        } else if (analyticsPoolList?.length) {
            setActivePoolList(analyticsPoolList);
        }
    }, [JSON.stringify(analyticsPoolList), JSON.stringify(gcgoPoolList)]);

    const {
        topPools: hardcodedTopPools,
        crocEnv,
        provider,
    } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);

    const [intermediaryPoolData, setIntermediaryPoolData] = useState<
        Array<PoolIF>
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
        if (
            // poolList?.length &&
            crocEnv
        ) {
            // use metadata to get expanded pool data
            processPoolList(activeNetwork.chainId, crocEnv);
        }
    };

    // fn to get data on a single pool
    async function expandPoolListData(
        pool: PoolIF,
        crocEnv: CrocEnv,
    ): Promise<PoolIF> {
        const expandedPoolData = await expandPoolStats(
            pool,
            crocEnv,
            cachedFetchTokenPrice,
            cachedTokenDetails,
            tokens.tokenUniv,
        );

        return expandedPoolData;
    }

    function processPoolList(chainId: string, crocEnv: CrocEnv): void {
        if (!activePoolList || !activePoolList.length) return;

        const expandedPoolDataOnCurrentChain = activePoolList
            .filter((pool) => {
                return pool.chainId === chainId;
            })
            .map((pool: PoolIF) => expandPoolListData(pool, crocEnv));

        Promise.all(expandedPoolDataOnCurrentChain)
            .then((results: Array<PoolIF>) => {
                setIsFetchError(false);
                const filteredPoolData = results.filter(
                    (pool) => pool.lastPriceSwap && pool.lastPriceSwap > 0,
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
        useState<Array<PoolIF>>([]);

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
                        pool.base.toLowerCase(),
                    ) &&
                    !excludedTokenAddressesLowercase.includes(
                        pool.quote.toLowerCase(),
                    ) &&
                    !hiddenTokens.some(
                        (excluded) =>
                            (excluded.address.toLowerCase() ===
                                pool.base.toLowerCase() ||
                                excluded.address.toLowerCase() ===
                                    pool.quote.toLowerCase()) &&
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
                activePoolList?.length &&
                (await crocEnv.context).chain.chainId === activeNetwork.chainId
            ) {
                processPoolListForActiveChain();
            }
        })();
    }, [
        isUserOnline,
        JSON.stringify(activePoolList),
        crocEnv,
        activeNetwork.chainId,
        intermediaryPoolData.length !== poolDataFilteredByActiveChain.length,
    ]);

    const topPools = useMemo(() => {
        let topPoolsFilteredByVolume;
        if (
            filteredPoolsNoExcludedOrHiddenTokens.filter(
                (pool) => pool.volumeChange24h && pool.volumeChange24h > 1000,
            ).length >= 3
        ) {
            topPoolsFilteredByVolume =
                filteredPoolsNoExcludedOrHiddenTokens.filter(
                    (pool) =>
                        pool.volumeChange24h && pool.volumeChange24h > 1000,
                );
        } else if (
            filteredPoolsNoExcludedOrHiddenTokens.filter(
                (pool) => pool.volumeChange24h && pool.volumeChange24h > 100,
            ).length >= 3
        ) {
            topPoolsFilteredByVolume =
                filteredPoolsNoExcludedOrHiddenTokens.filter(
                    (pool) =>
                        pool.volumeChange24h && pool.volumeChange24h > 100,
                );
        } else if (
            filteredPoolsNoExcludedOrHiddenTokens.filter(
                (pool) => pool.volumeChange24h && pool.volumeChange24h > 0,
            ).length >= 3
        ) {
            topPoolsFilteredByVolume =
                filteredPoolsNoExcludedOrHiddenTokens.filter(
                    (pool) => pool.volumeChange24h && pool.volumeChange24h > 0,
                );
        } else {
            topPoolsFilteredByVolume = filteredPoolsNoExcludedOrHiddenTokens;
        }
        return isFetchError
            ? hardcodedTopPools
            : topPoolsFilteredByVolume
                  .sort(
                      (poolA: PoolIF, poolB: PoolIF) =>
                          (poolB['volumeChange24h'] || 0) -
                          (poolA['volumeChange24h'] || 0),
                  )
                  .slice(0, 5);
    }, [isFetchError, JSON.stringify(filteredPoolsNoExcludedOrHiddenTokens)]);

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
            activePoolList,
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
