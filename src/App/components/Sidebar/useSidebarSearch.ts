import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { TokenIF, TempPoolIF } from '../../../utils/interfaces/exports';
import { recursiveMax } from '../../../utils/errors/recursiveMax';

export const useSidebarSearch = (
    poolList: TempPoolIF[],
    verifyToken: (addr: string, chn: string) => boolean
): [
    Dispatch<SetStateAction<string>>,
    boolean,
    TempPoolIF[]
] => {
    // raw user input from the DOM
    const [rawInput, setRawInput] = useState<string>('');

    // search type ➜ '' or 'address' or 'nameOrAddress'
    const [searchAs, setSearchAs] = useState<string|null>(null);

    // cleaned and validated version of raw user input
    const validatedInput = useMemo<string>(() => {
        // trim string and make it lower case
        const cleanInput: string = rawInput.trim().toLowerCase();
        // action if input appears to be a contract address
        if (
            cleanInput.length === 42 ||
            (cleanInput.length === 40 && !cleanInput.startsWith('0x'))
        ) {
            setSearchAs('address');
            // if not an apparent token address, search name and symbol
        } else if (cleanInput.length >= 2) {
            setSearchAs('nameOrSymbol');
            return cleanInput;
            // otherwise treat as if there is no input entered
        } else {
            setSearchAs(null);
            return '';
        }
        // add '0x' to the front of the cleaned string if not present
        const fixedInput = cleanInput.startsWith('0x') ? cleanInput : '0x' + cleanInput;
        // declare an output variable
        let output = cleanInput;
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
    }, [rawInput]);

    // sub-array of pools in which both tokens have been verified
    const [verifiedPools, setVerifiedPools] = useState<TempPoolIF[]>([]);

    // array of custom tokens acknowledged by the user from local storage
    const [ackTokens, setAckTokens] = useState<TokenIF[]|null>(null);

    useEffect(() => {
        const getAckTokens = (limiter=1): void => {
            const userData = JSON.parse(localStorage.getItem('user') as string);
            if (userData.ackTokens) {
                setAckTokens(userData.ackTokens);
            } else if (limiter < 20) {
                setTimeout(() => getAckTokens(limiter+1), 100);
            } else {
                recursiveMax('warn');
            }
        };
        getAckTokens();
    }, []);

    // memoized list of pools where both tokens can be verified
    // can be a useMemo because poolList will initialize as empty array
    useEffect(() => {
        const verifyPools = (limiter=1): void => {
            if (ackTokens) {
                // function to verify token either in token map or in acknowledged tokens
                const checkToken = (addr: string, chn: string): boolean => {
                    // check if token can be verified in token map
                    const isKnown: boolean = verifyToken(addr.toLowerCase(), chn);
                    // check if token was previously acknowledged by user
                    const isAcknowledged: boolean = ackTokens.some((ackTkn: TokenIF) => (
                        ackTkn.chainId === parseInt(chn) &&
                        ackTkn.address.toLowerCase() === addr.toLowerCase()
                    ));
                    // return true if either verification passed
                    return isKnown || isAcknowledged;
                }
                // filter array of tokens where both tokens can be verified
                const checkedPools = poolList.filter((pool: TempPoolIF) => (
                    checkToken(pool.base, pool.chainId) && checkToken(pool.quote, pool.chainId)
                ));
                // return array of pools with both verified tokens
                setVerifiedPools(checkedPools);
            } else if (limiter < 20) {
                setTimeout(() => verifyPools(limiter+1), 150);
            } else {
                recursiveMax('warn');
            }
        }
        verifyPools();
    }, [ackTokens, poolList.length, validatedInput]);

    // array of pools to output from the hook
    const [outputPools, setOutputPools] = useState<TempPoolIF[]>([]);

    // logic to update the output pools from the hook
    useEffect(() => {
        // fn to filter pools by address (must be exact)
        const searchByAddress = (addr: string): TempPoolIF[] => verifiedPools.filter(
            (pool: TempPoolIF) => (
                pool.base.toLowerCase() === addr.toLowerCase() ||
                pool.quote.toLowerCase() === addr.toLowerCase()
            )
        );
        // fn to filter pools by symbol (must be exact IF input is two characters)
        const searchBySymbol = (symb: string): TempPoolIF[] => verifiedPools.filter(
            (pool: TempPoolIF) => symb.length === 2
                ? (
                    pool.baseSymbol.toLowerCase() === symb.toLowerCase() ||
                    pool.quoteSymbol.toLowerCase() === symb.toLowerCase()
                )
                : (
                    pool.baseSymbol.toLowerCase().includes(symb.toLowerCase()) ||
                    pool.quoteSymbol.toLowerCase().includes(symb.toLowerCase())
                )
        );
        // fn to return list of verified pools with no search filtering
        const noSearch = (): TempPoolIF[] => verifiedPools;
        // variable to hold the list of pools generated by the search
        let filteredPools: TempPoolIF[];
        // logic router to apply the relevant search function
        switch (searchAs) {
            case 'address':
                filteredPools = searchByAddress(validatedInput);
                break;
            case 'nameOrSymbol':
                filteredPools = searchBySymbol(validatedInput);
                break;
            case '':
            default:
                filteredPools = noSearch();
        }
        setOutputPools(filteredPools);
    }, [verifiedPools.length, validatedInput]);

    return [
        setRawInput,
        !!searchAs,
        outputPools
    ];
}