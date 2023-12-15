import { tokenListURIs } from '../constants';
import { TokenIF, TokenListIF } from '../types';
import fetchTokenList from './fetchTokenList';
const tokenUniverses = new Map<string, TokenIF[]>();

function processTokenList(
    tokenList: TokenIF[],
    universe: Map<string, Map<string, TokenIF>>,
) {
    for (const token of tokenList) {
        if (!universe.has(token.chainId)) {
            universe.set(token.chainId, new Map<string, TokenIF>());
        }
        const currentTokens = universe.get(token.chainId);
        if (!currentTokens.has(token.address)) {
            currentTokens.set(token.address, token);
        }
    }
}

export async function downloadAllTokenUniverses(): Promise<
    Map<string, TokenIF[]>
> {
    if (tokenUniverses.size > 0) return tokenUniverses;
    const universes = new Map<string, Map<string, TokenIF>>();
    for (const uri of Object.values(tokenListURIs)) {
        try {
            const tokenList = await fetchTokenList(uri);
            processTokenList(tokenList.tokens, universes);
        } catch (error) {
            console.warn(
                `Warning: Could not load token list from URI: ${uri}`,
                error,
            );
        }
    }
    universes.forEach((tokens, chainId) => {
        tokenUniverses.set(
            '0x' + chainId.toString(16),
            Array.from(tokens.values()),
        );
    });
    return tokenUniverses;
}

export async function fetchTokenUniverse(chainId: string): Promise<TokenIF[]> {
    const tokenUniverse = await downloadAllTokenUniverses();
    return tokenUniverse.get(chainId) || ([] as TokenIF[]);
}
