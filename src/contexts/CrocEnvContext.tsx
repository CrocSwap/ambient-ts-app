import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useProvider, useSigner } from 'wagmi';
import { useAppChain } from '../App/hooks/useAppChain';
import { useBlacklist } from '../App/hooks/useBlacklist';
import { useTopPools } from '../App/hooks/useTopPools';
import { CachedDataContext } from './CachedDataContext';
import { Provider } from '@ethersproject/providers';
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
    IS_LOCAL_ENV,
    ethereumMainnet,
    mainnetETH,
    getDefaultPairForChain,
} from '../ambient-utils/constants';
import { UserDataContext } from './UserDataContext';

interface UrlRoutesTemplate {
    swap: string;
    market: string;
    limit: string;
    pool: string;
}

interface CrocEnvContextIF {
    crocEnv: CrocEnv | undefined;
    setCrocEnv: (val: CrocEnv | undefined) => void;
    selectedNetwork: NetworkIF;
    chainData: ChainSpec;
    isWalletChainSupported: boolean;
    topPools: PoolIF[];
    ethMainnetUsdPrice: number | undefined;
    defaultUrlParams: UrlRoutesTemplate;
    provider: Provider | undefined;
    activeNetwork: NetworkIF;
    chooseNetwork: (network: NetworkIF) => void;
    mainnetProvider: Provider | undefined;
}

export const CrocEnvContext = createContext<CrocEnvContextIF>(
    {} as CrocEnvContextIF,
);

export const CrocEnvContextProvider = (props: { children: ReactNode }) => {
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

    const { userAddress } = useContext(UserDataContext);
    const { data: signer, isError, error, status: signerStatus } = useSigner();

    const [crocEnv, setCrocEnv] = useState<CrocEnv | undefined>();
    // const [activeNetwork, setActiveNetwork] =
    //     useState<NetworkIF>(ethereumGoerli);
    const { chainData, isWalletChainSupported, activeNetwork, chooseNetwork } =
        useAppChain();
    const topPools: PoolIF[] = useTopPools(chainData.chainId);
    const [ethMainnetUsdPrice, setEthMainnetUsdPrice] = useState<
        number | undefined
    >();

    // hooks to generate default URL paths
    const linkGenSwap: linkGenMethodsIF = useLinkGen('swap');
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    const createDefaultUrlParams = useCallback(
        (chainId: string): UrlRoutesTemplate => {
            const [tokenA, tokenB]: [TokenIF, TokenIF] =
                getDefaultPairForChain(chainId);

            // default URL params for swap and market modules
            const swapParams: swapParamsIF = {
                chain: chainId,
                tokenA: tokenA.address,
                tokenB: tokenB.address,
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
        },
        [linkGenLimit, linkGenMarket, linkGenPool, linkGenSwap],
    );

    const initUrl = createDefaultUrlParams(chainData.chainId);
    // why is this a `useState`? why not a `useRef` or a const?
    const [defaultUrlParams, setDefaultUrlParams] =
        useState<UrlRoutesTemplate>(initUrl);

    const provider = useProvider({ chainId: +chainData.chainId });
    const mainnetProvider = useProvider({ chainId: +'0x1' });

    useBlacklist(userAddress);

    useEffect(() => {
        if (APP_ENVIRONMENT === 'local') {
            console.debug({ provider });
            console.debug({ signer });
            console.debug({ crocEnv });
            console.debug({ signerStatus });
        }
    }, [crocEnv, provider, signer, signerStatus]);

    const [chainIdFromSigner, setChainIdFromSigner] = useState<
        number | undefined
    >();
    const [chainIdFromProvider, setChainIdFromProvider] = useState<
        number | undefined
    >();

    useEffect(() => {
        (async () => {
            setChainIdFromSigner(await signer?.getChainId());
        })();
    }, [signer]);

    useEffect(() => {
        (async () => {
            setChainIdFromProvider((await provider.getNetwork()).chainId);
        })();
    }, [provider]);

    useEffect(() => {
        setCrocEnv((currentCrocEnv) => {
            if (isError) {
                console.error({ error });
                return undefined;
            } else if (APP_ENVIRONMENT === 'local' && !provider && !signer) {
                console.debug('setting crocEnv to undefined');
                return undefined;
            } else if (provider) {
                if (!currentCrocEnv) {
                    const newCrocEnv = new CrocEnv(
                        provider,
                        signer ? signer : undefined,
                    );
                    return newCrocEnv;
                }
            } else {
                if (chainIdFromProvider === chainIdFromSigner) {
                    const newCrocEnv = new CrocEnv(
                        provider,
                        signer ? signer : undefined,
                    );
                    APP_ENVIRONMENT === 'local' &&
                        console.debug({ newCrocEnv });
                    return newCrocEnv;
                }
            }
        });
    }, [
        chainIdFromProvider,
        chainIdFromSigner,
        error,
        isError,
        provider,
        signer,
    ]);

    useEffect(() => {
        if (provider && crocEnv) {
            (async () => {
                IS_LOCAL_ENV &&
                    console.debug('fetching WETH price from mainnet');
                const mainnetEthPrice = await cachedFetchTokenPrice(
                    mainnetETH.address,
                    ethereumMainnet.chainId,
                    crocEnv,
                );
                const usdPrice = mainnetEthPrice?.usdPrice;
                setEthMainnetUsdPrice(usdPrice);
            })();
        }
    }, [cachedFetchTokenPrice, crocEnv, provider]);

    useEffect(() => {
        setDefaultUrlParams(createDefaultUrlParams(chainData.chainId));
    }, [chainData.chainId, createDefaultUrlParams]);

    // data returned by this context
    const crocEnvContext = {
        crocEnv,
        setCrocEnv,
        selectedNetwork: activeNetwork,
        chainData,
        isWalletChainSupported,
        topPools,
        ethMainnetUsdPrice,
        defaultUrlParams,
        provider,
        mainnetProvider,
        activeNetwork,
        chooseNetwork,
    };

    return (
        <CrocEnvContext.Provider value={crocEnvContext}>
            {props.children}
        </CrocEnvContext.Provider>
    );
};
