// START: Import Local Files
import { tokenListURIs } from '../../utils/data/tokenListURIs';
import { TokenIF, TokenListIF } from '../../utils/interfaces/exports';
import uriToHttp from '../../utils/functions/uriToHttp';

export function fetchTokenLists(): void {
    const fetchAndFormatList = async (
        uri: string,
    ): Promise<TokenListIF | undefined> => {
        const endpoints: string[] = uriToHttp(uri, 'retry');
        let rawData;
        // console.log(endpoints);
        for (let i = 0; i < endpoints.length; i++) {
            const response = await fetch(endpoints[i]);
            if (response.ok) {
                rawData = await response.json();
                break;
            }
        }
        if (!rawData) return;
        const output: TokenListIF = {
            ...rawData,
            uri,
            dateRetrieved: new Date().toISOString(),
            userImported: false,
            tokens: rawData.tokens.map((tkn: TokenIF) => {
                return { ...tkn, fromList: uri };
            }),
        };
        return output;
    };
    const tokenListPromises: Promise<TokenListIF | undefined>[] = Object.values(
        tokenListURIs,
    ).map((uri: string) => fetchAndFormatList(uri));
    Promise.all(tokenListPromises)
        .then((lists) => lists.filter((l) => l !== undefined))
        .then((lists) =>
            localStorage.setItem('allTokenLists', JSON.stringify(lists)),
        );
}
