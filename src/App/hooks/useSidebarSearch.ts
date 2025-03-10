import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { fetchEnsAddress } from '../../ambient-utils/api';
import {
    IS_LOCAL_ENV,
    ZERO_ADDRESS,
    tokenListURIs,
} from '../../ambient-utils/constants';
import {
    LimitOrderIF,
    PoolIF,
    PositionIF,
    TokenIF,
    TransactionIF,
} from '../../ambient-utils/types';
import { AppStateContext } from '../../contexts/AppStateContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { PoolContext } from '../../contexts/PoolContext';
import matchSearchInput from '../functions/matchSearchInput';
import { tokenMethodsIF } from './useTokens';

// types specifying which results set should render in the dom
// `standard` ⮕ standard sidebar content
// `token` ⮕ content when user searches for a token address, name, or symbol
// `wallet` ⮕ content when user searches for a wallet address or ENS
export type contentGroups = 'standard' | 'token' | 'wallet';

export interface walletHexAndENS {
    hex: string;
    ens: string | null;
}

// shape of object returned by this hook
export interface sidebarSearchIF {
    rawInput: string;
    contentGroup: contentGroups;
    setInput: Dispatch<SetStateAction<string>>;
    clearInput: () => void;
    isInputValid: boolean;
    pools: PoolIF[];
    positions: PositionIF[];
    txs: TransactionIF[];
    limits: LimitOrderIF[];
    wallets: walletHexAndENS[];
}

