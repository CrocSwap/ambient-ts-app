import { tokenListURIs } from '../constants';
import { TokenIF } from '../types';
import fetchTokenList from './fetchTokenList';
const tokenUniverses = new Map<string, TokenIF[]>();

function processTokenList(
    tokenList: TokenIF[],
    universe: Map<string, Map<string, TokenIF>>,
) {
    for (const token of tokenList) {
        const strChainId = '0x' + token.chainId.toString(16);
        if (!universe.has(strChainId)) {
            universe.set(strChainId, new Map<string, TokenIF>());
        }
        const currentTokens = universe.get(strChainId);
        if (currentTokens && !currentTokens.has(token.address)) {
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
            const tokenList = await fetchTokenList(uri, false);
            processTokenList(tokenList.tokens, universes);
        } catch (error) {
            console.warn(
                `Log: Could not load token list from URI: ${uri}`,
                error,
            );
        }
    }
    universes.forEach((tokens, chainId) => {
        tokenUniverses.set(chainId, Array.from(tokens.values()));
    });
    return tokenUniverses;
}

export async function fetchTokenUniverse(chainId: string): Promise<TokenIF[]> {
    const tokenUniverse = await downloadAllTokenUniverses();
    return tokenUniverse.get(chainId) || ([] as TokenIF[]);
}
