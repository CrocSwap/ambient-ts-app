import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { TokenIF, TempPoolIF } from '../../../utils/interfaces/exports';

export const useSidebarSearch = (
    poolList: TempPoolIF[],
    verifyToken: (addr: string, chn: string) => boolean
): [
    Dispatch<SetStateAction<string>>,
    boolean,
    TempPoolIF[]
] => {
    // memoized list of pools where both tokens can be verified
    // can be a useMemo because poolList will initialize as empty array
    const verifiedPools = useMemo<TempPoolIF[]>(() => {
        // get array of acknowledged tokens from local storage
        const {ackTokens} = JSON.parse(localStorage.getItem('user') as string);
        // function to verify token either in token map or in acknowledged tokens
        const checkToken = (addr: string, chn: string): boolean => {
            // check if token can be verified in token map
            const isKnown = verifyToken(addr.toLowerCase(), chn);
            // check if token was previously acknowledged by user
            const isAcknowledged = ackTokens.some((ackTkn: TokenIF) => (
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
        return checkedPools;
    }, [poolList.length]);

    // raw user input from the DOM
    const [rawInput, setRawInput] = useState<string>('');

    // search type ➜ '' or 'address' or 'nameOrAddress'
    const [searchAs, setSearchAs] = useState<string|null>(null);

    // cleaned and validated version of raw user input
    const validatedInput = useMemo<string>(() => {
        // trim string and make it lower case
        const cleanInput = rawInput.trim().toLowerCase();
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

    const [outputPools, setOutputPools] = useState<TempPoolIF[]>([]);

    useEffect(() => {
        const searchByAddress = (addr: string): TempPoolIF[] => verifiedPools.filter(
            (pool: TempPoolIF) => (
                pool.base.toLowerCase() === addr.toLowerCase() ||
                pool.quote.toLowerCase() === addr.toLowerCase()
            )
        );
        const searchBySymbol = (symb: string): TempPoolIF[] => verifiedPools.filter(
            (pool: TempPoolIF) => (
                pool.baseSymbol.toLowerCase() === symb.toLowerCase() ||
                pool.quoteSymbol.toLowerCase() === symb.toLowerCase()
            )
        );
        const noSearch = () => verifiedPools;
        let filteredPools: TempPoolIF[];
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
        setOutputPools(filteredPools.slice(0, 4));
    }, [poolList.length, validatedInput]);

    return [
        setRawInput,
        !!searchAs,
        outputPools.slice(0, 4)
    ];
}