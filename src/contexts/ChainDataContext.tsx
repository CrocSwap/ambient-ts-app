import { CrocEnv } from '@crocswap-libs/sdk';
import moment from 'moment';
import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    expandTokenBalances,
    fetchBlastUserXpData,
    fetchBlockNumber,
    fetchUserXpData,
    IDexTokenBalances,
    RpcNodeStatus,
} from '../ambient-utils/api';
import { fetchNFT } from '../ambient-utils/api/fetchNft';
import {
    BLOCK_POLLING_RPC_URL,
    GCGO_BLAST_URL,
    GCGO_ETHEREUM_URL,
    GCGO_SCROLL_URL,
    GCGO_SWELL_URL,
    hiddenTokens,
    IS_LOCAL_ENV,
    supportedNetworks,
    vaultSupportedNetworkIds,
    ZERO_ADDRESS,
} from '../ambient-utils/constants';
import { getChainStats, getFormattedNumber } from '../ambient-utils/dataLayer';
import {
    AllVaultsServerIF,
    SinglePoolDataIF,
    TokenIF,
} from '../ambient-utils/types';
import { AppStateContext } from './AppStateContext';
import { BrandContext } from './BrandContext';
import { CachedDataContext } from './CachedDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { ReceiptContext } from './ReceiptContext';
import {
    NftDataIF,
    NftListByChain,
    TokenBalanceContext,
} from './TokenBalanceContext';
import { TokenContext } from './TokenContext';
import {
    BlastUserXpDataIF,
    UserDataContext,
    UserXpDataIF,
} from './UserDataContext';

export interface ChainDataContextIF {
    gasPriceInGwei: number | undefined;
    setGasPriceinGwei: Dispatch<SetStateAction<number | undefined>>;
    lastBlockNumber: number;
    setLastBlockNumber: Dispatch<SetStateAction<number>>;
    rpcNodeStatus: RpcNodeStatus;
    connectedUserXp: UserXpDataIF;
    connectedUserBlastXp: BlastUserXpDataIF;
    isActiveNetworkBlast: boolean;
    isActiveNetworkPlume: boolean;
    isActiveNetworkSwell: boolean;
    isActiveNetworkBase: boolean;
    isActiveNetworkScroll: boolean;
    isActiveNetworkMainnet: boolean;
    isVaultSupportedOnNetwork: boolean;
    isActiveNetworkL2: boolean;
    nativeTokenUsdPrice: number | undefined;
    allPoolStats: SinglePoolDataIF[] | undefined;
    allVaultsData: AllVaultsServerIF[] | null | undefined;
    setAllVaultsData: Dispatch<
        SetStateAction<AllVaultsServerIF[] | null | undefined>
    >;
    totalTvlString: string | undefined;
    totalVolumeString: string | undefined;
    totalFeesString: string | undefined;
}

export const ChainDataContext = createContext({} as ChainDataContextIF);

