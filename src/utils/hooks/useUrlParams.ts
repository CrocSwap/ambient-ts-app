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
import { pageNames, linkGenMethodsIF, useLinkGen } from './useLinkGen';
import validateAddress from '../functions/validateAddress';
import validateChain from '../functions/validateChain';

/* Hook to process GET-request style parameters passed to the URL. This includes
 * chain, tokens, and context-specific tick parameters. All action is intermediated
 * by passing parameters through to the tradeDataSlice in redux. */

// array of all valid params in the app (global, anywhere)
// must be listed in desired sequence in URL string
const validParams = [
    'chain',
    'tokenA',
    'tokenB',
    'lowTick',
    'highTick',
    'limitTick',
] as const;

// type generated as a union of all string literals in `validParams`
type validParamsType = typeof validParams[number];

export interface updatesIF {
    update?: Array<[validParamsType, string | number]>;
    delete?: Array<validParamsType>;
}

interface urlParamsMethodsIF {
    updateURL: (changes: updatesIF) => void;
}

export const useUrlParams = (
    tokens: tokenMethodsIF,
    dfltChainId: string,
    provider?: ethers.providers.Provider,
): urlParamsMethodsIF => {
    const { params } = useParams();

    // this is used for updating the URL bar
    // also for when params need to be re-parsed because the page has changed
    const linkGenCurrent: linkGenMethodsIF = useLinkGen();

    // generate an array of required params in the URL based on route
    const requiredParams = useMemo<validParamsType[]>(() => {
        // name of page currently in the DOM
        const pageName: pageNames = linkGenCurrent.currentPage;
        // global params for all parameterized pathways
        const globalParams: validParamsType[] = ['chain', 'tokenA', 'tokenB'];
        // output variable
        let paramsForPage: validParamsType[];
        // logic router for required URL params for each parameterized route
        // all parameterized pathways MUST have mandatory params defined here
        switch (pageName) {
            case 'swap':
            case 'market':
            case 'limit':
                paramsForPage = globalParams;
                break;
            case 'pool':
            case 'initpool':
                paramsForPage = globalParams.concat(['lowTick', 'highTick']);
                break;
            // all non-parameterized URL pathways
            default:
                paramsForPage = [];
                break;
        }
        // return array of required URL params
        return paramsForPage;
    }, [linkGenCurrent.currentPage]);

    const dispatch = useAppDispatch();

    const { switchNetwork } = useSwitchNetwork();

    // map of all params in the current URL string
    const urlParamMap = useMemo<Map<validParamsType, string>>(() => {
        // get URL parameters or empty string if undefined
        const fixedParams = params ?? '';
        // output variable
        const paramMap = new Map<validParamsType, string>();
        // parse URL params from `x=a&y=b&z=c` format
        fixedParams
            // split params string at every ampersand
            .split('&')
            // remove any values missing an = symbol
            .filter((par) => par.includes('='))
            // split substrings at = symbols to make [key, value] tuples
            .map((par) => par.split('='))
            // remove empty strings created by extra = symbols
            .map((par) => par.filter((e) => e !== ''))
            // remove tuples with trisomy issues
            .filter((par) => par.length === 2)
            // add each key-val pair to the param map
            .forEach((par) => paramMap.set(par[0] as validParamsType, par[1]));
        // return Map of all params in the URL
        return paramMap;
    }, [params]);

    // redirect user to default params if params received are malformed
    useEffect(() => {
        // array of keys deconstructed from params string
        const paramKeys: validParamsType[] = [...urlParamMap.keys()];
        // logic to redirect a user to current URL with default params
        const redirectUser = (): void => linkGenCurrent.redirect();
        // determine if any required URL params are missing
        const areParamsMissing: boolean = requiredParams.some(
            (param: validParamsType) => !paramKeys.includes(param),
        );
        // redirect user if any required URL params are missing
        areParamsMissing && redirectUser();
        // array of parameter tuples from URL
        const paramTuples: Array<[validParamsType, string]> = [
            ...urlParamMap.entries(),
        ];
        // run a validation fn against each param tuple
        paramTuples.forEach((pT: [validParamsType, string]) =>
            validateParam(pT),
        );
        // fn to validate each parameter tuple, will redirect user to the default
        // ... parameterization on current route if validation fails
        function validateParam(p: [validParamsType, string]): void {
            const [key, val] = p;
            if (key === 'chain') {
                validateChain(val) || redirectUser();
            } else if (key === 'tokenA' || key === 'tokenB') {
                validateAddress(val) || redirectUser();
            }
        }
    }, [urlParamMap]);

    // fn to update the current URL without a navigation event
    function updateURL(changes: updatesIF): void {
        // copy of the current URL param map
        const workingMap: Map<validParamsType, string> = urlParamMap;
        // process any updates to existing k-v pairs (also adds new ones)
        changes.update &&
            changes.update.forEach(
                (param: [validParamsType, string | number]) => {
                    const [k, v] = param;
                    workingMap.set(k, v.toString());
                },
            );
        // remove any k-v pairs marked for deletion
        changes.delete &&
            changes.delete.forEach((param: validParamsType) =>
                workingMap.delete(param),
            );
        // use the updated param map to build a new param string
        const newParamString: string = [...workingMap.entries()]
            // remove unrecognized params
            .filter((pair) => validParams.includes(pair[0]))
            // sort param tuples into preferred sequence
            .sort(
                (p1, p2) =>
                    validParams.indexOf(p1[0]) - validParams.indexOf(p2[0]),
            )
            // transform k-v tuples in param strings
            .map((pair) => pair.join('='))
            // join individual params into a unified param string
            .join('&');
        // overwrite the last item in the history stack
        // using `.pushState()` will fill the history stack with garbage
        // current state, if any, is preserved
        window.history.replaceState(
            { ...window.history.state },
            '',
            linkGenCurrent.baseURL + '/' + newParamString,
        );
    }

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

    function processOptParam(
        paramName: validParamsType,
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
    }, [
        tokensOnChain.length,
        ...validParams.map((x: validParamsType) => urlParamMap.get(x)),
    ]);

    return {
        updateURL,
    };
};
