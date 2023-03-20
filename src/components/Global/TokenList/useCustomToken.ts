import { useEffect, useMemo, useState, Dispatch, SetStateAction } from 'react';
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';

export const useCustomToken = (
    chainId: string,
): [
    Dispatch<SetStateAction<string>>,
    boolean,
    Dispatch<SetStateAction<boolean>>,
    TokenIF[],
    string | null,
] => {
    // make an array of every token in every list in allTokenLists in local storage
    // empty dependency array makes this value calculated once when the component mounts
    // to have it update, pass values into the dependency array
    const allTokens = useMemo(
        () =>
            JSON.parse(localStorage.getItem('allTokenLists') as string)
                .map((tokenList: TokenListIF) => tokenList.tokens)
                .flat(),
        [],
    );

    // input text from user input field in the DOM
    // this hook only receives santized values
    const [searchInput, setSearchInput] = useState('');

    // error text to populate in the DOM to explain invalid inputs
    const [errorText, setErrorText] = useState<string | null>(null);

    // boolean representing whether the user already imported the token searched for
    const [tokenAlreadyImported, setTokenAlreadyImported] = useState(false);

    // array of tokens that match contract addresses from allTokenLists or on-chain query
    const [matchingTokens, setMatchingTokens] = useState<Array<TokenIF>>([]);

    const chain = chainId === '0x1' ? EvmChain.ETHEREUM : EvmChain.GOERLI;

    // function to fetch metadata from on-chain by address and chain ID
    const fetchTokenMetadata = async (addresses: string) =>
        await Moralis.EvmApi.token.getTokenMetadata({
            addresses: [addresses],
            chain,
        });

    // hook to run every time the user changes text input
    useEffect(() => {
        // clear error text in DOM on new input
        setErrorText('');
        // clear prior results for searched tokens matching user input
        setMatchingTokens([]);

        // determine if user entered a proper 0x[...] contract address
        // any value that gets here has already been lower-cased
        if (searchInput.match(/^0x[a-f0-9]{40}$/)) {
            const importedTokens = JSON.parse(localStorage.getItem('user') as string).tokens;
            const tokenFromImportedList = importedTokens.filter(
                (tkn: TokenIF) => tkn.address === searchInput && tkn.chainId === parseInt(chainId),
            );

            if (tokenFromImportedList.length) {
                setTokenAlreadyImported(true);
            } else if (!tokenFromImportedList.length) {
                setTokenAlreadyImported(false);
                const matchingLocalTokens = allTokens.filter((token: TokenIF) =>
                    token.address.includes(searchInput),
                );
                if (matchingTokens.length >= 1) {
                    setMatchingTokens(matchingLocalTokens);
                } else {
                    const token = fetchTokenMetadata(searchInput as string);
                    Promise.resolve(token)
                        .then((response) => {
                            const tkn = response?.result[0].token;
                            if (!tkn.decimals) {
                                setErrorText('On-chain data is invalid.');
                                throw new Error(
                                    'Data returned from chain does not appear to represent a valid token. Check that you are on the correct chain for the contract address used. If so, please log an issue referencing the file useCustomToken.ts, your current chain, and the contract address used.',
                                );
                            }
                            console.log(tkn);
                            const customToken = {
                                name: tkn.name,
                                address: tkn.contractAddress.lowercase,
                                symbol: tkn.symbol,
                                decimals: tkn.decimals,
                                chainId: parseInt(chainId),
                                logoURI: tkn.logo
                                    ? tkn.logo
                                    : 'https://cdn4.iconfinder.com/data/icons/symbol-blue-set-1/100/Untitled-2-63-512.png',
                                fromList: 'custom',
                            };
                            console.log(customToken);
                            setMatchingTokens([customToken]);
                        })
                        .catch((err) => console.warn(err));
                }
            }
            // action if user did not enter a proper contract address
        } else if (!searchInput.match(/^0x[a-f0-9]{40}$/) && searchInput.length) {
            setErrorText('Please enter a valid 0x[...] address.');
        }
        // run this hook every time user inputs a new value in the DOM
    }, [searchInput]);

    return [
        setSearchInput,
        tokenAlreadyImported,
        setTokenAlreadyImported,
        matchingTokens,
        errorText,
    ];
};
