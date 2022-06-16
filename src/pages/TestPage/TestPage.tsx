import { useState } from 'react';
import { TokenListIF } from '../../utils/interfaces/exports';
import styles from './TestPage.module.css';

export default function TestPage() {

    // get the user object from local storage
    const userData = JSON.parse(localStorage.getItem('user') as string);

    // initialize local state with an array of active lists from local storage
    const [activeLists, setActiveLists] = useState(userData.activeTokenLists);

    // click handler for toggle button on each token list <li>
    const toggleList = (list:string) => {
        // check if toggled list is currently in the active list
        const newActiveTokenList = (userData.activeTokenLists.includes(list))
            // if URI is in active list, remove it
            ? userData.activeTokenLists.filter((uri:string) => uri !== list)
            // if URI is not in active list, add it
            : [...userData.activeTokenLists, list];
        // overwrite the old activeTokenLists value with the new one
        userData.activeTokenLists = newActiveTokenList;
        // send the updated user object to local storage
        localStorage.setItem('user', JSON.stringify(userData));
        setActiveLists(newActiveTokenList);
    };

    // TODO:  @Junior I used a <button> element below for simplicity, I assume that you
    // TODO:  ... will replace it with your toggle component which is fine by me, I also
    // TODO:  ... assume you'll take out the Active vs Not Active `<h6>` as the toggle
    // TODO:  ... will be indicative of this

    // get allTokenLists value from local storage
    const tokenListElements = JSON.parse(localStorage.getItem('allTokenLists') as string)
        // map over the array and make a bank of <li> for the DOM
        .map((list:TokenListIF) => (
            <li key={`token-list-toggle-${list.uri}`} className={styles.token_list_li}>
                <h4>{list.name}</h4>
                <h6>{activeLists.includes(list.uri) ? 'Active' : 'Not Active'}</h6>
                <button onClick={() => toggleList(list.uri as string)}>Toggle</button>
            </li>
        ));

    return (
        <main className={styles.test_page_main}>
            <ul className={styles.token_list_selects_ul}>
                {tokenListElements}
            </ul>
        </main>
    );
}