export const ChainDataContextProvider = (props: { children: ReactNode }) => {
    const {
        activeNetwork: { chainId, evmRpcUrl: nodeUrl, GCGO_URL },
        isUserIdle,
        isUserOnline,
    } = useContext(AppStateContext);
    const {
        setTokenBalances,
        setNFTData,
        NFTFetchSettings,
        setNFTFetchSettings,
    } = useContext(TokenBalanceContext);
    const { sessionReceipts } = useContext(ReceiptContext);
    const {
        crocEnv,
        provider,
        mainnetProvider,
        scrollProvider,
        blastProvider,
        swellProvider,
    } = useContext(CrocEnvContext);
    const {
        cachedFetchAmbientListWalletBalances,
        cachedFetchDexBalances,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedFetchNFT,
        cachedAllPoolStatsFetch,
    } = useContext(CachedDataContext);
    const { tokens } = useContext(TokenContext);
    const { showDexStats } = useContext(BrandContext);

    const allDefaultTokens = tokens.allDefaultTokens;

    const {
        userAddress,
        isUserConnected,
        setIsfetchNftTriggered,
        isfetchNftTriggered,
        nftTestWalletAddress,
        setNftTestWalletAddress,
    } = useContext(UserDataContext);

    const [lastBlockNumber, setLastBlockNumber] = useState<number>(0);
    console.log({ lastBlockNumber });

    const [rpcNodeStatus, setRpcNodeStatus] =
        useState<RpcNodeStatus>('unknown');
    const [gasPriceInGwei, setGasPriceinGwei] = useState<number | undefined>();

    const isActiveNetworkBlast = ['0x13e31', '0xa0c71fd'].includes(chainId);
    const isActiveNetworkScroll = ['0x82750', '0x8274f'].includes(chainId);
    const isActiveNetworkMainnet = ['0x1'].includes(chainId);
    const isActiveNetworkPlume = ['0x18230', '0x18231'].includes(chainId);
    const isActiveNetworkSwell = ['0x783', '0x784'].includes(chainId);
    const isActiveNetworkBase = ['0x14a34'].includes(chainId);

    const isVaultSupportedOnNetwork =
        vaultSupportedNetworkIds.includes(chainId);

    // vault data from tempest API
    const [allVaultsData, setAllVaultsData] = useState<
        AllVaultsServerIF[] | null | undefined
    >(null);

    const [totalTvlString, setTotalTvlString] = useState<string | undefined>();
    const [totalVolumeString, setTotalVolumeString] = useState<
        string | undefined
    >();
    const [totalFeesString, setTotalFeesString] = useState<
        string | undefined
    >();

    const blockPollingUrl = BLOCK_POLLING_RPC_URL
        ? BLOCK_POLLING_RPC_URL
        : nodeUrl;

    // array of network IDs for supported L2 networks
    const L1_NETWORKS: string[] = [
        '0x1', // ethereum mainnet
        '0xaa36a7', // ethereum sepolia
    ];

    // boolean representing whether the active network is an L2
    const isActiveNetworkL2 = !L1_NETWORKS.includes(chainId);

    const BLOCK_NUM_POLL_MS = isUserIdle ? 30000 : 5000; // poll for new block every 30 seconds when user is idle, every 5 seconds when user is active
    const GAS_PRICE_POLL_MS = isUserIdle ? 60000 : 10000; // poll for new gas price every 60 seconds when user is idle, every 10 seconds when user is active

    const poolStatsPollingCacheTime = Math.floor(
        Date.now() / (isUserIdle ? 120000 : 30000),
    ); // poll for new pool stats every 120 seconds when user is idle, every 30 seconds when user is active

    const fetchGasPrice = async () => {
        setGasPriceinGwei(
            await supportedNetworks[chainId].getGasPriceInGwei(provider),
        );
    };

    useEffect(() => {
        setGasPriceinGwei(undefined);
        fetchGasPrice();

        const interval = setInterval(() => {
            fetchGasPrice();
        }, GAS_PRICE_POLL_MS);

        return () => clearInterval(interval);
    }, [chainId]);

    async function pollBlockNum(): Promise<void> {
        try {
            const lastBlockNumber = await fetchBlockNumber(blockPollingUrl);
            if (lastBlockNumber > 0) {
                setLastBlockNumber(lastBlockNumber);
                setRpcNodeStatus('active');
            } else {
                setRpcNodeStatus('inactive');
            }
        } catch (error) {
            setRpcNodeStatus('inactive');
        }
    }

    useEffect(() => {
        if (!isUserOnline) return;
        // Grab block right away, then poll on periodic basis; useful for initial load
        pollBlockNum();

        const interval = setInterval(() => {
            pollBlockNum();
        }, BLOCK_NUM_POLL_MS);

        // Clean up the interval when the component unmounts or when dependencies change
        return () => clearInterval(interval);
    }, [isUserOnline, chainId, BLOCK_NUM_POLL_MS]);

    const [allPoolStats, setAllPoolStats] = useState<
        SinglePoolDataIF[] | undefined
    >();

    async function updateAllPoolStats(): Promise<void> {
        try {
            const allPoolStats = await cachedAllPoolStatsFetch(
                chainId,
                GCGO_URL,
                poolStatsPollingCacheTime,
                true,
            );

            if (allPoolStats) {
                setAllPoolStats(allPoolStats);
            }
        } catch (error) {
            console.log({ error });
        }
    }

    useEffect(() => {
        if (chainId && GCGO_URL && isUserOnline) {
            updateAllPoolStats();
        }
    }, [chainId, GCGO_URL, poolStatsPollingCacheTime, isUserOnline]);

    // used to trigger token balance refreshes every 5 minutes
    const everyFiveMinutes = Math.floor(Date.now() / 300000);

    useEffect(() => {
        const nftLocalData = localStorage.getItem('user_nft_data');

        const actionKey = userAddress;

        const localNftDataParsed = nftLocalData
            ? new Map(JSON.parse(nftLocalData))
            : undefined;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nftDataMap = localNftDataParsed?.get(actionKey) as any;

        const isOverTimeLimit =
            nftDataMap &&
            moment(Date.now()).diff(moment(nftDataMap.lastFetchTime), 'days') >=
                7;

        if (
            isUserOnline &&
            (isfetchNftTriggered ||
                !nftLocalData ||
                isOverTimeLimit ||
                (localNftDataParsed && !localNftDataParsed.has(actionKey)))
        ) {
            (async () => {
                if (crocEnv && isUserConnected && userAddress && chainId) {
                    try {
                        const fetchFunction = isfetchNftTriggered
                            ? fetchNFT
                            : cachedFetchNFT;

                        const NFTResponse = await fetchFunction(
                            nftTestWalletAddress !== ''
                                ? nftTestWalletAddress
                                : userAddress,
                            crocEnv,
                            NFTFetchSettings.pageKey,
                            NFTFetchSettings.pageSize,
                        );

                        if (NFTResponse !== undefined) {
                            const NFTData = NFTResponse.NFTData;

                            const pageKey = NFTResponse.pageKey;

                            const userHasNFT = NFTResponse.userHasNFT;

                            setNFTFetchSettings({
                                pageSize: NFTFetchSettings.pageSize,
                                pageKey: pageKey ? pageKey : '',
                            });

                            const nftImgArray: Array<NftDataIF> = [];

                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            NFTData.map((nftData: any) => {
                                if (
                                    nftData.collection.name !==
                                    'ENS: Ethereum Name Service'
                                ) {
                                    nftImgArray.push({
                                        contractAddress:
                                            nftData.contract.address,
                                        contractName: nftData.contract.name,
                                        thumbnailUrl:
                                            nftData.image.thumbnailUrl,
                                        cachedUrl: nftData.image.cachedUrl,
                                    });
                                }
                            });

                            const nftDataMap = localNftDataParsed
                                ? localNftDataParsed
                                : new Map<string, Array<NftListByChain>>();

                            const mapValue: Array<NftListByChain> = [];

                            mapValue.push({
                                chainId: chainId,
                                totalNFTCount: NFTResponse.totalNFTCount,
                                userHasNFT: userHasNFT,
                                data: nftImgArray,
                            });

                            const mapWithFetchTime = {
                                lastFetchTime: Date.now(),
                                mapValue: mapValue,
                            };

                            nftDataMap.set(actionKey, mapWithFetchTime);

                            localStorage.setItem(
                                'user_nft_data',
                                JSON.stringify(Array.from(nftDataMap)),
                            );

                            setNFTData(mapValue);
                            setIsfetchNftTriggered(() => false);
                            setNftTestWalletAddress(() => '');
                        }
                    } catch (error) {
                        console.error({ error });
                        setIsfetchNftTriggered(() => false);
                    }
                }
            })();
        } else {
            if (localNftDataParsed && localNftDataParsed.has(actionKey)) {
                if (nftDataMap) {
                    setNFTData(() => nftDataMap.mapValue as NftListByChain[]);
                }
            }
        }
    }, [
        isUserOnline,
        crocEnv,
        isUserConnected,
        userAddress,
        chainId,
        // everyFiveMinutes,
        GCGO_URL,
        isfetchNftTriggered,
    ]);

    useEffect(() => {
        (async () => {
            IS_LOCAL_ENV &&
                console.debug('fetching native token and erc20 token balances');
            if (
                crocEnv &&
                isUserConnected &&
                userAddress &&
                chainId &&
                everyFiveMinutes &&
                (await crocEnv.context).chain.chainId === chainId
            ) {
                try {
                    const combinedBalances: TokenIF[] = [];

                    // fetch wallet balances for tokens in ambient token list
                    const AmbientListWalletBalances: TokenIF[] | undefined =
                        await cachedFetchAmbientListWalletBalances({
                            address: userAddress,
                            chain: chainId,
                            crocEnv: crocEnv,
                            _refreshTime: everyFiveMinutes,
                        });

                    combinedBalances.push(...AmbientListWalletBalances);

                    // fetch exchange balances and wallet balances for tokens in user's exchange balances
                    const dexBalancesFromCache = await cachedFetchDexBalances({
                        address: userAddress,
                        chain: chainId,
                        crocEnv: crocEnv,
                        GCGO_URL: GCGO_URL,
                        _refreshTime: everyFiveMinutes,
                    });

                    if (dexBalancesFromCache !== undefined) {
                        await Promise.all(
                            dexBalancesFromCache.map(
                                async (tokenBalances: IDexTokenBalances) => {
                                    const indexOfExistingToken = (
                                        combinedBalances ?? []
                                    ).findIndex(
                                        (existingToken) =>
                                            existingToken.address.toLowerCase() ===
                                            tokenBalances.tokenAddress.toLowerCase(),
                                    );
                                    const newToken = await expandTokenBalances(
                                        tokenBalances,
                                        tokens.tokenUniv,
                                        cachedTokenDetails,
                                        crocEnv,
                                        chainId,
                                    );

                                    if (indexOfExistingToken === -1) {
                                        const updatedToken = {
                                            ...newToken,
                                        };
                                        combinedBalances.push(updatedToken);
                                    } else {
                                        const existingToken =
                                            combinedBalances[
                                                indexOfExistingToken
                                            ];

                                        const updatedToken = {
                                            ...existingToken,
                                        };

                                        updatedToken.dexBalance =
                                            newToken.dexBalance;

                                        combinedBalances[indexOfExistingToken] =
                                            updatedToken;
                                    }
                                },
                            ),
                        );
                    }

                    const tokensWithLogos = combinedBalances
                        .filter((t) => {
                            // Then check if token is in exclusion list
                            return !hiddenTokens.some(
                                (excluded) =>
                                    excluded.address.toLowerCase() ===
                                        t.address.toLowerCase() &&
                                    excluded.chainId === t.chainId,
                            );
                        })
                        .map((token) => {
                            const oldToken: TokenIF | undefined =
                                tokens.getTokenByAddress(token.address);
                            const newToken = { ...token };

                            newToken.decimals =
                                oldToken?.decimals || newToken?.decimals || 18;
                            newToken.name =
                                oldToken?.name || newToken.name || '';
                            newToken.logoURI =
                                oldToken?.logoURI || newToken.logoURI || '';
                            newToken.symbol =
                                oldToken?.symbol || newToken.symbol || '';
                            return newToken;
                        });
                    setTokenBalances(tokensWithLogos);
                } catch (error) {
                    // setTokenBalances(undefined);
                    console.error({ error });
                }
            }
        })();
    }, [
        crocEnv,
        isUserConnected,
        userAddress,
        chainId,
        everyFiveMinutes,
        GCGO_URL,
        sessionReceipts.length,
    ]);

    const [nativeTokenUsdPrice, setNativeTokenUsdPrice] = useState<
        number | undefined
    >();

    useEffect(() => {
        Promise.resolve(cachedFetchTokenPrice(ZERO_ADDRESS, chainId)).then(
            (response) => {
                setNativeTokenUsdPrice(response?.usdPrice);
            },
        );
    }, [chainId]);

    const [connectedUserXp, setConnectedUserXp] = useState<UserXpDataIF>({
        dataReceived: false,
        data: undefined,
    });

    const [connectedUserBlastXp, setConnectedUserBlastXp] =
        useState<BlastUserXpDataIF>({
            dataReceived: false,
            data: undefined,
        });

    useEffect(() => {
        if (isUserOnline) {
            if (userAddress) {
                fetchUserXpData({
                    user: userAddress,
                    chainId: chainId,
                })
                    .then((data) => {
                        setConnectedUserXp({
                            dataReceived: true,
                            data: data,
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                        setConnectedUserXp({
                            dataReceived: false,
                            data: undefined,
                        });
                    });

                if (isActiveNetworkBlast) {
                    fetchBlastUserXpData({
                        user: userAddress,
                        chainId: chainId,
                    })
                        .then((data) => {
                            setConnectedUserBlastXp({
                                dataReceived: true,
                                data: data,
                            });
                        })
                        .catch((error) => {
                            console.error(error);
                            setConnectedUserBlastXp({
                                dataReceived: false,
                                data: undefined,
                            });
                        });
                }
            } else {
                setConnectedUserXp({
                    dataReceived: false,
                    data: undefined,
                });
                setConnectedUserBlastXp({
                    dataReceived: false,
                    data: undefined,
                });
            }
        }
    }, [isUserOnline, userAddress, isActiveNetworkBlast]);

    const mainnetCrocEnv = useMemo(
        () =>
            mainnetProvider
                ? new CrocEnv(mainnetProvider, undefined)
                : undefined,
        [mainnetProvider !== undefined],
    );

    const scrollCrocEnv = useMemo(
        () =>
            scrollProvider ? new CrocEnv(scrollProvider, undefined) : undefined,
        [scrollProvider !== undefined],
    );

    const swellCrocEnv = useMemo(
        () =>
            swellProvider ? new CrocEnv(swellProvider, undefined) : undefined,
        [swellProvider !== undefined],
    );

    const blastCrocEnv = useMemo(
        () =>
            blastProvider ? new CrocEnv(blastProvider, undefined) : undefined,
        [blastProvider !== undefined],
    );

    useEffect(() => {
        if (
            showDexStats &&
            mainnetCrocEnv !== undefined &&
            scrollCrocEnv !== undefined &&
            swellCrocEnv !== undefined &&
            blastCrocEnv !== undefined &&
            allDefaultTokens.length > 0
        ) {
            let tvlTotalUsd = 0,
                volumeTotalUsd = 0,
                feesTotalUsd = 0;

            const numChainsToAggregate = 4;
            let resultsReceived = 0;

            getChainStats(
                'cumulative',
                '0x1',
                mainnetCrocEnv,
                GCGO_ETHEREUM_URL,
                cachedFetchTokenPrice,
                10,
                allDefaultTokens,
            ).then((dexStats) => {
                if (!dexStats) {
                    return;
                }
                tvlTotalUsd += dexStats.tvlTotalUsd;
                volumeTotalUsd += dexStats.volumeTotalUsd;
                feesTotalUsd += dexStats.feesTotalUsd;

                resultsReceived += 1;

                if (resultsReceived === numChainsToAggregate) {
                    setTotalTvlString(
                        getFormattedNumber({
                            value: tvlTotalUsd,
                            prefix: '$',
                            isTvl: true,
                            mantissa: 1,
                        }),
                    );
                    setTotalVolumeString(
                        getFormattedNumber({
                            value: volumeTotalUsd,
                            prefix: '$',
                            mantissa: 1,
                        }),
                    );
                    setTotalFeesString(
                        getFormattedNumber({
                            value: feesTotalUsd,
                            prefix: '$',
                            mantissa: 1,
                        }),
                    );
                }
            });

            getChainStats(
                'cumulative',
                '0x82750',
                scrollCrocEnv,
                GCGO_SCROLL_URL,
                cachedFetchTokenPrice,
                20,
                allDefaultTokens,
            ).then((dexStats) => {
                if (!dexStats) {
                    return;
                }
                tvlTotalUsd += dexStats.tvlTotalUsd;
                volumeTotalUsd += dexStats.volumeTotalUsd;
                feesTotalUsd += dexStats.feesTotalUsd;
                resultsReceived += 1;

                if (resultsReceived === numChainsToAggregate) {
                    setTotalTvlString(
                        getFormattedNumber({
                            value: tvlTotalUsd,
                            prefix: '$',
                            isTvl: true,
                            mantissa: 1,
                        }),
                    );
                    setTotalVolumeString(
                        getFormattedNumber({
                            value: volumeTotalUsd,
                            prefix: '$',
                            mantissa: 1,
                        }),
                    );
                    setTotalFeesString(
                        getFormattedNumber({
                            value: feesTotalUsd,
                            prefix: '$',
                            mantissa: 1,
                        }),
                    );
                }
            });

            getChainStats(
                'cumulative',
                '0x783',
                swellCrocEnv,
                GCGO_SWELL_URL,
                cachedFetchTokenPrice,
                10,
                allDefaultTokens,
            ).then((dexStats) => {
                if (!dexStats) {
                    return;
                }
                tvlTotalUsd += dexStats.tvlTotalUsd;
                volumeTotalUsd += dexStats.volumeTotalUsd;
                feesTotalUsd += dexStats.feesTotalUsd;
                resultsReceived += 1;
                if (resultsReceived === numChainsToAggregate) {
                    setTotalTvlString(
                        getFormattedNumber({
                            value: tvlTotalUsd,
                            prefix: '$',
                            isTvl: true,
                            mantissa: 1,
                        }),
                    );
                    setTotalVolumeString(
                        getFormattedNumber({
                            value: volumeTotalUsd,
                            prefix: '$',
                            mantissa: 1,
                        }),
                    );
                    setTotalFeesString(
                        getFormattedNumber({
                            value: feesTotalUsd,
                            prefix: '$',
                            mantissa: 1,
                        }),
                    );
                }
            });

            getChainStats(
                'cumulative',
                '0x13e31',
                blastCrocEnv,
                GCGO_BLAST_URL,
                cachedFetchTokenPrice,
                10,
                allDefaultTokens,
            ).then((dexStats) => {
                if (!dexStats) {
                    return;
                }
                tvlTotalUsd += dexStats.tvlTotalUsd;
                volumeTotalUsd += dexStats.volumeTotalUsd;
                feesTotalUsd += dexStats.feesTotalUsd;
                resultsReceived += 1;
                if (resultsReceived === numChainsToAggregate) {
                    setTotalTvlString(
                        getFormattedNumber({
                            value: tvlTotalUsd,
                            prefix: '$',
                            isTvl: true,
                            mantissa: 1,
                        }),
                    );
                    setTotalVolumeString(
                        getFormattedNumber({
                            value: volumeTotalUsd,
                            prefix: '$',
                            mantissa: 1,
                        }),
                    );
                    setTotalFeesString(
                        getFormattedNumber({
                            value: feesTotalUsd,
                            prefix: '$',
                            mantissa: 1,
                        }),
                    );
                }
            });
        }
    }, [
        showDexStats,
        mainnetCrocEnv !== undefined &&
            scrollCrocEnv !== undefined &&
            blastCrocEnv !== undefined &&
            allDefaultTokens.length > 0,
    ]);

    const chainDataContext = {
        lastBlockNumber,
        setLastBlockNumber,
        rpcNodeStatus,
        gasPriceInGwei,
        connectedUserXp,
        connectedUserBlastXp,
        setGasPriceinGwei,
        isActiveNetworkBlast,
        isActiveNetworkPlume,
        isActiveNetworkSwell,
        isActiveNetworkBase,
        isActiveNetworkScroll,
        isActiveNetworkMainnet,
        isVaultSupportedOnNetwork,
        isActiveNetworkL2,
        allPoolStats,
        nativeTokenUsdPrice,
        allVaultsData,
        setAllVaultsData,
        totalTvlString,
        totalVolumeString,
        totalFeesString,
    };

    return (
        <ChainDataContext.Provider value={chainDataContext}>
            {props.children}
        </ChainDataContext.Provider>
    );
};
