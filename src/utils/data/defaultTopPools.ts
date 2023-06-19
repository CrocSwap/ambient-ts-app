import {
    arbGoerliETH,
    arbGoerliDAI,
    arbGoerliUSDC,
    arbGoerliWBTC,
    goerliETH,
    goerliUSDC,
    goerliWBTC,
    goerliDAI,
    mainnetETH,
    mainnetUSDC,
} from './defaultTokens';
import { topPoolIF } from '../../App/hooks/useTopPools';
import { TokenIF } from '../interfaces/exports';
import sortTokens from '../functions/sortTokens';
import { ChainIdType } from './chains';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import chainNumToString from '../../App/functions/chainNumToString';

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
                ? chainNumToString(baseToken.chainId)
                : '';
        this.poolId = poolId;
        this.speed = speed;
        this.id = id;
    }
}

export function getDefaultTopPools(chainId: string): topPoolIF[] {
    if (chainId in defaultTopPools) {
        return defaultTopPools[chainId as ChainIdType];
    } else {
        return [];
    }
}

const MAINNET_POOL_ID = lookupChain('0x1').poolIndex;
const GOERLI_POOL_ID = lookupChain('0x5').poolIndex;

const defaultTopPools = {
    '0x1': [new TopPool(mainnetETH, mainnetUSDC, MAINNET_POOL_ID, 0, 1)],
    '0x5': [
        new TopPool(goerliETH, goerliUSDC, GOERLI_POOL_ID, 0, 1),
        new TopPool(goerliETH, goerliWBTC, GOERLI_POOL_ID, 0.5, 3),
        new TopPool(goerliWBTC, goerliUSDC, GOERLI_POOL_ID, -2, 4),
        new TopPool(goerliUSDC, goerliDAI, GOERLI_POOL_ID, -2, 4),
    ],
    '0x66eed': [
        new TopPool(arbGoerliETH, arbGoerliUSDC, GOERLI_POOL_ID, 0, 1),
        new TopPool(arbGoerliETH, arbGoerliWBTC, GOERLI_POOL_ID, 0.5, 3),
        new TopPool(arbGoerliETH, arbGoerliDAI, GOERLI_POOL_ID, 0.5, 3),
    ],
};
