import { useEffect, useMemo, useState, Dispatch, SetStateAction } from 'react';
import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';
import { ambientTokenList } from '../../../utils/data/ambientTokenList';

export const useSoloSearch = (
    chainId: string
): [
    TokenIF | null,
    Dispatch<SetStateAction<string>>
] => {
    const [input, setInput] = useState('');

    const validatedInput = useMemo(() => {
        const cleanInput = input.trim().toLowerCase();
        const fixedInput = cleanInput.startsWith('0x')
            ? cleanInput
            : '0x' + cleanInput;
        let output = '';
        if (
            fixedInput.length === 42 &&
            fixedInput.substring(2).match(/[0-9a-f]/g)
        ) {
            output = fixedInput;
        }
        // string starts with 0x then 40 hexadecimal characters
        // string is 40 hexadecimal characters
        return output;
    }, [input]);

    const [token, setToken] = useState<TokenIF|null>(null);
    const [isTokenFound, setIsTokenFound] = useState(false);

    useEffect(() => {
        setIsTokenFound(false);
        const findToken = (tokens: TokenIF[]) => tokens.find(
            (token) => token.address === input && token.chainId === parseInt(chainId)
        );
        // first check ambient list
        if (ambientTokenList) {
            const tkn = findToken(ambientTokenList.tokens) as TokenIF;
            tkn && setIsTokenFound(true);
            tkn && setToken(tkn);
        }
        // if not found check CoinGecko
        if (localStorage.allTokenLists && !isTokenFound) {
            const coinGeckoTokens = JSON.parse(localStorage.getItem('allTokenLists') as string).find((list: TokenListIF) => list.name === 'CoinGecko').tokens;
            const tkn = findToken(coinGeckoTokens) as TokenIF;
            tkn && setIsTokenFound(true);
            tkn && setToken(tkn);
        }
        // if not found pull data from on-chain
    }, [validatedInput]);
    return [token, setInput];
}