import { useEffect, useMemo, useState, Dispatch, SetStateAction } from 'react';
import { useMoralisWeb3Api } from 'react-moralis';
import Token from '../../../utils/classes/Token';
import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';

export const useCustomToken = (
    chainId: string
): [Dispatch<SetStateAction<string>>, string] => {
    const Web3Api = useMoralisWeb3Api();

    const allTokens = useMemo(() => {
        console.log('got all tokens in useCustomTokens.ts file');
        return JSON.parse(localStorage.getItem('allTokenLists') as string)
            .map((tokenList: TokenListIF) => tokenList.tokens).flat();
    }, []);

    const [searchInput, setSearchInput] = useState('');
    const [errorText, setErrorText] = useState('');
    const [matchingTokens, setMatchingTokens] = useState<Array<TokenIF>>([]);

    const fetchTokenMetadata = async (chainId: string, addresses: string) => await Web3Api.token.getTokenMetadata({ chain: 'eth', addresses: [addresses]});

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
                    if (!tkn[0].decimals) {
                        setErrorText('On-chain data is invalid.');
                        throw new Error('Data returned from chain does not appear to represent a valid token. Check that you are on the correct chain for the contract address used. If so, please log an issue referencing the file useCustomToken.ts, your current chain, and the contract address used.');
                    }
                    const customToken = new Token(
                        tkn[0].name,
                        tkn[0].address,
                        tkn[0].symbol,
                        parseInt(tkn[0].decimals),
                        parseInt(chainId),
                        tkn[0].logo ? tkn[0].logo : '',
                        'custom'
                    );
                    console.log(customToken);
                    setMatchingTokens([customToken]);
                }).catch(err => console.warn(err));
            };
        } else {
            setMatchingTokens([]);
        }
    }, [searchInput]);

    useEffect(() => {console.log({matchingTokens})}, [matchingTokens]);

    return [ setSearchInput, errorText ];
}