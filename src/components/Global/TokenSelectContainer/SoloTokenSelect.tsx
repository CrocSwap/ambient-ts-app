import { useMemo, Dispatch, SetStateAction } from 'react';
import { TokenListIF, TokenIF } from '../../../utils/interfaces/exports';
import TokenSelect from '../TokenSelect/TokenSelect';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { setToken } from '../../../utils/state/temp';
import { useSoloSearch } from './useSoloSearch';

interface propsIF {
    importedTokens: TokenIF[];
    chainId: string;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    tokensOnActiveLists: Map<string, TokenIF>;
    closeModal: () => void;
}

export const SoloTokenSelect = (props: propsIF) => {
    const {
        importedTokens,
        chainId,
        setImportedTokens,
        closeModal,
        tokensOnActiveLists
    } = props;

    const [
        searchedToken,
        input,
        setInput,
        searchType
    ] = useSoloSearch(chainId, tokensOnActiveLists);
    false && input;

    const dispatch = useAppDispatch();

    const undeletableTokens = useMemo(
        () =>
            JSON.parse(localStorage.getItem('allTokenLists') as string)
                .find((tokenList: TokenListIF) => tokenList.uri === '/ambient-token-list.json')
                .tokens.map((tkn: TokenIF) => tkn.address),
        [],
    );

    const chooseToken = (tkn: TokenIF) => {
        dispatch(setToken(tkn));
        if (searchedToken) {
            const tokenIsImported = importedTokens.some(
                (tk: TokenIF) => tk.address === searchedToken[0].address
            );
            if (tokenIsImported) {
                const userDataFromLocalStorage = JSON.parse(
                    localStorage.getItem('user') as string
                );
                userDataFromLocalStorage.tokens = [searchedToken, ...importedTokens];
                localStorage.setItem('user', JSON.stringify(userDataFromLocalStorage));
            }
        }
        closeModal();
    };

    // fn to find a token with a matching contract address
    // arg tokens === array of token data objects to search
    const filterByAddress = (tokens: TokenIF[]) =>
        // run a filter on provided array of tokens
        tokens.filter((token: TokenIF) => (
            // make sure a valid value exists for the searchedToken array
            searchedToken && searchedToken.length
                // look for a token matching the address of the desired one
                ? searchedToken[0].address.toLowerCase() === token.address.toLowerCase()
                // if no token matches, return true
                : true
    ));

    // fn to find a token with a matching name or symbol
    // arg tokens === array of token data objects to search
    const filterByName = (tokens: TokenIF[]) => {
        // declare a variable to hold strings to match
        const positives: string[] = [];
        // make sure the searchedToken array has at least one value in it
        if (searchedToken && searchedToken.length) {
            // for each value in searchedToken, push name and symbol into matches
            searchedToken.forEach((token) => {
                positives.push(token.name);
                positives.push(token.symbol);
            })
        };
        // make an array with tokens filtered out of provided bank of tokens
        const matchingTokens = tokens.filter((token) => (
            // place token in output variable if name matches (partials ok)
            positives.includes(token.name) ||
            // place token in output variable if symbol matches (partials ok)
            positives.includes(token.symbol)
        ));
        // return output variable
        return matchingTokens;
    }

    const filteredTokens = useMemo(() => {
        const tokensOnChain = importedTokens
            .filter((token: TokenIF) => token.chainId === parseInt(chainId));
        console.log(tokensOnChain)
        switch (searchType) {
            case 'address':
                return filterByAddress(tokensOnChain);
            case 'nameOrSymbol':
                return filterByName(tokensOnChain);
            default:
                return tokensOnChain;
        }
    }, [searchType, importedTokens]);

    const importedTokenButtons = filteredTokens.map((token: TokenIF) => (
        <TokenSelect
            key={JSON.stringify(token)}
            token={token}
            tokensBank={importedTokens}
            undeletableTokens={undeletableTokens}
            chainId={chainId}
            setImportedTokens={setImportedTokens}
            chooseToken={chooseToken}
            isOnPortfolio={true}
        />
    ));

    return (
        <>
            <input
                type='text'
                placeholder='Enter an Address'
                onChange={(e) => setInput(e.target.value)}
            />
            <h1>Imported Tokens</h1>
            {importedTokenButtons}
            <h2>More Available Tokens</h2>
        </>
    );
};
