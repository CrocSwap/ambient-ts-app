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
    mainnetWBTC,
    mainnetPEPE,
    mainnetDAI,
} from './defaultTokens';
import { PoolIF, TokenIF } from '../interfaces/exports';
import sortTokens from '../functions/sortTokens';
import { ChainIdType } from './chains';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import chainNumToString from '../../App/functions/chainNumToString';

class TopPool implements PoolIF {
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
    if (chainId in defaultTopPools) {
        return defaultTopPools[chainId as ChainIdType];
    } else {
        return [];
    }
}

const MAINNET_POOL_ID = lookupChain('0x1').poolIndex;
const GOERLI_POOL_ID = lookupChain('0x5').poolIndex;

const defaultTopPools = {
    '0x1': [
        new TopPool(mainnetETH, mainnetUSDC, MAINNET_POOL_ID),
        new TopPool(mainnetETH, mainnetWBTC, MAINNET_POOL_ID),
        new TopPool(mainnetETH, mainnetPEPE, MAINNET_POOL_ID),
        new TopPool(mainnetUSDC, mainnetDAI, MAINNET_POOL_ID),
    ],
    '0x5': [
        new TopPool(goerliETH, goerliUSDC, GOERLI_POOL_ID),
        new TopPool(goerliETH, goerliWBTC, GOERLI_POOL_ID),
        new TopPool(goerliWBTC, goerliUSDC, GOERLI_POOL_ID),
        new TopPool(goerliUSDC, goerliDAI, GOERLI_POOL_ID),
    ],
    '0x66eed': [
        new TopPool(arbGoerliETH, arbGoerliUSDC, GOERLI_POOL_ID),
        new TopPool(arbGoerliETH, arbGoerliWBTC, GOERLI_POOL_ID),
        new TopPool(arbGoerliETH, arbGoerliDAI, GOERLI_POOL_ID),
    ],
};
