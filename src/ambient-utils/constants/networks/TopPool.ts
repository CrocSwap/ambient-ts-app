import { chainNumToString } from '../../dataLayer/functions/chainNumToString';
import { getMoneynessRank } from '../../dataLayer/functions/getMoneynessRank';
import { sortTokens } from '../../dataLayer/functions/sortTokens';
import { PoolIF, TokenIF } from '../../types';

export class TopPool implements PoolIF {
    name: string;
    base: TokenIF;
    quote: TokenIF;
    chainId: string;
    poolIdx: number;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    constructor(tokenA: TokenIF, tokenB: TokenIF, poolIdx: number) {
        const [baseToken, quoteToken]: TokenIF[] = sortTokens(tokenA, tokenB);
        const isBaseTokenMoneynessGreaterOrEqual: boolean =
            getMoneynessRank(baseToken?.symbol) -
                getMoneynessRank(quoteToken?.symbol) >=
            0;

        this.name = `${baseToken.symbol} / ${quoteToken.symbol}`;

        this.base = baseToken;
        this.quote = quoteToken;
        this.chainId =
            baseToken.chainId === quoteToken.chainId
                ? chainNumToString(baseToken.chainId)
                : '';
        this.poolIdx = poolIdx;
        this.isBaseTokenMoneynessGreaterOrEqual =
            isBaseTokenMoneynessGreaterOrEqual;
    }
}
