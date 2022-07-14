import { useMemo } from 'react';
import { TokenListIF } from '../../../utils/interfaces/TokenListIF';

export const useCustomToken = (
    chainId: string
) => {
    const allTokens = useMemo(() => {
        console.log('got all tokens in useCustomTokens.ts file');
        return JSON.parse(localStorage.getItem('allTokenLists') as string)
            .map((tokenList: TokenListIF) => tokenList.tokens).flat();
    }, []);
    console.log(allTokens);
    console.log(chainId);
}