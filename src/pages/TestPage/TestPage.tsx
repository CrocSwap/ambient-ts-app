import { TokenListIF } from '../../utils/interfaces/exports';
import styles from './TestPage.module.css';

export default function TestPage() {

    // const { activeTokenLists } = JSON.parse(localStorage.getItem('user') as string);

    const allTokenListMeta = JSON.parse(localStorage.getItem('allTokenLists') as string)
        .map((list:TokenListIF) => (
            // {
            //     name: list.name,
            //     uri: list.uri,
            //     isActive: activeTokenLists.includes(list.uri)
            // }
            <li key={`token-list-toggle-${list.uri}`} className={styles.token_list_li}>
                <h4>{list.name}</h4>
                
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
