import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import { useAppChain } from '../App/hooks/useAppChain';
import { useBlacklist } from '../App/hooks/useBlacklist';
import { useTopPools } from '../App/hooks/useTopPools';
import { APP_ENVIRONMENT, IS_LOCAL_ENV } from '../constants';
import { getDefaultPairForChain } from '../utils/data/defaultTokens';
import { CachedDataContext } from './CachedDataContext';
import { useMainnetProvider } from '../App/functions/useMainnetProvider';
import { Provider } from '@ethersproject/providers';
import { PoolIF, TokenIF } from '../utils/interfaces/exports';
import {
    limitParamsIF,
    linkGenMethodsIF,
    poolParamsIF,
    swapParamsIF,
    useLinkGen,
} from '../utils/hooks/useLinkGen';

interface UrlRoutesTemplate {
    swap: string;
    market: string;
    limit: string;
    pool: string;
}
interface CrocEnvContextIF {
    crocEnv: CrocEnv | undefined;
    setCrocEnv: (val: CrocEnv | undefined) => void;
    chainData: ChainSpec;
    isChainSupported: boolean;
    topPools: PoolIF[];
    ethMainnetUsdPrice: number | undefined;
    defaultUrlParams: UrlRoutesTemplate;
    mainnetProvider: Provider | undefined;
}

export const CrocEnvContext = createContext<CrocEnvContextIF>(
    {} as CrocEnvContextIF,
);

export const CrocEnvContextProvider = (props: { children: ReactNode }) => {
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

    const { address: userAddress, isConnected } = useAccount();
    const { data: signer, isError, error, status: signerStatus } = useSigner();

    const [crocEnv, setCrocEnv] = useState<CrocEnv | undefined>();
    const [chainData, isChainSupported] = useAppChain(isConnected);
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
        const [tokenA, tokenB]: [TokenIF, TokenIF] =
            getDefaultPairForChain(chainId);
        const swapParams: swapParamsIF = {
            chain: chainId,
            tokenA: tokenA.address,
            tokenB: tokenB.address,
        };
        const limitParams: limitParamsIF = {
            ...swapParams,
            limitTick: '10',
        };
        const poolParams: poolParamsIF = {
            ...swapParams,
            lowTick: '-1',
            highTick: '1',
        };
        return {
            swap: linkGenSwap.getFullURL(swapParams),
            market: linkGenMarket.getFullURL(swapParams),
            limit: linkGenLimit.getFullURL(limitParams),
            pool: linkGenPool.getFullURL(poolParams),
        };
    }
    const initUrl = createDefaultUrlParams(chainData.chainId);
    // why is this a `useState`? why not a `useRef` or a const?
    const [defaultUrlParams, setDefaultUrlParams] =
        useState<UrlRoutesTemplate>(initUrl);

    const provider = useProvider();
    const mainnetProvider = useMainnetProvider();

    const crocEnvContext = {
        crocEnv,
        setCrocEnv,
        chainData,
        isChainSupported,
        topPools,
        ethMainnetUsdPrice,
        defaultUrlParams,
        mainnetProvider:
            chainData.chainId === '0x1' ? provider : mainnetProvider,
    };

    useBlacklist(userAddress);

    const setNewCrocEnv = async () => {
        if (APP_ENVIRONMENT === 'local') {
            console.debug({ provider });
            console.debug({ signer });
            console.debug({ crocEnv });
            console.debug({ signerStatus });
        }
        if (isError) {
            console.error({ error });
            setCrocEnv(undefined);
        } else if (!provider && !signer) {
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
                (await signer?.getChainId()) ==
                (await provider.getNetwork()).chainId
            ) {
                const newCrocEnv = new CrocEnv(
                    provider,
                    signer ? signer : undefined,
                );
                APP_ENVIRONMENT === 'local' && console.debug({ newCrocEnv });
                setCrocEnv(newCrocEnv);
            }
        }
    };
    useEffect(() => {
        setNewCrocEnv();
    }, [
        // signerStatus === 'success',
        crocEnv === undefined,
        chainData.chainId,
        signer,
    ]);

    useEffect(() => {
        if (provider) {
            (async () => {
                IS_LOCAL_ENV &&
                    console.debug('fetching WETH price from mainnet');
                const mainnetEthPrice = await cachedFetchTokenPrice(
                    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                    '0x1',
                );
                const usdPrice = mainnetEthPrice?.usdPrice;
                setEthMainnetUsdPrice(usdPrice);
            })();
        }
    }, [provider]);
    useEffect(() => {
        setDefaultUrlParams(createDefaultUrlParams(chainData.chainId));
    }, [chainData.chainId]);

    return (
        <CrocEnvContext.Provider value={crocEnvContext}>
            {props.children}
        </CrocEnvContext.Provider>
    );
};
