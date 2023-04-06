import {
    arbGoerliETH,
    arbGoerliDAI,
    arbGoerliUSDC,
    arbGoerliWBTC,
    goerliETH,
    goerliUSDC,
    goerliWBTC,
    goerliDAI,
} from './defaultTokens';
import { topPoolIF } from '../../App/hooks/useTopPools';
import { TokenIF } from '../interfaces/exports';
import sortTokens from '../functions/sortTokens';

class TopPool implements topPoolIF {
    name: string;
    base: TokenIF;
    quote: TokenIF;
    chainId: string;
    poolId: number;
    speed: number;
    id: number;
    constructor(
        tokenA: TokenIF,
        tokenB: TokenIF,
        poolId: number,
        speed: number,
        id: number,
    ) {
        const [baseToken, quoteToken]: TokenIF[] = sortTokens(tokenA, tokenB);
        this.name = `${baseToken.symbol} / ${quoteToken.symbol}`;
        this.base = baseToken;
        this.quote = quoteToken;
        this.chainId =
            baseToken.chainId === quoteToken.chainId
                ? '0x' + baseToken.chainId.toString(16)
                : '';
        this.poolId = poolId;
        this.speed = speed;
        this.id = id;
    }
}

export const defaultTopPools: topPoolIF[] = [
    new TopPool(goerliETH, goerliUSDC, 36000, 0, 1),
    new TopPool(goerliETH, goerliWBTC, 36000, 0.5, 3),
    new TopPool(goerliWBTC, goerliUSDC, 36000, -2, 4),
    new TopPool(goerliUSDC, goerliDAI, 36000, -2, 4),
    new TopPool(arbGoerliETH, arbGoerliUSDC, 36000, 0, 1),
    new TopPool(arbGoerliETH, arbGoerliWBTC, 36000, 0.5, 3),
    new TopPool(arbGoerliWBTC, arbGoerliUSDC, 36000, -2, 4),
    new TopPool(arbGoerliUSDC, arbGoerliDAI, 36000, -2, 4),
];
