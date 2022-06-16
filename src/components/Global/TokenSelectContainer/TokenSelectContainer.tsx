import styles from './TokenSelectContainer.module.css';
import { useState } from 'react';
import TokenSelect from '../TokenSelect/TokenSelect';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import Button from '../../Global/Button/Button';

interface TokenSelectContainerPropsIF {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    tokenList?: Array<TokenIF>;
    chainId?: string;
    tokenToUpdate: string;
    closeModal: () => void;
    reverseTokens: () => void;
}

export default function TokenSelectContainer(props: TokenSelectContainerPropsIF) {
    const { tokenPair, tokensBank, tokenToUpdate, closeModal, reverseTokens } = props;

    // console.log(tokenToUpdate);
    const [searchTerm, setSearchTerm] = useState('');

    const searchInput = (
        <div className={styles.search_input}>
            <input
                type='text'
                placeholder='Search name or paste address'
                onChange={(event) => setSearchTerm(event.target.value)}
            />
        </div>
    );

    const tokenListContent = (
        <>
            {tokensBank
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

    const manageTokenListButton = (
        <Button title='Manage Token List' action={() => console.log('yes')} />
    );

    return (
        <div className={styles.token_select_container}>
            {searchInput}
            {tokenListContent}
            {manageTokenListButton}
        </div>
    );
}
