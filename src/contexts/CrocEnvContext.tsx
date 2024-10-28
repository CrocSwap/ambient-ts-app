import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useWeb3ModalProvider } from '@web3modal/ethers/react';
import { useBlacklist } from '../App/hooks/useBlacklist';
import { useTopPools } from '../App/hooks/useTopPools';
import { CachedDataContext } from './CachedDataContext';
import { Provider, ethers } from 'ethers';
import { BatchedJsonRpcProvider } from '../utils/batchedProvider';
import {
    limitParamsIF,
    linkGenMethodsIF,
    poolParamsIF,
    swapParamsIF,
    useLinkGen,
} from '../utils/hooks/useLinkGen';
import { NetworkIF, PoolIF, TokenIF } from '../ambient-utils/types';
import {
    APP_ENVIRONMENT,
    ethereumMainnet,
    mainnetETH,
    getDefaultPairForChain,
    BLAST_RPC_URL,
    MAINNET_RPC_URL,
    SEPOLIA_RPC_URL,
    SCROLL_RPC_URL,
} from '../ambient-utils/constants';
import { UserDataContext } from './UserDataContext';
import { TradeDataContext } from './TradeDataContext';
import { translateTokenSymbol } from '../ambient-utils/dataLayer';
import { TokenContext } from './TokenContext';

interface UrlRoutesTemplate {
    swap: string;
    market: string;
    limit: string;
    pool: string;
}

export interface CrocEnvContextIF {
    crocEnv: CrocEnv | undefined;
    setCrocEnv: (val: CrocEnv | undefined) => void;
    selectedNetwork: NetworkIF;
    chainData: ChainSpec;
    topPools: PoolIF[];
    ethMainnetUsdPrice: number | undefined;
    defaultUrlParams: UrlRoutesTemplate;
    provider: Provider;
    activeNetwork: NetworkIF;
    chooseNetwork: (network: NetworkIF) => void;
    mainnetProvider: Provider | undefined;
    scrollProvider: Provider | undefined;
    blastProvider: Provider | undefined;
}

export const CrocEnvContext = createContext<CrocEnvContextIF>(
    {} as CrocEnvContextIF,
);
const mainnetProvider = new BatchedJsonRpcProvider(MAINNET_RPC_URL, 1, {
    staticNetwork: true,
});

const scrollProvider = new BatchedJsonRpcProvider(SCROLL_RPC_URL, 534352, {
    staticNetwork: true,
});
const blastProvider = new BatchedJsonRpcProvider(BLAST_RPC_URL, 81457, {
    staticNetwork: true,
});
const sepoliaProvider = new BatchedJsonRpcProvider(SEPOLIA_RPC_URL, 11155111, {
    staticNetwork: true,
});

