import { useMemo, Dispatch, SetStateAction } from 'react';
import { TokenListIF, TokenIF } from '../../../utils/interfaces/exports';
import TokenSelect from '../TokenSelect/TokenSelect';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { setToken } from '../../../utils/state/temp';

interface propsIF {
    tokensBank: TokenIF[];
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    closeModal: () => void;
}

export const SoloTokenSelect = (props: propsIF) => {
    const { tokensBank, setImportedTokens, closeModal } = props;
    console.log(tokensBank);

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
    }

    const tokenButtons = tokensBank
        .filter((token: TokenIF) => token.chainId === parseInt('0x5'))
        .map((token: TokenIF) => (
            <TokenSelect
                key={JSON.stringify(token)}
                token={token}
                tokensBank={tokensBank}
                undeletableTokens={undeletableTokens}
                chainId='0x5'
                setImportedTokens={setImportedTokens}
                chooseToken={chooseToken}
            />
        )
    );

    return (
        <>
        {tokenButtons}
        </>
    );
}