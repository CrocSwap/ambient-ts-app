import { useMemo, Dispatch, SetStateAction } from 'react';
import { TokenListIF, TokenIF } from '../../../utils/interfaces/exports';
import TokenSelect from '../TokenSelect/TokenSelect';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { setToken } from '../../../utils/state/temp';
import { useSoloSearch } from './useSoloSearch';

interface propsIF {
    tokensBank: TokenIF[];
    chainId: string;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    closeModal: () => void;
}

export const SoloTokenSelect = (props: propsIF) => {
    const { tokensBank, chainId, setImportedTokens, closeModal } = props;

    const [ searchedToken, input, setInput, searchType ] = useSoloSearch(chainId);
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
            const tokenIsImported = tokensBank.some(
                (tk: TokenIF) => tk.address === searchedToken[0].address
            );
            if (tokenIsImported) {
                const userDataFromLocalStorage = JSON.parse(
                    localStorage.getItem('user') as string
                );
                userDataFromLocalStorage.tokens = [searchedToken, ...tokensBank];
                localStorage.setItem('user', JSON.stringify(userDataFromLocalStorage));
            }
        }
        closeModal();
    };

    const tokensOnChain = tokensBank
        .filter((token: TokenIF) => token.chainId === parseInt(chainId))

    const filterByAddress = (tokens: TokenIF[]) => tokens.filter((token: TokenIF) => (
        searchedToken && searchedToken.length
            ? searchedToken[0].address.toLowerCase() === token.address.toLowerCase() : true
    ));

    const filterByName = (tokens: TokenIF[]) => {
        const positives: string[] = [];
        if (searchedToken && searchedToken.length) {
            searchedToken.forEach((token) => {
                positives.push(token.name);
                positives.push(token.symbol);
            })
        };
        const matchingTokens = tokens.filter((token) => (
            positives.includes(token.name) ||
            positives.includes(token.symbol)
        ));
        return matchingTokens;
    }

    const filteredTokens = useMemo(() => {
        switch (searchType) {
            case 'address':
                return filterByAddress(tokensOnChain);
            case 'nameOrSymbol':
                return filterByName(tokensOnChain);
            default:
                return tokensOnChain;
        }
    }, [searchType, tokensOnChain]);

    const importedTokenButtons = filteredTokens.map((token: TokenIF) => (
        <TokenSelect
            key={JSON.stringify(token)}
            token={token}
            tokensBank={tokensBank}
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
            {importedTokenButtons}
        </>
    );
};
