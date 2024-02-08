import { TokenIF } from '../token/TokenIF';

export interface PoolIF {
    name?: string;
    base: TokenIF;
    quote: TokenIF;
    chainId: string;
    poolIdx: number;
    isBaseTokenMoneynessGreaterOrEqual?: boolean;
}
