import { useEffect, useMemo, useState } from 'react';
import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';

export const useCustomToken = (
    chainId: string
) => {
    const allTokens = useMemo(() => {
        console.log('got all tokens in useCustomTokens.ts file');
        return JSON.parse(localStorage.getItem('allTokenLists') as string)
            .map((tokenList: TokenListIF) => tokenList.tokens).flat();
    }, []);
    const [searchInput, setSearchInput] = useState('');
    useEffect(() => {console.log({searchInput})}, [searchInput]);
    const [matchingLocalTokens, setLocalMatchingTokens] = useState([]);
    useEffect(() => {
        setLocalMatchingTokens(
            // TODO: expand logic in the filter to look for matching chain ID
            allTokens.filter((token: TokenIF) => token.address.includes(searchInput))
        );
    }, [searchInput]);
    useEffect(() => {console.log({matchingLocalTokens})}, [matchingLocalTokens]);

    return [ setSearchInput ];
}