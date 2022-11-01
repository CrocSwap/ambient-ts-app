import { useEffect, useMemo, useState, Dispatch, SetStateAction } from 'react';
import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';
import { ambientTokenList } from '../../../utils/data/ambientTokenList';

export const useSoloSearch = (
    chainId: string
): [
    TokenIF | null,
    Dispatch<SetStateAction<string>>
] => {
    // raw input from the user
    const [input, setInput] = useState('');

    // cleaned and validated version of raw user input
    const validatedInput = useMemo(() => {
        // trim string and make it lower case
        const cleanInput = input.trim().toLowerCase();
        // add '0x' to the front of the cleaned string if not present
        const fixedInput = cleanInput.startsWith('0x')
            ? cleanInput
            : '0x' + cleanInput;
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
    const [token, setToken] = useState<TokenIF|null>(null);

    // control flow to gatekeep secondary and tertiary calls
    const [isTokenFound, setIsTokenFound] = useState(false);

    useEffect(() => {
        setIsTokenFound(false);
        validatedInput || setToken(null);
        const findToken = (tokens: TokenIF[]) => tokens.find(
            (token) => token.address === input && token.chainId === parseInt(chainId)
        );
        // first check ambient list
        if (validatedInput && ambientTokenList) {
            const tkn = findToken(ambientTokenList.tokens) as TokenIF;
            tkn && setIsTokenFound(true);
            tkn && setToken(tkn);
        }
        // if not found check CoinGecko
        if (
            validatedInput &&
            localStorage.allTokenLists &&
            !isTokenFound
        ) {
            const coinGeckoTokens = JSON.parse(localStorage.getItem('allTokenLists') as string).find((list: TokenListIF) => list.name === 'CoinGecko').tokens;
            const tkn = findToken(coinGeckoTokens) as TokenIF;
            tkn && setIsTokenFound(true);
            tkn && setToken(tkn);
        }
        // if not found pull data from on-chain
    }, [validatedInput]);
    return [token, setInput];
}