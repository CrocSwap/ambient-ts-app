import { TokenIF } from './TokenIF';

export interface TempPoolIF {
    baseToken: TokenIF;
    quoteToken: TokenIF;
    base: string;
    baseDecimals: number;
    baseName: string;
    baseSymbol: string;
    chainId: string;
    poolIdx: number;
    quote: string;
    quoteDecimals: number;
    quoteName: string;
    quoteSymbol: string;
}
