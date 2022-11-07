import { useEffect, useMemo, useState, Dispatch, SetStateAction } from 'react';
import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';
import { ambientTokenList } from '../../../utils/data/ambientTokenList';

export const useSoloSearch = (
    chainId: string,
): [TokenIF | null, string, Dispatch<SetStateAction<string>>] => {
    // raw input from the user
    const [input, setInput] = useState('');

    // cleaned and validated version of raw user input
    const validatedInput = useMemo(() => {
        // trim string and make it lower case
        const cleanInput = input.trim().toLowerCase();
        // add '0x' to the front of the cleaned string if not present
        const fixedInput = cleanInput.startsWith('0x') ? cleanInput : '0x' + cleanInput;
        // declare an output variable
        let output = '';
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

    // data object for token matching user query
    const [token, setToken] = useState<TokenIF | null>(null);

    // control flow to gatekeep secondary and tertiary calls
    const [isTokenFound, setIsTokenFound] = useState(false);

    useEffect(() => {
        // reset value to false used to gatekeep queries
        setIsTokenFound(false);

        // make sure raw user input has been validated
        // if not, set token data object to null
        validatedInput || setToken(null);

        // fn to find token in an array of tokens by address and chain ID
        const findToken = (tokens: TokenIF[]) =>
            tokens.find(
                (token) =>
                    token.address.toLowerCase() === validatedInput &&
                    token.chainId === parseInt(chainId),
            );

        // fn to update local state if a token is found
        const updateToken = (tkn: TokenIF) => {
            setIsTokenFound(true);
            setToken(tkn);
        };

        // first check ambient list
        if (validatedInput && ambientTokenList) {
            // find token in the ambient token list
            const tkn = findToken(ambientTokenList.tokens) as TokenIF;
            // update local state if a token is found
            tkn && updateToken(tkn);
        }

        // if not found check CoinGecko
        if (validatedInput && localStorage.allTokenLists && !isTokenFound) {
            // get tokens array from CoinGecko list in local storage
            const coinGeckoTokens = JSON.parse(
                localStorage.getItem('allTokenLists') as string,
            ).find((list: TokenListIF) => list.name === 'CoinGecko').tokens;
            // find token in CoinGecko token list
            const tkn = findToken(coinGeckoTokens) as TokenIF;
            // update local state if a token is found
            tkn && updateToken(tkn);
        }

        // TODO: if not found pull data from on-chain

        // run hook when validated user input changes
        // this prevents queries without valid input
    }, [validatedInput]);

    // token === token data object or null
    // input === raw input from the user
    // setInput === useState setter function for raw input
    return [token, input.trim(), setInput];
};
