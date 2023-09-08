import { PoolIF, TokenIF } from '../interfaces/exports';
import sortTokens from '../functions/sortTokens';
import chainNumToString from '../../App/functions/chainNumToString';
import { supportedNetworks } from '../networks';

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

export function getDefaultTopPools(chainId: string): PoolIF[] {
    return supportedNetworks[chainId].topPools;
}
