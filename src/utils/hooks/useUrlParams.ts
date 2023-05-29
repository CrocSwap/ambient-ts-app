import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from './reduxToolkit';
import {
    setTokenA,
    setTokenB,
    setAdvancedLowTick,
    setAdvancedHighTick,
    setLimitTick,
    setChainId,
} from '../state/tradeDataSlice';
import { TokenIF } from '../interfaces/exports';
import { ethers } from 'ethers';
import { fetchContractDetails } from '../../App/functions/fetchContractDetails';
import { useProvider, useSwitchNetwork } from 'wagmi';
import { getDefaultPairForChain } from '../data/defaultTokens';
import { tokenMethodsIF } from '../../App/hooks/useTokens';

/* Hook to process GET-request style parameters passed to the URL. This includes
 * chain, tokens, and context-specific tick parameters. All action is intermediated
 * by passing parameters through to the tradeDataSlice in redux. */
export const useUrlParams = (
    tokens: tokenMethodsIF,
    dfltChainId: string,
    provider?: ethers.providers.Provider,
) => {
    const { params } = useParams();

    const dispatch = useAppDispatch();

    const { switchNetwork } = useSwitchNetwork();

    const urlParamMap = useMemo<Map<string, string>>(() => {
        // get URL parameters or empty string if undefined
        const fixedParams = params ?? '';
        // split params string at every ampersand
        const paramMap = new Map<string, string>();

        // Splits and parses GET params in x=a&y=b&z=c formater
        fixedParams
            .split('&')
            // remove any values missing an = symbol
            .filter((par) => par.includes('='))
            // split substrings at = symbols to make [key, value] tuples
            .map((par) => par.split('='))
            // remove empty strings created by extra = symbols
            .map((par) => par.filter((e) => e !== ''))
            // remove tuples with trisomy issues
            .filter((par) => par.length === 2)
            .forEach((par) => paramMap.set(par[0], par[1]));

        return paramMap;
    }, [params]);

    const tokensOnChain: TokenIF[] = tokens.tokenUniv;

    /* Given an address and chain ID retrieves full token context data from the useTokenMap
     * hook. */
    async function getTokenByAddress(
        addr: string,
        chainId: string,
    ): Promise<TokenIF | undefined> {
        // Don't run until the token map has loaded. Otherwise, we may spuriously query a token
        // on-chain that has mapped data
        if (tokensOnChain.length === 0) {
            return;
        }
        const lookup = tokens.getTokenByAddress(addr);
        if (lookup) {
            return lookup;
        } else {
            const provider = inflateProvider(chainId);
            if (provider) {
                return fetchContractDetails(provider, addr, chainId);
            }
        }
    }

    function inflateProvider(chainId: string) {
        if (!provider) {
            provider = useProvider({ chainId: parseInt(chainId) });
            if (!provider) {
                console.warn(
                    'Cannot set provider to lookup token address on chain',
                    chainId,
                );
                return undefined;
            }
        }
        return provider;
    }

    // All relevant flags that we want to update on any change
    const dependencies = [
        'chain',
        'tokenA',
        'tokenB',
        'lowTick',
        'highTick',
        'limitTick',
    ];

    function processOptParam(
        paramName: string,
        processFn: (val: string) => void,
    ): void {
        if (urlParamMap.has(paramName)) {
            const paramVal = urlParamMap.get(paramName) as string;
            processFn(paramVal);
        }
    }

    async function processTokenAddr(
        tokenAddrA: string,
        tokenAddrB: string,
        chainToUse: string,
    ) {
        const tokenPair = await resolveTokenData(
            tokenAddrA,
            tokenAddrB,
            chainToUse,
        );

        // If both tokens are valid and have data for this chain, use those
        // Otherwise fallback to the chain's default pair.
        if (tokenPair) {
            dispatch(setTokenA(tokenPair[0]));
            dispatch(setTokenB(tokenPair[1]));
        } else {
            processDefaultTokens(chainToUse);
        }
    }

    async function resolveTokenData(
        addrA: string,
        addrB: string,
        chainToUse: string,
    ): Promise<[TokenIF, TokenIF] | undefined> {
        const [tokenA, tokenB] = await Promise.all([
            getTokenByAddress(addrA, chainToUse),
            getTokenByAddress(addrB, chainToUse),
        ]);

        if (tokenA && tokenB) {
            if (
                tokenA.chainId == parseInt(chainToUse) &&
                tokenB.chainId == parseInt(chainToUse)
            ) {
                return [tokenA, tokenB];
            }
        }
        return undefined;
    }

    function processDefaultTokens(chainToUse: string) {
        const [dfltA, dfltB] = getDefaultPairForChain(chainToUse);
        dispatch(setTokenA(dfltA));
        dispatch(setTokenB(dfltB));
    }

    useEffect(() => {
        try {
            const chainToUse = urlParamMap.get('chain') || dfltChainId;

            if (urlParamMap.has('chain')) {
                switchNetwork && switchNetwork(parseInt(chainToUse));
                dispatch(setChainId(chainToUse));
            }

            const tokenA = urlParamMap.get('tokenA');
            const tokenB = urlParamMap.get('tokenB');
            if (tokenA && tokenB) {
                processTokenAddr(tokenA, tokenB, chainToUse);
            } else {
                processDefaultTokens(chainToUse);
            }

            processOptParam('lowTick', async (tick: string) => {
                dispatch(setAdvancedLowTick(parseInt(tick)));
            });

            processOptParam('highTick', async (tick: string) => {
                dispatch(setAdvancedHighTick(parseInt(tick)));
            });

            processOptParam('limitTick', async (tick: string) => {
                dispatch(setLimitTick(parseInt(tick)));
            });
        } catch (error) {
            console.error({ error });
        }
    }, [tokensOnChain.length, ...dependencies.map((x) => urlParamMap.get(x))]);
};
