import { TokenIF } from './TokenIF';

export interface TokenMethodsIF {
    defaultTokens: TokenIF[];
    verify: (addr: string) => boolean;
    acknowledge: (tkn: TokenIF) => void;
    tokenUniv: TokenIF[];
    getTokenByAddress: (addr: string) => TokenIF | undefined;
    getTokensFromList: (uri: string) => TokenIF[];
    getTokensByNameOrSymbol: (input: string, exact?: boolean) => TokenIF[];
}
