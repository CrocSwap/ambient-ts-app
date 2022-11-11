import {
    useEffect,
    useMemo,
    useState,
    Dispatch,
    SetStateAction
} from 'react';
import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';
import { ambientTokenList } from '../../../utils/data/ambientTokenList';

export const useSoloSearch = (
    chainId: string,
    tokensOnActiveLists: Map<string, TokenIF>
): [
    TokenIF[] | null,
    string,
    Dispatch<SetStateAction<string>>,
    string
] => {
    console.log(tokensOnActiveLists);
    // raw input from the user
    const [input, setInput] = useState('');

    const [searchAs, setSearchAs] = useState('');

    // cleaned and validated version of raw user input
    const validatedInput = useMemo(() => {
        // trim string and make it lower case
        const cleanInput = input.trim().toLowerCase();
        // action if input appears to be a contract address
        if (
            cleanInput.length === (42) ||
            (
                cleanInput.length === (40) &&
                !cleanInput.startsWith('0x')
            )
        ) {
            setSearchAs('address');
        // if not an apparent token address search name and symbol
        } else if (cleanInput.length >= 2) {
            setSearchAs('nameOrSymbol');
            return cleanInput;
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

    // data object for token matching user query
    const [tokens, setTokens] = useState<TokenIF[]|null>(null);

    // control flow to gatekeep secondary and tertiary calls
    const [isTokenFound, setIsTokenFound] = useState(false);

    useEffect(() => {
        // reset value to false used to gatekeep queries
        setIsTokenFound(false);

        // make sure raw user input has been validated
        // if not, set token data object to null
        validatedInput || setTokens(null);

        // TODO:  @Emily refactor this to a switch (case)
        // fn to find token in an array of tokens by address and chain ID
        const findToken = (
            tokens: TokenIF[],
            searchType: string
        ) => {
            if (searchType === 'address') {
                const tkn = tokens.find((token) =>
                    token.address.toLowerCase() === validatedInput && token.chainId === parseInt(chainId)
                );
                return [tkn];
            } else if (searchType === 'nameOrSymbol') {
                const outputTokens:TokenIF[] = [];
                // TODO: refactor this as a .filter()
                tokens.forEach((token) => {
                    if (
                        token.name.toLowerCase().includes(validatedInput) ||
                        token.symbol.toLowerCase().includes(validatedInput)
                    ) {
                        outputTokens.push(token);
                    }
                })
                return outputTokens;
            } else {
                console.warn(`Error in fn findToken() in useSoloSearch.ts file.  Did not receive a valid value for parameter <<searchType>>. Acceptable values include <<'address'>> and <<'nameOrSymbol'>> of type <<string>>, received value <<${searchType}>> of type <<${typeof searchType}>>. Fn will return an empty array.`);
                return [];
            }
        };

        // fn to update local state if a token is found
        const updateToken = (tkn: TokenIF[]) => {
            setIsTokenFound(true);
            setTokens(tkn);
        }

        // first check ambient list
        if (validatedInput && ambientTokenList) {
            // find token in the ambient token list
            const tkns = findToken(ambientTokenList.tokens, searchAs) as TokenIF[];
            // update local state if a token is found
            tkns && updateToken(tkns);
            // next line prevents the app from running subsequent searches
            return;
        }

        // if not found check CoinGecko
        if (
            validatedInput &&
            localStorage.allTokenLists &&
            !isTokenFound
        ) {
            // get tokens array from CoinGecko list in local storage
            const coinGeckoTokens = JSON.parse(localStorage.getItem('allTokenLists') as string)
                .find((list: TokenListIF) => list.name === 'CoinGecko')
                .tokens;
            // find token in CoinGecko token list
            const tkn = findToken(coinGeckoTokens, searchAs) as TokenIF[];
            // update local state if a token is found
            tkn && updateToken(tkn);
        }

        console.log([...tokensOnActiveLists.values()])

        // for(const val of tokensOnActiveLists.values()) {
        //     if(val.name.includes('ETH')) console.log('it matches');
        // }

        // for(const key of tokensOnActiveLists.keys()) {
        //     if(key.includes('0x')) return key;
        //   }

    // TODO: if not found pull data from on-chain

    // run hook when validated user input changes
    // this prevents queries without valid input
    }, [validatedInput]);

    // token === token data object or null
    // input === raw input from the user
    // setInput === useState setter function for raw input
    return [
        tokens,
        input.trim(),
        setInput,
        searchAs
    ];
}