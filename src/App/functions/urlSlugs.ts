import { TokenIF } from '../../utils/interfaces/TokenIF';
import chainNumToString from './chainNumToString';

export function formSlugForPairParams(
    chainId: string | number,
    tokenA: TokenIF | string,
    tokenB: TokenIF | string,
): string {
    if (typeof chainId === 'number') {
        chainId = chainNumToString(chainId);
    }
    if (typeof tokenA !== 'string') {
        tokenA = tokenA.address;
    }
    if (typeof tokenB !== 'string') {
        tokenB = tokenB.address;
    }

    return `chain=${chainId}&tokenA=${tokenA}&tokenB=${tokenB}`;
}
