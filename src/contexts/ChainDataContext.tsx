import React, {
    createContext,
    SetStateAction,
    Dispatch,
    useEffect,
    useMemo,
    useState,
    useContext,
} from 'react';
import useWebSocket from 'react-use-websocket';
import { useAccount } from 'wagmi';
import {
    IS_LOCAL_ENV,
    SHOULD_NON_CANDLE_SUBSCRIPTIONS_RECONNECT,
} from '../constants';
import isJsonString from '../utils/functions/isJsonString';
import { useAppDispatch } from '../utils/hooks/reduxToolkit';
import { TokenIF } from '../utils/interfaces/TokenIF';
import { setLastBlock } from '../utils/state/graphDataSlice';
import { setNativeToken, setErc20Tokens } from '../utils/state/userDataSlice';
import { CachedDataContext } from './CachedDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TokenContext } from './TokenContext';
import { Client } from '@covalenthq/client-sdk';

interface ChainDataContextIF {
    gasPriceInGwei: number | undefined;
    setGasPriceinGwei: Dispatch<SetStateAction<number | undefined>>;
    lastBlockNumber: number;
    setLastBlockNumber: Dispatch<SetStateAction<number>>;
}

export const ChainDataContext = createContext<ChainDataContextIF>(
    {} as ChainDataContextIF,
);

export const ChainDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const {
        cachedFetchErc20TokenBalances,
        cachedFetchNativeTokenBalance,
        cachedTokenDetails,
    } = useContext(CachedDataContext);
    const { chainData, crocEnv } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);

    const client = new Client(process.env.REACT_APP_COVALENT_API_KEY || '');

    const dispatch = useAppDispatch();
    const { address: userAddress, isConnected } = useAccount();

    const [lastBlockNumber, setLastBlockNumber] = useState<number>(0);
    const [gasPriceInGwei, setGasPriceinGwei] = useState<number | undefined>();

    const chainDataContext = {
        lastBlockNumber,
        setLastBlockNumber,
        gasPriceInGwei,
        setGasPriceinGwei,
    };

    async function pollBlockNum(): Promise<void> {
        // if default RPC is Infura, use key from env variable
        const nodeUrl =
            chainData.nodeUrl.toLowerCase().includes('infura') &&
            process.env.REACT_APP_INFURA_KEY
                ? chainData.nodeUrl.slice(0, -32) +
                  process.env.REACT_APP_INFURA_KEY
                : chainData.nodeUrl;

        return fetch(nodeUrl, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 'app-blockNum-sub', // Arbitary string (see JSON-RPC spec)
            }),
        })
            .then((response) => response?.json())
            .then((json) => json?.result)
            .then(parseInt)
            .then((blockNum) => {
                if (blockNum > lastBlockNumber) {
                    setLastBlockNumber(blockNum);
                    dispatch(setLastBlock(blockNum));
                }
            })
            .catch(console.error);
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
                        dispatch(setLastBlock(parseInt(lastBlockNumberHex)));
                    }
                }
            }
        }
    }, [lastNewHeadMessage]);

    useEffect(() => {
        fetch(
            'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=KNJM7A9ST1Q1EESYXPPQITIP7I8EFSY456',
        )
            .then((response) => response.json())
            .then((response) => {
                if (response.result.ProposeGasPrice) {
                    const newGasPrice = parseInt(
                        response.result.ProposeGasPrice,
                    );
                    if (gasPriceInGwei !== newGasPrice) {
                        setGasPriceinGwei(newGasPrice);
                    }
                }
            })
            .catch(console.error);
    }, [lastBlockNumber]);

    // prevents useEffect below from triggering every block update
    const everyEigthBlock = useMemo(
        () => Math.floor(lastBlockNumber / 8),
        [lastBlockNumber],
    );
    useEffect(() => {
        (async () => {
            IS_LOCAL_ENV &&
                console.debug('fetching native token and erc20 token balances');
            if (crocEnv && isConnected && userAddress && chainData.chainId) {
                try {
                    const newNativeToken: TokenIF =
                        await cachedFetchNativeTokenBalance(
                            userAddress,
                            chainData.chainId,
                            everyEigthBlock,
                            crocEnv,
                        );

                    dispatch(setNativeToken(newNativeToken));
                } catch (error) {
                    console.error({ error });
                }
                try {
                    const erc20Results: TokenIF[] =
                        await cachedFetchErc20TokenBalances(
                            userAddress,
                            chainData.chainId,
                            everyEigthBlock,
                            cachedTokenDetails,
                            crocEnv,
                            client,
                        );
                    const erc20TokensWithLogos = erc20Results.map((token) => {
                        const oldToken: TokenIF | undefined =
                            tokens.getTokenByAddress(token.address);
                        const newToken = { ...token };
                        newToken.name = oldToken ? oldToken.name : '';
                        newToken.logoURI = oldToken ? oldToken.logoURI : '';
                        return newToken;
                    });

                    dispatch(setErc20Tokens(erc20TokensWithLogos));
                } catch (error) {
                    console.error({ error });
                }
            }
        })();
    }, [crocEnv, isConnected, userAddress, chainData.chainId, everyEigthBlock]);

    return (
        <ChainDataContext.Provider value={chainDataContext}>
            {props.children}
        </ChainDataContext.Provider>
    );
};
