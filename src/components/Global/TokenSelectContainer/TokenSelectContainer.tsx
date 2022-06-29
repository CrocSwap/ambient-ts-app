import styles from './TokenSelectContainer.module.css';
import { useState, SetStateAction, useEffect } from 'react';
import TokenSelect from '../TokenSelect/TokenSelect';
import TokenSelectSearchable from '../TokenSelect/TokenSelectSearchable';
import { TokenIF, TokenListIF, TokenPairIF } from '../../../utils/interfaces/exports';
import Button from '../../Global/Button/Button';
import TokenList from '../../Global/TokenList/TokenList';
// import searchTokens from './searchTokens';

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
    const [matchingSearchableTokens, setMatchingSearchableTokens] = useState<Array<TokenIF>>([]);

    useEffect(() => {console.log(matchingSearchableTokens);}, [matchingSearchableTokens]);

    // change handler to run on user input in text input field
    function searchTokens(searchStr:string) {
        // gatekeeper value to only apply search if search string is three or more characters
        const validSearch = searchStr.length >= 3;

        // function to filter an array of tokens for string matches by symbol, name, and address
        const matchTokens = (listOfTokens:Array<TokenIF>) => (
            listOfTokens.filter((token:TokenIF) => 
                token.symbol.toLowerCase().includes(searchStr.toLowerCase())
                || token.name.toLowerCase().includes(searchStr.toLowerCase())
                || token.address.toLowerCase().includes(searchStr.toLowerCase()))
        );

        // filter imported tokens if user input string is validated
        const matchingImported = validSearch ? matchTokens(tokensBank) : tokensBank;
        
        // update local state with array of imported tokens to be rendered in DOM
        setMatchingImportedTokens(matchingImported);

        // filter searchable tokens if user input string is validated
        const matchingSearchable = validSearch ? matchTokens(searchableTokens) : [];

        // update local state with array of searchable tokens to be rendered in DOM
        setMatchingSearchableTokens(matchingSearchable);
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
                    onChange={(event) => searchTokens(event.target.value)}
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
