import styles from './TokenSelectContainer.module.css';
import { useState, SetStateAction, useEffect } from 'react';
import TokenSelect from '../TokenSelect/TokenSelect';
import { TokenIF, TokenPairIF, TokenListIF } from '../../../utils/interfaces/exports';
import Button from '../../Global/Button/Button';
import TokenList from '../../Global/TokenList/TokenList';
import searchTokens from './searchTokens';

interface TokenSelectContainerPropsIF {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
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
        chainId,
        tokenToUpdate,
        closeModal,
        reverseTokens,
        showManageTokenListContent,
        setShowManageTokenListContent,
    } = props;

    const [searchTerm] = useState('');

    const [selectableTokens, setSelectableTokens] = useState(tokensBank);
    const [searchableTokens, setSearchableTokens] = useState(tokensBank);

    useEffect(() => {
        const { activeTokenLists } = JSON.parse(localStorage.getItem('user') as string);
        const selectableTokenAddresses = selectableTokens.map((tkn:TokenIF) => tkn.address);
        setSearchableTokens(
            JSON.parse(localStorage.getItem('allTokenLists') as string)
                // return only active token lists
                .filter((tokenList:TokenListIF) => activeTokenLists.includes(tokenList.uri))
                // make an array of all tokens from those lists
                .map((tokenList:TokenListIF) => tokenList.tokens).flat()
                // return only tokens on active lists
                .filter((tkn:TokenIF) => tkn.chainId === parseInt(chainId))
                // return only tokens not already imported
                .filter((tkn:TokenIF) => !selectableTokenAddresses.includes(tkn.address))
        );
    }, []);

    // TODO:  @Emily add the setter function back in to the useState() call
    // const [tL] = useState(
    //     JSON.parse(localStorage.getItem('user') as string).tokens
    //         .filter((tkn:TokenIF) => tkn.chainId === parseInt(chainId))
    // );

    const searchInput = (
        <div className={styles.search_input}>
            <input
                type='text'
                placeholder='Search name or paste address'
                onChange={(event) => searchTokens(event.target.value)}
            />
        </div>
    );

    const tokenListContent = (
        <>
            {selectableTokens
                .filter((val) => {
                    if (searchTerm === '') {
                        return val;
                    } else if (
                        val.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        val.symbol.toLowerCase().includes(searchTerm.toLowerCase())
                    ) {
                        return val;
                    }
                })
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
        </>
    );

    const tokenListContainer = (
        <>
            {searchInput}
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
