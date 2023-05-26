import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { error } from 'ajv/dist/vocabularies/applicator/dependencies';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import { formSlugForPairParams } from '../App/functions/urlSlugs';
import { useAppChain } from '../App/hooks/useAppChain';
import { useBlacklist } from '../App/hooks/useBlacklist';
import { topPoolIF, useTopPools } from '../App/hooks/useTopPools';
import { APP_ENVIRONMENT, IS_LOCAL_ENV } from '../constants';
import { getDefaultPairForChain } from '../utils/data/defaultTokens';
import { CachedDataContext } from './CachedDataContext';

interface CrocEnvIF {
    crocEnv: CrocEnv | undefined;
    setCrocEnv: (val: CrocEnv | undefined) => void;
    chainData: ChainSpec;
    isChainSupported: boolean;
    topPools: topPoolIF[];
    ethMainnetUsdPrice: number | undefined;
    setEthMainnetUsdPrice: (val: number) => void;
}

export const CrocEnvContext = createContext<CrocEnvIF>({} as CrocEnvIF);

export const CrocEnvContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

    const { address: userAddress, isConnected } = useAccount();
    const provider = useProvider();
    const { data: signer, isError, error, status: signerStatus } = useSigner();

    const [crocEnv, setCrocEnv] = useState<CrocEnv | undefined>();
    const [chainData, isChainSupported] = useAppChain(isConnected);
    const topPools: topPoolIF[] = useTopPools(chainData.chainId);
    const [ethMainnetUsdPrice, setEthMainnetUsdPrice] = useState<
        number | undefined
    >();

    const crocEnvState = {
        crocEnv,
        setCrocEnv,
        chainData,
        isChainSupported,
        topPools,
        ethMainnetUsdPrice,
        setEthMainnetUsdPrice,
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

    return (
        <CrocEnvContext.Provider value={crocEnvState}>
            {props.children}
        </CrocEnvContext.Provider>
    );
};
