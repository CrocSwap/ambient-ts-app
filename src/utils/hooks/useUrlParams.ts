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
import { linkGenMethodsIF, useLinkGen } from './useLinkGen';
import validateAddress from '../functions/validateAddress';
import validateChain from '../functions/validateChain';

/* Hook to process GET-request style parameters passed to the URL. This includes
 * chain, tokens, and context-specific tick parameters. All action is intermediated
 * by passing parameters through to the tradeDataSlice in redux. */

// union of all recognized param keys in the app
type validParams =
    | 'chain'
    | 'tokenA'
    | 'tokenB'
    | 'lowTick'
    | 'highTick'
    | 'limitTick';

export const useUrlParams = (
    requiredParams: string[],
    tokens: tokenMethodsIF,
    dfltChainId: string,
    provider?: ethers.providers.Provider,
) => {
    const { params } = useParams();

    const linkGenCurrent: linkGenMethodsIF = useLinkGen();

    const dispatch = useAppDispatch();

    const { switchNetwork } = useSwitchNetwork();

    const urlParamMap = useMemo<Map<string, string>>(() => {
        // get URL parameters or empty string if undefined
        const fixedParams = params ?? '';
        // split params string at every ampersand
        const paramMap = new Map<validParams, string>();

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
            .forEach((par) => paramMap.set(par[0] as validParams, par[1]));

        return paramMap;
    }, [params]);

    // redirect user to default params if params received are malformed
    useEffect(() => {
        // array of keys deconstructed from params string
        const paramKeys: string[] = [...urlParamMap.keys()];
        // logic to redirect a user to current URL with default params
        const redirectUser = (): void => linkGenCurrent.redirect();
        // redirect user if a required param is missing
        requiredParams.some((param: string) => {
            paramKeys.includes(param) || redirectUser();
        });
        // array of parameter tuples from URL
        const paramTuples: Array<[string, string]> = [...urlParamMap.entries()];
        // run a validation fn against each param tuple
        paramTuples.forEach((pt: [string, string]) => validateParam(pt));
        // fn to validate each parameter tuple, will redirect user to the default
        // ... parameterization on current route if validation fails
        function validateParam(p: [string, string]): void {
            const [key, val] = p;
            if (key === 'chain') {
                validateChain(val) || redirectUser();
            } else if (key === 'tokenA' || key === 'tokenB') {
                validateAddress(val) || redirectUser();
            }
        }
    }, [urlParamMap]);

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

    useEffect((): (() => void) => {
        let flag = true;

        const processTokenAddr = async (
            tokenAddrA: string,
            tokenAddrB: string,
            chainToUse: string,
        ) => {
            const tokenPair = await resolveTokenData(
                tokenAddrA,
                tokenAddrB,
                chainToUse,
            );

            // prevent race condition involving lookup and fetching contract
            if (!flag) return;

            // If both tokens are valid and have data for this chain, use those
            // Otherwise fallback to the chain's default pair.
            if (tokenPair && tokenPair[0].decimals && tokenPair[1].decimals) {
                dispatch(setTokenA(tokenPair[0]));
                dispatch(setTokenB(tokenPair[1]));
            } else {
                processDefaultTokens(chainToUse);
            }
        };

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
        return () => {
            flag = false;
        };
    }, [tokensOnChain.length, ...dependencies.map((x) => urlParamMap.get(x))]);
};
