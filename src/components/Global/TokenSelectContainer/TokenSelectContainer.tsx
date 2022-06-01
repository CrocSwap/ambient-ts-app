import styles from './TokenSelectContainer.module.css';
import { useState } from 'react';
import TokenSelect from '../TokenSelect/TokenSelect';

type Item = {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    chainId: number;
    logoURI: string;
};
interface TokenSelectContainerProps {
    tokenList: Item[];
}

export default function TokenSelectContainer(props: TokenSelectContainerProps) {
    const { tokenList } = props;
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
                .map((token, idx) => {
                    return (
                        <TokenSelect
                            key={idx}
                            icon={token.logoURI}
                            symbol={token.symbol}
                            name={token.name}
                            qty={token.decimals}
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
