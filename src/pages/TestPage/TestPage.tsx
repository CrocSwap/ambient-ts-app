import { TokenListIF } from '../../utils/interfaces/exports';

export default function TestPage() {

    const { activeTokenLists } = JSON.parse(localStorage.getItem('user') as string);

    const allTokenListMeta = JSON.parse(localStorage.getItem('allTokenLists') as string)
        .map((list:TokenListIF) => (
            {
                name: list.name,
                uri: list.uri,
                isActive: activeTokenLists.includes(list.uri)
            }
        ));
    console.log(allTokenListMeta);

    return (
        <main>

        </main>
    );
}
