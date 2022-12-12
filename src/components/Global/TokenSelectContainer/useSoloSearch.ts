import { useEffect, useMemo, useState, Dispatch, SetStateAction } from 'react';
import { TokenIF } from '../../../utils/interfaces/exports';

export const useSoloSearch = (
    chainId: string,
    importedTokens: TokenIF[],
    verifyToken: (addr: string, chn: string) => boolean,
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined,
): [TokenIF[], string, Dispatch<SetStateAction<string>>, string] => {
    // memoize default list of tokens to display in DOM
    const importedTokensOnChain = useMemo(() => (
        importedTokens.filter((tkn) => tkn.chainId === parseInt(chainId))
    ), [chainId]);
    
    // raw input from the user
    const [input, setInput] = useState('');

    // search type => '' or 'address' or 'nameOrAddress'
    const [searchAs, setSearchAs] = useState('');

    // cleaned and validated version of raw user input
    const validatedInput = useMemo(() => {
        // trim string and make it lower case
        const cleanInput = input.trim().toLowerCase();
        // action if input appears to be a contract address
        if (
            cleanInput.length === 42 ||
            (cleanInput.length === 40 && !cleanInput.startsWith('0x'))
        ) {
            setSearchAs('address');
            // if not an apparent token address search name and symbol
        } else if (cleanInput.length >= 3) {
            setSearchAs('nameOrSymbol');
            return cleanInput;
            // otherwise treat as if there is no input entered
        } else {
            setSearchAs('');
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
    }, [input]);

    const [outputTokens, setOutputTokens] = useState<TokenIF[]>(importedTokensOnChain);
    useEffect(() => {
        // make one set of tokens to render
        // default is the basic imported tokens wherever they come from now
        const tokenExists = verifyToken(validatedInput, chainId);
        if (validatedInput) {
            tokenExists && setOutputTokens(
                [getTokenByAddress(validatedInput, chainId) as TokenIF]
            );
        } else {
            setOutputTokens(importedTokensOnChain);
        }
    }, [validatedInput]);

    return [outputTokens, validatedInput, setInput, searchAs];
};