import styles from './TokenSelectContainer.module.css';
import { useState } from 'react';
import TokenSelect from '../TokenSelect/TokenSelect';
import { TokenIF } from '../../../utils/interfaces/TokenIF';

interface TokenSelectContainerPropsIF {
    tokenList: Array<TokenIF>;
    chainId: string;
    tokenToUpdate: string;
}

export default function TokenSelectContainer(props: TokenSelectContainerPropsIF) {
    const { tokenList, chainId, tokenToUpdate } = props;
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
            {tokenList
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
                .filter((tkn) => {
                    console.log(tkn);
                    console.log(chainId);
                    if (tkn.chainId.toString() === chainId) {
                        return tkn;
                    }
                })
                .map((token, idx) => {
                    return (
                        <TokenSelect
                            key={idx}
                            icon={token.logoURI}
                            symbol={token.symbol}
                            name={token.name}
                            qty={token.decimals}
                            address={token.address}
                            tokenToUpdate={tokenToUpdate}
                        />
                    );
                })}
        </>
    );

    return (
        <div className={styles.token_select_container}>
            {searchInput}
            {tokenListContent}
        </div>
    );
}
