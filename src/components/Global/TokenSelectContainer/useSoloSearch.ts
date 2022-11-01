import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';
import { ambientTokenList } from '../../../utils/data/ambientTokenList';

export const useSoloSearch = (
    chainId: string
): [
    TokenIF | null,
    Dispatch<SetStateAction<string>>
] => {
    console.log('Hi mom!');

    const [input, setInput] = useState('');
    const [token, setToken] = useState<TokenIF|null>(null);

    const [isTokenFound, setIsTokenFound] = useState(false);
    useEffect(() => console.log(isTokenFound), [isTokenFound]);

    useEffect(() => {
        setIsTokenFound(false);
        const findToken = (tokens: TokenIF[]) => tokens.find(
            (token) => token.address === input && token.chainId === parseInt(chainId)
        );
        // first check ambient list
        console.log(ambientTokenList);
        if (ambientTokenList) {
            const tkn = findToken(ambientTokenList.tokens) as TokenIF;
            tkn && setIsTokenFound(true);
            tkn && setToken(tkn);
        }
        // if not found check CoinGecko
        if (localStorage.allTokenLists) {
            const coinGeckoTokens = JSON.parse(localStorage.getItem('allTokenLists') as string).find((list: TokenListIF) => list.name === 'CoinGecko').tokens;
            const tkn = findToken(coinGeckoTokens) as TokenIF;
            tkn && setIsTokenFound(true);
            tkn && setToken(tkn);
        }
        // if not found pull data from on-chain
    }, [input]);
    return [token, setInput];
}