import { TokenIF, PoolIF } from '../../types';
import { sortTokens } from '../../dataLayer/functions/sortTokens';
import { chainNumToString } from '../../dataLayer/functions/chainNumToString';

export class TopPool implements PoolIF {
    name: string;
    base: TokenIF;
    quote: TokenIF;
    chainId: string;
    poolIdx: number;
    constructor(tokenA: TokenIF, tokenB: TokenIF, poolIdx: number) {
        const [baseToken, quoteToken]: TokenIF[] = sortTokens(tokenA, tokenB);
        this.name = `${baseToken.symbol} / ${quoteToken.symbol}`;
        this.base = baseToken;
        this.quote = quoteToken;
        this.chainId =
            baseToken.chainId === quoteToken.chainId
                ? chainNumToString(baseToken.chainId)
                : '';
        this.poolIdx = poolIdx;
    }
}
