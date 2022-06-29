import styles from './TokenSelectContainer.module.css';
import { Dispatch, SetStateAction } from 'react';
import TokenSelect from '../TokenSelect/TokenSelect';
import TokenSelectSearchable from '../TokenSelect/TokenSelectSearchable';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import Button from '../../Global/Button/Button';
import TokenList from '../../Global/TokenList/TokenList';
import { useSearch } from './useSearch';

interface TokenSelectContainerPropsIF {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<{ name: string; address: string; symbol: string; decimals: number; chainId: number; logoURI: string; fromList: string; }[]>>;
    searchableTokens: Array<TokenIF>;
    tokenList?: Array<TokenIF>;
    chainId: string;
    tokenToUpdate: string;
    closeModal: () => void;
    reverseTokens: () => void;
    showManageTokenListContent: boolean;
    setShowManageTokenListContent: Dispatch<SetStateAction<boolean>>;
}

export default function TokenSelectContainer(props: TokenSelectContainerPropsIF) {
    const {
        tokenPair,
        tokensBank,
        setImportedTokens,
        searchableTokens,
        chainId,
        tokenToUpdate,
        closeModal,
        reverseTokens,
        showManageTokenListContent,
        setShowManageTokenListContent,
    } = props;

    const [
        matchingImportedTokens,
        matchingSearchableTokens,
        setSearchInput
    ] = useSearch(tokensBank, searchableTokens, chainId);

    const handleClickSearchable = (tkn:TokenIF) => {
        console.log(tokensBank);
        console.log(tkn);
        // look inside tokensBank to see if clicked token is already imported
        const importedTokenAddresses = tokensBank.map((token: TokenIF) => token.address)
        const newImportedTokensArray = importedTokenAddresses.includes(tkn.address)
            // TRUE: make new array with it removed
            ? tokensBank.filter((token:TokenIF) => token.address !== tkn.address)
            // FALSE: make new array with it added
            : [tkn, ...tokensBank];
        // sync local storage and local state inside App.tsx with new array
        const userData = JSON.parse(localStorage.getItem('user') as string);
        userData.tokens = newImportedTokensArray;
        localStorage.setItem('user', JSON.stringify(userData));
        console.log({newImportedTokensArray});
        setImportedTokens(newImportedTokensArray);
    }

    const tokenListContent = (
        <>
            <h3>Your Tokens</h3>
            {matchingImportedTokens
                .map((token:TokenIF, idx:number) => {
                    return (
                        <TokenSelect
                            key={idx}
                            token={token}
                            tokenToUpdate={tokenToUpdate}
                            closeModal={closeModal}
                            tokenPair={tokenPair}
                            reverseTokens={reverseTokens}
                        />
                    );
            })}
            {matchingSearchableTokens.length >=3 ? <h3>Searched Tokens</h3> : null}
            {matchingSearchableTokens.map((tkn:TokenIF, idx:number) => (
                <TokenSelectSearchable
                    key={`tss_${idx}`}
                    token={tkn}
                    clickHandler={handleClickSearchable}
                    closeModal={closeModal}
                />
            ))}
        </>
    );

    const tokenListContainer = (
        <>
            <div className={styles.search_input}>
                <input
                    type='text'
                    placeholder='Search name or paste address'
                    onChange={(event) => setSearchInput(event.target.value)}
                />
            </div>
            {tokenListContent}
        </>
    );

    const manageTokenListButton = (
        <Button title='Manage Token List' action={() => setShowManageTokenListContent(true)} />
    );

    return (
        <div className={styles.token_select_container}>
            {showManageTokenListContent ? <TokenList /> : tokenListContainer}
            {showManageTokenListContent ? null : manageTokenListButton}
        </div>
    );
}
