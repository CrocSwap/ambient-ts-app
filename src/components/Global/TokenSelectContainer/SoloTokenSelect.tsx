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

    const [ searchedToken, input, setInput ] = useSoloSearch(chainId);

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

    console.log(searchedToken);

    const filterByAddress = (tokens: TokenIF[]) => tokens.filter((token: TokenIF) => (
        searchedToken && searchedToken.length
            ? searchedToken[0].address.toLowerCase() === token.address.toLowerCase() : true
    ));

    const importedTokenButtons = filterByAddress(tokensOnChain)
        .map((token: TokenIF) => (
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
            {(input && !searchedToken) ? <p>Could not find a matching token on-chain, please recheck your input and try again.</p> : importedTokenButtons}
        </>
    );
};
