import { TokenListIF } from '../../utils/interfaces/exports';

export default function TestPage() {

    const allTokenListMeta = JSON.parse(localStorage.getItem('allTokenLists') as string)
        .map((list:TokenListIF) => (
            {
                name: list.name,
                uri: list.uri,
                isDefault: list.default
            }
        ));

        const { activeTokenLists } = JSON.parse(localStorage.getItem('user') as string);
        console.log(activeTokenLists);

    return (
        <main>

        </main>
    );
}