export const CrocEnvContextProvider = (props: { children: ReactNode }) => {
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);
    const { chainData, activeNetwork, chooseNetwork } =
        useContext(TradeDataContext);

    const { userAddress, walletChain } = useContext(UserDataContext);
    const { walletProvider } = useWeb3ModalProvider();
    const [crocEnv, setCrocEnv] = useState<CrocEnv | undefined>();
    const { tokens } = useContext(TokenContext);

    const topPools: PoolIF[] = useTopPools(chainData.chainId);
    const [ethMainnetUsdPrice, setEthMainnetUsdPrice] = useState<
        number | undefined
    >();

    // hooks to generate default URL paths
    const linkGenSwap: linkGenMethodsIF = useLinkGen('swap');
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    function createDefaultUrlParams(chainId: string): UrlRoutesTemplate {
        const [dfltTokenA, dfltTokenB]: [TokenIF, TokenIF] =
            getDefaultPairForChain(chainData.chainId);

        const savedTokenASymbol: string | null = localStorage.getItem('tokenA');
        const savedTokenBSymbol: string | null = localStorage.getItem('tokenB');

        const tokensMatchingA: TokenIF[] =
            savedTokenASymbol === 'ETH'
                ? [dfltTokenA]
                : tokens.getTokensByNameOrSymbol(savedTokenASymbol || '', true);
        const tokensMatchingB: TokenIF[] =
            savedTokenBSymbol === 'ETH'
                ? [dfltTokenA]
                : tokens.getTokensByNameOrSymbol(savedTokenBSymbol || '', true);

        const firstTokenMatchingA = tokensMatchingA[0] || undefined;
        const firstTokenMatchingB = tokensMatchingB[0] || undefined;

        const isSavedTokenADefaultB = savedTokenASymbol
            ? translateTokenSymbol(savedTokenASymbol) ===
              translateTokenSymbol(dfltTokenB.symbol)
            : false;

        const isSavedTokenBDefaultA = savedTokenBSymbol
            ? translateTokenSymbol(savedTokenBSymbol) ===
              translateTokenSymbol(dfltTokenA.symbol)
            : false;

        const shouldReverseDefaultTokens =
            isSavedTokenADefaultB || isSavedTokenBDefaultA;

        // default URL params for swap and market modules
        // decision tree exists to preferentially consume most recent
        // ... token pair rather than the hardcoded default
        const swapParams: swapParamsIF = {
            chain: chainId,
            tokenA: firstTokenMatchingA
                ? firstTokenMatchingA.address
                : shouldReverseDefaultTokens
                  ? dfltTokenB.address
                  : dfltTokenA.address,
            tokenB: firstTokenMatchingB
                ? firstTokenMatchingB.address
                : shouldReverseDefaultTokens
                  ? dfltTokenA.address
                  : dfltTokenB.address,
        };

        // default URL params for the limit module
        const limitParams: limitParamsIF = {
            ...swapParams,
        };

        // default URL params for the pool module
        const poolParams: poolParamsIF = {
            ...swapParams,
        };

        return {
            swap: linkGenSwap.getFullURL(swapParams),
            market: linkGenMarket.getFullURL(swapParams),
            limit: linkGenLimit.getFullURL(limitParams),
            pool: linkGenPool.getFullURL(poolParams),
        };
    }

    const initUrl = createDefaultUrlParams(chainData.chainId);
    const [defaultUrlParams, setDefaultUrlParams] =
        useState<UrlRoutesTemplate>(initUrl);

    const nodeUrl = ['0x1'].includes(chainData.chainId)
        ? MAINNET_RPC_URL
        : ['0x13e31'].includes(chainData.chainId) // use blast env variable for blast network
          ? BLAST_RPC_URL
          : ['0x82750'].includes(chainData.chainId) // use scroll env variable for scroll network
            ? SCROLL_RPC_URL
            : chainData.nodeUrl;

    const provider = useMemo(
        () =>
            chainData.chainId === '0x1'
                ? mainnetProvider
                : chainData.chainId === '0x82750'
                  ? scrollProvider
                  : chainData.chainId === '0x13e31'
                    ? blastProvider
                    : chainData.chainId === '0xaa36a7'
                      ? sepoliaProvider
                      : new BatchedJsonRpcProvider(
                            nodeUrl,
                            parseInt(chainData.chainId),
                            { staticNetwork: true },
                        ),
        [chainData.chainId],
    );

    useBlacklist(userAddress);

    const setNewCrocEnv = async () => {
        let signer = undefined;
        if (walletProvider) {
            const w3provider = new ethers.BrowserProvider(walletProvider);
            signer = await w3provider.getSigner();
        }
        if (APP_ENVIRONMENT === 'local') {
            console.debug({ provider });
            console.debug({ signer });
            console.debug({ crocEnv });
        }
        if (!provider && !signer) {
            APP_ENVIRONMENT === 'local' &&
                console.debug('setting crocEnv to undefined');
            setCrocEnv(undefined);
            return;
        } else if (!signer && !!crocEnv) {
            APP_ENVIRONMENT === 'local' && console.debug('keeping provider');
            return;
        } else if (provider && !crocEnv) {
            const newCrocEnv = new CrocEnv(
                provider,
                signer ? signer : undefined,
            );
            setCrocEnv(newCrocEnv);
        } else {
            // If signer and provider are set to different chains (as can happen)
            // after a network switch, it causes a lot of performance killing timeouts
            // and errors
            if (
                (await signer?.provider?.getNetwork())?.chainId ==
                (await provider.getNetwork()).chainId
            ) {
                const newCrocEnv = new CrocEnv(provider, signer);
                APP_ENVIRONMENT === 'local' && console.debug({ newCrocEnv });
                setCrocEnv(newCrocEnv);
            } else if (signer) {
                // Since this is a weird case, it's best not to rush things - maybe this happens
                // during the short moment while the network is switching already, idk.
                await new Promise((resolve) => setTimeout(resolve, 1000));
                // await useSwitchNetwork().switchNetwork(
                //     Number(chainData.chainId),
                // );
            }
        }
    };
    useEffect(() => {
        setNewCrocEnv();
    }, [
        crocEnv === undefined,
        chainData.chainId,
        walletProvider,
        userAddress,
        activeNetwork.chainId,
        walletChain,
    ]);

    useEffect(() => {
        if (provider && crocEnv) {
            (async () => {
                const mainnetEthPrice = await cachedFetchTokenPrice(
                    mainnetETH.address,
                    ethereumMainnet.chainId,
                    crocEnv,
                );
                const usdPrice = mainnetEthPrice?.usdPrice;
                usdPrice !== Infinity && setEthMainnetUsdPrice(usdPrice);
            })();
        }
    }, [crocEnv, provider]);
    useEffect(() => {
        setDefaultUrlParams(createDefaultUrlParams(chainData.chainId));
    }, [chainData.chainId]);

    // data returned by this context
    const crocEnvContext = {
        crocEnv,
        setCrocEnv,
        selectedNetwork: activeNetwork,
        chainData,
        topPools,
        ethMainnetUsdPrice,
        defaultUrlParams,
        provider,
        mainnetProvider,
        scrollProvider,
        blastProvider,
        activeNetwork,
        chooseNetwork,
    };

    return (
        <CrocEnvContext.Provider value={crocEnvContext}>
            {props.children}
        </CrocEnvContext.Provider>
    );
};
