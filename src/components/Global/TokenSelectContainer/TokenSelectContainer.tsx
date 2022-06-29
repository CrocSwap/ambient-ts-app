import styles from './TokenSelectContainer.module.css';
import { useState, SetStateAction, useEffect } from 'react';
import TokenSelect from '../TokenSelect/TokenSelect';
import TokenSelectSearchable from '../TokenSelect/TokenSelectSearchable';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import Button from '../../Global/Button/Button';
import TokenList from '../../Global/TokenList/TokenList';
import handleSearch from './handleSearch';

interface TokenSelectContainerPropsIF {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    searchableTokens: Array<TokenIF>;
    tokenList?: Array<TokenIF>;
    chainId: string;
    tokenToUpdate: string;
    closeModal: () => void;
    reverseTokens: () => void;
    showManageTokenListContent: boolean;
    setShowManageTokenListContent: React.Dispatch<SetStateAction<boolean>>;
}

export default function TokenSelectContainer(props: TokenSelectContainerPropsIF) {
    const {
        tokenPair,
        tokensBank,
        searchableTokens,
        chainId,
        tokenToUpdate,
        closeModal,
        reverseTokens,
        showManageTokenListContent,
        setShowManageTokenListContent,
    } = props;
    console.log(chainId)

    const [matchingImportedTokens, setMatchingImportedTokens] = useState(tokensBank);
    useEffect(() => {console.log({matchingImportedTokens});}, [matchingImportedTokens]);

    const [matchingSearchableTokens, setMatchingSearchableTokens] = useState<Array<TokenIF>>([]);
    useEffect(() => {console.log({matchingSearchableTokens});}, [matchingSearchableTokens]);

    function searchHandler(userInput:string) {
        handleSearch(
            userInput,
            tokensBank,
            searchableTokens,
            setMatchingImportedTokens,
            setMatchingSearchableTokens
        );
    }

    const tokenListContent = (
        <>
            <h3>Your Tokens</h3>
            {matchingImportedTokens
                .map((token, idx) => {
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
                    onChange={(event) => searchHandler(event.target.value)}
                />
            </div>
            {tokenListContent}
        </>
    );

    const manageTokenListContainer = (
        <>
            <TokenList />
        </>
    );

    const manageTokenListButton = (
        <Button title='Manage Token List' action={() => setShowManageTokenListContent(true)} />
    );

    return (
        <div className={styles.token_select_container}>
            {showManageTokenListContent ? manageTokenListContainer : tokenListContainer}
            {showManageTokenListContent ? null : manageTokenListButton}
        </div>
    );
}
