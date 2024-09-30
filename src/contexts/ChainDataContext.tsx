import React, {
    createContext,
    SetStateAction,
    Dispatch,
    useEffect,
    useState,
    useContext,
} from 'react';
import useWebSocket from 'react-use-websocket';
import {
    ALCHEMY_API_KEY,
    BLOCK_POLLING_RPC_URL,
    IS_LOCAL_ENV,
    MAINNET_RPC_URL,
    SCROLL_RPC_URL,
    SEPOLIA_RPC_URL,
    SHOULD_NON_CANDLE_SUBSCRIPTIONS_RECONNECT,
    ZERO_ADDRESS,
    supportedNetworks,
} from '../ambient-utils/constants';
import { isJsonString } from '../ambient-utils/dataLayer';
import { TokenIF } from '../ambient-utils/types';
import { CachedDataContext } from './CachedDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TokenContext } from './TokenContext';
import {
    BlastUserXpDataIF,
    UserDataContext,
    UserXpDataIF,
} from './UserDataContext';
import {
    NftDataIF,
    NftListByChain,
    TokenBalanceContext,
} from './TokenBalanceContext';
import {
    expandTokenBalances,
    fetchBlastUserXpData,
    fetchBlockNumber,
    fetchUserXpData,
    RpcNodeStatus,
    IDexTokenBalances,
} from '../ambient-utils/api';
import { BLAST_RPC_URL } from '../ambient-utils/constants/networks/blastNetwork';
import { AppStateContext } from './AppStateContext';
import moment from 'moment';
import { Network, Alchemy } from 'alchemy-sdk';
import { fetchNFT } from '../ambient-utils/api/fetchNft';
import { ReceiptContext } from './ReceiptContext';

interface ChainDataContextIF {
    gasPriceInGwei: number | undefined;
    setGasPriceinGwei: Dispatch<SetStateAction<number | undefined>>;
    lastBlockNumber: number;
    setLastBlockNumber: Dispatch<SetStateAction<number>>;
    rpcNodeStatus: RpcNodeStatus;
    connectedUserXp: UserXpDataIF;
    connectedUserBlastXp: BlastUserXpDataIF;
    isActiveNetworkBlast: boolean;
    isActiveNetworkScroll: boolean;
    isActiveNetworkMainnet: boolean;
    isActiveNetworkL2: boolean;
    nativeTokenUsdPrice: number | undefined;
}

export const ChainDataContext = createContext<ChainDataContextIF>(
    {} as ChainDataContextIF,
);

