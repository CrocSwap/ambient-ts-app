import { useEffect, useMemo, useState, Dispatch, SetStateAction } from 'react';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../utils/interfaces/exports';
import { tokenMethodsIF } from './useTokens';
import { tokenListURIs } from '../../utils/data/tokenListURIs';

export const useTokenSearch = (
    chainId: string,
    tokens: tokenMethodsIF,
    walletTokens: TokenIF[],
    getRecentTokens: () => TokenIF[],
): [TokenIF[], string, Dispatch<SetStateAction<string>>, string] => {
    // TODO: debounce this input later
    // TODO: figure out if we need to update EVERYTHING to the debounced value
    // raw input from the user
    const [input, setInput] = useState<string>('');

    // search type ➜ '' or 'address' or 'nameOrAddress'
    const [searchAs, setSearchAs] = useState<string>('');

    const recentTxTokens = useAppSelector(
        (state) => state.userData.recentTokens,
    );

    // cleaned and validated version of raw user input
    const validatedInput = useMemo<string>(() => {
        // trim string and make it lower case
        const cleanInput = input.trim().toLowerCase();
        // action if input appears to be a contract address
        if (
            cleanInput.length === 42 ||
            (cleanInput.length === 40 && !cleanInput.startsWith('0x'))
        ) {
            setSearchAs('address');
            // if not an apparent token address, search name and symbol
            // if not an apparent token address, search name and symbol
        } else if (cleanInput.length >= 2) {
            setSearchAs('nameOrSymbol');
            return cleanInput;
            // otherwise treat as if there is no input entered
            // otherwise treat as if there is no input entered
        } else {
            setSearchAs('');
            return '';
        }
        // add '0x' to the front of the cleaned string if not present
        const fixedInput = cleanInput.startsWith('0x')
            ? cleanInput
            : '0x' + cleanInput;
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

    // hook to track tokens to output and render in DOM
    const [outputTokens, setOutputTokens] = useState<TokenIF[]>([]);

    // hook to update the value of outputTokens based on user input
    useEffect(() => {
        // fn to run a token search by contract address
        function searchAsAddress(): TokenIF[] {
            // determined whether a known token exists for user input as an address
            // this check is run against tokens listed in `allTokenLists`
            const tokenLookup: TokenIF | undefined =
                tokens.getTokenByAddress(validatedInput);
            return tokenLookup ? [tokenLookup] : [];
        }

        // fn to run a token search by name or symbol
        function searchAsNameOrSymbol(): TokenIF[] {
            // determine if the validated input is exactly two characters
            // for two-character input, app should only return exact matches
            const exactOnly: boolean = validatedInput.length === 2;
            // check tokens in `allTokenLists` for tokens that match validated input
            return tokens.getTokensByNameOrSymbol(validatedInput, exactOnly);
        }

        // fn to run if the app does not recognize input as an address or name or symbol
        function noSearch(): TokenIF[] {
            // initialize an array of tokens to output, seeded with Ambient default
            const outputTokens: TokenIF[] = tokens.defaultTokens;
            // fn to add tokens from an array to the output array
            const addTokensToOutput = (
                newTokens: TokenIF[],
                verificationNeeded: boolean,
                maxToAdd: number,
            ): void => {
                // counter to track how many tokens from array have been added
                let limiter = 0;
                // logic to iterate through all tokens in array parameter
                for (let i = 0; i < newTokens.length; i++) {
                    // check if current token at index is already in the ouput variable
                    const isInArray = outputTokens.some(
                        (tk: TokenIF) =>
                            tk.address.toLowerCase() ===
                                newTokens[i].address.toLowerCase() &&
                            tk.chainId === newTokens[i].chainId,
                    );
                    // check if token is recognized from a list (if necessary)
                    const isTokenKnown = verificationNeeded
                        ? tokens.verifyToken(newTokens[i].address)
                        : true;
                    // add token to output if not already there and limiter is below max
                    if (!isInArray && isTokenKnown && limiter < maxToAdd) {
                        limiter++;
                        outputTokens.push(newTokens[i]);
                    }
                }
            };
            // add wallet tokens to output array
            addTokensToOutput(walletTokens, true, 2);
            // add tokens from recent txs to output array
            addTokensToOutput(recentTxTokens ?? [], false, 2);
            // add recent tokens to output array
            addTokensToOutput(getRecentTokens(), false, 2);
            // remove off-chain tokens from output array
            const ouputTokensOnChain = outputTokens.filter(
                (tk: TokenIF) => tk.chainId === parseInt(chainId),
            );
            return ouputTokensOnChain;
        }

        // declare an output variable
        let foundTokens: TokenIF[];
        // logic router to assign search results to output based on input type
        switch (searchAs) {
            case 'address':
                foundTokens = searchAsAddress();
                break;
            case 'nameOrSymbol':
                foundTokens = searchAsNameOrSymbol();
                break;
            default:
                foundTokens = noSearch();
        }
        // sort to list tokens higher which are recognized by more authorities
        // keep tokens listed by Ambient at the top
        const sortedTokens: TokenIF[] = foundTokens.sort(
            (a: TokenIF, b: TokenIF) => {
                const isOnAmbientList = (t: TokenIF) =>
                    t.listedBy?.includes(tokenListURIs.ambient);
                function comparePopularity(): number {
                    const getPopularity = (tkn: TokenIF): number =>
                        tkn.listedBy?.length ?? 1;
                    const popularityTokenA: number = getPopularity(a);
                    const popularityTokenB: number = getPopularity(b);
                    return popularityTokenB - popularityTokenA;
                }
                let rank: number;
                if (isOnAmbientList(a) && isOnAmbientList(b)) {
                    rank = comparePopularity();
                } else if (isOnAmbientList(a)) {
                    rank = -1;
                } else if (isOnAmbientList(b)) {
                    rank = 1;
                } else {
                    rank = comparePopularity();
                }
                return rank;
            },
        );
        // send found tokens to local state hook
        // this will be the array of tokens returned by the hook
        setOutputTokens(sortedTokens);
        // run hook every time the validated input from the user changes
        // will ignore changes that do not pass validation (eg adding whitespace)
    }, [
        chainId,
        tokens.defaultTokens,
        walletTokens.length,
        getRecentTokens().length,
        validatedInput,
    ]);

    // outputTokens ➜ tokens to display in DOM
    // validatedInput ➜ user input after validation mods
    // setInput ➜ function to update raw user input from the DOM
    // searchAs ➜ type of search the app is running
    return [outputTokens, validatedInput, setInput, searchAs];
};
