import { TokenIF } from './TokenIF';

export interface TokenMethodsIF {
    verify: (addr: string) => boolean;
    acknowledge: (tkn: TokenIF) => void;
    tokenUniv: TokenIF[];
    getTokenByAddress: (addr: string) => TokenIF | undefined;
    getTokensFromList: (uri: string) => TokenIF[];
    getTokensByNameOrSymbol: (
        input: string,
        chn: string,
        exact?: boolean,
    ) => TokenIF[];
}
