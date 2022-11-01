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

    const [ searchedToken, setInput ] = useSoloSearch(chainId);
    false && searchedToken;

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
        closeModal();
    };

    const importedTokenButtons = tokensBank
        .filter((token: TokenIF) => token.chainId === parseInt(chainId))
        .filter((token: TokenIF) => (searchedToken ? searchedToken.address === token.address : true))
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
            {importedTokenButtons}
        </>
    );
};
