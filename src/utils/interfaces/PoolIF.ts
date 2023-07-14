import { TokenIF } from './TokenIF';

export interface PoolIF {
    name?: string;
    base: TokenIF;
    quote: TokenIF;
    chainId: string;
    poolIdx: number;
}
