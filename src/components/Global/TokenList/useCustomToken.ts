import { useEffect, useMemo, useState } from 'react';
import { useMoralisWeb3Api } from 'react-moralis';
import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';

export const useCustomToken = (
    chainId: string
) => {
    const Web3Api = useMoralisWeb3Api();

    const allTokens = useMemo(() => {
        console.log('got all tokens in useCustomTokens.ts file');
        return JSON.parse(localStorage.getItem('allTokenLists') as string)
            .map((tokenList: TokenListIF) => tokenList.tokens).flat();
    }, []);

    const [searchInput, setSearchInput] = useState('');
    const [matchingTokens, setMatchingTokens] = useState<Array<TokenIF>>([]);

    const fetchTokenMetadata = async (chainId: string, addresses: string) => await Web3Api.token.getTokenMetadata({ chain: chainId as '0x2a' | 'kovan', addresses: [addresses]});

    useEffect(() => {
        const matchingLocalTokens = allTokens.filter((token: TokenIF) => token.address.includes(searchInput));
        if (searchInput.length >= 3) {
            if (matchingTokens.length > 1) setMatchingTokens(matchingLocalTokens);
            else {
                console.log('checking on chain with Moralis...')
                const token = fetchTokenMetadata(chainId as string, searchInput as string);
                console.log(token);
                Promise.resolve(token).then((tkn) => {
                    console.log(tkn);
                    // setMatchingTokens(tkn);
                });
            };
        } else {
            setMatchingTokens([]);
        }
    }, [searchInput]);

    useEffect(() => {console.log({matchingTokens})}, [matchingTokens]);

    return [ setSearchInput ];
}