export const ChainDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const { isUserIdle } = useContext(AppStateContext);
    const {
        setTokenBalances,
        setNFTData,
        NFTFetchSettings,
        setNFTFetchSettings,
    } = useContext(TokenBalanceContext);

    const { sessionReceipts } = useContext(ReceiptContext);

    const { chainData, activeNetwork, crocEnv, provider } =
        useContext(CrocEnvContext);
    const {
        cachedFetchAmbientListWalletBalances,
        cachedFetchDexBalances,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedFetchNFT,
    } = useContext(CachedDataContext);
    const { tokens } = useContext(TokenContext);

    const {
        userAddress,
        isUserConnected,
        setIsfetchNftTriggered,
        isfetchNftTriggered,
        nftTestWalletAddress,
        setNftTestWalletAddress,
    } = useContext(UserDataContext);

    const [lastBlockNumber, setLastBlockNumber] = useState<number>(0);

    const [rpcNodeStatus, setRpcNodeStatus] =
        useState<RpcNodeStatus>('unknown');
    const [gasPriceInGwei, setGasPriceinGwei] = useState<number | undefined>();

    const isActiveNetworkBlast = ['0x13e31', '0xa0c71fd'].includes(
        chainData.chainId,
    );

    const isActiveNetworkScroll = ['0x82750', '0x8274f'].includes(
        chainData.chainId,
    );
    const isActiveNetworkMainnet = ['0x1'].includes(chainData.chainId);

    const blockPollingUrl = BLOCK_POLLING_RPC_URL
        ? BLOCK_POLLING_RPC_URL
        : chainData.nodeUrl;

    // array of network IDs for supported L2 networks
    const L2_NETWORKS: string[] = [
        '0x13e31',
        '0xa0c71fd',
        '0x82750',
        '0x8274f',
    ];

    const settings = {
        apiKey: ALCHEMY_API_KEY,
        network: Network.ETH_MAINNET,
    };

    const alchemyClient = new Alchemy(settings);

    // boolean representing whether the active network is an L2
    const isActiveNetworkL2: boolean = L2_NETWORKS.includes(chainData.chainId);

    const BLOCK_NUM_POLL_MS = isUserIdle ? 30000 : 5000; // poll for new block every 30 seconds when user is idle, every 5 seconds when user is active

    async function pollBlockNum(): Promise<void> {
        const nodeUrl = ['0x1'].includes(chainData.chainId)
            ? MAINNET_RPC_URL
            : ['0xaa36a7'].includes(chainData.chainId)
              ? SEPOLIA_RPC_URL
              : ['0x13e31'].includes(chainData.chainId) // use blast env variable for blast network
                ? BLAST_RPC_URL
                : ['0x82750'].includes(chainData.chainId) // use scroll env variable for scroll network
                  ? SCROLL_RPC_URL
                  : blockPollingUrl;
        // const nodeUrl =
        //     chainData.nodeUrl.toLowerCase().includes('infura') &&
        //     import.meta.env.VITE_INFURA_KEY
        //         ? chainData.nodeUrl.slice(0, -32) +
        //           import.meta.env.VITE_INFURA_KEY
        //         : ['0x13e31'].includes(chainData.chainId) // use blast env variable for blast network
        //           ? BLAST_RPC_URL
        //           : ['0x82750'].includes(chainData.chainId) // use scroll env variable for scroll network
        //             ? SCROLL_RPC_URL
        //             : blockPollingUrl;
        try {
            const lastBlockNumber = await fetchBlockNumber(nodeUrl);
            // const lastBlockNumber = await fetchBlockNumber(
            //     'http://scroll-sepolia-rpc.01no.de:8545',
            // );
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
        // Grab block right away, then poll on periodic basis; useful for initial load
        pollBlockNum();

        // Don't use polling, use WebSocket (below) if available
        if (chainData.wsUrl) {
            return;
        }

        const interval = setInterval(() => {
            pollBlockNum();
        }, BLOCK_NUM_POLL_MS);

        // Clean up the interval when the component unmounts or when dependencies change
        return () => clearInterval(interval);
    }, [chainData.chainId, BLOCK_NUM_POLL_MS]);

    /* This will not work with RPCs that don't support web socket subscriptions. In
     * particular Infura does not support websockets on Arbitrum endpoints. */

    const wsUrl =
        chainData.wsUrl?.toLowerCase().includes('infura') &&
        import.meta.env.VITE_INFURA_KEY
            ? chainData.wsUrl.slice(0, -32) + import.meta.env.VITE_INFURA_KEY
            : chainData.wsUrl;

    const { sendMessage: sendBlockHeaderSub, lastMessage: lastNewHeadMessage } =
        useWebSocket(wsUrl || null, {
            onOpen: () => {
                sendBlockHeaderSub(
                    '{"jsonrpc":"2.0","method":"eth_subscribe","params":["newHeads"],"id":5}',
                );
            },
            onClose: (event: CloseEvent) => {
                if (IS_LOCAL_ENV) {
                    false &&
                        console.debug('infura newHeads subscription closed');
                    false && console.debug({ event });
                }
            },
            shouldReconnect: () => SHOULD_NON_CANDLE_SUBSCRIPTIONS_RECONNECT,
        });
    useEffect(() => {
        if (lastNewHeadMessage && lastNewHeadMessage.data) {
            if (!isJsonString(lastNewHeadMessage.data)) return;
            const lastMessageData = JSON.parse(lastNewHeadMessage.data);
            if (lastMessageData) {
                const lastBlockNumberHex =
                    lastMessageData.params?.result?.number;
                if (lastBlockNumberHex) {
                    const newBlockNum = parseInt(lastBlockNumberHex);
                    if (lastBlockNumber !== newBlockNum) {
                        setLastBlockNumber(parseInt(lastBlockNumberHex));
                    }
                }
            }
        }
    }, [lastNewHeadMessage]);

    const fetchGasPrice = async () => {
        const newGasPrice =
            await supportedNetworks[chainData.chainId].getGasPriceInGwei(
                provider,
            );
        if (gasPriceInGwei !== newGasPrice) {
            setGasPriceinGwei(newGasPrice);
        }
    };

    const gasPricePollingCacheTime = Math.floor(
        Date.now() / (isUserIdle ? 60000 : 10000),
    ); // poll for new gas price every 60 seconds when user is idle, every 10 seconds when user is active

    useEffect(() => {
        fetchGasPrice();
    }, [gasPricePollingCacheTime]);

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
            isfetchNftTriggered ||
            !nftLocalData ||
            isOverTimeLimit ||
            (localNftDataParsed && !localNftDataParsed.has(actionKey))
        ) {
            (async () => {
                if (
                    crocEnv &&
                    isUserConnected &&
                    userAddress &&
                    chainData.chainId &&
                    alchemyClient
                ) {
                    try {
                        const fetchFunction = isfetchNftTriggered
                            ? fetchNFT
                            : cachedFetchNFT;

                        const NFTResponse = await fetchFunction(
                            nftTestWalletAddress !== ''
                                ? nftTestWalletAddress
                                : userAddress,
                            crocEnv,
                            alchemyClient,
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
                                chainId: chainData.chainId,
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
        crocEnv,
        isUserConnected,
        userAddress,
        chainData.chainId,
        // everyFiveMinutes,
        alchemyClient !== undefined,
        activeNetwork.graphCacheUrl,
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
                chainData.chainId &&
                lastBlockNumber
            ) {
                try {
                    const combinedBalances: TokenIF[] = [];

                    // fetch wallet balances for tokens in ambient token list
                    const AmbientListWalletBalances: TokenIF[] | undefined =
                        await cachedFetchAmbientListWalletBalances({
                            address: userAddress,
                            chain: chainData.chainId,
                            crocEnv: crocEnv,
                            _refreshTime: lastBlockNumber,
                        });

                    combinedBalances.push(...AmbientListWalletBalances);

                    // fetch exchange balances and wallet balances for tokens in user's exchange balances
                    const dexBalancesFromCache = await cachedFetchDexBalances({
                        address: userAddress,
                        chain: chainData.chainId,
                        crocEnv: crocEnv,
                        graphCacheUrl: activeNetwork.graphCacheUrl,
                        _refreshTime: lastBlockNumber,
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
                                        chainData.chainId,
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

                    const tokensWithLogos = combinedBalances.map((token) => {
                        const oldToken: TokenIF | undefined =
                            tokens.getTokenByAddress(token.address);
                        const newToken = { ...token };

                        newToken.decimals =
                            oldToken?.decimals || newToken?.decimals || 18;
                        newToken.name = oldToken?.name || newToken.name || '';
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
        chainData.chainId,
        everyFiveMinutes,
        activeNetwork.graphCacheUrl,
        sessionReceipts.length,
    ]);

    const [nativeTokenUsdPrice, setNativeTokenUsdPrice] = useState<
        number | undefined
    >();

    useEffect(() => {
        if (!crocEnv) return;
        Promise.resolve(
            cachedFetchTokenPrice(ZERO_ADDRESS, chainData.chainId, crocEnv),
        ).then((price) => {
            if (price?.usdPrice !== undefined) {
                setNativeTokenUsdPrice(price.usdPrice);
            } else {
                setNativeTokenUsdPrice(undefined);
            }
        });
    }, [crocEnv, chainData.chainId]);

    const [connectedUserXp, setConnectedUserXp] = React.useState<UserXpDataIF>({
        dataReceived: false,
        data: undefined,
    });

    const [connectedUserBlastXp, setConnectedUserBlastXp] =
        React.useState<BlastUserXpDataIF>({
            dataReceived: false,
            data: undefined,
        });

    React.useEffect(() => {
        if (userAddress) {
            fetchUserXpData({
                user: userAddress,
                chainId: chainData.chainId,
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
                    chainId: chainData.chainId,
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
    }, [userAddress, isActiveNetworkBlast]);

    const chainDataContext = {
        lastBlockNumber,
        setLastBlockNumber,
        rpcNodeStatus,
        gasPriceInGwei,
        connectedUserXp,
        connectedUserBlastXp,
        setGasPriceinGwei,
        isActiveNetworkBlast,
        isActiveNetworkScroll,
        isActiveNetworkMainnet,
        isActiveNetworkL2,
        nativeTokenUsdPrice,
    };

    return (
        <ChainDataContext.Provider value={chainDataContext}>
            {props.children}
        </ChainDataContext.Provider>
    );
};
