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
    const {
        topPools: hardcodedTopPools,
        crocEnv,
        provider,
    } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);
    const { poolList } = useContext(PoolContext);

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
        if (poolList?.length && crocEnv) {
            // use metadata to get expanded pool data
            processPoolList(poolList, activeNetwork.chainId, crocEnv);
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
                poolList?.length &&
                (await crocEnv.context).chain.chainId === activeNetwork.chainId
            ) {
                processPoolListForActiveChain();
            }
        })();
    }, [
        isUserOnline,
        poolList
            ?.map((pool) => pool.base.address + pool.quote.address)
            .join(''),
        crocEnv,
        activeNetwork.chainId,
        intermediaryPoolData.length !== poolDataFilteredByActiveChain.length,
    ]);

    const topPools = useMemo(() => {
        const topPoolsFilteredByVolume =
            filteredPoolsNoExcludedOrHiddenTokens.filter(
                (pool) => pool.volumeChange24h && pool.volumeChange24h > 1000,
            );
        return isFetchError
            ? hardcodedTopPools
            : topPoolsFilteredByVolume
                  .sort(
                      (poolA: PoolIF, poolB: PoolIF) =>
                          (poolB['volumeChange24h'] || 0) -
                          (poolA['volumeChange24h'] || 0),
                  )
                  .slice(0, 5);
    }, [
        isFetchError,
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
