import {
    useEffect,
    useMemo,
    useState,
    Dispatch,
    SetStateAction
} from 'react';
import { TokenIF } from '../../../utils/interfaces/exports';
// import { ambientTokenList } from '../../../utils/data/ambientTokenList';

export const useSoloSearch = (
    chainId: string,
    importedTokens: TokenIF[],
    tokensOnActiveLists: Map<string, TokenIF>
): [
    TokenIF[] | null,
    TokenIF[] | null,
    string,
    Dispatch<SetStateAction<string>>,
    string
] => {
    // console.log(tokensOnActiveLists);
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

    const [importedTokensForDOM, setImportedTokensForDOM] = useState<TokenIF[]>([]);
    const [otherTokensForDOM, setOtherTokensForDOM] = useState<TokenIF[]>([]);
    useEffect(() => {
        const importedTokensOnChain = importedTokens.filter(
            (tkn: TokenIF) => tkn.chainId === parseInt(chainId)
        );

        const otherTokensOnChain = [...tokensOnActiveLists.values()].filter(
            (tkn: TokenIF) => (
                tkn.chainId === parseInt(chainId) &&
                !importedTokensOnChain.some((tk: TokenIF) => (
                    tk.address === tkn.address
                ))
            )
        );

        const searchByAddress = (searchString: string) => {
            const importedMatches = importedTokensOnChain.filter(
                (tkn: TokenIF) => tkn.address === searchString
            );
            setImportedTokensForDOM(importedMatches);
            const otherMatches = otherTokensOnChain.filter(
                (tkn: TokenIF) => tkn.address === searchString
            );
            setOtherTokensForDOM(otherMatches);
        }

        const searchByNameOrSymbol = (searchString: string) => {
            const importedMatches = importedTokensOnChain.filter(
                (tkn: TokenIF) => (
                    tkn.name.toLowerCase().includes(searchString) ||
                    tkn.symbol.toLowerCase().includes(searchString)
                )
            );
            setImportedTokensForDOM(importedMatches);
            const otherMatches = otherTokensOnChain.filter(
                (tkn: TokenIF) => (
                    tkn.name.toLowerCase().includes(searchString) ||
                    tkn.symbol.toLowerCase().includes(searchString)
                )
            );
            setOtherTokensForDOM(otherMatches);
        }

        const noSort = () => {
            setImportedTokensForDOM(importedTokensOnChain);
            setOtherTokensForDOM([]);
        }

        switch (searchAs) {
            case 'address':
                searchByAddress(validatedInput);
                break;
            case 'nameOrSymbol':
                searchByNameOrSymbol(validatedInput);
                break;
            default:
                noSort();
        }
    }, [importedTokens, validatedInput]);

    // token === token data object or null
    // input === raw input from the user
    // setInput === useState setter function for raw input
    return [
        importedTokensForDOM,
        otherTokensForDOM,
        input.trim(),
        setInput,
        searchAs
    ];
}