export const useSidebarSearch = (
    positionList: PositionIF[],
    txList: TransactionIF[],
    limitOrderList: LimitOrderIF[],
    tokens: tokenMethodsIF,
): sidebarSearchIF => {
    const { activeNetwork } = useContext(AppStateContext);
    const { analyticsPoolList } = useContext(PoolContext);

    // needed to resolve ENS addresses entered by user
    const { mainnetProvider } = useContext(CrocEnvContext);

    // raw user input from the DOM
    const [rawInput, setRawInput] = useState<string>('');

    // debounced copy of `rawInput` (no sanitization)
    const [dbInput, setDbInput] = useState<string>('');
    useEffect(() => {
        // prevent debouncing when input has been cleared
        if (!rawInput) {
            setDbInput(rawInput);
            return;
        }
        // time in ms to debounce input
        const delayTime = 400;
        // update `dbInput` after the indicated delay
        const timer = setTimeout(() => setDbInput(rawInput), delayTime);
        // clear the timeout from the DOM
        return () => clearTimeout(timer);
    }, [rawInput]);

    // search type ➜ presumed type of input provided by user
    type searchType = 'address' | 'nameOrSymbol' | 'ens' | null;
    const [searchAs, setSearchAs] = useState<searchType>(null);

    // value delineating which content set the DOM should render, this prevents a
    // ... flash of token search content before displaying wallet search content
    const [contentGroup, setContentGroup] = useState<contentGroups>('standard');

    // cleaned and validated version of raw user input
    const validatedInput = useMemo<string>(() => {
        // trim string and make it lower case
        const cleanInput: string = dbInput.trim();
        // logic to determine which type of search to run based on input shape
        if (
            cleanInput.length === 42 ||
            (cleanInput.length === 40 && !cleanInput.startsWith('0x'))
        ) {
            setSearchAs('address');
        } else if (cleanInput.includes('.eth')) {
            setSearchAs('ens');
            return cleanInput.split('.')[0] + '.eth';
        } else if (cleanInput.length > 0) {
            setSearchAs('nameOrSymbol');
            setContentGroup('token');
            return cleanInput;
        } else {
            setSearchAs(null);
            setContentGroup('standard');
            return '';
        }
        // declare an output variable
        let output: string = cleanInput;
        // extra formatting to handle contract addresses without leading '0x'
        const fixedInput: string = cleanInput.startsWith('0x')
            ? cleanInput
            : '0x' + cleanInput;
        // check if string is a correctly-formed contract address
        if (
            // check if string has 42 characters
            fixedInput.length === 42 &&
            // check if string after '0x' is valid hexadecimal
            fixedInput.substring(2).match(/[0-9a-f]/g)
        ) {
            // if fixed string is valid, assign it to the output variable
            output = fixedInput;
        }
        // return output variable
        return output;
    }, [dbInput]);

    // array of pools to output from the hook
    const [outputPools, setOutputPools] = useState<PoolIF[]>([]);

    // constant to force searches to return exact matches only
    const SEARCH_EXACT = true;

    // logic to update the output pools from the hook
    useEffect(() => {
        if (!analyticsPoolList) return;
        // fn to filter pools by address (must be exact)
        const searchByAddress = (addr: string): PoolIF[] =>
            analyticsPoolList.filter((pool: PoolIF) =>
                matchSearchInput(addr, [pool.base, pool.quote], SEARCH_EXACT),
            );
        // fn to filter pools by symbol (must be exact IF input is two characters)
        const searchByNameOrSymbol = (symb: string): PoolIF[] =>
            analyticsPoolList
                .filter((pool: PoolIF) =>
                    matchSearchInput(symb, [
                        pool.baseToken.symbol,
                        pool.quoteToken.symbol,
                        pool.baseToken.name,
                        pool.quoteToken.name,
                    ]),
                )
                .filter(
                    (pool: PoolIF) =>
                        tokens.verify(pool.base) && tokens.verify(pool.quote),
                );
        // fn to return list of verified pools with no search filtering
        const noSearch = (): PoolIF[] =>
            analyticsPoolList.filter(
                (pool: PoolIF) =>
                    tokens.verify(pool.base) && tokens.verify(pool.quote),
            );
        // variable to hold the list of pools generated by the search
        let filteredPools: PoolIF[];
        // logic router to apply the relevant search function
        switch (searchAs) {
            case 'address':
                filteredPools = searchByAddress(validatedInput);
                break;
            case 'nameOrSymbol':
                filteredPools = searchByNameOrSymbol(validatedInput);
                break;
            case 'ens':
            case null:
            default:
                filteredPools = noSearch();
        }
        // sort returned pools before sending data to the app
        const sortedPools: PoolIF[] = filteredPools.sort(
            (poolA: PoolIF, poolB: PoolIF) => {
                // logic to assign numerical priority to a pool (scale is arbitrary)
                function getPoolPriority(pool: PoolIF): number {
                    // fn to increment the output value
                    function getTokenPriority(tkn: TokenIF): number {
                        let count: number;
                        if (tkn.address === ZERO_ADDRESS) {
                            count = Object.keys(tokenListURIs).length;
                        } else if (tkn.listedBy) {
                            count = tkn.listedBy.length;
                        } else {
                            count = 1;
                        }
                        return count;
                    }
                    // return overall priority value
                    return (
                        getTokenPriority(pool.baseToken) +
                        getTokenPriority(pool.quoteToken)
                    );
                }
                // sort by relative popularity of tokens in the pool
                return getPoolPriority(poolB) - getPoolPriority(poolA);
            },
        );
        // send data to `useState()` hook which returns to the app
        setOutputPools(sortedPools);
    }, [validatedInput]);

    // array of range positions to output from the hook
    const [outputPositions, setOutputPositions] = useState<PositionIF[]>([]);

    // logic to update the output range positions from the hook
    // this does NOT apply token verification because data is specific to user
    // presumably user wants to see their position data regardless of token validity
    useEffect(() => {
        // fn to filter range positions by address (must be exact, will fix for casing mismatch)
        const searchByAddress = (addr: string): PositionIF[] =>
            positionList
                // filter positions for ones with a matching address
                .filter((position: PositionIF) =>
                    matchSearchInput(
                        addr,
                        [position.base, position.quote],
                        SEARCH_EXACT,
                    ),
                )
                // remove empty positions from search results
                .filter((pos: PositionIF) => pos.totalValueUSD);
        // fn to filter range positions by symbol (must be exact IF input is two characters)
        const searchByNameOrSymbol = (symb: string): PositionIF[] =>
            positionList
                .filter((position: PositionIF) =>
                    matchSearchInput(symb, [
                        position.baseSymbol,
                        position.quoteSymbol,
                        position.baseName,
                        position.quoteName,
                    ]),
                )
                // remove empty positions from search results
                .filter((pos: PositionIF) => pos.totalValueUSD);
        // fn to return list of range positions with no search filtering
        const noSearch = (): PositionIF[] => positionList;
        // output variable to hold the array of range positions generated by the search filter
        let filteredRangePositions: PositionIF[];
        // logic router to apply the relevant search function to filter range positions
        switch (searchAs) {
            case 'address':
                filteredRangePositions = searchByAddress(validatedInput);
                break;
            case 'nameOrSymbol':
                filteredRangePositions = searchByNameOrSymbol(validatedInput);
                break;
            case 'ens':
            case null:
            default:
                filteredRangePositions = noSearch();
        }
        // send positions filtered by search input to local state (to be returned from this file)
        setOutputPositions(filteredRangePositions);
    }, [positionList.length, validatedInput]);

    // array of range positions to output from the hook
    const [outputTxs, setOutputTxs] = useState<TransactionIF[]>([]);

    // logic to update the output txs from the hook
    // this does NOT apply token verification because data is specific to user
    // presumably user wants to see their txs regardless of token validity
    useEffect(() => {
        // fn to filter txs by address (must be exact, will fix for casing mismatch)
        const searchByAddress = (addr: string): TransactionIF[] =>
            txList.filter((tx: TransactionIF) =>
                matchSearchInput(addr, [tx.base, tx.quote], SEARCH_EXACT),
            );
        // fn to filter txs by symbol (must be exact IF input is two characters)
        const searchByNameOrSymbol = (symb: string): TransactionIF[] =>
            txList.filter((tx: TransactionIF) =>
                matchSearchInput(symb, [
                    tx.baseSymbol,
                    tx.quoteSymbol,
                    tx.baseName,
                    tx.quoteName,
                ]),
            );
        // fn to return array of txs with no search filtering
        const noSearch = (): TransactionIF[] => txList;
        // output variable to hold the array of txs generated by the search filter
        let filteredTxs: TransactionIF[];
        // logic router to apply the relevant search function to filter txs
        switch (searchAs) {
            case 'address':
                filteredTxs = searchByAddress(validatedInput);
                break;
            case 'nameOrSymbol':
                filteredTxs = searchByNameOrSymbol(validatedInput);
                break;
            case 'ens':
            case null:
            default:
                filteredTxs = noSearch();
        }
        // send txs filtered by search input to local state (to be returned from this file)
        setOutputTxs(filteredTxs);
    }, [txList.length, validatedInput]);

    // array of range positions to output from the hook
    const [outputLimits, setOutputLimits] = useState<LimitOrderIF[]>([]);

    // logic to update the output txs from the hook
    // this does NOT apply token verification because data is specific to user
    // presumably user wants to see their txs regardless of token validity
    useEffect(() => {
        // fn to filter txs by address (must be exact, will fix for casing mismatch)
        const searchByAddress = (addr: string): LimitOrderIF[] =>
            limitOrderList.filter((limitOrder: LimitOrderIF) =>
                matchSearchInput(
                    addr,
                    [limitOrder.base, limitOrder.quote],
                    SEARCH_EXACT,
                ),
            );
        // fn to filter txs by symbol (must be exact IF input is two characters)
        const searchByNameOrSymbol = (symb: string): LimitOrderIF[] =>
            limitOrderList.filter((limitOrder: LimitOrderIF) =>
                matchSearchInput(symb, [
                    limitOrder.baseSymbol,
                    limitOrder.quoteSymbol,
                    limitOrder.baseName,
                    limitOrder.quoteName,
                ]),
            );
        // fn to return array of txs with no search filtering
        const noSearch = (): LimitOrderIF[] => limitOrderList;
        // output variable to hold the array of txs generated by the search filter
        let filteredLimits: LimitOrderIF[];
        // logic router to apply the relevant search function to filter txs
        switch (searchAs) {
            case 'address':
                filteredLimits = searchByAddress(validatedInput);
                break;
            case 'nameOrSymbol':
                filteredLimits = searchByNameOrSymbol(validatedInput);
                break;
            case 'ens':
            case null:
            default:
                filteredLimits = noSearch();
        }
        // send txs filtered by search input to local state (to be returned from this file)
        setOutputLimits(filteredLimits);
    }, [limitOrderList.length, validatedInput]);

    // data returned when querying address as a wallet
    const [outputWallets, setOutputWallets] = useState<walletHexAndENS[]>([]);

    // logic to query search input as a wallet
    useEffect(() => {
        // fn to run query when user enters a hex address
        async function fetchWalletByHex(searchStr: string): Promise<void> {
            // construct a queryable endpoint for wallet data
            let walletEndpoint: string = activeNetwork.GCGO_URL;
            walletEndpoint += '/user_txs?';
            walletEndpoint += new URLSearchParams({
                user: searchStr.toLowerCase(),
                chainId: activeNetwork.chainId.toLowerCase(),
                n: '1',
            });
            // determine if user-created search input is a wallet (implied by tx data present)
            const isWallet: boolean | undefined = await fetch(walletEndpoint)
                .then((response) => response.json())
                .then((response) => !!response.data)
                .catch((err) => {
                    IS_LOCAL_ENV && console.warn(err);
                    return undefined;
                });
            // search for an ENS address if input is a wallet, otherwise reset state data
            if (isWallet) {
                const ens = await fetchEnsAddress(searchStr);
                setOutputWallets([
                    {
                        hex: searchStr,
                        ens: ens ?? null,
                    },
                ]);
                setContentGroup('wallet');
            } else {
                setOutputWallets([]);
                setContentGroup('token');
            }
        }
        // fn to run query when user enters an ENS address
        function fetchWalletByENS(searchStr: string) {
            if (mainnetProvider) {
                mainnetProvider
                    .resolveName(searchStr)
                    .then((res) => {
                        if (res) {
                            setOutputWallets([
                                {
                                    hex: res,
                                    ens: searchStr,
                                },
                            ]);
                            setContentGroup('wallet');
                        } else {
                            setOutputWallets([]);
                            setContentGroup('wallet');
                        }
                    })
                    .catch((err) => {
                        IS_LOCAL_ENV && console.warn(err);
                        setOutputWallets([]);
                    });
            }
        }
        // logic router to only run a query if input validates as an address
        // if input validates, run the query (results may still be negative)
        // if input does not validate, do not query and nullify any prior data
        if (searchAs === 'address') {
            fetchWalletByHex(validatedInput);
        } else if (searchAs === 'ens') {
            fetchWalletByENS(validatedInput);
        } else {
            setOutputWallets([]);
        }
    }, [validatedInput]);

    return {
        rawInput,
        contentGroup,
        setInput: setRawInput,
        clearInput: () => setRawInput(''),
        isInputValid: !!searchAs,
        pools: outputPools,
        positions: outputPositions,
        txs: outputTxs,
        limits: outputLimits,
        wallets: outputWallets,
    };
};
