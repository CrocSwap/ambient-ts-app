import { TokenIF } from './TokenIF';

export interface PoolIF {
    base: TokenIF;
    quote: TokenIF;
    chainId: string;
    poolId: number;
}
