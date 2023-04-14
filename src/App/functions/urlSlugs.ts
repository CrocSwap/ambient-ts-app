import { TokenIF } from '../../utils/interfaces/TokenIF';

export function formSlugForPairParams(
    chainId: string | number,
    tokenA: TokenIF | string,
    tokenB: TokenIF | string,
): string {
    if (typeof chainId === 'number') {
        chainId = '0x' + chainId.toString(16);
    }
    if (typeof tokenA !== 'string') {
        tokenA = tokenA.address;
    }
    if (typeof tokenB !== 'string') {
        tokenB = tokenB.address;
    }

    return `chain=${chainId}&tokenA=${tokenA}&tokenB=${tokenB}`;
}
