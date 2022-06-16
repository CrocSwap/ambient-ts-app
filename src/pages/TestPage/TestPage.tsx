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
        console.log(allTokenListMeta);

    return (
        <main>

        </main>
    );
}
