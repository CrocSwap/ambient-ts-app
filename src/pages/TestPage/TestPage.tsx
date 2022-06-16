import { TokenListIF } from '../../utils/interfaces/exports';
import styles from './TestPage.module.css';

export default function TestPage() {

    const userData = JSON.parse(localStorage.getItem('user') as string);

    const toggleList = (list:string) => {
        const newActiveTokenList = (userData.activeTokenLists.includes(list))
            ? userData.activeTokenLists.filter((uri:string) => uri !== list)
            : [...userData.activeTokenLists, list];
        userData.activeTokenLists = newActiveTokenList;
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const allTokenListMeta = JSON.parse(localStorage.getItem('allTokenLists') as string)
        .map((list:TokenListIF) => (
            <li key={`token-list-toggle-${list.uri}`} className={styles.token_list_li}>
                <h4>{list.name}</h4>
                <button onClick={() => toggleList(list.uri as string)}>Toggle</button>
            </li>
        ));

    return (
        <main className={styles.test_page_main}>
            <ul className={styles.token_list_selects_ul}>
                {allTokenListMeta}
            </ul>
        </main>
    );
}
