import { useEffect, useState, SetStateAction, Dispatch } from 'react';
import { TokenIF } from '../../../utils/interfaces/exports';

export const useSearch = (
    tokensBank:Array<TokenIF>,
    searchableTokens:Array<TokenIF>,
    chainId: string
): [ TokenIF[], TokenIF[], Dispatch<SetStateAction<string>> ] => {

    // current value of search input field
    const [searchInput, setSearchInput] = useState('');

    // filtered array of tokens for the user's imported tokens list 
    const [matchingImportedTokens, setMatchingImportedTokens] = useState<Array<TokenIF>>(tokensBank);

    // filtered array of all tokens from all active token lists
    const [matchingSearchableTokens, setMatchingSearchableTokens] = useState<Array<TokenIF>>([]);

    // gatekeeper value to only apply search if search string is three or more characters
    const validSearch = searchInput.length >= 3;

    // function to determine if a string includes a given search input
    const checkMatchLowerCase = (text:string) => text.toLowerCase().includes(searchInput.toLowerCase());

    // function to filter an array of tokens for string matches by symbol, name, and address
    const searchTokens = (listOfTokens:Array<TokenIF>) => {
        const matchingTokens = listOfTokens.filter((token:TokenIF) => 
            checkMatchLowerCase(token.symbol)
            || checkMatchLowerCase(token.name)
            || checkMatchLowerCase(token.address)
        )
        // remove off-chain tokens from the search results
        return filterOnChain(matchingTokens);
    };

    // function to filter an array of tokens as matching the current chain
    const filterOnChain = (tokens:Array<TokenIF>) => (
        tokens.filter((token:TokenIF) => token.chainId === parseInt(chainId))
    );

    useEffect(() => {
        // filter imported tokens if user input string is validated
        const matchingImported = validSearch ? searchTokens(tokensBank) : filterOnChain(tokensBank);
        // update local state with array of imported tokens to be rendered in DOM
        setMatchingImportedTokens(matchingImported);
        // filter searchable tokens if user input string is validated
        const matchingSearchable = validSearch ? searchTokens(searchableTokens) : [];
        // update local state with array of searchable tokens to be rendered in DOM
        setMatchingSearchableTokens(matchingSearchable);
    }, [searchInput, tokensBank, searchableTokens]);

    return [matchingImportedTokens, matchingSearchableTokens, setSearchInput];
}