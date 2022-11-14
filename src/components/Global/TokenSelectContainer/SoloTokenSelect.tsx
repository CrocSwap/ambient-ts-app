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
        tokensForDOM,
        input,
        setInput,
        searchType
    ] = useSoloSearch(
        chainId,
        importedTokens,
        tokensOnActiveLists
    );
    false && input;
    false && searchType;

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
        // if (searchedToken) {
        //     const tokenIsImported = importedTokens.some(
        //         (tk: TokenIF) => tk.address === searchedToken[0].address
        //     );
        //     if (tokenIsImported) {
        //         const userDataFromLocalStorage = JSON.parse(
        //             localStorage.getItem('user') as string
        //         );
        //         userDataFromLocalStorage.tokens = [searchedToken, ...importedTokens];
        //         localStorage.setItem('user', JSON.stringify(userDataFromLocalStorage));
        //     }
        // }
        console.log('user clicked a token: ' + JSON.stringify(tkn));
        closeModal();
    };

    const importedTokenButtons = tokensForDOM
        ? tokensForDOM.map((token: TokenIF) => (
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
            )
        ) : null;

    return (
        <>
            <input
                type='text'
                placeholder='Enter an Address'
                onChange={(e) => setInput(e.target.value)}
            />
            <h1>Imported Tokens</h1>
            {importedTokenButtons}
            {searchType && <h2>More Available Tokens</h2>}
        </>
    );
};
