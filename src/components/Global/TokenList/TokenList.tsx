import styles from './TokenList.module.css';
import { useEffect, useState } from 'react';
import TokenListCard from '../TokenListCard/TokenListCard';

interface TokenListProps {
    children: React.ReactNode;
}

export default function TokenList(props: TokenListProps) {
    const [showImportedTokens, setShowImportedTokens] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const TokenListContainerHeader = (
        <div className={styles.header_container}>
            <div className={styles.header_content}>
                <div
                    className={showImportedTokens ? styles.active_button : styles.inactive_button}
                    onClick={() => setShowImportedTokens(!showImportedTokens)}
                >
                    Lists
                </div>
                <div
                    className={!showImportedTokens ? styles.active_button : styles.inactive_button}
                    onClick={() => setShowImportedTokens(!showImportedTokens)}
                >
                    Tokens
                </div>
            </div>
        </div>
    );

    const TokenListInput = (
        <div className={styles.search_input}>
            <input
                type='text'
                placeholder='https:// pr ipfs:// or ENS name'
                onChange={(event) => setSearchTerm(event.target.value)}
            />
        </div>
    );

    const searchedList = [1, 2, 3, 4, 5];

    const TokenListContent = (
        <div className={styles.token_list_content}>
            {searchedList.map((list, idx) => (
                <TokenListCard key={idx} />
            ))}
        </div>
    );

    const TokenListDisplay = (
        <div className={styles.token_list_container}>
            {TokenListContainerHeader}
            {TokenListInput}
            <div className={styles.divider}></div>
            {TokenListContent}
        </div>
    );

    const ImportedTokensDisplay = (
        <div className={styles.custom_tokens}>
            {TokenListContainerHeader}
            <div className={styles.search_input}>
                <input
                    type='text'
                    placeholder='0x000'
                    //   onChange={(event) => setSearchTerm(event.target.value)}
                />
                <div className={styles.divider}></div>
                <div className={styles.custom_tokens_header}>
                    <span>0 Custom Tokens</span>
                    <span className={styles.clear_all_button}>Clear all</span>
                </div>
                <div className={styles.custom_tokens_footer}>
                    Tip: Custom tokens are stored locally in your browser
                </div>
            </div>
        </div>
    );

    return <>{!showImportedTokens ? ImportedTokensDisplay : TokenListDisplay}</>;
}
