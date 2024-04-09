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
    IS_LOCAL_ENV,
    SHOULD_NON_CANDLE_SUBSCRIPTIONS_RECONNECT,
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
import { TokenBalanceContext } from './TokenBalanceContext';
import { fetchBlastUserXpData, fetchUserXpData } from '../ambient-utils/api';
import { AppStateContext } from './AppStateContext';
import { usePublicClient } from 'wagmi';
import { hexToNumber } from 'viem';

interface ChainDataContextIF {
    gasPriceInGwei: number | undefined;
    setGasPriceinGwei: Dispatch<SetStateAction<number | undefined>>;
    lastBlockNumber: number;
    setLastBlockNumber: Dispatch<SetStateAction<number>>;
    connectedUserXp: UserXpDataIF;
    connectedUserBlastXp: BlastUserXpDataIF;
    isActiveNetworkBlast: boolean;
    isActiveNetworkScroll: boolean;
    isActiveNetworkMainnet: boolean;
    isActiveNetworkL2: boolean;
}

export const ChainDataContext = createContext<ChainDataContextIF>(
    {} as ChainDataContextIF,
);

export const ChainDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const { isUserIdle } = useContext(AppStateContext);
    const { setTokenBalances } = useContext(TokenBalanceContext);

    const { chainData, activeNetwork, crocEnv, provider } =
        useContext(CrocEnvContext);
    const { cachedFetchTokenBalances, cachedTokenDetails } =
        useContext(CachedDataContext);
    const { tokens } = useContext(TokenContext);

    const { userAddress, isUserConnected } = useContext(UserDataContext);

    const [lastBlockNumber, setLastBlockNumber] = useState<number>(0);
    const [gasPriceInGwei, setGasPriceinGwei] = useState<number | undefined>();

    const isActiveNetworkBlast = ['0x13e31', '0xa0c71fd'].includes(
        chainData.chainId,
    );

    const isActiveNetworkScroll = ['0x82750', '0x8274f'].includes(
        chainData.chainId,
    );
    const isActiveNetworkMainnet = ['0x1'].includes(chainData.chainId);

    // array of network IDs for supported L2 networks
    const L2_NETWORKS: string[] = [
        '0x13e31',
        '0xa0c71fd',
        '0x82750',
        '0x8274f',
    ];

    // boolean representing whether the active network is an L2
    const isActiveNetworkL2: boolean = L2_NETWORKS.includes(chainData.chainId);

    const BLOCK_NUM_POLL_MS = isUserIdle ? 15000 : 5000; // poll for new block every 15 seconds when user is idle, every 5 seconds when user is active

    const publicClient = usePublicClient({
        chainId: hexToNumber(chainData.chainId),
    });

    async function pollBlockNum(): Promise<void> {
        try {
            const lastBlockNumber = await publicClient?.getBlockNumber();
            if (lastBlockNumber && lastBlockNumber > 0)
                setLastBlockNumber(Number(lastBlockNumber));
        } catch (error) {
            console.error({ error });
        }
    }

    useEffect(() => {
        // Grab block right away, then poll on periodic basis; useful for initial load
        pollBlockNum();

        // Don't use polling, use WebSocket (below) if available
        if (chainData.wsUrl) {
            return;
        }

        const interval = setInterval(async () => {
            pollBlockNum();
        }, BLOCK_NUM_POLL_MS);
        return () => clearInterval(interval);
    }, [chainData.chainId, BLOCK_NUM_POLL_MS]);
    /* This will not work with RPCs that don't support web socket subscriptions. In
     * particular Infura does not support websockets on Arbitrum endpoints. */

    const wsUrl =
        chainData.wsUrl?.toLowerCase().includes('infura') &&
        process.env.REACT_APP_INFURA_KEY
            ? chainData.wsUrl.slice(0, -32) + process.env.REACT_APP_INFURA_KEY
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
        const newGasPrice = await supportedNetworks[
            chainData.chainId
        ].getGasPriceInGwei(provider);
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
        (async () => {
            IS_LOCAL_ENV &&
                console.debug('fetching native token and erc20 token balances');
            if (
                crocEnv &&
                isUserConnected &&
                userAddress &&
                chainData.chainId
            ) {
                try {
                    const tokenBalances: TokenIF[] =
                        await cachedFetchTokenBalances(
                            userAddress,
                            chainData.chainId,
                            everyFiveMinutes,
                            cachedTokenDetails,
                            crocEnv,
                            activeNetwork.graphCacheUrl,
                            tokens.tokenUniv,
                        );
                    const tokensWithLogos = tokenBalances.map((token) => {
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
    ]);

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
        gasPriceInGwei,
        connectedUserXp,
        connectedUserBlastXp,
        setGasPriceinGwei,
        isActiveNetworkBlast,
        isActiveNetworkScroll,
        isActiveNetworkMainnet,
        isActiveNetworkL2,
    };

    return (
        <ChainDataContext.Provider value={chainDataContext}>
            {props.children}
        </ChainDataContext.Provider>
    );
};
