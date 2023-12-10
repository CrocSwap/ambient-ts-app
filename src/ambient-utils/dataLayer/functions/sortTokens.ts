import { getBaseTokenAddress } from '@crocswap-libs/sdk';
import { TokenIF } from '../../types/token';

export function sortTokens(
    firstToken: TokenIF,
    secondToken: TokenIF,
): TokenIF[] {
    const baseAddr: string = getBaseTokenAddress(
        firstToken.address,
        secondToken.address,
    );
    const sortedTokens: TokenIF[] =
        firstToken.address === baseAddr
            ? [firstToken, secondToken]
            : [secondToken, firstToken];
    return sortedTokens;
}
