import { SetStateAction } from 'react';
import { TokenIF } from '../../../utils/interfaces/exports';

export default function handleSearch(
    searchStr:string,
    tokensBank:Array<TokenIF>,
    searchableTokens:Array<TokenIF>,
    setMatchingImportedTokens:React.Dispatch<SetStateAction<TokenIF[]>>,
    setMatchingSearchableTokens:React.Dispatch<SetStateAction<TokenIF[]>>
) {
    // gatekeeper value to only apply search if search string is three or more characters
    const validSearch = searchStr.length >= 3;

    // function to determine if a string includes a given search input
    const checkMatchLowerCase = (text:string) => text.toLowerCase().includes(searchStr.toLowerCase());

    // function to filter an array of tokens for string matches by symbol, name, and address
    const searchTokens = (listOfTokens:Array<TokenIF>) => (
            listOfTokens.filter((token:TokenIF) => 
                checkMatchLowerCase(token.symbol)
                || checkMatchLowerCase(token.name)
                || checkMatchLowerCase(token.address)
            )
    );

    // filter imported tokens if user input string is validated
    const matchingImported = validSearch ? searchTokens(tokensBank) : tokensBank;
    
    // update local state with array of imported tokens to be rendered in DOM
    setMatchingImportedTokens(matchingImported);

    // filter searchable tokens if user input string is validated
    const matchingSearchable = validSearch ? searchTokens(searchableTokens) : [];

    // update local state with array of searchable tokens to be rendered in DOM
    setMatchingSearchableTokens(matchingSearchable);
}