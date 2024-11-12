import { CrocEnv } from '@crocswap-libs/sdk';
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
import { PoolIF, TokenIF } from '../ambient-utils/types';
import {
    ethereumMainnet,
    mainnetETH,
    getDefaultPairForChain,
} from '../ambient-utils/constants';
import { UserDataContext } from './UserDataContext';
import { translateTokenSymbol } from '../ambient-utils/dataLayer';
import { TokenContext } from './TokenContext';
import { AppStateContext } from './AppStateContext';
import { BLAST_RPC_URL } from '../ambient-utils/constants/networks/blastMainnet';
import { MAINNET_RPC_URL } from '../ambient-utils/constants/networks/ethereumMainnet';
import { SCROLL_RPC_URL } from '../ambient-utils/constants/networks/scrollMainnet';

interface UrlRoutesTemplateIF {
    swap: string;
    market: string;
    limit: string;
    pool: string;
}

export interface CrocEnvContextIF {
    crocEnv: CrocEnv | undefined;
    setCrocEnv: (val: CrocEnv | undefined) => void;
    topPools: PoolIF[];
    ethMainnetUsdPrice: number | undefined;
    defaultUrlParams: UrlRoutesTemplateIF;
    provider: Provider;
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

export const CrocEnvContextProvider = (props: { children: ReactNode }) => {
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);
    const {
        activeNetwork: { chainId, evmRpcUrl },
    } = useContext(AppStateContext);

    const { userAddress } = useContext(UserDataContext);
    const { walletProvider } = useWeb3ModalProvider();
    const [crocEnv, setCrocEnv] = useState<CrocEnv | undefined>();
    const { tokens } = useContext(TokenContext);

    const topPools: PoolIF[] = useTopPools(chainId);
    const [ethMainnetUsdPrice, setEthMainnetUsdPrice] = useState<
        number | undefined
    >();

    // hooks to generate default URL paths
    const linkGenSwap: linkGenMethodsIF = useLinkGen('swap');
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    function createDefaultUrlParams(chainId: string): UrlRoutesTemplateIF {
        const [dfltTokenA, dfltTokenB]: [TokenIF, TokenIF] =
            getDefaultPairForChain(chainId);

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

    const initUrl = createDefaultUrlParams(chainId);
    const [defaultUrlParams, setDefaultUrlParams] =
        useState<UrlRoutesTemplateIF>(initUrl);

    const provider = useMemo(
        () =>
            new BatchedJsonRpcProvider(evmRpcUrl, parseInt(chainId), {
                staticNetwork: true,
            }),
        [chainId],
    );

    useBlacklist(userAddress);

    const setNewCrocEnv = async () => {
        let signer = undefined;
        if (walletProvider) {
            const w3provider = new ethers.BrowserProvider(walletProvider);
            signer = await w3provider.getSigner();
        }
        if (!provider && !signer) {
            setCrocEnv(undefined);
            return;
        } else if (provider) {
            const newCrocEnv = new CrocEnv(
                provider,
                signer ? signer : undefined,
            );
            setCrocEnv(newCrocEnv);
        }
    };
    useEffect(() => {
        setNewCrocEnv();
    }, [provider, walletProvider]);

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
        setDefaultUrlParams(createDefaultUrlParams(chainId));
    }, [chainId]);

    // data returned by this context
    const crocEnvContext: CrocEnvContextIF = {
        crocEnv,
        setCrocEnv,
        topPools,
        ethMainnetUsdPrice,
        defaultUrlParams,
        provider,
        mainnetProvider,
        scrollProvider,
        blastProvider,
    };

    return (
        <CrocEnvContext.Provider value={crocEnvContext}>
            {props.children}
        </CrocEnvContext.Provider>
    );
};
