import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import { formSlugForPairParams } from '../App/functions/urlSlugs';
import { useAppChain } from '../App/hooks/useAppChain';
import { useBlacklist } from '../App/hooks/useBlacklist';
import { useTopPools } from '../App/hooks/useTopPools';
import { APP_ENVIRONMENT } from '../constants';
import { getDefaultPairForChain } from '../utils/data/defaultTokens';
import { CachedDataContext } from './CachedDataContext';
import { Provider } from '@ethersproject/providers';
import { NetworkIF, PoolIF } from '../utils/interfaces/exports';
import { ethereumGoerli } from '../utils/networks/ethereumGoerli';

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
    setSelectedNetwork: (val: NetworkIF) => void;
    chainData: ChainSpec;
    isChainSupported: boolean;
    topPools: PoolIF[];
    nativeTokenUsdPrice: number | undefined;
    defaultUrlParams: UrlRoutesTemplate;
    provider: Provider | undefined;
}

export const CrocEnvContext = createContext<CrocEnvContextIF>(
    {} as CrocEnvContextIF,
);

export const CrocEnvContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

    const { address: userAddress, isConnected } = useAccount();
    const { data: signer, isError, error, status: signerStatus } = useSigner();

    const [crocEnv, setCrocEnv] = useState<CrocEnv | undefined>();
    const [selectedNetwork, setSelectedNetwork] =
        useState<NetworkIF>(ethereumGoerli);
    const [chainData, isChainSupported, setNextChain] =
        useAppChain(isConnected);
    const topPools: PoolIF[] = useTopPools(chainData.chainId);
    const [nativeTokenUsdPrice, setNativeTokenUsdPrice] = useState<
        number | undefined
    >();

    function createDefaultUrlParams(chainId: string): UrlRoutesTemplate {
        const [tokenA, tokenB] = getDefaultPairForChain(chainId);
        const pairSlug = formSlugForPairParams(chainId, tokenA, tokenB);
        return {
            swap: `/swap/${pairSlug}`,
            market: `/trade/market/${pairSlug}`,
            pool: `/trade/pool/${pairSlug}`,
            limit: `/trade/limit/${pairSlug}`,
        };
    }
    const initUrl = createDefaultUrlParams(chainData.chainId);
    const [defaultUrlParams, setDefaultUrlParams] =
        useState<UrlRoutesTemplate>(initUrl);

    const provider = useProvider({ chainId: +chainData.chainId });

    const updateNetwork = (network: NetworkIF) => {
        setSelectedNetwork(network);
        setNextChain(network.chainId);
    };

    const crocEnvContext = {
        crocEnv,
        setCrocEnv,
        selectedNetwork,
        setSelectedNetwork: updateNetwork,
        chainData,
        isChainSupported,
        topPools,
        nativeTokenUsdPrice,
        defaultUrlParams,
        provider,
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
                const nativeTokenPrice = await cachedFetchTokenPrice(
                    selectedNetwork.wrappedNativeTokens[0],
                    selectedNetwork.chainId,
                );
                const usdPrice = nativeTokenPrice?.usdPrice;
                setNativeTokenUsdPrice(usdPrice);
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
