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
import { Client } from '@covalenthq/client-sdk';
import { UserDataContext } from './UserDataContext';
import {
    NftTokenContractBalanceItemIF,
    TokenBalanceContext,
} from './TokenBalanceContext';
import { fetchBlockNumber } from '../ambient-utils/api';
import { fetchNFT } from '../ambient-utils/api/fetchNft';

interface ChainDataContextIF {
    gasPriceInGwei: number | undefined;
    setGasPriceinGwei: Dispatch<SetStateAction<number | undefined>>;
    lastBlockNumber: number;
    setLastBlockNumber: Dispatch<SetStateAction<number>>;
    client: Client;
}

export const ChainDataContext = createContext<ChainDataContextIF>(
    {} as ChainDataContextIF,
);

export const ChainDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const { setTokenBalances, setNFTData } = useContext(TokenBalanceContext);

    const { chainData, activeNetwork, crocEnv, provider } =
        useContext(CrocEnvContext);
    const { cachedFetchTokenBalances, cachedTokenDetails, cachedFetchNFT } =
        useContext(CachedDataContext);
    const { tokens } = useContext(TokenContext);

    const client = new Client('cqt_rQdWPMQV7YGRkVfmvTd7FFRBXHR4');

    const { userAddress, isUserConnected } = useContext(UserDataContext);

    const [lastBlockNumber, setLastBlockNumber] = useState<number>(0);
    const [gasPriceInGwei, setGasPriceinGwei] = useState<number | undefined>();

    async function pollBlockNum(): Promise<void> {
        // if default RPC is Infura, use key from env variable
        const nodeUrl =
            chainData.nodeUrl.toLowerCase().includes('infura') &&
            process.env.REACT_APP_INFURA_KEY
                ? chainData.nodeUrl.slice(0, -32) +
                  process.env.REACT_APP_INFURA_KEY
                : chainData.nodeUrl;
        try {
            const lastBlockNumber = await fetchBlockNumber(nodeUrl);
            if (lastBlockNumber > 0) setLastBlockNumber(lastBlockNumber);
        } catch (error) {
            console.error({ error });
        }
    }

    const BLOCK_NUM_POLL_MS = 2000;
    useEffect(() => {
        (async () => {
            await pollBlockNum();
            // Don't use polling, useWebSocket (below)
            if (chainData.wsUrl) {
                return;
            }
            // Grab block right away, then poll on periodic basis

            const interval = setInterval(async () => {
                await pollBlockNum();
            }, BLOCK_NUM_POLL_MS);
            return () => clearInterval(interval);
        })();
    }, [chainData.nodeUrl, BLOCK_NUM_POLL_MS]);
    /* This will not work with RPCs that don't support web socket subscriptions. In
     * particular Infura does not support websockets on Arbitrum endpoints. */
    const { sendMessage: sendBlockHeaderSub, lastMessage: lastNewHeadMessage } =
        useWebSocket(chainData.wsUrl || null, {
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

    useEffect(() => {
        fetchGasPrice();
    }, [lastBlockNumber]);

    // used to trigger token balance refreshes every 5 minutes
    const everyFiveMinutes = Math.floor(Date.now() / 300000);

    useEffect(() => {
        (async () => {
            if (
                crocEnv &&
                isUserConnected &&
                userAddress &&
                chainData.chainId &&
                client
            ) {
                try {
                    const NFTData = await cachedFetchNFT(
                        // cachedFetchNFT(
                        '0x8e42AEcF40b5cC4c25fFA74E352b3840759aefa2',
                        chainData.chainId,
                        crocEnv,
                        client,
                    );

                    const parsedNftData: NftTokenContractBalanceItemIF[] = [];

                    NFTData.forEach((element: any) => {
                        const item = {
                            balance: element.balance,
                            balance24h: element.balance_24h,
                            contractAddress: element.contract_address,
                            contractName: element.contract_name,
                            contractTickerSymbol:
                                element.contract_ticker_symbol,
                            isSpam: element.is_spam,
                            lastTransferedAt: element.last_transfered_at,
                            nftData: element.nft_data,
                            supportsErc: element.supports_erc,
                            type: element.type,
                        };

                        parsedNftData.push(item);
                    });

                    setNFTData(parsedNftData);
                } catch (error) {
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
        client !== undefined,
        activeNetwork.graphCacheUrl,
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
                client
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
                            client,
                        );
                    const tokensWithLogos = tokenBalances.map((token) => {
                        const oldToken: TokenIF | undefined =
                            tokens.getTokenByAddress(token.address);
                        const newToken = { ...token };
                        newToken.name = oldToken ? oldToken.name : '';
                        newToken.logoURI = oldToken ? oldToken.logoURI : '';
                        return newToken;
                    });

                    setTokenBalances(tokensWithLogos);
                } catch (error) {
                    setTokenBalances([]);
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
        client !== undefined,
        activeNetwork.graphCacheUrl,
    ]);

    const chainDataContext = {
        lastBlockNumber,
        setLastBlockNumber,
        gasPriceInGwei,
        setGasPriceinGwei,
        client,
    };

    return (
        <ChainDataContext.Provider value={chainDataContext}>
            {props.children}
        </ChainDataContext.Provider>
    );
};
