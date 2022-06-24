import styles from './TokenList.module.css';
import { useState } from 'react';
import TokenListCard from '../TokenListCard/TokenListCard';
import Divider from '../Divider/Divider';
import { TokenListIF } from '../../../utils/interfaces/exports';

import { motion } from 'framer-motion';

export default function TokenList() {
    const [showImportedTokens, setShowImportedTokens] = useState(false);
    // eslint-disable-next-line
    const [searchTerm, setSearchTerm] = useState('');

    const TokenListContainerHeader = (
        <div className={styles.header_container}>
            <div className={styles.header_content}>
                <div
                    className={!showImportedTokens ? styles.active_button : styles.inactive_button}
                    onClick={() => setShowImportedTokens(!showImportedTokens)}
                >
                    Lists
                </div>
                <div
                    className={showImportedTokens ? styles.active_button : styles.inactive_button}
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

    // get the user object from local storage
    const userData = JSON.parse(localStorage.getItem('user') as string);
    // initialize local state with an array of active lists from local storage
    const [activeLists, setActiveLists] = useState(userData.activeTokenLists);

    // click handler for toggle button on each token list <li>
    const toggleList = (list: string) => {
        // check if toggled list is currently in the active list
        const newActiveTokenList = userData.activeTokenLists.includes(list)
            ? // if URI is in active list, remove it
              userData.activeTokenLists.filter((uri: string) => uri !== list)
            : // if URI is not in active list, add it
              [...userData.activeTokenLists, list];
        // overwrite the old activeTokenLists value with the new one
        userData.activeTokenLists = newActiveTokenList;
        // send the updated user object to local storage
        localStorage.setItem('user', JSON.stringify(userData));
        setActiveLists(newActiveTokenList);
    };

    // get allTokenLists value from local storage
    const tokenListElements = JSON.parse(localStorage.getItem('allTokenLists') as string);
    // map over the array and make a bank of <li> for the DOM

    const TokenListContent = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={styles.token_list_content}
        >
            {tokenListElements.map((list: TokenListIF) => (
                <TokenListCard
                    key={`token-list-toggle-${list.uri}`}
                    list={list}
                    activeLists={activeLists}
                    listIsActive={activeLists.includes(list.uri)}
                    toggleActiveState={() => toggleList(list.uri as string)}
                />
            ))}
        </motion.div>
    );

    const TokenListDisplay = (
        <div className={styles.token_list_container}>
            {TokenListContainerHeader}
            {TokenListInput}
            <Divider />
            <div className={styles.token_list_content_container}>{TokenListContent}</div>
        </div>
    );

    const ImportedTokensDisplay = (
        <div className={styles.custom_tokens}>
            {TokenListContainerHeader}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={styles.search_input}
            >
                <input
                    type='text'
                    placeholder='0x000'
                    //   onChange={(event) => setSearchTerm(event.target.value)}
                />
                <Divider />
                <div className={styles.custom_tokens_header}>
                    <span>0 Custom Tokens</span>
                    <span className={styles.clear_all_button}>Clear all</span>
                </div>
                <div className={styles.custom_tokens_footer}>
                    Tip: Custom tokens are stored locally in your browser
                </div>
            </motion.div>
        </div>
    );

    return (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
            {showImportedTokens ? ImportedTokensDisplay : TokenListDisplay}
        </motion.div>
    );
}
